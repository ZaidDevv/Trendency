const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const routes = require('./routes/routes.js')
const session = require('express-session');
const passport = require('passport')
require('dotenv').config()
const createHttpError = require('http-errors')

require("./utils/mongoose.js");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('Trendency Gateway'))


app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET
}));

app.use('/uploads', express.static('uploads'))
app.use(passport.initialize());
app.use(passport.session());


// Main Route
app.use('/api', routes)

//* Catch HTTP 404 
app.use((req, res, next) => {
  next(createHttpError(404));
})

//* Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      status: err.status || 500,
      message: err.message
    }
  })
});

app.listen(process.env.PORT || 3000, () => console.log(`Trendency listening on port ${process.env.PORT}`))


module.exports = {
  app
}

