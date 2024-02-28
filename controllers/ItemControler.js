import { ObjectId } from 'mongodb';

import userUtils from '../utils/user';
import fileUtils from '../utils/files';
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
      console.log('itemId', itemId);

      const itemObjId = ObjectId(itemId);
      const item = await fileUtils.getItem({ _id: itemObjId });
      if (!item) {
        return res.status(400).send({ error: 'Bad Request: Item not found' });
      }
      console.log('item', item);

      // Get user and handle unauthorized access
      const email = req.user.user.email;
      const user = await userUtils.getUser({ email }, { projection: { password: false } });
      if (!user) {
        return res.status(401).send({ error: 'Unauthorized' });
      }

      const userId = user._id.toString();
      if (!await dbClient.cartCollection.findOne({ userId })) {
        await dbClient.cartCollection.insertOne({ userId });
      }
      const userCart = await dbClient.cartCollection.findOne({ userId });
      console.log('userCart', userCart);
      if (itemId in userCart) {
        await dbClient.cartCollection.updateOne({ userId }, { $inc: { [itemId]: 1 } });
      } else {
        const newDict = {}
        newDict[itemId] = 1;
        await dbClient.cartCollection.updateOne({ userId }, { $set: newDict });
      }

    } catch (error) {
      console.error('Error adding item to cart:', error);
      // Handle errors globally (e.g., log to a file, send generic error response)
      return res.status(500).send({ error: 'Internal server error' }); // Generic error message
    }
  }
}

export default ItemController;