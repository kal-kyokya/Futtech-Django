// This is a Script containing a class whose methods handle API routes
import Video from '../models/Video.js';
import Mux from '@mux/mux-node';
import User from '../models/User.js';

export default class VideosController {
  /**
   * Uploads a video to MUX
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async uploadVideo(req, res) {
    // Extract the user's information
    const { id } = req.userInfo;

    const muxTokenId = process.env.MUX_TOKEN_ID;
    const muxTokenSecret = process.env.MUX_TOKEN_SECRET;

    // Initialize Mux
    const mux = new Mux({
	tokenId: muxTokenId,
	tokenSecret: muxTokenSecret,
    });

    // Proceed with upload of the video
    try {
      // Create a direct upload URL
      const upload = await mux.uploads.create({
	  new_asset_settings: {
	      playback_policy: [ 'public' ],
	      video_quality: 'basic'
	  },
	  cors_origin: 'https://www.futtech.kalkyokya.tech',
      });

      const user = await User.findOne({ id });
      user.uploads.push(upload.id);
      res.status(201).send({ uploadUrl: upload.url, uploadId: upload.id });
    } catch (err) {
      console.error('Mux upload URL creation error - ', err);
      return res.status(500).send({ error: err });
    }
  }

  /**
   * Get a video's playback ID from MUX
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async getPlaybackId(req, res) {
    const { uploadId } = req.params;

    // Extract the user's information
    const { id } = req.userInfo;
    const user = await User.findOne({ id });

    const muxTokenId = process.env.MUX_TOKEN_ID;
    const muxTokenSecret = process.env.MUX_TOKEN_SECRET;

    // Initialize Mux
    const mux = new Mux({
	tokenId: muxTokenId,
	tokenSecret: muxTokenSecret,
    });

    // Proceed with retrieval of the playback ID
    try {
      if (!user.uploads.includes(uploadId)) {
	return res.status(404).send({ error: 'Upload not found' });
      }

      // Check upload status from Mux
      const muxUpload = await mux.uploads.get({ uploadId });
      if (!muxUpload.asset_id) {
          res.status(202).send({ message: 'Mux asset not ready yet' });
      }

      // Check asset playback ID
      const asset = await mux.assets.get(muxUpload.asset_id);

      const playbackId = asset.playback_ids?.[0]?.id;
      if (!playback) {
          res.status(202).send({ message: 'Playback ID not ready yet' });
      }

      res.status(200).send({ playbackId });
    } catch (err) {
      console.error('Error fetching playback ID ', err);
      return res.status(500).send({ error: err });
    }
  }

  /**
   * Uploads a video's metadata to the database
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async createNewVideo(req, res) {
    // Create the video
    const newVideo = new Video(req.body);

    // Proceed with upload of the video
    try {
      const savedVideo = await newVideo.save();
      return res.status(201).send(savedVideo);
    } catch (err) {
      return res.status(500).send({ error: err });
    }
  }

  /**
   * Retrieves a video thanks to the request params 'id'
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async getVideo(req, res) {
    try {
      const video = await Video.findById(req.params.id);
      return res.status(201).send(video);
    } catch (err) {
      return res.status(500).send({ error: err });
    }
  }

  /**
   * Retrieves a random video from the database
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async getRandomVideo(req, res) {
    // Extract the video category
    const { category } = req.query;
    let video;

    // Proceed with random retrieval of a video
    try {
      if (category === 'drone') {
        video = await Video.aggregate([
          { $match: { isDrone: true } },
          { $sample: { size: 1 } },
        ]);
      } else {
        video = await Video.aggregate([
          { $match: { isDrone: false } },
          { $sample: { size: 1 } },
        ]);
      }
      res.status(201).send(video);
    } catch (err) {
      return res.status(500).send({ error: err });
    }
  }

  /**
   * Retrieves all the videos in the database
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async getAll(req, res) {
    // Extract the user's information
    const { id, isAdmin } = req.userInfo;

    // Proceed with deletion of video
    if (isAdmin) {
      try {
        const videos = await Video.find();
        return res.status(201).send(videos.reverse());
      } catch (err) {
        return res.status(500).send({ error: err });
      }
    } else {
      try {
        const videos = await Video.find( { owner: id } );
        return res.status(201).send(videos.reverse());
      } catch (err) {
        return res.status(500).send({ error: err });
      }
    }
  }

  /**
   * Compiles a report for videos in the database
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async getStats(req, res) {
    // Extract the users's information
    const { isAdmin } = req.videoInfo;

    // Proceed with report compilation
    if (isAdmin) {
      try {
        const stats = await Video.aggregate([
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
   * Updates the video based on the info in the request object
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async updateVideo(req, res) {
    // Extract the user's information
    const { id, isAdmin } = req.userInfo;

    // Proceed with updation of the video
    if (isAdmin) {
      try {
        const updatedVideo = await Video.findByIdAndUpdate(
          req.params.id,
          { $set: req.body },
          { new: true },
        );
        return res.status(201).send(updatedVideo);
      } catch (err) {
        return res.status(500).send({ error: err });
      }
    } else if (id === req.body.owner) {
      try {
        const updatedVideo = await Video.findByIdAndUpdate(
          req.params.id,
          { $set: req.body },
          { new: true },
        );
        return res.status(201).send(updatedVideo);
      } catch (err) {
        return res.status(500).send({ error: err });
      }
    }

    return res.status(500).send({ error: 'Failed to update the video' });
  }

  /**
   * Deletes a video from the database
   * @param { Object } req - The request object
   * @param { Object } res - The response object
   */
  static async deleteVideo(req, res) {
    // Extract the user's information
    const { id, isAdmin } = req.userInfo;

    // Proceed with deletion of video
    if (isAdmin) {
      try {
        await Video.findByIdAndDelete(req.params.id);
        return res.status(204);
      } catch (err) {
        return res.status(500).send({ error: err });
      }
    } else if (id === req.headers.owner) {
      try {
        await Video.findByIdAndDelete(req.params.id);
        return res.status(204);
      } catch (err) {
        return res.status(500).send({ error: err });
      }
    }

    return res.status(500).send({ error: 'Failed to delete the video' });
  }
}
