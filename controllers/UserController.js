import sha1 from 'sha1';
import { ObjectId } from 'mongodb';

import dbClient from '../utils/db';
import userUtils from '../utils/user';

class UserController {
  static async postRegister(req, res) {
    const {
      firstName, lastName, email, password, confirmPwd,
    } = req.body;

    // Switch case for item confirmation and validati
    if (!firstName) return res.render('register', { error: 'Missing first name' });
    if (!lastName) return res.render('register', { error: 'Missing last name' });
    if (!email) return res.render('register', { error: 'Missing email' });
    if (!password) return res.render('register', { error: 'Missing password' });
    if (!confirmPwd || confirmPwd !== password) return res.render('register', { error: 'Confirm password' });
    if (await userUtils.getUser({ email }, { projection: { password: false } })) {
      return res.render('register', { error: 'Email already exists' });
    }
    // Proceed with registration if all validations pass
    const hashPwd = sha1(password);

    try {
      await dbClient.userCollection.insertOne({
        firstName, lastName, email, password: hashPwd,
      });
      return res.render('login', { msg: 'You are registered! You can now login.' });
    } catch (err) {
      return res.status(500).send({ error: 'Server Error' });
    }
  }

  static async postLogin(req, res) {
    const { email, password } = req.body;
    if (!email) return res.render('login', { error: 'Missing email' });
    if (!password) return res.render('login', { error: 'Missing password' });

    // The passowrd encryption to verification

    try {
      const user = await userUtils.getUser({ email });
      if (!user) return res.render('login', { error: 'Email does not exist' });
      if (sha1(password) !== user.password) return res.render('login', { error: 'Email or password incorrect' });

      return res.render('index', { msg: 'You are logged in!' });
    } catch (error) {
      return res.status(500).send({ error: 'Server Error' });
    }
  }
}

export default UserController;
