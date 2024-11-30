import pkg from "mongodb";
const { ObjectId } = pkg;
import userUtils from "../utils/user.js";
import fileUtils, { addToCart } from "../utils/files.js";

import dbClient from "../utils/db.js";

/**
 * Item controller
 */
class ItemController {
  /**
   * A function to retrieve items from the database,
   * excluding the "userId" field for potential security or privacy reasons.
   *
   * This function fetches all items from the "itemsCollection" in the database,
   * excluding the "userId" field from the returned data using a projection.
   * This exclusion might be done to protect user privacy or prevent unnecessary information leakage.
   *
   * @param {Object} req The HTTP request object (potentially containing filters or pagination parameters).
   * @param {Object} res The HTTP response object.
   * @returns {Promise<Array>} A promise that resolves to an array of item objects,
   * excluding the "userId" field.
   */
  static async getItems(req, res) {
    return res.send(
      await dbClient.itemsCollection
        .find({}, { projection: { userId: false } })
        .toArray()
    );
  }

  /**
   * A function to create a new item listing on the website.
   *
   * This function allows authorized users to post an item with details
   * such as name, price, short description, detailed description, and an image.
   * It validates the user's ID and required fields before inserting the item data into the database.
   *
   * @param {Object} req The HTTP request object containing the item data in the body and
   * potentially the uploaded image in the `files` property.
   * @param {Object} res The HTTP response object.
   * @returns {Promise<void>} (No direct return value, sends response using `res`.)
   */
  static async postItem(req, res) {
    const { itemName, itemPrice, miniDetail, itemDetails } = req.body;
    const itemImage = req.file;
    const { user } = req;
    console.log("\n", "itemImage", req.file);
    if (!itemName || !itemPrice || !miniDetail || !itemDetails || !user) {
      return res.status(500).send({ error: "Some info missing" });
    }

    const userId = user.user._id.toString();
    if (!userUtils.isValidId(userId))
      return res.status(400).send({ error: "Unauthorized" });

    await dbClient.itemsCollection.insertOne({
      userId,
      itemName,
      itemPrice,
      miniDetail,
      itemDetails,
      itemImagePath: `${itemImage.destination}${itemImage.filename}`,
    });

    return res.status(201).send({ msg: "Item Posted" });
  }

  /**
   * A function to add an item to the user's cart, potentially using a queue system.
   *
   * This function allows users to add items to their carts, performing the following actions:
   *   - Validates the presence of an `itemId` in the request body.
   *   - Retrieves the item details from the database.
   *   - Validates the user's email and retrieves user information, excluding the password.
   *   - Checks if the user's cart exists in the database; if not, creates a new cart.
   *   - **(Functionality not shown in snippet):** Potentially adds the item to a queue related to the cart (depending on the implementation of the queue system).
   *   - Retrieves the updated user cart from the database, excluding unnecessary fields.
   *   - Calculates the total quantity of items in the cart.
   *   - Sends a response with the status code and the total quantity.
   *
   * @param {Object} req The HTTP request object containing the item ID in the body.
   * @param {Object} res The HTTP response object.
   * @returns {Promise<void>} (No direct return value, sends response using `res`.)
   */
  static async addToCart(req, res) {
    try {
      // Validate and handle missing itemId
      const { itemId } = req.body;
      if (!itemId) return res.status(400).send({ error: "Bad Request" });

      const itemObjId = ObjectId(itemId);
      const item = await fileUtils.getItem({ _id: itemObjId });
      if (!item) return res.status(400).send({ error: "Bad Request" });

      // Get user and handle unauthorized access
      const { email } = req.user.user;
      const user = await userUtils.getUser(
        { email },
        { projection: { password: false } }
      );
      if (!user) return res.status(401).send({ error: "Unauthorized" });

      const userId = user._id.toString();
      console.log("addToCart", userId, itemId);
      if (!(await dbClient.cartCollection.findOne({ userId }))) {
        await dbClient.cartCollection.insertOne({ userId });
      }

      await addToCart(userId, itemId);

      const userCart = await fileUtils.getUserCart(
        { userId },
        { projection: { _id: false, userId: false } }
      );

      const values = Object.values(userCart).map(Number);
      const quantitySum = values.reduce((acc, num) => acc + num, 0) + 1;

      return res.status(200).send({ total: quantitySum });
    } catch (error) {
      console.error("Error adding item to cart:", error);
      return res.status(500).send({ error: "Internal server error" });
    }
  }

  /**
   * A function to remove an item from the user's cart.
   *
   * This function allows users to remove specific items from their carts.\
   * It performs the following actions:
   *   - Validates the presence of an `itemId` in the request body.
   *   - Validates the user's ID.
   *   - Retrieves the item details and user cart, excluding the "userId" field from both to
   *      potentially protect user privacy or prevent unnecessary information leakage.
   *   - Checks if the quantity of the item in the cart is 1.
   *     - If yes, it removes the item entirely using the `$unset` operator.
   *     - If no, it decrements the quantity of the item using the `$inc` operator.
   *   - Sends a response with a success message.
   *
   * @param {Object} req The HTTP request object containing the item ID in the body.
   * @param {Object} res The HTTP response object.
   * @returns {Promise<void>} (No direct return value, sends response using `res`.)
   */
  static async removeFromCart(req, res) {
    delete req.user.user.key;
    const { itemId } = req.body;
    const userId = String(req.user.user._id);
    if (!userUtils.isValidId(itemId))
      return res.status(400).send({ error: "Bad request" });

    const itemObjId = ObjectId(itemId);
    const item = await fileUtils.getItem(
      { _id: itemObjId },
      { projection: { userId: false } }
    );
    if (!item) return res.status(400).send({ error: "Bad Requset" });

    const userCart = await dbClient.cartCollection.findOne(
      { userId },
      { projection: { _id: false, userId: false } }
    );

    if (userCart[itemId] === 1) {
      console.log(userId);
      await dbClient.cartCollection.updateOne(
        { userId },
        { $unset: { [itemId]: 1 } }
      );
    } else {
      console.log("h2");
      await dbClient.cartCollection.updateOne(
        { userId },
        { $inc: { [itemId]: -1 } }
      );
    }

    return res.send({ msg: "success" });
  }

  /**
   * A function to retrieve the total number of items in the user's cart.
   *
   * This function fetches the user's shopping cart from the database,
   * excluding the "userId" field to potentially protect user privacy or
   * prevent unnecessary information leakage.
   * It then calculates the total quantity of items in the cart by summing up individual item
   * quantities and sends the result as a response.
   *
   * @param {Object} req The HTTP request object containing the user information in the `user` property.
   * @param {Object} res The HTTP response object.
   * @returns {Promise<void>} (No direct return value, sends response using `res`.)
   */
  static async totalCartItems(req, res) {
    delete req.user.key;

    const { user } = req.user;
    const userId = String(user._id);

    const userCart = await fileUtils.getUserCart(
      { userId },
      { projection: { _id: false, userId: false } }
    );
    if (!userCart) return;

    const values = Object.values(userCart).map(Number);
    const quantitySum = values.reduce((acc, num) => acc + num, 0);

    return res.send({ total: quantitySum });
  }

  /**
   * A function to retrieve the user's cart items along with their quantities.
   *
   * This function fetches the user's shopping cart from the database,
   * excluding the "userId" field to potentially protect user privacy or
   * prevent unnecessary information leakage.
   *
   * It then iterates through the cart items:
   * - For each item ID in the cart, it retrieves the corresponding item details from the database, again excluding the "userId" field.
   * - It creates an object for each item, combining the retrieved item details with the quantity information from the cart.
   * - Finally, it sends an array containing these item objects as a response.
   *
   * @param {Object} req The HTTP request object containing the user information in the `user` property.
   * @param {Object} res The HTTP response object.
   * @returns {Promise<void>} (No direct return value, sends response using `res`.)
   */
  static async cartItems(req, res) {
    const userId = String(req.user.user._id);
    const userCart = await fileUtils.getUserCart(
      { userId },
      { projection: { _id: false, userId: false } }
    );
    if (!userCart) return res.send({ msg: "No items in cart" });
    console.log(userCart);

    const keys = Object.keys(userCart);
    const quantity = Object.values(userCart);
    const userCartItems = []; // Use an array instead of an object

    for (const itemId of keys) {
      const item = await fileUtils.getItem(
        { _id: ObjectId(itemId) },
        { projection: { userId: false } }
      );
      userCartItems.push(item); // Add the entire item object to the array
    }

    for (let i = 0; i < userCartItems.length; i += 1) {
      userCartItems[i].itemQuantity = quantity[i];
    }

    return res.status(200).send(userCartItems);
  }

  /**
   * A function to retrieve details of an item from the database based on its ID.
   *
   * This function fetches an item's details from the "itemsCollection"
   * based on the provided ID in the request query parameter. It:
   *   - Validates the ID format using `userUtils.isValidId`.
   *   - Retrieves the item details using `fileUtils.getItem` and
   *      excludes the "userId" field to potentially protect user privacy or
   *      prevent unnecessary information leakage.
   *   - Sends a response with the item details or an error message
   *      if the item is not found or the ID is invalid.
   *
   * @param {Object} req The HTTP request object containing the item ID in the query string parameter.
   * @param {Object} res The HTTP response object.
   * @returns {Promise<void>} (No direct return value, sends response using `res`.)
   */
  static async itemDetails(req, res) {
    const { itemId } = req.query;
    console.log(req.body, req.query);

    if (!userUtils.isValidId(itemId))
      return res.status(200).send({ error: "Invalid item id" });
    console.log(itemId);

    const itemObjId = ObjectId(itemId);
    const item = await fileUtils.getItem(
      { _id: itemObjId },
      { projection: { _id: false, userId: false } }
    );
    if (!item) return res.status(400).send({ error: "Bad Request" });

    return res.status(200).send({ item });
  }
}

export default ItemController;
