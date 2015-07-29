
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
        //var timeAtStart=new Date().getTime()
        var result=ai(tableFromDb.table,tableFromDb.wNext)
        // var timeItTook=new Date().getTime()-timeAtStart
        // console.log(timeItTook+" ms")
        if(result.length>1){  //if there are any moves
          var aiMoveString=result[1][0]
          var toConsole=[]  //to chat?
          
          for(var i=0;i<result.length;i++){
            toConsole[i-1]=               result[i][0]+'__'+
                                          result[i][1]+'__'+
                                          result[i][2]+'__'+
                                          result[i][3];
                                             
          }
          
          
          
          var sendJson={aimove: aiMoveString, fulltable: result, toconsole: toConsole}
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