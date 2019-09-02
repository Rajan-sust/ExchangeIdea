var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

var url = "mongodb://127.0.0.1:27017";



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

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("exchange-idea");
    var myobj = {
      username : username,
      email: email,
      password: password

    };
    dbo.collection("users").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("Document of 1 User Inserted");
      db.close();
    });
  });

  // console.log(username);
  res.redirect('/register');

});

router.get('/login', function(req, res, next) {
  res.render('login');

});

router.get('/home', function (req, res, next) {
  res.render('home');
});



module.exports = router;
