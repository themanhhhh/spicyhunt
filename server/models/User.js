import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String },
  email: { type: String, unique: true, sparse: true },
  imgUrl: { type: String },
  role: { type: String, enum: ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'], default: 'CUSTOMER' },
  state: { type: String, enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'], default: 'ACTIVE' },
  refreshToken: { type: String },
  otpCode: { type: String },
  otpExpiry: { type: Date },
  resetPasswordToken: { type: String },
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
