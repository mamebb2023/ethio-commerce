import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { v4 } from 'uuid';

import redisClient from './redis';
import dbClient from './db';

class userUtils {
  static async createToken(userId) {
    const token = v4();
    const key =  `auth_${token}`;
    const expirationHour = 24;

    await redisClient.set(key, userId.toString(), expirationHour);

    return token;
  }

  static async getUserIdAndKey(req) {
    const xToken = req.header('X-Token');
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

  static encryptPwd(password, salt) {
    const hashedpwd = bcrypt.hash(password, salt);
    return hashedpwd;
  }
}

export default userUtils;
