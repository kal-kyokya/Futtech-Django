// This is a Script containing a class whose methods handle API routes
import List from '../models/List';

export default class ListsController {
  /**
   * Creates a list of videos
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async createNewList(req, res) {
    // Extract the user's information
    const { isAdmin } = req.user_info;

    // Create the list
    const newList = new List(req.body);

    // Proceed with create of the list
    if (isAdmin) {
      try {
        const savedList = await newList.save();
        return res.status(201).send(savedList);
      } catch (err) {
        return res.status(500).send({ error: err });
      }
    }
  }

  /**
   * Retrieves a list from the database
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async getList(req, res) {
    // Extract the list category
    const { category, subCategory } = req.query;
    let lists = [];

    // Proceed with retrieval of a list
    try {
      if (category) {
        if (subCategory) {
          lists = await List.aggregate([
            { $match: { category, subCategory } },
            { $sample: { size: 3 } },
          ]);
        } else {
          lists = await List.aggregate([
            { $match: { category } },
            { $sample: { size: 3 } },
          ]);
        }
      } else {
        lists = await List.aggregate([{ $sample: { size: 3 } }]);
      }

      res.status(201).send(lists);
    } catch (err) {
      return res.status(500).send({ error: err });
    }
  }

  /**
   * Compiles a report for lists in the database
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async getStats(req, res) {
    // Extract the users's information
    const { isAdmin } = req.list_info;

    // Proceed with report compilation
    if (isAdmin) {
      try {
        const stats = await List.aggregate([
          { $project: { month: { $month: '$createAt' } } },
          { $group: { _id: '$month', total: { $sum: 1 } } },
        ]);
        return res.status(201).send(stats);
      } catch (err) {
        return res.status(500).send({ error: err });
      }
    }
  }

  /**
   * Deletes a list from the database
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async deleteList(req, res) {
    // Extract the user's information
    const { isAdmin } = req.user_info;

    // Proceed with deletion of list
    if (isAdmin) {
      try {
        await List.findByIdAndDelete(req.params.id);
        return res.status(204);
      } catch (err) {
        return res.status(500).send({ error: err });
      }
    }
  }
}
