var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var crypto = require('crypto');
var cookieParser = require('cookie-parser');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

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

  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
    if (err) throw err;
    var myobj = {
      username : username,
      email: email,
      password: getHash(password)
    };
    const collection = client.db("exchange-idea").collection("users");
    collection.insertOne(myobj, function(err, res) {
      if (err) throw err;
      client.close();
    });
  });

  // console.log(username);
  res.redirect('/register?status=' + encodeURIComponent('success'));

});

router.get('/login', function(req, res, next) {
  res.render('login');

});


router.post('/login', function(req, res, next) {

  console.log('After posting login form');

  var email = req.body.email;
  var password = getHash(req.body.password);
 

  MongoClient.connect(url, { useNewUrlParser: true , useUnifiedTopology: true}, function(err, client) {
    if (err) throw err;
    var query = {
      email: email,
      password: password
    };
    const collection = client.db("exchange-idea").collection("users");
    collection.find(query).toArray(function(err, items) {
      if(items.length == 1) {
        res.cookie('userData',items[0],{ maxAge: 1000 * 60 * 60 * 24 });
        res.redirect('/home');
      } else{
        res.redirect('/login?error=' + encodeURIComponent('incorrect'));
      }
      client.close();
    });
  });

 




});

router.get('/home', function (req, res, next) {
  res.render('home');
});



module.exports = router;


/*
show dbs
use mydb
show collections
db.collection_name.find().pretty()
*/

