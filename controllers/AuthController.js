import pkg from "mongodb";
const { ObjectId } = pkg;
import redisClient from "../utils/redis.js";
import userUtils from "../utils/user.js";

/**
 * Authentication Controller
 */
class AuthController {
  /**
   * A function to verify a user's authorization based on a provided token.
   *
   * This function checks for the presence of a valid token in the request header's cookie,
   * retrieves user information from Redis if the token is valid, and attaches relevant
   * data to the request object for further processing by subsequent middleware or route handlers.
   *
   * @param {Object} req The HTTP request object.
   * @param {Object} res The HTTP response object.
   * @param {function} next The next middleware function to be executed in the chain.
   * @returns {void} (No direct return value, potentially calls `next()` for further processing.)
   */
  static async verifyUser(req, res, next) {
    const redirectUrl = req.body.redirectUrl;
    const token = req
      .header("cookie")
      ?.split("; ")
      ?.find((cookie) => cookie.startsWith("X-Token="))
      ?.split("=")[1];
    if (!token) {
      return res.status(200).send({ error: "Unauthorized" });
    }

    const key = `auth_${token}`;

    try {
      const userId = await redisClient.get(key);
      if (!userId) return res.status(400).send({ error: "Unauthorized" });

      const userObjId = ObjectId(userId);
      const user = await userUtils.getUser(
        { _id: userObjId },
        { projection: { password: false } }
      );
      if (!user) return res.status(400).send({ error: "Unauthorized" });

      req.user = { user, key, redirectUrl };
      next();
    } catch (error) {
      console.log(error);
      return res.status(400).send({ error: "Unauthorized" });
    }
  }
}

export default AuthController;
