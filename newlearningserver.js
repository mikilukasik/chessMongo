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

var dletters = ["a", "b", "c", "d", "e", "f", "g", "h"]
var http = require('http')
app.get('/startLearningGame', function(req, res) {
//var myGame=0
	//var wPNum = players[0].indexOf(req.query.w)
	//var bPNum = players[0].indexOf(req.query.b)
var firstFreeTable=0

function createXData() {
	console.log("can't find xData in db, creating..") //header in db

	mongodb.connect(cn, function(err, db) {

		db.collection("tables")
			.insert({
				"tableNum": "xData",
				"firstFreeTable": 1,
				"lobbyChat": [],
				"activeTables": []
			}, function(err3, res) {})
		db.close()

	});
}

mongodb.connect(cn, function(err, db) {
	db.collection("tables")
		.findOne({
			tableNum: "xData"
		}, function(err2, xData) {
			if(xData == null) {

				createXData();

				firstFreeTable = 143223
			} else {
				firstFreeTable = xData.firstFreeTable
			}
			
			
				var initedTable = new Dbtable(firstFreeTable, "mod lpV:"+ req.query.mv,"standard")

	// mongodb.connect(cn, function(err, db) {
	// 	db.collection("users")
	// 		.findOne({
	// 			name: req.query.w
	// 		}, function(err2, userInDb) {
	// 			if(!(userInDb == null)) {
	// 				userInDb.games.unshift(initedTable.tableNum)

	// 				db.collection("users")
	// 					.save(userInDb, function(err3, res) {})

	// 			}
	// 			db.close()
	// 				// res.json({

	// 			// });
	// 		});

	// });

	// mongodb.connect(cn, function(err, db) {
	// 	db.collection("users")
	// 		.findOne({
	// 			name: req.query.b
	// 		}, function(err2, userInDb) {
	// 			if(!(userInDb == null)) {
	// 				userInDb.games.unshift(initedTable.tableNum)

	// 				db.collection("users")
	// 					.save(userInDb, function(err3, res) {})
	// 			}
	// 			db.close()
	// 				// res.json({

	// 			// });
	// 		});

	// });

	//mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.insert(initedTable, function(err, doc) {});
	//	db.close()
	//})
	var myGame=initedTable
	firstFreeTable++

	//mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				tableNum: "xData"
			}, function(err2, xData) {

				xData.firstFreeTable++

				db.collection("tables")
					.save(xData, function(err3, res) {})
	//			db.close()
			});
	//});
	
	//?dbTables.insert(initedTable, function (err, doc) {});

	// players[2][wPNum] = true; //ask wplayer to start game
	// players[2][bPNum] = true; //ask bplayer to start game

	// players[3][wPNum] = true; //will play w
	// players[3][bPNum] = false; //will play b

	// players[4][wPNum] = firstFreeTable
	// players[4][bPNum] = firstFreeTable

	// players[5][wPNum] = req.query.b; //give them the opponents name
	// players[5][bPNum] = req.query.w;

	//x
	console.log('Sending response to start request...')
	
	res.json({
		message: "table in db, thinking on first move..."
	});
	
	
	console.log('Response sent, thinking 1st move..')
	
//if(!(myGame == null)) {
playgame(myGame)
			
			db.close()
			
			
		});
});



function playgame (myGame,mt,mv) {
	



				var result = ai(myGame.table, myGame.wNext, myGame.allPastTables, mt, mv)			//		ai	<------------

				if(result.length > 1) { //if there are any moves

					var aiMoveString = result[1][0] // the winning movestring

					var toConsole = [] //to chat?

					toConsole[0] = result[0][2]+" ms." //timeItTook
					
					
					
					

					for(var i = 1; i < result.length; i++) {
						
		

							toConsole[i] = 	'Move:'+result[i][0] + ' RMv:'+result[i][2]+ ','+	'Val:'+result[i][1]+ 'a' //+
								
					}

					var sendJson = {
						aimove: aiMoveString,
						fulltable: result,
						toconsole: toConsole
					}
				} else {		//can't move
				
					//eval
				
				
					myGame.gameIsOn=false
				
				
					var sendJson = {
						aimove: "",
						fulltable: result
					}
				}
			//} else {
				// var sendJson = {
				// 	error: "error"
				// }
			//}

			//db.close()
			//console.log(sendJson);//trick
			console.log('Will move '+aiMoveString)
			
			
			
			
			
			
			
					var toPush = String(myGame.table[dletters.indexOf(aiMoveString[0])][aiMoveString[1] - 1][0]) + //color of whats moving
						myGame.table[dletters.indexOf(aiMoveString[0])][aiMoveString[1] - 1][1] + //piece
						aiMoveString + //the string
						myGame.table[dletters.indexOf(aiMoveString[2])][aiMoveString[3] - 1][0] + //color of whats hit
						myGame.table[dletters.indexOf(aiMoveString[2])][aiMoveString[3] - 1][1] //piece

					// if(!(toPush==myGame.moves[myGame.moves.length-1])){
					myGame.moves.push(toPush)
					
					myGame.table = moveIt(aiMoveString, myGame.table)
					
					myGame.wNext = !myGame.wNext

					//myGame.pollNum++ //<---- majd increment a checkTableStatus ha kiertekelte	//nemis

					//evalGame(myGame)

					myGame.pollNum++

						//myGame.toBeChecked = true //tells it to server(itself) to evaluate table

					myGame.moved = new Date().getTime()

					myGame.table = addMovesToTable(myGame.table, myGame.wNext)
					
					//remember this state for 3fold rule
					
					
					
					
					
					myGame.allPastTables.push(createState(myGame.table))
					
					

					//popThem(req.query.t, myGame, 'moved', 'Player moved: ' + aiMoveString) //respond to pending longpolls

					//}

					mongodb.connect(cn, function(err, db2) {
						db2.collection("tables")
							.findOne({
								tableNum: myGame.tableNum
							}, function(err2, result) {
								console.log('found table:'+result.tableNum)
								
								
								
								result.table=myGame.table
								result.moves=myGame.moves
								result.pollNum=myGame.pollNum
								result.wNext=myGame.wNext
								result.moved=myGame.moved
								result.allPastTables=myGame.allPastTables
								
								
								
								console.log('will save moved table..')
								db2.collection("tables")
									.save(result, function(err3, res) {})
									
								console.log('saved.')
								
								db2.close()
								console.log('closed.')
								
								
								
								
								var optionsb = {
									host: 'localhost',
									port: 80,
									path: '/forcePopTable?t='+myGame.tableNum+'&p=learner&m=move: '+aiMoveString
								};
								
								//http.request(optionsb, function(response){
									
								// 	console.log('jott vmi')
									
								// 	response.on('data', function(chunk) {
								// 	//resJsn = JSON.parse(chunk);
								// });

								// response.on('end', function() {
								// 	});
									
								//}).end()
							
								
								
								
								
								
								
								
								
								
								
								
								
								if (myGame.gameIsOn){
									
									
									
									
									
									
									
									
									
									
									
									
									
									
									
									console.log('recalling playgame')
									
									
									
									
									
									playgame(myGame)
									
								}				
							});
					});

			
			
			
			
			
			
			}
			
			
			
			
			
			
			
			
			
			
			
});





var server = app.listen(16778, function() {

	var host = server.address().address;
	var port = server.address().port;

	console.log('learningserver is listening at http://%s:%s', host, port);

});