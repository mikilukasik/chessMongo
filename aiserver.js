
//
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
//var mongoTable=[]
  
 
  
mongodb.connect(cn, function(err, db) {
    db.collection("tables").findOne({tableNum: Number(req.query.t)},function(err2, tableFromDb) {
      //console.log("loaded", err2, tableFromDb)
      if(!(tableFromDb==null)){
      
        //mongoTable = tableFromDb.table;
        
        var result=ai(tableFromDb.table,tableFromDb.wNext)
        var result1=result[1][0]
      }
     	res.json({aichoice: result1, fullchoicetable: result});

    
  });
})
  
  
  
//   dbTables.find({"tableNum":req.query.t}).toArray(function(err, results){
//     console.log(results); // output all records
// });
  //     console.log("tables loaded", err, thisDbTable)
  //     var mongoTable = thisDbTable[1];
   //console.log(mongoTable)
      
  // });
      
  //0//nem allTables[req.query.t]
	
  // if(req.query.p==2){			//2 stands for white
	//    var result=ai(mongoTable,true)
  // }else{
	//   var result=ai(mongoTable,false)
	  
  // }
  // result1=result[1][0]
 	// res.json({aichoice: result1, fullchoicetable: result});

});






var server = app.listen(80801, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});