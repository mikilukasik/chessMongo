//app.listen 80801

var express = require('express');
var morgan = require('morgan');
var app = express();

var activeGames=[]
activeGames[0]=[]
activeGames[1]=[]
var tablesLastMoved=[]
//http://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files
var fs = require('fs');

// file is included here:
eval(fs.readFileSync('public/brandNewAi.js')+'');
//http://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files



app.use(express.static('public'))
app.use(morgan("combined"))



var dletters = ["a","b","c","d","e","f","g","h"]




app.get('/aiChoice', function (req, res) {
	var startTime=(new Date()).getTime()
  
  //itt mongobul ko szedni a tablat nemalltablesbol
  var mongoTable= 0//nem allTables[req.query.t]
	
  if(req.query.p==2){			//2 stands for white
	   var result=ai(mongoTable,true)
  }else{
	  var result=ai(mongoTable,false)
	  
  }
  result1=result[1][0]
 	res.json({aichoice: result1, fullchoicetable: result});

});






var server = app.listen(80801, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});