// This is a Script containing a class whose methods handle API routes
import cryptoJS from 'crypto-js';
import User from '../models/User';

export default class UsersController {
  /**
   * Creates a new user by saving their username, email and password
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async createNewUser(req, res) {
    // Validate the 'username' sent
    const username = req.body ? req.body.username : null;
    if (!username) {
      res.status(400).send({ error: 'Missing username' });
      return;
    }

    // Validate the 'email' sent
    const email = req.body ? req.body.email : null;
    if (!email) {
      res.status(400).send({ error: 'Missing email' });
      return;
    }

    // Validate the 'password' sent
    const reqPassword = req.body ? req.body.password : null;
    if (!reqPassword) {
      res.status(400).send({ error: 'Missing password' });
      return;
    }

    const user = await User.findOne({ email });

    // Verify that the 'email' not in Database
    if (user && user.email === email) {
      res.status(400).send({ error: 'Email already in use' });
      return;
    }

    // Hash 'reqPassword' using 'AES'
    const hashedPwd = cryptoJS.AES.encrypt(
      reqPassword,
      process.env.SECRET_KEY,
    ).toString();

    // Save 'new user' to MongoDB
    const newUser = new User({
      username,
      email,
      password: hashedPwd,
    });

    const { password, ...details } = newUser._doc;

    // Return all user data except the password
    res.status(201).send(details);
  }

  /**
   * Retrieves the user through the request object's token
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async getMe(req, res) {
    const { id } = req.user_info;

    try {
      const user = await User.findById(id);
      const { password, ...details } = user;
      return res.status(201).send({ details });
    } catch (err) {
      return res.status(500).send({ error: err });
    }
  }

  /**
   * Retrieve all users in the database
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async getAll(req, res) {
    // Extract the user's information
    const { isAdmin } = req.user_info;
    const query = req.query.new;

    // Proceed with deletion of user
    if (isAdmin) {
      try {
        const users = query
          ? await User.find().sort({ _id: -1 }).limit(10)
          : await User.find();
        return res.status(201).send(users);
      } catch (err) {
        return res.status(500).send({ error: err });
      }
    }

    return res.status(403).send({ error: 'Forbidden' });
  }

  /**
   * Compiles a report on users in the database
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async getStats(req, res) {
    // Extract the user's information
    const { isAdmin } = req.user_info;

    // Proceed with report compilation
    if (isAdmin) {
      try {
        const stats = await User.aggregate([
          { $project: { month: { $month: '$createAt' } } },
          { $group: { _id: '$month', total: { $sum: 1 } } },
        ]);
        return res.status(201).send(stats);
      } catch (err) {
        return res.status(500).send({ error: err });
      }
    }

    return res.status(403).send({ error: 'Forbidden' });
  }

  /**
   * Updates the user based on the info in the request object
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async updateUser(req, res) {
    // Extract the user's information
    const { id, isAdmin } = req.user_info;

    // Proceed with updation of user details
    if (id === req.params.id || isAdmin) {
      // Ensure password gets changed if it was the target
      if (req.body.password) {
        // Hash 'password' using 'AES'
        req.body.password = cryptoJS.AES.encrypt(
          req.body.password,
          process.env.SECRET_KEY,
        ).toString();
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(
          id,
          { $set: req.body },
          { new: true },
        );
        return res.status(201).send(updatedUser);
      } catch (err) {
        return res.status(500).send({ error: err });
      }
    }

    return res.status(403).send({ error: 'Forbidden' });
  }

  /**
   * Deletes a user, by User himself or Admin
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async deleteUser(req, res) {
    // Extract the user's information
    const { id, isAdmin } = req.user_info;

    // Proceed with deletion of user
    if (id === req.params.id || isAdmin) {
      try {
        await User.findByIdAndDelete(id);
        return res.status(204);
      } catch (err) {
        return res.status(500).send({ error: err });
      }
    }

    return res.status(403).send({ error: 'Forbidden' });
  }
}
