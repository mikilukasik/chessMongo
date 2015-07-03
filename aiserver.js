
//app.listen(16789


var express = require('express');
var morgan = require('morgan');
var mongodb = require('mongodb');
var fs = require('fs');

var app = express();

//app.use(express.static('public'))
app.use(morgan("combined"))

var cn='mongodb://localhost:17890/chessdb'

eval(fs.readFileSync('public/brandNewAi.js')+'');
//eval(fs.readFileSync('public/tableClass.js')+'');


app.get('/aiChoice', function (req, res) {

  mongodb.connect(cn, function(err, db) {
    db.collection("tables").findOne({tableNum: Number(req.query.t)},function(err2, tableFromDb) {
    
      if(!(tableFromDb==null)){
        var result=ai(tableFromDb.table,tableFromDb.wNext)
        if(result.length>1){  //if there are any moves
          var result1=result[1][0]
          
          var sendJson={aimove: result1, fulltable: result}
        }else{
          var sendJson={aimove: "", fulltable: result}
        }
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