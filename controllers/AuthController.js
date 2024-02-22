import { v4 } from 'uuid';
import redisClient from '../utils/redis';
import userUtils from '../utils/user';

class AuthController {
    static async createToken(email, token) {
        const user = await userUtils.getUser({ email}, { projection: { password: false } });
        if (!user) return {};

        if (token !== null) await redisClient.del(`auth_${token}`);

        const newtoken = v4();
        const key = `auth_${newtoken}`;
        const expirationHour = 24;

        await redisClient.set(key, user._id.toString(), expirationHour * 3600);

        return newtoken;
    }

    static async validateUser(req, res) {
        const { token, userId } = req.header
    }
}

export default AuthController;