const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username:   { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:   { type: String, select: false },
    googleId:   { type: String, select: false },
    role:       { type: String, enum: ['ADMIN', 'AUTHOR', 'READER'], default: 'AUTHOR' },
    avatar:     { type: String, default: null },
    bio:        { type: String, maxlength: 300, default: '' },
    isVerified: { type: Boolean, default: false },
    isBanned:   { type: Boolean, default: false },
    followers:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    points:     { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.googleId;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
