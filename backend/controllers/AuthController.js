// File containing endpoints authenticating a user
import cryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default class AuthController {
  /**
   * Sign in a user by generating a new Auth Token
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async signingIn(req, res) {
    // Sign in a user using database password verification
    // Extract user information from the request object
    const { email, password: pwd } = req.body;

    // Ensure the DB contains a user with the input email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send({ error: 'Invalid Email' });
    }

      if (cryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY).toString(cryptoJS.enc.Utf8) !== pwd) {
      return res.status(401).send({ error: 'Incorrect Password' });
    }

    // Generate a Json Web Token associated to the user
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.SECRET_KEY,
      { expiresIn: '5d' },
    );

    const { password, ...details } = user._doc;

    // Return all user data except the password
    return res.status(201).send({ ...details, accessToken: token});
  }
}
