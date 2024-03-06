import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/**
 * App Controller
 */
class AppController {
  /**
   * A function to get the status of the whole database
   * @param {*} req Request form user
   * @param {*} res Response sent to user
   * @returns A response with status code and the status
   */
  static async getStatus(req, res) {
    const status = {
      redis: await redisClient.isAlive(),
      db: await dbClient.isAlive(),
      nbUsers: await dbClient.nbUsers(),
      nbItems: await dbClient.nbItems(),
      users: await dbClient.userCollection.find(
        {},
        { projection: { password: false } }
      ).toArray(),
    };

    return res.status(200).send({ status });
  }
}

export default AppController;
