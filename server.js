require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const cookieParser = require('cookie-parser');


const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/signup', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser())

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, 'publics')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


// // Routes
const indexRoutes = require('./routes/admin');
app.use('/', indexRoutes);

const requireAuth = (req, res, next) => {
  if (req.session.user) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return next();
  } else {
    return next();
  }
};

const indRoutes = require('./routes/user');
app.use('/', indRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
