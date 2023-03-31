const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const mainRoute = require('./routes/main');
const schedulerRoute = require('./routes/scheduler');
const clientsRoute = require('./routes/clients');
const statisticsRoute = require('./routes/statistics');
const statementsRoute = require('./routes/statements');
const authRoute = require('./routes/auth');
const profileRoute = require('./routes/profile');

const isAuth = require('./middleware/is-auth');
const errorController = require('./controllers/error');

const User = require('./models/user');

const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
  session({
    secret: 'tacataca',
    resave: false,
    saveUninitialized: false,
    store,
  })
);
app.use(flash());
app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  res.locals.user = req.session.user;
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

/////////////////////////////////// ROUTES
app.use('/profile', isAuth, profileRoute);
app.use('/clients', isAuth, clientsRoute);
app.use('/scheduler', isAuth, schedulerRoute);
app.use('/statistics', isAuth, statisticsRoute);
app.use('/statements', isAuth, statementsRoute);
app.use('/', authRoute);
app.use('/', isAuth, mainRoute);

app.get('/500', errorController.get500);
app.use(errorController.get404);

// app.use((error, req, res, next) => {
//   res.status(500).render('500', {
//     page: 'A aparut o eroare',
//     isLoggedIn: req.session.isLoggedIn,
//   });
// });
/////////////////////////////////// ROUTES

mongoose
  .connect()
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
