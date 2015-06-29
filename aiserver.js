
//app.listen(16789


var express = require('express');
var morgan = require('morgan');
var app = express();
//
var mongodb = require('mongodb');
//var monk = require('monk');
//var db = monk('localhost:27017/chessdb');
var cn='mongodb://localhost:27017/chessdb'

//
//http://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files
var fs = require('fs');

// file is included here:
eval(fs.readFileSync('public/brandNewAi.js')+'');
eval(fs.readFileSync('public/tableClass.js')+'');
//http://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files


app.use(express.static('public'))
app.use(morgan("combined"))

// Make our db accessible to our router
// app.use(function(req,res,next){
//     req.db = db;
//     next();
// });
//
//var dbTables=db.get('tables');




var dletters = ["a","b","c","d","e","f","g","h"]




app.get('/aiChoice', function (req, res) {

  mongodb.connect(cn, function(err, db) {
    db.collection("tables").findOne({tableNum: Number(req.query.t)},function(err2, tableFromDb) {
   
      if(!(tableFromDb==null)){
        var result=ai(tableFromDb.table,tableFromDb.wNext)
        var result1=result[1][0]
      }
      db.close()
      res.json({aichoice: result1, fullchoicetable: result});
    
    });
    //db.close()
  });
  
  


});






var server = app.listen(16789, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});