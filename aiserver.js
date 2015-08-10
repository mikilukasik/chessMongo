//app.listen(16789
var express = require('express');
var morgan = require('morgan');
var mongodb = require('mongodb');
var fs = require('fs');

var app = express();

//app.use(express.static('public'))
app.use(morgan("combined"))

var cn = 'mongodb://localhost:17890/chessdb'

eval(fs.readFileSync('public/brandNewAi.js') + '');
eval(fs.readFileSync('public/engine.js')+'');

app.get('/aiChoice', function(req, res) {

	mongodb.connect(cn, function(err, db) {
		db.collection("tables").findOne({
			tableNum: Number(req.query.t)
		}, function(err2, tableFromDb) {

			if(!(tableFromDb == null)) {

				var result = ai(tableFromDb.table, tableFromDb.wNext)			//		ai	<------------

				if(result.length > 1) { //if there are any moves

					var aiMoveString = result[1][0] // the winning movestring

					var toConsole = [] //to chat?

					toConsole[0] = result[0][2]+" ms." //timeItTook

					for(var i = 1; i < result.length; i++) {

						toConsole[i] = 	'stepMove: '+result[i][0] + '  ' +
										//'pushThisValue: '+
										result[i][1]+ ' <br>' +
										'hisBestRtnMove: '+result[i][2]+ ' <br>' +
										'rtnValue: '+result[i][3]+ ' <br>' +
										'captureScore: '+result[i][4]+ ' <br>' +
										'smallValScore: '+result[i][5]+ ' <br>' +
										'dontGetHit: '+result[i][6]+ ' <br>' +
										'tTable2Value: '+result[i][7]+ ' <br>' +
										'temp: '+result[i][8]+ ' <br>' +
										' -------------------<br><br>';
										
										
										//[stepMove, pushThisValue, hisBestRtnMove, rtnValue, captureScore, smallValScore, dontGetHit,tTable2Value]
					}

					var sendJson = {
						aimove: aiMoveString,
						fulltable: result,
						toconsole: toConsole
					}
				} else {
					var sendJson = {
						aimove: "",
						fulltable: result
					}
				}
			} else {
				var sendJson = {
					error: "error"
				}
			}

			db.close()
			res.json(sendJson);

		});
	});
});

app.get('/test', function(req, res) {

	var result = []

	var testDepth = 5	//default
	if(!isNaN(req.query.d)) testDepth = req.query.d	//or set

	var testTable = new Dbtable(0, "wtest", "btest").table
	//testTable.wNext = false
	testTable=moveIt("e2e4",testTable)

	for(var i = 0; i < testDepth; i++) {

		result[i] = ai(testTable, false) //		ai	<------------

	}

	var toConsole = [] //to chat?
	var avgSpeed=0
	
	for (var i=0; i<result.length; i++){
		avgSpeed += result[i][0][2]
	}
	
	avgSpeed /=result.length
	
	toConsole[0] = 'Average: '+avgSpeed+' ms.  Move: ' + result[0][1][0] // the winning movestring

	for(var i = 0; i < result.length; i++) {

		toConsole[i + 1] = (i + 1) + ': ' + result[i][0][2] + ' ms' 

	}

	var sendJson = {

		toconsole: toConsole
		
	}

	res.json(sendJson);

});



var server = app.listen(16789, function() {

	var host = server.address().address;
	var port = server.address().port;

	console.log('aiserver is listening at http://%s:%s', host, port);

});