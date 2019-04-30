const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const mediaTable = require('./media_table');

passport.serializeUser((user, done) => {
  console.log('serialize:', user);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new LocalStrategy(
    (username, password, done) => {
      console.log('Here we go: ' + username);
      let res = null;

      const doLogin = (username, password) => {
        return new Promise((resolve, reject) => {
          mediaTable.login([username], (result) => {
            bcrypt.compare(password, result[0].passwd, (err, res) => {
              // res == true
              if (res) {
                resolve(result);
              } else {
                reject(err);
              }
            });
          });
        });
      };

      return doLogin(username, password).then((result) => {
        if (result.length < 1) {
          console.log('undone');
          return done(null, false);
        } else {
          console.log('done');
          delete result[0].passwd; // remove password from user's data before sending it to frontend
          return done(null, result[0]); // result[0] is user's data, accessible as req.user
        }
      }).catch(err => {
        console.log('err', err);
      });
    },
));

const login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) { // if login not happening
      return res.sendStatus(403); // http code forbidden
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.send(req.user); // if login succesful, send user object
    });
  })(req, res, next);
};

// register
const register = (req, res, next) => {
  console.log(req.body);
  const saltRounds = 10;
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    // Store hash in your password DB.
    console.log('hash', hash);
    mediaTable.register([req.body.username, hash], next);
  });
};

// function to check if the user has logged in, to be used in middleware
const loggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    console.log(req.user);
    res.sendStatus(403);
  }
};

module.exports = {
  login: login,
  register: register,
  loggedIn: loggedIn,
};

