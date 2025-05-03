import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema(
  {
    owner: { type: String, required: true },
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: true },
    location: { type: String, default: '' },
    isDrone: { type: String, required: true },
    isAiAnalysis: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: String, default: new Date().toJSON() },
    content: { type: String, required: true },
    thumbnail: { type: String, required: true },
  },
  { timestamps: true },
);

const Video = new mongoose.model('Video', VideoSchema);
export default Video;
