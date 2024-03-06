import { ObjectId } from 'mongodb';

import redisClient from '../utils/redis';
import userUtils from '../utils/user';

/**
 * Authentication Controller
 */
class AuthController {
    /**
   * A function to verify a user
   * @param {*} req Request form user
   * @param {*} res Response sent to user
   * @param {function} next the next function to be executed
   * @returns If success, it continues the next function to be executed
   */
    static async verifyUser(req, res, next) {
        const redirectUrl = req.body.redirectUrl;
        const token = req.header('cookie')
            ?.split('; ')
            ?.find(cookie => cookie.startsWith('X-Token='))
            ?.split('=')[1];
        if (!token) {
            return res.status(200).send({ error: 'Unauthorized' });
        }

        const key = `auth_${token}`;

        try {
            const userId = await redisClient.get(key);
            if (!userId) return res.status(400).send({ error: 'Unauthorized' });

            const userObjId = ObjectId(userId);
            const user = await userUtils.getUser({ _id: userObjId }, { projection: { password: false } });
            if (!user) return res.status(400).send({ error: 'Unauthorized' });

            req.user = { user, key, redirectUrl };
            next();
        } catch (error) {
            console.log(error);
            return res.status(400).send({ error: 'Unauthorized' });
        }
    }
}

export default AuthController;
