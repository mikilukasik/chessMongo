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
eval(fs.readFileSync('public/js/deepening.js') + '');
eval(fs.readFileSync('public/js/classes.js') + '');
eval(fs.readFileSync('public/engine.js')+'');

app.get('/aiChoice', function(req, res) {

	mongodb.connect(cn, function(err, db) {
		db.collection("tables").findOne({
			_id: Number(req.query.t)
		}, function(err2, tableFromDb) {

			if(!(tableFromDb == null)) {

				var result = newAi(tableFromDb, req.query.mt, req.query.mv)			//		ai	<------------

				if(result.length > 1) { //if there are any moves

					var aiMoveString = result[1].move // the winning movestring

					var toConsole = [] //to chat?

					toConsole[0] = result[0][2]+" ms." //timeItTook
					
					
					
					

					for(var i = 1; i < result.length; i++) {
						
						// if(false){//i<4){
							
						// 	allTempTables.push([stepMove, pushThisValue, hisBestRtnMove, loopValue, captureScore, smallValScore,
			 			// 	dontGetHit,tTable2Value, retProtect, mhit, hhit, fwdVal,lsancValue,rsancValue,
						// 	 sancValue,getToMiddle,pushHimBack,mostMoved])
							
						// 	toConsole[i] = 	'stepMove: '+result[i][0] + //' <br> ' +
						// 				'pushThisValue: '+result[i][1]+ ' <br>' +
						// 				'hisBestRtnMove: '+result[i][2]+ ' <br>' +
						// 				'loopValue: '+result[i][3]+ ' <br>' +
						// 				'captureScore: '+result[i][4]+ ' <br>' +
						// 				'smallValScore: '+result[i][5]+ ' <br>' +
						// 				'dontGetHit: '+result[i][6]+ ' <br>' +
						// 				'tTable2Value: '+result[i][7]+ ' <br>' +
						// 				'retProtect: '+result[i][8]+ ' <br>' +
						// 				'mhit: '+result[i][9]+ ' <br>' +
						// 				'hhit: '+result[i][10]+ ' <br>' +
						// 				'fwdVal: '+result[i][11]+ ' <br>' +
						// 				'lsancValue: '+result[i][12]+ ' <br>' +
						// 				'rsancValue: '+result[i][13]+ ' <br>' +
						// 				'sancValue: '+result[i][14]+ ' <br>' +
						// 				'getToMiddle: '+result[i][15]+ ' <br>' +
										
						// 				' ----<br>';
							
						// }else{

							toConsole[i] = 	'Move:'+result[i].move //+ ' RMv:'+result[i][2]
							+ ', '+	'Val:'+result[i].score//+ 'a' //+
										// //' RMv:'+result[i][2]+ ',' +
										// ' lpV:'+result[i][3]+ ',' +
										// ' cpS:'+result[i][4]+ ',' +//
										// //' smV:'+result[i][5]+ ',' +//' <br>' +
										// ' dGH:'+result[i][6]+ ',' +//' <br>' +
										// ' t2V:'+result[i][7]+ ',' +//' <br>' +
										// ' rPr:'+result[i][8]+ ',' +//' <br>' +
										// ' mht:'+result[i][9]+ ',' +//' <br>' +
										// ' hht:'+result[i][10]+ ',' +//' <br>' +
										// //' fwV:'+result[i][11]+ ',' +//' <br>' +
										// //' lsc:'+result[i][12]+ ',' +//' <br>' +
										// //' rsc:'+result[i][13]+ ',' +//' <br>' +
										// //' scV:'+result[i][14]+ //',' +//' <br>' +
										// ' gTM:'+result[i][15]+ //',' +//' <br>' +
										// ' pHB:'+result[i][16]+ //',' +//' <br>' +
										// //' mMv:'+result[i][17]+ //',' +//' <br>' +
										
										// ' <br>----<br>';
						//}			
										
		// allTempTables.push([stepMove, pushThisValue, hisBestRtnMove, loopValue, captureScore,
		// 	 smallValScore, dontGetHit,tTable2Value, retProtect, mhit, hhit	, fwdVal,lsancValue,rsancValue,sancValue])
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