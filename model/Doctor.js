/* eslint-disable comma-dangle */
/* eslint-disable require-jsdoc */
const mongoose = require('mongoose');
const MoviesSchema = new mongoose.Schema(
    {
      _id: mongoose.Schema.Types.ObjectId,
      movieName: {
        type: String,
        required: false,
        unique: true,
      },
      rating: {
        type: Number,
        validate: [ratingCheck, 'Rating should be between 0 to 5'],
      },
      ratingHistory: [
        {
          rating: {type: Number},
          UserID: {type: String},
          email: {type: String},
        }
      ]
    },
    // eslint-disable-next-line comma-dangle
    {timestamps: true}
);
function ratingCheck(val) {
  return 0 <= val <= 5;
}

module.exports = Movies = mongoose.model('Movies', MoviesSchema);
