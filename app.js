const express = require('express')
const bodyParser = require('body-parser')
const app = express()
var cors = require('cors')
const session = require('express-session');
const routes = require('./routes/routes.js')
require('dotenv').config()
var morgan = require('morgan');
var cookieParser = require('cookie-parser');

require("./utils/mongoose.js");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.send('Trendency Gateway'))


app.use(cookieParser());
app.use(morgan('dev'))
app.use('/uploads', express.static('uploads'))
app.use(session({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  cookie: { httpOnly: false, secure: false, maxAge: 86400000 },
  resave: false
}));

app.use(cors({ credentials: true, withCredentials: true }))

// Main Route
app.use('/api', routes)


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

