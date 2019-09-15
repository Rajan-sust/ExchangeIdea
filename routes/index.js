var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var crypto = require('crypto');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

var url = "mongodb://127.0.0.1:27017";


function getHash(pswd) {
  return crypto.createHash('sha256').update(pswd).digest('hex');
}



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/register', function (req, res, next) {
  res.render('register');
});

router.post('/register', function (req, res, next) {
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;

  MongoClient.connect(url, function(err, client) {
    if (err) throw err;
    var myobj = {
      username : username,
      email: email,
      password: getHash(password)
    };
    var db = client.db("exchange-idea");
    db.collection("users").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("Document of 1 User Inserted");
      client.close();
    });
  });

  // console.log(username);
  res.redirect('/register?status=' + encodeURIComponent('success'));

});

router.get('/login', function(req, res, next) {
  res.render('login');

});

router.get('/home', function (req, res, next) {
  res.render('home');
});



module.exports = router;


/*
show dbs
use mydb
show collections
*/

