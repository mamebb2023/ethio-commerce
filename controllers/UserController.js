import bcrypt from 'bcrypt';

import dbClient from '../utils/db';
import userUtils from '../utils/user';
import AuthController from './AuthController';

class UserController {
  static async postRegister(req, res) {
    const { firstName, lastName, email, password, confirmPwd } = req.body;
    const token = req.header('X-Token');

    if (!firstName) return res.status(400).send({ error: 'Missing first name' });
    if (!lastName) return res.status(400).send({ error: 'Missing last name' });
    if (!email || !password) return res.status(400).send({ error: 'Missing required fields: email and password' });
    if (!confirmPwd || confirmPwd !== password) return res.status(400).send({ error: 'Passwords do not match' });

    const existingUser = await userUtils.getUser({ email });
    if (existingUser) return res.status(400).send({ error: 'Email already exists' });

    const saltRounds = 10;
    try {
      const hashedPassword = await userUtils.encryptPwd(password, saltRounds);

      await dbClient.userCollection.insertOne({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });

      const newToken = await AuthController.createToken(email, token);

      return res.status(200).send({ token: newToken, redirectUrl: '/' });
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

      const newToken = await AuthController.createToken(email, token);

      return res.status(200).send({ token: newToken, redirectUrl: '/' });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).send({ error: 'Internal server error' });
    }
  }
}

export default UserController;
