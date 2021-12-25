const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: 'String',
    required: [true, 'Please provide a name'],
    maxlength: 30,
  },
  email: {
    type: 'String',
    required: [true, 'Please provide a email'],
    validate: [validator.isEmail, 'Please provide a valid email'],
    unique: true,
    maxlength: 50,
  },
  password: {
    type: 'String',
    required: [true, 'Please provide a password'],
    minlength: 8,
    maxlength: 50,
    select: false,
  },
  confirmPassword: {
    type: 'String',
    required: [true, 'Please confirm your password'],
    validate: {
      // Custom validators only works on save() and create()
      validator: function (val) {
        return val === this.password;
      },
      message: 'Confirm password is different from password',
    },
  },
  photo: {
    type: 'String',
    default: 'default.png',
  },
  passwordChangedAt: Date,
  role: {
    type: 'String',
    default: 'user',
  },
  resetToken: String,
  resetTokenExpiresIn: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// pre hooks only run when save() and create()
userSchema.pre('save', async function (next) {
  // We are checking if we modified the password when called save() or create() : to prevent hashing our hashed password
  // Bcoz we update other details like email with save(), not findAndUpdate() : So hash only when password is changed or password will be re-hashed
  if (this.isModified('password')) {
    this.confirmPassword = undefined;
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (this.isNew || !this.isModified('password')) next();
  this.passwordChangedAt = Date.now() - 1000; // -1000 Bcoz mongoose takes few more milliseconds to update field than JWT token issue, and that would be issue if passwardChangedAt > JWT_TimeStamp
  next();
});

// Prevent deleted user to appear in "Get All Users" - implemening pre find hook in userModel
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.generateResetToken = function () {
  // Create hashed string hex encoded
  const resetToken = crypto.randomBytes(16).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetToken = hashedToken;

  const expiresIn = 10; // in minutes
  this.resetTokenExpiresIn = Date.now() + expiresIn * 60 * 1000;

  return resetToken;
};

userSchema.methods.checkPassword = async function (givenPass, userPass) {
  return await bcrypt.compare(givenPass, userPass);
};

userSchema.methods.changedPasswordAfter = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const userPassChangeTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return userPassChangeTimeStamp > jwtTimeStamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
