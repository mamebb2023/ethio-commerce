import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static async getStatus(req, res) {
    const status = {
      redis: await redisClient.isAlive(),
      db: await dbClient.isAlive(),
      users: await dbClient.nbUsers(),
      items: await dbClient.nbItems(),
    };
    res.status(200).send(status);
  }
}

export default AppController;
