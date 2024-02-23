// import bcrypt from 'bcrypt';
import sha1 from 'sha1';

import dbClient from '../utils/db';
import userUtils from '../utils/user';

class UserController {
  static async userRegister(req, res) {
    const {
      firstName, lastName, email, password,
    } = req.body;
   
    if (!firstName) return res.status(400).send({ error: 'First name required' });
    if (!lastName) return res.status(400).send({ error: 'Last name required' });
    if (!email) return res.status(400).send({ error: 'Email required' });
    if (!password) return res.status(400).send({ error: 'Password required' });

    const user = await userUtils.getUser({ email }, { projection: { password: false } });
    if (user) return res.status(400).send({ error: 'Email Already Exists' });

    // const salt = 10;
    // const hashPassword = bcrypt.hash(password, 10);
    const hashPassword = sha1(password);

    try {
      await dbClient.userCollection.insertOne({
        firstName,
        lastName,
        email,
        password: hashPassword
      });
      return res.status(201).send({ msg: 'User Registered! You Can now login.', redirectUrl: '/login' });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ error: 'Internal Server Error' });
    }
  }

  static async userLogin(req, res) {
    const {
      email, password, redirectUrl
    } = req.body;

    if (!email) return res.status(400).send({ error: 'Email required' });
    if (!password) return res.status(400).send({ error: 'Password required' });

    const user = await userUtils.getUser({ email });
    if (!user) return res.status(400).send({ error: 'Invalid email or password' });

    try {
      // const isValid = bcrypt.compare(password, user.password);
      const hashPassword = sha1(password);
      if (hashPassword !== user.password) {
        return res.status(400).send({ error: 'Invalid email or password' });
      }
      delete user.password;

      // uncomment this and remove the token on return
      const token = await userUtils.createToken(user._id.toString());
      res.cookie('X-Token', token, {
        // httpOnly: true,
        // secure: true,
        // sameSite: 'lax',
      });
      return res.status(200).send({ msg: 'You are logged in!', token, redirectUrl });
    } catch (error) {

    }
  }
}

export default UserController;
