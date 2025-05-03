import mongoose from 'mongoose';

const ListSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    category: { type: String },
    subCategory: { type: String },
    thumbnail: {type: String},
    content: { type: Array }
  },
  { timestamps: true },
);

const List = new mongoose.model('List', ListSchema);
export default List;
