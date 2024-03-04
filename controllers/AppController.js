import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static async getStatus(req, res) {
    const status = {
      redis: await redisClient.isAlive(),
      db: await dbClient.isAlive(),
      nbUsers: await dbClient.nbUsers(),
      nbItems: await dbClient.nbItems(),
      users: await dbClient.userCollection.find({}, { projection: { password: false } }).toArray(),
    };

    return res.status(200).send({ status, users });
  }
}

export default AppController;
