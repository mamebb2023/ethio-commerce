import { ObjectId } from 'mongodb';

import userUtils from '../utils/user';
import fileUtils, { addToCart } from '../utils/files';

import dbClient from '../utils/db';

/**
 * Item controller
 */
class ItemController {
  /**
   * A function get an item from items database
   * @param {*} req Request form user
   * @param {*} res Response sent to user
   * @returns A response with the found item
   */
  static async getItems(req, res) {
    return res.send(await dbClient.itemsCollection.find(
      {},
      { projection: { userId: false } },
    ).toArray());
  }

  /**
   * A function to post an item on the website
   * @param {*} req Request form user
   * @param {*} res Response sent to user
   * @returns A response with status code and a json message
   */
  static async postItem(req, res) {
    const {
      itemName, itemPrice, miniDetail, itemDetails,
    } = req.body;
    const itemImage = req.file;
    const { user } = req;
    console.log('\n', 'itemImage', req.file);
    if (!itemName || !itemPrice || !miniDetail || !itemDetails || !user) {
      return res.status(500).send({ error: 'Some info missing' });
    }

    const userId = user.user._id.toString();
    if (!userUtils.isValidId(userId)) return res.status(400).send({ error: 'Unauthorized' });

    await dbClient.itemsCollection.insertOne({
      userId,
      itemName,
      itemPrice,
      miniDetail,
      itemDetails,
      itemImagePath: `${itemImage.destination}${itemImage.filename}`,
    });

    return res.status(201).send({ msg: 'Item Posted' });
  }

  /**
   * A function to add an item to user cart with a queue system
   * @param {*} req Request form user
   * @param {*} res Response sent to user
   * @returns A response with status code and
   *          the total quantity in the user cart
   */
  static async addToCart(req, res) {
    try {
      // Validate and handle missing itemId
      const { itemId } = req.body;
      if (!itemId) return res.status(400).send({ error: 'Bad Request' });

      const itemObjId = ObjectId(itemId);
      const item = await fileUtils.getItem({ _id: itemObjId });
      if (!item) return res.status(400).send({ error: 'Bad Request' });

      // Get user and handle unauthorized access
      const { email } = req.user.user;
      const user = await userUtils.getUser({ email }, { projection: { password: false } });
      if (!user) return res.status(401).send({ error: 'Unauthorized' });

      const userId = user._id.toString();
      console.log('addToCart', userId, itemId);
      if (!await dbClient.cartCollection.findOne({ userId })) {
        await dbClient.cartCollection.insertOne({ userId });
      }

      await addToCart(userId, itemId);

      const userCart = await fileUtils.getUserCart(
        { userId },
        { projection: { _id: false, userId: false } },
      );

      const values = Object.values(userCart).map(Number);
      const quantitySum = values.reduce((acc, num) => acc + num, 0) + 1;

      return res.status(200).send({ total: quantitySum });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return res.status(500).send({ error: 'Internal server error' });
    }
  }

  /**
   * A function to remove a cart item from the user cart
   * @param {*} req Request form user
   * @param {*} res Response sent to user
   * @returns A response with status code and a json message
   */
  static async removeFromCart(req, res) {
    delete req.user.user.key;
    const { itemId } = req.body;
    const userId = String(req.user.user._id);
    if (!userUtils.isValidId(itemId)) return res.status(400).send({ error: 'Bad request' });

    const itemObjId = ObjectId(itemId);
    const item = await fileUtils.getItem({ _id: itemObjId }, { projection: { userId: false } });
    if (!item) return res.status(400).send({ error: 'Bad Requset' });

    const userCart = await dbClient.cartCollection.findOne(
      { userId },
      { projection: { _id: false, userId: false } },
    );

    if (userCart[itemId] === 1) {
      console.log(userId);
      await dbClient.cartCollection.updateOne({ userId }, { $unset: { [itemId]: 1 } });
    } else {
      console.log('h2');
      await dbClient.cartCollection.updateOne({ userId }, { $inc: { [itemId]: -1 } });
    }

    return res.send({ msg: 'success' });
  }

  /**
   * A function to get the total items in the user cart
   * @param {*} req Request form user
   * @param {*} res Response sent to user
   * @returns A response with the total quantity of the user
   */
  static async totalCartItems(req, res) {
    delete req.user.key;

    const { user } = req.user;
    const userId = String(user._id);

    const userCart = await fileUtils.getUserCart(
      { userId },
      { projection: { _id: false, userId: false } },
    );
    if (!userCart) return;

    const values = Object.values(userCart).map(Number);
    const quantitySum = values.reduce((acc, num) => acc + num, 0);

    return res.send({ total: quantitySum });
  }

  /**
   * A function to get the cart items
   * @param {*} req Request form user
   * @param {*} res Response sent to user
   * @returns A response with status code and the cart items
   */
  static async cartItems(req, res) {
    const userId = String(req.user.user._id);
    const userCart = await fileUtils.getUserCart(
      { userId },
      { projection: { _id: false, userId: false } },
    );
    if (!userCart) return res.send({ msg: 'No items in cart' });
    console.log(userCart);

    const keys = Object.keys(userCart);
    const quantity = Object.values(userCart);
    const userCartItems = []; // Use an array instead of an object

    for (const itemId of keys) {
      const item = await fileUtils.getItem(
        { _id: ObjectId(itemId) },
        { projection: { userId: false } },
      );
      userCartItems.push(item); // Add the entire item object to the array
    }

    for (let i = 0; i < userCartItems.length; i += 1) {
      userCartItems[i].itemQuantity = quantity[i];
    }

    return res.status(200).send(userCartItems);
  }

  /**
   * A function to display an item details from the items database
   * @param {*} req Request form user
   * @param {*} res Response sent to user
   * @returns A response with status code and the item details
   */
  static async itemDetails(req, res) {
    const { itemId } = req.query;
    console.log(req.body, req.query);

    if (!userUtils.isValidId(itemId)) return res.status(200).send({ error: 'Invalid item id' });
    console.log(itemId);

    const itemObjId = ObjectId(itemId);
    const item = await fileUtils.getItem(
      { _id: itemObjId },
      { projection: { _id: false, userId: false } },
    );
    if (!item) return res.status(400).send({ error: 'Bad Request' });

    return res.status(200).send({ item });
  }
}

export default ItemController;
