import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    const status = {
      redis: redisClient.isAlive(),
      db: redisClient.isAlive(),
      users: dbClient.nbUsers(),
      items: dbClient.nbItems(),
    };
    res.status(200).send(status);
  }
}

export default AppController;
