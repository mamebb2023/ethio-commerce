import pkg from "mongodb";
const { ObjectId } = pkg;
import { v4 } from "uuid";

import redisClient from "./redis.js";
import dbClient from "./db.js";

class userUtils {
  static async createToken(userId) {
    const token = v4();
    const key = `auth_${token}`;
    const expirationHour = 24;

    await redisClient.set(key, userId.toString(), expirationHour * 3600);

    return token;
  }

  static async getUserIdAndKey(req) {
    const xToken = req.header("X-Token");
    if (!xToken) return {};

    const userKey = `auth_${xToken}`;
    const userId = await redisClient.get(userKey);

    return { userKey, userId };
  }

  static async getUser(...query) {
    const user = await dbClient.userCollection.findOne(...query);
    return user;
  }

  static isValidId(userId) {
    try {
      ObjectId(userId);
    } catch (error) {
      return false;
    }
    return true;
  }

  static isAdmin(req, res, next) {
    const { user } = req.user;
    if (!user) return res.status(401).send({ error: "Unauthorized" });

    const admins = ["admin@admin.com"];
    if (admins.includes(user.email)) {
      console.log("isAdmin", req.user);
      next();
    } else {
      return res.status(401).send({ error: "Unauthorized" });
    }
  }
}

export default userUtils;
