import dbClient from './db';

class fileUtils {
    static async getItem(...query) {
        const user = await dbClient.itemsCollection.findOne(...query);
        return user;
    }
}

export default fileUtils;