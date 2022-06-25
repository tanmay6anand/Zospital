/* eslint-disable semi */
/* eslint-disable comma-dangle */
// eslint-disable-next-line new-cap
const router = require('express').Router();
const User = require('../model/users');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


router.post('/login', async (req, res) => {
  User.find({email: req.body.email})
      .exec()
      .then((user) => {
        if (user.length < 1) {
          return res.status(401).json({
            message: 'Auth failed'
          })
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
          if (err) {
            return res.status(401).json({
              message: 'Auth failed'
            })
          }
          if (result) {
            if (Number(Date.now()) < Number(user[0].nextLoginTime)) {
              return res.status(401).json({
                message: 'Login blocked for this account for 30 mins'
              })
            }
            console.log(Date.now(), user[0].nextLoginTime);
            const token = jwt.sign(
                {
                  email: user[0].email,
                  userId: user[0]._id,
                  scope: 'user'
                },
                process.env.TOKEN_SECRET,
                {
                  expiresIn: '1h'
                }
            )
            User.findByIdAndUpdate(
                {_id: user[0]._id},
                {loginAttempts: 0, nextLoginTime: Date.now()}
            ).exec()
            return res.status(200).json({
              message: 'Auth successful',
              token: token,
              response: user[0],
              createdAt: Date.now
            })
          }
          User.findByIdAndUpdate(
              {_id: user[0]._id},
              {loginAttempts: user[0].loginAttempts + 1}
          ).exec()
          if (user[0].loginAttempts == 4) {
            const d = new Date();
            const time = d.getTime()
            const MINS30 = 3 * 600000
            User.findByIdAndUpdate(
                {_id: user[0]._id},
                {nextLoginTime: time + MINS30}
            ).exec()
            return res.status(401).json({
              message: 'Auth failed more than 4 times please try after 30mins'
            })
          }
          if (user[0].loginAttempts >= 4) {
            return res.status(401).json({
              message: 'Auth failed more than 4 times please try after 30mins'
            })
          }
          res.status(401).json({
            message: 'Auth failed'
          })
        })
      })
      .catch((err) => {
        console.log(err)
        res.status(500).json({
          error: err
        })
      })
})

router.post('/signup', (req, res) => {
  User.find({email: req.body.email})
      .exec()
      .then((user) => {
        if (user.length >= 1) {
          return res.status(409).json({
            message: 'Mail exists'
          })
        } else {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              console.log(err)
              return res.status(500).json({
                error: err
              })
            } else {
              const user = new User({
              // required data
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                password: hash,
                name: req.body.name,
                age: req.body.age
              })
              user
                  .save()
                  .then((result) => {
                    console.log(result)

                    res.status(201).json({
                      message: 'User created'
                    })
                  })
                  .catch((err) => {
                    console.log(err)
                    res.status(500).json({
                      error: err
                    })
                  })
            }
          })
        }
      })
})

router.post('/addfavmovie', async (req, res) => {
  const emailPayload = req.body.email
  const movies = req.body.moviesID
  const data = await User.findOne({email: req.body.email}).exec()
  if (data.favourite_movies != null) {
    for (let i = 0; i < data.favourite_movies.length; i++) {
      if (movies.includes(data.favourite_movies[i])) {
        return res.status(400).json({
          // eslint-disable-next-line max-len
          message: 'Error in setting movie as favourite as one or more movie is already in favourites'
        })
      }
    }
  }
  const movieSet = new Set()
  for (let i = 0; i < movies.length; i++) {
    movieSet.add(movies[i]);
  }
  if (movieSet.size != movies.length) {
    return res.status(402).json({
      message: 'Payload contains movie more than one time '
    // eslint-disable-next-line semi
    })
  }
  User.findOneAndUpdate(
      {email: emailPayload},
      {$push: {favourite_movies: movies}}
  )
      .exec()
      .then((result) => {
        return res.status(200).json({
          message: 'Fav movies added successfully'
        })
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err
        })
      })
})

module.exports = router;
