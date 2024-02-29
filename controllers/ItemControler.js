import { ObjectId } from 'mongodb';

import userUtils from '../utils/user';
import fileUtils from '../utils/files';
import { addToCart } from '../utils/files';
import dbClient from '../utils/db';

class ItemController {
  static async getItem(req, res) {
    return res.send(await dbClient.itemsCollection.find({}).toArray());
  }

  static async postItem(req, res) {
      console.log('postItem user', req.user);
      console.log('postItem body', req.body);
      const { itemName, itemPrice, miniDetail, itemDetails } = req.body;
      const itemImage = req.file;
      const user = req.user;
      console.log('\n', 'itemImage', req.file);
      if (!itemName || !itemPrice || !miniDetail || !itemDetails || !user) {
          return res.status(500).send({ error: 'Some info missing' });
      }

      const userId = user.user._id.toString();
      if (!userUtils.isValidId(userId)) return res.status(400).send({ error: 'Unauthorized' });
      const item = await dbClient.itemsCollection.insertOne({
          userId,
          itemName,
          itemPrice,
          miniDetail,
          itemDetails,
          itemImagePath: `${itemImage.destination}${itemImage.filename}`, 
      });
      return res.status(201).send({ msg:'Item Posted' });
  }

  static async addToCart(req, res) {
    try {
      // Validate and handle missing itemId
      const itemId = req.body.itemId;
      if (!itemId) {
        return res.status(400).send({ error: 'Bad Request: Missing itemId' });
      }

      const itemObjId = ObjectId(itemId);
      const item = await fileUtils.getItem({ _id: itemObjId });
      if (!item) {
        return res.status(400).send({ error: 'Bad Request: Item not found' });
      }

      // Get user and handle unauthorized access
      const email = req.user.user.email;
      const user = await userUtils.getUser({ email }, { projection: { password: false } });
      if (!user) {
        return res.status(401).send({ error: 'Unauthorized' });
      }

      const userId = user._id.toString();
      console.log(userId, itemId);
      if (!await dbClient.cartCollection.findOne({ userId })){
        await dbClient.cartCollection.insertOne({ userId });
      }

      await addToCart(userId, itemId);

      const userCart = await fileUtils.getUserCart({ userId });

      const values = Object.values(userCart);
      const quantity = values.slice(2).map(Number);
      const quantitySum = quantity.reduce((acc, num) => acc + num, 0) + 1;

      return res.status(200).send({ total: quantitySum});
    } catch (error) {
      console.error('Error adding item to cart:', error);
      // Handle errors globally (e.g., log to a file, send generic error response)
      return res.status(500).send({ error: 'Internal server error' }); // Generic error message
    }
  }

  static async cartItems(req, res) {
    delete req.user.key;

    const user = req.user.user;
    const userId = String(user._id);

    const userCart = await fileUtils.getUserCart({ userId });
    console.log('userCart', userCart);
    if (!userCart) return res.send({ msg: 'No items in cart' });

    const values = Object.values(userCart);
    const quantity = values.slice(2).map(Number);
    const quantitySum = quantity.reduce((acc, num) => acc + num, 0);

    return res.send({userCart, total: quantitySum});
  }
}

export default ItemController;