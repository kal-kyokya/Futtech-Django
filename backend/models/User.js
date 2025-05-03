import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: 'First Name' },
    lastName: { type: String, default: 'Last Name' },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    position: { type: String, default: 'Position' },
    profession: { type: String, default: 'Profession' },
    profilePic: { type: String, default: 'BlankProfile.png' },
    career: { type: Boolean, default: false },
    phone: { type: String, default: 'Phone' },
    location: { type: String, default: 'Location' },
    sex: { type: String, default: 'Sex' },
    isAdmin: { type: Boolean, default: false },
    birthday: { type: Date, default: new Date().toJSON() },
  },
  { timestamps: true },
);

const User = new mongoose.model('User', UserSchema);
export default User;
