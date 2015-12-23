var express = require('express');

var mongodb = require('mongodb')

var cn = "mongodb://localhost:27017/chessDB"

var router = express.Router();
// var reques = require('request')
var users ={name:"Miki", age:34};
/* GET users listing. */
router.get('/', function(req, res) {
    res.json(users)
});

var game = { version: 0 }


router.get("/getVersion", function(req, res) {
  res.json(game)
})

router.get("/setVersion", function(req, res) {
  game.version++
  res.json(game)
})


router.get("/createGame", function(req, res) {
  var user1 = req.query.u1
  var user2 = req.query.u2
  
  var newGame = {
    user1: user1,
    user2: user2,
    gameId: Math.random().toString() + Math.random().toString(),
    steps: [ [{a:1}],[{b:2}] ]
  }
  
  mongodb.connect(cn, function(err, db) {
    db.collection("games").insert(newGame, function(err, result) {
      console.log("done!!!", err, result);
      res.json(newGame)
    })
  })
})

router.get("/doStep", function(req, res) {
  var id = req.query.t
  var step = req.query.step
  
  mongodb.connect(cn, function(err, db) {
    db.collection("games").find({gameId: id}).toArray(function(err, tables) {
      console.log("table loaded", err, tables)
      var table = tables[0];
      table.steps.push(step)
      db.collection("games").save(table, function(err, result) {
            console.log("step saved!", err)
            res.json({ok:1});
      });
    });
  })
  
})

module.exports = router;
