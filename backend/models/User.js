import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    position: { type: String, default: '' },
    profession: { type: String, default: '' },
    profilePic: { type: String, default: '' },
    career: { type: Boolean, default: false },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    sex: { type: String, default: '' },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', UserSchema);
