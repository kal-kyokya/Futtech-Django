// This file contains a class protecting routes that require login or logout
import jwt from 'jsonwebtoken';

export default class AuthMiddleWare {
  /**
   * Ensures the request comes from a logged in user
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   * @param { function } next - Function relaying control
   */
  static async loginRequired(req, res, next) {
    // Extract the Authentication token
    const token = req.headers['auth-token'];
    if (!token) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // Validate the token sent
    await jwt.verify(
      token,
      process.env.SECRET_KEY,
      (err, userInfo) => {
        if (err) {
          return res.status(401).send({ error: 'Unauthorized' });
        }
        req.userInfo = userInfo;
        return next();
      },
    );

    return res.status(401).send({ error: 'Unauthorized' });
  }

  /**
   * Ensure the request comes from a logged out user
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   * @param { function } next - Function relaying control
   */
  static async logoutRequired(req, res, next) {
    if (req.headers['x-token']) {
      return res.redirect('/users/me');
    }
    return next();
  }
}
