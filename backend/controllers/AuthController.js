// File containing endpoints authenticating a user
import cryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export default class AuthController {
  /**
   * Sign in a user by generating a new Auth Token
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async signingIn(req, res) {
    // Sign in a user using 'Basic Authentication'
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // Extract user information from the encoded header
    const credentials = Buffer.from(header.split(' ')[1], 'base64').toString('utf-8');
    // const credentials = header.split(' ')[1];
    const email = credentials.split(':')[0];

    // Ensure the DB contains a user with the input email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    if (user.password !== cryptoJS.AES.encrypt(credentials.split(':')[1], process.env.SECRET_KEY)) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // Generate a Json Web Token associated to the user
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.SECRET_KEY,
      { expiresIn: '5d' },
    );
    return res.status(200).send({ token });
  }
}
