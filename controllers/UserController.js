// import bcrypt from 'bcrypt';
import sha1 from "sha1";

import dbClient from "../utils/db.js";
import userUtils from "../utils/user.js";
import redisClient from "../utils/redis.js";

/**
 * User Controller
 */
class UserController {
  /**
   * A function to register a user
   * @param {*} req Request form user
   * @param {*} res Response sent to user
   * @returns A response with status code and a json message
   */
  static async userRegister(req, res) {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName)
      return res.status(200).send({ error: "First name required" });
    if (!lastName) return res.status(200).send({ error: "Last name required" });
    if (!email) return res.status(200).send({ error: "Email required" });
    if (!password) return res.status(200).send({ error: "Password required" });

    const user = await userUtils.getUser(
      { email },
      { projection: { password: false } }
    );
    if (user) return res.status(200).send({ error: "Email Already Exists" });

    // const salt = 10;
    // const hashPassword = bcrypt.hash(password, salt);
    console.log(password);
    const hashPassword = sha1(password);

    try {
      await dbClient.userCollection.insertOne({
        firstName,
        lastName,
        email,
        password: hashPassword,
      });
      return res.status(201).send({
        msg: "User Registered! You Can now login.",
        redirectUrl: "/login",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }

  /**
   * A function to login a registered user
   * @param {*} req Request form user
   * @param {*} res Response sent to user
   * @returns A response with status code and a json message
   */
  static async userLogin(req, res) {
    const { email, password, redirectUrl } = req.body;

    if (!email) return res.status(200).send({ error: "Email required" });
    if (!password) return res.status(200).send({ error: "Password required" });

    const user = await userUtils.getUser({ email });
    if (!user)
      return res.status(200).send({ error: "Invalid email or password" });

    try {
      // const isValid = bcrypt.compare(password, user.password);
      const hashPassword = sha1(password);
      if (hashPassword !== user.password) {
        return res.status(200).send({ error: "Invalid email or password" });
      }
      delete user.password;

      // uncomment below and remove the token on return
      const token = await userUtils.createToken(user._id.toString());
      res.cookie("X-Token", token, {
        // httpOnly: true,
        // secure: true,
        // sameSite: 'lax',
      });
      return res
        .status(200)
        .send({ msg: "You are logged in!", token, redirectUrl });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }

  /**
   * Gets the current user
   * @param {*} req Request form user
   * @param {*} res Response sent to user
   * @returns A response with status code and the user
   */
  static getUser(req, res) {
    delete req.user.key;
    if (!req.user.user) return res.status(400).send({ error: "Unauthorized" });

    delete req.user.user._id;

    const { user } = req.user;
    console.log("getUser", req.user.user);

    return res.status(201).send(user);
  }

  /**
   * A function to log out a logged in user
   * @param {*} req Request form user
   * @param {*} res Response sent to user
   * @returns A response with status code and a redirection to the main page
   */
  static async userLogout(req, res) {
    const { key } = req.user;
    if (!key) return res.status(400).send({ error: "Unauthorized 6" });

    try {
      await redisClient.del(key);
      res.clearCookie("X-Token");
      delete req.key;
      delete req.user;
      return res.status(201).send({ redirectUrl: "/" });
    } catch (error) {
      return res.status(500).send({ error: "Internal Server Error" });
    }
  }
}

export default UserController;
