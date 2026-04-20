// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema(
//   {
//     username:   { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
//     email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
//     password:   { type: String, select: false },
//     googleId:   { type: String, select: false },
//     role:       { type: String, enum: ['ADMIN', 'AUTHOR', 'READER'], default: 'AUTHOR' },
//     avatar:     { type: String, default: null },
//     bio:        { type: String, maxlength: 300, default: '' },
//     isVerified: { type: Boolean, default: false },
//     isBanned:   { type: Boolean, default: false },
//     followers:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//     following:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//     points:     { type: Number, default: 0 },
//   },
//   { timestamps: true }
// );

// // Hash password before save
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password') || !this.password) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// userSchema.methods.comparePassword = async function (plain) {
//   return bcrypt.compare(plain, this.password);
// };

// userSchema.methods.toPublicJSON = function () {
//   const obj = this.toObject();
//   delete obj.password;
//   delete obj.googleId;
//   delete obj.__v;
//   return obj;
// };

// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    username:   { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:   { type: String, select: false },
    googleId:   { type: String, select: false },
    role:       { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'AUTHOR', 'READER'], default: 'AUTHOR' },
    avatar:     { type: String, default: null },
    bio:        { type: String, maxlength: 300, default: '' },
    isVerified: { type: Boolean, default: false },
    isBanned:   { type: Boolean, default: false },
    followers:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    points:     { type: Number, default: 0 },
    // Verification & Reset tokens
    verifyToken: String,
    verifyExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Generates a token, hashes it for the DB, and returns the plain version for the email
userSchema.methods.generateToken = function (type) {
  const token = crypto.randomBytes(20).toString('hex');
  const hashed = crypto.createHash('sha256').update(token).digest('hex');

  if (type === 'verify') {
    this.verifyToken = hashed;
    this.verifyExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 Hours
  } else {
    this.resetPasswordToken = hashed;
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 Mins
  }
  return token;
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.googleId;
  delete obj.verifyToken;
  delete obj.verifyExpire;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);