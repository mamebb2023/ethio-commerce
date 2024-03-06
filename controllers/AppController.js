import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/**
 * App Controller
 */
class AppController {
  /**
   * A function to get the overall health and status information of the system.
   *
   * This function checks the health of the Redis server and database,
   * retrieves the number of users and items, and fetches a list of users
   * (excluding their passwords).
   *
   * @param {Object} req The HTTP request object.
   * @param {Object} res The HTTP response object.
   * @returns {Object} An object containing the system status information.
   */
  static async getStatus(req, res) {
    const status = {
      redis: await redisClient.isAlive(),
      db: await dbClient.isAlive(),
      nbUsers: await dbClient.nbUsers(),
      nbItems: await dbClient.nbItems(),
      users: await dbClient.userCollection.find(
        {},
        { projection: { password: false } },
      ).toArray(),
    };

    return res.status(200).send({ status });
  }
}

export default AppController;
