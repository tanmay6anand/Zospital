/* eslint-disable comma-dangle */
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const port = 5000;
const app = express();

require('dotenv').config();

mongoose
    .connect(process.env.URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('database is connected!!'))
    .catch((err) => console.log(err));

app.use(
    bodyParser.urlencoded({
      extended: true,
    })
);
app.use(bodyParser.json());

const router = require('./routes/user');
const rating = require('./routes/rating');

app.use('/', router);
app.use('/', rating);

app.listen(process.env.PORT || port, () => {
  console.log(`the service is running on ${port}`);
});
