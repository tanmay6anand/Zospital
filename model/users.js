/* eslint-disable comma-dangle */
// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema(
    {
      _id: mongoose.Schema.Types.ObjectId,
      name: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      mobile: {
        type: Number,
        required: true,
        unique: true,
      },
      age: {
        type: Number,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
      loginAttempts: {
        type: Number,
        default: 0,
      },
      nextLoginTime: {
        type: String,
        default: Date.now(),
      },
      // eslint-disable-next-line comma-dangle
      timestamps: true
    }
);

module.exports = Users = mongoose.model('Users', UserSchema);
