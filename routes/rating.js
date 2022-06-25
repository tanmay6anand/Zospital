/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable new-cap */
const router = require('express').Router();
const Movie = require('../model/movie');
const mongoose = require('mongoose');
const verify = require('./verifytoken');
const jwt = require('jsonwebtoken');

router.post('/addmovie', verify, (req, res) => {
  const movie1 = req.body.movie;
  Movie.findOne({movieName: movie1})
      .exec()
      .then((movie) => {
        if (movie != null) {
          if (movie.movieName == movie1) {
            return res.status(401).json({
              message: 'Movie already exists with the same name',
            })
          }
        }

        const movies = new Movie({
          _id: new mongoose.Types.ObjectId(),
          movieName: movie1,
        })
        movies
            .save()
            .then((result) => {
              console.log(result)
              return res.status(201).json({
                message: 'Movie added successfully',
              })
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({
                error: err,
              })
            })
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        })
      })
});

router.get('/findmovie/:name', verify, async (req, res) => {
  let data = await Movie.find({
    $or: [
      {
        movieName: {$regex: req.params.name},
      },
    ],
  })
      .exec()
      .then((data) => {
        if (data.length < 1) {
          return res.status(404).json({
            message: 'Movie not found',
          })
        }
        console.log(data);
        return res.status(200).json({
          movies: data,
        })
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        })
      })
});

router.post('/addrating', verify, async (req, res) => {
  const movie1 = req.body.movie;
  const rating1 = req.body.rating;
  if (rating1 > 5 || rating1 < 0) {
    return res.status(402).json({
      message: 'WRONG RATING,Please give rating between 0 and 5',
    })
  }
  let movieData = await Movie.findOne({movie: movie1})
      .exec()
      .then((movieData) => {
        if (movieData == null) {
          return res.status(404).json({
            message: 'Movie Not found,Please add the movie first',
          })
        } else if (movieData.rating == null) {
          Movie.updateOne({movieName: movie1}, {rating: rating1})
              .exec()
              .then((result) => {
                let token = req.header('auth-token');
                let tokenData = jwt.decode(token);
                console.log(tokenData);
                Movie.findOneAndUpdate(
                    {movieName: movie1},
                    {
                      $push: {
                        ratingHistory: {
                          rating: rating1,
                          UserID: tokenData.userId,
                          email: tokenData.email,
                        },
                      },
                    // eslint-disable-next-line comma-dangle
                    }
                ).exec()
                return res.status(200).json({
                  message: 'Rating Added successfully',
                  NewRating: rating1,
                })
              })
        } else {
          let newRating = (movieData.rating + rating1) / 2;
          newRating = Number(newRating.toPrecision(2));
          let token = req.header('auth-token');
          let tokenData = jwt.decode(token);
          for (let i=0; i<movieData.ratingHistory.length; i++) {
            if (movieData.ratingHistory[i].email == tokenData.email) {
              return res.status(402).json({
                message: 'This user has already given review',
              })
            }
          }
          Movie.updateOne({movieName: movie1}, {rating: newRating})
              .exec()
              .then((result) => {
                console.log(tokenData);
                Movie.findOneAndUpdate(
                    {movieName: movie1},
                    {
                      $push: {
                        ratingHistory: {
                          rating: rating1,
                          UserID: tokenData.userId,
                          email: tokenData.email,
                        }
                      }
                    // eslint-disable-next-line comma-dangle
                    }
                ).exec()
                return res.status(200).json({
                  message: 'Rating updated successfully',
                  NewRating: newRating,
                  PreviousRating: movieData.rating,
                })
              })
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        })
      })
});


module.exports = router;
