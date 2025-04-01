import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema(
  {
    owner: { type: String, required: true },
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: true },
    location: { type: String, default: '' },
    isDrone: { type: Boolean, required: true },
    isAiAnalysis: { type: Boolean, required: true },
    category: { type: String, required: true },
    date: { type: String, default: new Date().toJSON() },
    content: { type: String, required: true },
    trailer: { type: String, default: 'turf.mp4' },
    thumbnail: { type: String, default: 'logo.png' },
    thumbnailSmall: { type: String, default: 'logo.png' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Video', VideoSchema);
