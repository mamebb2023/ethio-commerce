import bcrypt from 'bcrypt';
import { v4 } from 'uuid';

import dbClient from '../utils/db';
import userUtils from '../utils/user';
import redisClient from '../utils/redis';

class UserController {
  static async postRegister(req, res) {
    const { firstName, lastName, email, password, confirmPwd } = req.body;

    if (!firstName) return res.status(400).send({ error: 'Missing first name' });
    if (!lastName) return res.status(400).send({ error: 'Missing last name' });
    if (!email || !password) return res.status(400).send({ error: 'Missing required fields: email and password' });
    if (!confirmPwd || confirmPwd !== password) return res.status(400).send({ error: 'Passwords do not match' });

    const existingUser = await userUtils.getUser({ email });
    if (existingUser) return res.status(400).send({ error: 'Email already exists' });

    const saltRounds = 10;
    try {
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await dbClient.userCollection.insertOne({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });

      
    } catch (error) {
      return res.status(500).send({ error: 'Internal server error' });
    }
  }

  static async postLogin(req, res) {
    const { email, password } = req.body;
    const token = req.header('X-Token');
    if (!email || !password) {
      return res.status(400).send({ error: 'Missing required fields: email and password' });
    }
  
    try {
      const user = await userUtils.getUser({ email });
      if (!user) {
        return res.status(401).send({ error: 'Invalid email or password' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).send({ error: 'Invalid email or password' });
      }

      delete user.password;

      let generatedToken;
      if (!token) {
        generatedToken = await this.setToken(user._id);
      } else {
        // Validate existing token (optional security step)
        // ... your token validation logic here ...
      }

      return res.status(200).send({ token: generatedToken || token, redirectUrl: '/' });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).send({ error: 'Internal server error' });
    }
  }

  static async setToken(userId) {
    const token = v4();
    const key =  `auth_${token}`;
    const expirationHour = 24;

    await redisClient.set(key, userId.toString(), expirationHour * 3600);

    return token;
  }
}

export default UserController;
