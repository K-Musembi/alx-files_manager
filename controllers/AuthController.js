import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const credentialsBase64 = authHeader.split(' ')[1];
    const userCredentials = Buffer.from(credentialsBase64, 'base64').toString('ascii');
    const [email, password] = userCredentials.split(':');
    const hashPw = crypto.createHash('sha1').update(password).digest('hex');
    const user = await dbClient.db.collection('users').findOne({ email, password: hashPw });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const newToken = uuidv4();
    const newKey = `auth_${newToken}`;
    await redisClient.set(newKey, user._id.toString(), 86400);

    return res.status(200).json({ token: newToken });
  }

  static async getDisconnect(req, res) {
    const newToken = req.headers['x-token'];

    if (!newToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${newToken}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(`auth_${newToken}`);

    return res.status(204).send();
  }
}

export default AuthController;
