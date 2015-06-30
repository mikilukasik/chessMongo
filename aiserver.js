
//app.listen(16789


var express = require('express');
var morgan = require('morgan');
var mongodb = require('mongodb');
var fs = require('fs');

var app = express();

app.use(express.static('public'))
app.use(morgan("combined"))

var cn='mongodb://localhost:27017/chessdb'

eval(fs.readFileSync('public/brandNewAi.js')+'');
eval(fs.readFileSync('public/tableClass.js')+'');


var dletters = ["a","b","c","d","e","f","g","h"]

//temp

var tempPracticeTable=new Dbtable(Math.floor(Math.random()*10000)+10000)
tempPracticeTable.wNext="dfsdsfsdfdfsdfsdf"
// Submit to the DB
mongodb.connect(cn, function(err, db) {
    db.collection("tables").insert(tempPracticeTable, function (err, doc) {});
    db.close()
})
//temp end



app.get('/moveInDb', function (req, res) {

  mongodb.connect(cn, function(err, db) {
      db.collection("tables").findOne({tableNum: Number(req.query.t)},function(err2, tableInDb) {
     
     
      var moveStr=String(req.query.m)

      
      var toPush=  String(tableInDb.table[dletters.indexOf(moveStr[0])][moveStr[1]-1][0])+
                    tableInDb.table[dletters.indexOf(moveStr[0])][moveStr[1]-1][1]+
                    moveStr+
                    tableInDb.table[dletters.indexOf(moveStr[2])][moveStr[3]-1][0]+
                    tableInDb.table[dletters.indexOf(moveStr[2])][moveStr[3]-1][1]
      
      if(!(toPush==tableInDb.moves[tableInDb.moves.length-1])){
        tableInDb.moves.push(toPush)
        tableInDb.table=moveIt(moveStr,tableInDb.table)
        tableInDb.wNext=!tableInDb.wNext
        tableInDb.pollNum++
        
        
        tableInDb.table=addMovesToTable(tableInDb.table,tableInDb.wNext)
      
      }
           
     
     
     
     
     
     
     
      
      
      
      
      
      
      db.collection("tables").save(tableInDb, function(err3,res){})
      db.close()
    });
    
    
    
    //db.close()
    res.json({});
    
  });
});





app.get('/aiChoice', function (req, res) {

  mongodb.connect(cn, function(err, db) {
    db.collection("tables").findOne({tableNum: Number(req.query.t)},function(err2, tableFromDb) {
    
      if(!(tableFromDb==null)){
        var result=ai(tableFromDb.table,tableFromDb.wNext)
        var result1=result[1][0]
        
        var sendJson={aichoice: result1, fullchoicetable: result}
      }else{
        var sendJson={error:"error"}
      }
      
      db.close()
      res.json(sendJson);
    
    });
  });
});






var server = app.listen(16789, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});