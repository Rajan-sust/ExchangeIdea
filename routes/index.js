var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var crypto = require('crypto');
var cookieParser = require('cookie-parser');
var mongo = require('mongodb');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var url = "mongodb://127.0.0.1:27017";


function getHash(pswd) {
  return crypto.createHash('sha256').update(pswd).digest('hex');
}



/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/login');
});


router.get('/register', function (req, res, next) {
  if(req.cookies.userData) {
    res.redirect('/home');
  }else {
    res.render('register');
  }



  
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
    collection.find({email: email}).toArray(function(err, items) {
      if(err) throw err;
      if(items.length > 0) {
        res.redirect('/register?status=' + encodeURIComponent('email-already-used'));

      } else{
        collection.insert(myobj, function(err, res) {
          if(err) throw err;
          res.redirect('/register?status=' + encodeURIComponent('success'));


        });
      }
      client.close();


    });
   
  });
  

});

router.get('/login', function(req, res, next) {

  if(req.cookies.userData) {
    res.redirect('/home');
  }else {
    res.render('login');
  }
});


router.post('/login', function(req, res, next) {

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
      if(err) throw err;

      if(items.length == 1) {
        res.cookie('userData',items[0],{ maxAge: 1000 * 60 * 60 * 24 });
        res.redirect('/home');
      } else{
        res.redirect('/login?status=' + encodeURIComponent('incorrect'));
      }
      client.close();
    });
  });

});


router.get('/logout', function (req, res) {
  res.clearCookie('userData');
  res.redirect('/login');
});

router.get('/home', function (req, res, next) {
  if(req.cookies.userData == undefined) {
    res.redirect('/login');
  } else{




    MongoClient.connect(url, { useNewUrlParser: true , useUnifiedTopology: true}, function(err, client) {
      if (err) throw err;
      
      const collection = client.db("exchange-idea").collection("questions");
      collection.find().toArray(function(err, items) {
        if(err) throw err;

        res.render('home', {

          username : req.cookies.userData.username,
          email : req.cookies.userData.email,
          questions : items
        });
  
        
        client.close();
      });
    });


    
  }

});




router.get('/askquestion', function(req, res, next){
  if(req.cookies.userData == undefined) {
    res.redirect('/login');
  } else{
    res.render('askquestion', {
      username : req.cookies.userData.username,
      email : req.cookies.userData.email
    });
  }
});


router.get('/myquestion', function(req, res, next) {
    //res.send("hello world");
    MongoClient.connect(url, { useNewUrlParser: true , useUnifiedTopology: true}, function(err, client) {
        if(err) throw err;
        const collection = client.db("exchange-idea").collection("questions");
        var query = { email:  req.cookies.userData.email};
        collection.find(query).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            res.render('myquestion', {
                username : req.cookies.userData.username,
                email : req.cookies.userData.email,
                data : result
            });
            client.close();
        });

    });

});




router.post('/askquestion', function(req, res, next) {

  
  //console.log(question);
  //res.send('value received from form');



  MongoClient.connect(url, { useNewUrlParser: true , useUnifiedTopology: true}, function(err, client) {
    if (err) throw err;
    var question = {
      title : req.body.title,
      content : req.body.content,
      tag : req.body.tag,
      email : req.cookies.userData.email,
      time : new Date().getTime(),
      answeredBy: []
    }

    console.log(question);
    const collection = client.db("exchange-idea").collection("questions");

    collection.insert(question, function(err, res) {
      if(err) throw err;
      client.close();




    });
    
  });

  res.redirect('/home');

  


});

router.get('/question/:id', function(req, res, next) {

  var id = req.params.id;
  MongoClient.connect(url, { useNewUrlParser: true , useUnifiedTopology: true}, function(err, client) {
    if (err) throw err;
    
    const collection = client.db("exchange-idea").collection("questions");

    collection.findOne({"_id" : new mongo.ObjectID(id)}, function(err, result) {
      if(err) throw err;

      res.render('question', {
        username : req.cookies.userData.username,
        email : req.cookies.userData.email,
        question : result,
        

      });
      client.close();


    });
    
  });

  router.post('/answer', function(req, res, next) {

      var newAnswer = {
        
        username: req.cookies.userData.username,
        content: req.body.content
       
      }
      
      MongoClient.connect(url, { useNewUrlParser: true , useUnifiedTopology: true}, function(err, client) {
        if(err) throw err;
        const collection = client.db("exchange-idea").collection("questions");
        collection.updateOne({_id:new mongo.ObjectID(req.body.questionId)}, {$push:{answeredBy: newAnswer}},function(err, result){
          if(err) throw err;
          res.redirect('/question/' + req.body.questionId);
          client.close();
        });
      });
  });

  module.exports = router;



  


});



module.exports = router;


/*
show dbs
use mydb
show collections
db.collection_name.find().pretty()
db.createCollection("col-name") -> create a collection
*/

