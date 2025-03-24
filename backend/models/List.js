import mongoose from 'mongoose';

const ListSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    category: { type: String },
    subCategory: { type: String },
    content: { type: Array },
    thumbnail: {type: String}
  },
  { timestamps: true },
);

module.exports = mongoose.model('List', ListSchema);
