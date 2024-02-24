import { ObjectId } from 'mongodb';

import redisClient from '../utils/redis';
import userUtils from '../utils/user';

class AuthController {
    static async verifyUser(req, res, next) {
        // const token = req.header('cookie').split('=')[1];
        const token = req.header('cookie')
            ?.split('; ')
            ?.find(cookie => cookie.startsWith('X-Token='))
            ?.split('=')[1];
        const key = `auth_${token}`;

        if (!token) {
            return res.status(401).send({ error: 'Unauthorized' });
        }

        try {
            const userId = await redisClient.get(key);
            if (!userId) return res.status(401).send({ error: 'Unauthorized' });

            const userObjId = ObjectId(userId);
            const user = await userUtils.getUser({ _id: userObjId }, { projection: { password: false } });
            if (!user) return res.status(401).send({ error: 'Unauthorized' });

            req.user = user; // Store userId in request object
            req.key = key;
            next();
        } catch (error) {
            console.log(error);
            return res.status(403).send({ error: 'Unauthorized' });
        }
    }
}

export default AuthController;
