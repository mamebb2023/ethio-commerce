import userUtils from '../utils/user';
import fileUtils from '../utils/files';
import dbClient from '../utils/db';

class ItemController {
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
            itemImagePath: itemImage.path, 
        });
        return res.status(201).send({ msg:'Item Posted' });
    }
}

export default ItemController;