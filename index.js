const express = require('express');
require('dotenv').config();
const mediaTable = require('./utils/media_table');
const multer = require('multer');
const resize = require('./utils/resize');
const exif = require('./utils/exif');
const bodyParser = require('body-parser');
const pass = require('./utils/pass');
const session = require('express-session');
const passport = require('passport');

const app = express();

app.use(session({
  secret: 'keyboard LOL cat',
  resave: true,
  saveUninitialized: true,
  cookie: {secure: false},
}));

app.use(passport.initialize());
app.use(passport.session());

// tiedostojen tallennuskansio
const upload = multer({dest: 'public/uploads/'});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

// parse application/json
app.use(bodyParser.json());

app.use(express.static('public'));

app.use('/modules', express.static('node_modules'));

app.get('/all', (req, res) => {
  mediaTable.select(res);
  // res.sendStatus(200);
});

// get users own images
app.get('/my', pass.loggedIn, (req, res) => {
  const data = [req.user.uID];
  console.log(data);
  mediaTable.selectMyImages(data, res);
  // res.sendStatus(200);
});

app.post('/image', pass.loggedIn, upload.single('my-image'),
    (req, res, next) => {
      // req body comes now from multer
      next();
      /*
      const response = {
      message: 'File uploaded',
      file: req.file,
      };
      res.send(response);
      */
    });

app.use('/image', (req, res, next) => {
  // tee pieni thumbnail
  resize.doResize(req.file.path, 300, './public/thumbs/' + req.file.filename).
      then(data => {
        next();
      });

});

app.use('/image', (req, res, next) => {
  // tee iso thumbnail
  resize.doResize(req.file.path, 640, './public/medium/' + req.file.filename).
      then(data => {
        next();
      });
});

// get coordinates
app.use('/image', (req, res, next) => {
  console.log('coordinates');
  exif.getCoordinates(req.file.path).then(coords => {
    req.coordinates = coords; // add new property to req object
    next();
  }).catch(() => {
    console.log('No coordinates');
    req.coordinates = {lat: 64, lng: 24}; // if no coordinates, add dummy object
    next();
  });
});

app.use('/image', (req, res, next) => {
  // lisää kuvan tiedot tietokantaan
  console.log('insert');
  const data = [
    req.body.category,
    req.body.title,
    req.body.details,
    'thumbs/' + req.file.filename,
    'medium/' + req.file.filename,
    'uploads/' + req.file.filename,
    req.coordinates,
    req.user.uID, // from passport (database column is uID)
  ];
  mediaTable.insert(data, res);
});

// update image
app.patch('/update', pass.loggedIn, (req, res) => {
  // req body comes now from body-parser
  console.log('body', req.body);
  // add userID to req.body
  req.body.push(req.user.uID);
  console.log('new body', req.body);
  // use req.body as data
  mediaTable.update(req.body, res);
});

// delete image
app.delete('/del/:mID', pass.loggedIn, (req, res) => {
  const data = [
    req.params.mID,
    req.user.uID, // userID
  ];
  mediaTable.del(data, res);
});

// authentication with custom callback (http://www.passportjs.org/docs/authenticate/)
app.post('/login', pass.login);

// register new user, automatically login
app.post('/register', pass.register, pass.login);

app.listen(3000);