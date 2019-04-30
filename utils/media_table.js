'use strict';
const db = require('./database');

const select = (res) => {
  // simple query
  db.connect().query(
      'SELECT * FROM bc_media',
      (err, results, fields) => {
        // console.log(results); // results contains rows returned by server
        // console.log(fields); // fields contains extra meta data about results, if available
        if (err == null) {
          res.send(results);
        } else {
          console.log(err);
        }
      },
  );
};

const selectMyImages = (data, res) => {
  // simple query
  db.connect().execute(
      'SELECT * FROM bc_media WHERE userID = ?',
      data,
      (err, results, fields) => {
        // console.log(results); // results contains rows returned by server
        // console.log(fields); // fields contains extra meta data about results, if available
        if (err == null) {
          res.send(results);
        } else {
          console.log(err);
        }
      },
  );
};

const insert = (data, res) => {
  // simple query
  db.connect().execute(
      'INSERT INTO bc_media (category, title, details, thumbnail, image, original, coordinates, userID) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
      data,
      (err, results, fields) => {
        // console.log(results); // results contains rows returned by server
        // console.log(fields); // fields contains extra meta data about results, if available
        if (err == null) {
          res.send(results);
        } else {
          console.log(err);
        }
      },
  );
};

const update = (data, res) => {
  // simple query
  db.connect().execute(
      'UPDATE bc_media SET category = ?, title = ?, details = ? WHERE mID = ? AND userID = ?;',
      data,
      (err, results, fields) => {
        // console.log(results); // results contains rows returned by server
        // console.log(fields); // fields contains extra meta data about results, if available
        if (err == null) {
          res.send(results);
        } else {
          console.log(err);
        }
      },
  );
};

const del = (data, res) => {
  // simple query
  db.connect().execute(
      'DELETE FROM bc_media WHERE mID = ? AND userID = ?;', // can delete only current user's images
      data,
      (err, results, fields) => {
        console.log(results); // results contains rows returned by server
        // console.log(fields); // fields contains extra meta data about results, if available
        if (err == null) {
          res.send(results);
        } else {
          console.log(err);
        }
      },
  );
};

const login = (data, callback) => {
  // simple query
  db.connect().execute(
      'SELECT * FROM bc_users WHERE email = ?;',
      data,
      (err, results, fields) => {
        console.log('results', results); // results contains rows returned by server
        // console.log(fields); // fields contains extra meta data about results, if available
        console.log(err);
        callback(results);
      },
  );
};

const register = (data, next) => {
  // simple query
  db.connect().execute(
      'INSERT INTO bc_users (email, passwd) VALUES (?, ?);',
      data,
      (err, results, fields) => {
        console.log(results); // results contains rows returned by server
        // console.log(fields); // fields contains extra meta data about results, if available
        console.log(err);
        next();
      },
  );
};

module.exports = {
  select: select,
  selectMyImages: selectMyImages,
  insert: insert,
  update: update,
  del: del,
  login: login,
  register: register,
};