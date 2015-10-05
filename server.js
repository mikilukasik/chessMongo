//
var express = require('express');
var morgan = require('morgan');

var fs = require('fs');
var mongodb = require('mongodb');
var io = require('socket.io');

var app = express();
var http = require('http')
var httpServ = http.Server(app);
var io = require('socket.io')(httpServ);

app.use(express.static('public'))
app.use(morgan("combined"))

var cn = 'mongodb://localhost:17890/chessdb'

eval(fs.readFileSync('public/brandNewAi.js') + '');
eval(fs.readFileSync('public/engine.js') + '');
//eval(fs.readFileSync('public/tableClass.js') + '');
//http://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files

var t1const = 11
var dletters = ["a", "b", "c", "d", "e", "f", "g", "h"]

var players = []

var playerDisconnectConst = 15000 //15sec
var gameInactiveConst = 300000 //5min
var checkGamesConst = 300

var pendingLongPolls = []

players[0] = [] //player names

players[1] = [] //players last polled

players[2] = [] //bolleans true if game is to start
players[3] = [] //player colors for new games
players[4] = [] //table numbers for new games
players[5] = [] //opponents name

var lobbyPollNum = 0
var lobbyChat = []

var firstFreeTable = 0

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

					firstFreeTable = 1
				} else {
					firstFreeTable = xData.firstFreeTable
					//xData.firstFreeTable++
				}
				// db.collection("tables")
				// 	.save(xData, function(err, doc) {});

				

				db.close()

			});
	});



setInterval(function() {

	// var needForEval = {
	// 	"wNext": true,
	// 	"tableNum": true,
	// 	"wName": true,
	// 	"bName": true,
	// 	"toBeChecked": true,
	// 	"whiteWon": true,
	// 	"blackWon": true,
	// 	"isDraw": true,
	// 	"gameIsOn": true,
	// 	"askWhiteDraw": true,
	// 	"askBlackDraw": true,
	// 	"whiteCanForceDraw": true,
	// 	"blackCanForceDraw": true,
	// 	"aiToMove": true
	// 		//"table": true
	// }

	// mongodb.connect(cn, function(err, setIntDB) {
	// 	//var laterThan = new Date().getTime()-gameInactiveConst
	// 	//if(!(setIntDB==null)){
	// 	setIntDB.collection("tables")
	// 		.find({
	// 			"toBeChecked": true // {"$gte": laterThan} 
	// 		}, needForEval).toArray(function(err2, gamesToCheck) {

	// 			gamesToCheck.forEach(function(checkThisGame) {

	// 				if((checkThisGame.wNext && checkThisGame.wName == "Computer") ||
	// 					(!checkThisGame.wNext && checkThisGame.bName == "Computer")) {
	// 					//need to make aiMove
	// 					var options = {
	// 						host: 'localhost',
	// 						port: 16789,
	// 						path: '/aichoice?t=' + checkThisGame.tableNum
	// 					};

	// 					http.request(options, function(response) {
	// 							var resJsn = {};

	// 							//another chunk of data has been recieved, so append it to `resJsn`
	// 							response.on('data', function(chunk) {
	// 								resJsn = JSON.parse(chunk);
	// 							});

	// 							response.on('end', function() {
	// 								/////////

	// 								mongodb.connect(cn, function(err, setIntDB2) { //itt egy server moveitot csinalunk vegulis
	// 									setIntDB2.collection("tables")
	// 										.findOne({
	// 											tableNum: Number(checkThisGame.tableNum)
	// 										}, function(err2, tableInDb) {
	// 											// console.log(resJsn)
	// 											// console.log('dssdfsdgs')
	// 											if(!(resJsn == null || tableInDb == null)) {
	// 												var moveStr = String(resJsn.aimove)
	// 												if(!(moveStr == "")) { //there's at least 1 move
	// 													var toPush = String(tableInDb.table[dletters.indexOf(moveStr[0])][moveStr[1] - 1][0]) + //color of whats moving
	// 														tableInDb.table[dletters.indexOf(moveStr[0])][moveStr[1] - 1][1] + //piece
	// 														moveStr + //the string
	// 														tableInDb.table[dletters.indexOf(moveStr[2])][moveStr[3] - 1][0] + //color of whats hit
	// 														tableInDb.table[dletters.indexOf(moveStr[2])][moveStr[3] - 1][1] //piece
	// 														//en passnal nem latszik a leveett paraszt

	// 													tableInDb.moves.push(toPush)
	// 													tableInDb.toBeChecked = true
	// 													tableInDb.table = moveIt(moveStr, tableInDb.table)
	// 													tableInDb.wNext = !tableInDb.wNext

	// 													evalGame(tableInDb)

	// 													tableInDb.pollNum++

	// 														tableInDb.moved = new Date().getTime()
	// 													tableInDb.chat = resJsn.toconsole

	// 													//tableInDb.toBeChecked = false //checked for now. this should be done later, there are other stuff to be checked

	// 													tableInDb.table = addMovesToTable(tableInDb.table, tableInDb.wNext)

	// 													popThem(Number(checkThisGame.tableNum), tableInDb, 'moved', 'Ai moved: ' + moveStr) //respond to pending longpolls

	// 													setIntDB2.collection("tables")
	// 														.save(tableInDb, function(err3, res) {})
	// 												}
	// 											}
	// 											setIntDB2.close()
	// 										});

	// 								});
	// 								/////////

	// 							});
	// 						})
	// 						.end();

	// 				}

	// 			})

	// 			setIntDB.close()

	// 		});

	// });

	//----------

	mongodb.connect(cn, function(err5, db2) {
		var laterThan = new Date().getTime() - gameInactiveConst

		if(!(db2 == null)) {
			db2.collection("tables")
				.find({
					"moved": {
						"$gte": laterThan
					}
				}, {
					"tableNum": true,
					"wName": true,
					"bName": true
				}).toArray(function(err25, actGames) {

					db2.collection("tables")
						.findOne({
							"tableNum": "xData"
						}, function(err24, xData) {

							xData.activeTables = actGames

							db2.collection("tables")
								.save(xData, function(err3, res) {
									db2.close()
								})
								//console.log('Games checked.')

						});

				});
		}

	});

}, checkGamesConst);

var popThem = function(tNum, tableInDb, commandToSend, messageToSend) {

	if(!(pendingLongPolls[tNum] == undefined)) {

		if(pendingLongPolls[tNum].length > 0) {
			//van mire valaszolni

			while(pendingLongPolls[tNum].length > 0) {

				var resp = pendingLongPolls[tNum].pop()

				var passMoves = tableInDb.moves
				var passTable = tableInDb.table
				var passWnext = tableInDb.wNext

				var passChat = tableInDb.chat

				var passPollNum = tableInDb.pollNum
					// db.close()

				resp.json({
					tablenum: tNum,
					table: passTable,
					next: passWnext,
					allmoves: passMoves,
					chat: passChat,
					tablepollnum: passPollNum,
					command: commandToSend,
					message: messageToSend
				});

			}

		}
	}
}



app.get('/move', function(req, res) {

	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				tableNum: Number(req.query.t)
			}, function(err2, tableInDb) {

				var moveStr = String(req.query.m)

				if(tableInDb == null){
					db.close()	
				}else {
					var toPush = String(tableInDb.table[dletters.indexOf(moveStr[0])][moveStr[1] - 1][0]) + //color of whats moving
						tableInDb.table[dletters.indexOf(moveStr[0])][moveStr[1] - 1][1] + //piece
						moveStr + //the string
						tableInDb.table[dletters.indexOf(moveStr[2])][moveStr[3] - 1][0] + //color of whats hit
						tableInDb.table[dletters.indexOf(moveStr[2])][moveStr[3] - 1][1] //piece

					// if(!(toPush==tableInDb.moves[tableInDb.moves.length-1])){
					tableInDb.moves.push(toPush)
					
					tableInDb.table = moveIt(moveStr, tableInDb.table)
					
					tableInDb.wNext = !tableInDb.wNext

					//tableInDb.pollNum++ //<---- majd increment a checkTableStatus ha kiertekelte	//nemis

					evalGame(tableInDb)

					tableInDb.pollNum++

						//tableInDb.toBeChecked = true //tells it to server(itself) to evaluate table

					tableInDb.moved = new Date().getTime()

					tableInDb.table = addMovesToTable(tableInDb.table, tableInDb.wNext)
					
					//remember this state for 3fold rule
					
					
					
					
					
					tableInDb.allPastTables.push(createState(tableInDb.table))
					
					

					popThem(req.query.t, tableInDb, 'moved', 'Player moved: ' + moveStr) //respond to pending longpolls

					//}

					db.collection("tables")
						.save(tableInDb, function(err3, res) {})

					///////

					//	if(tableInDb.gameIsOn){

					if(tableInDb.gameIsOn &&
						((tableInDb.wNext && tableInDb.wName == "Computer") ||
							(!tableInDb.wNext && tableInDb.bName == "Computer"))) {
						//need to make aiMove
						var options = {
							host: 'localhost',
							port: 16789,
							path: '/aichoice?t=' + tableInDb.tableNum
						};

						http.request(options, function(response) {
								var resJsn = {};

								//another chunk of data has been recieved, so append it to `resJsn`
								response.on('data', function(chunk) {
									resJsn = JSON.parse(chunk);
								});

								response.on('end', function() {
									/////////

						//			mongodb.connect(cn, function(err, setIntDB2) { //itt egy server moveitot csinalunk vegulis
										// setIntDB2.collection("tables")
										// 	.findOne({
										// 		tableNum: Number(tableInDb.tableNum)
										// 	}, function(err2, tableInDb2) {
												// console.log(resJsn)
												// console.log('dssdfsdgs')
												if(!(resJsn == null)) {
													var moveStr = String(resJsn.aimove)
													if(!(moveStr == "")) { //there's at least 1 move
														var toPush = String(tableInDb.table[dletters.indexOf(moveStr[0])][moveStr[1] - 1][0]) + //color of whats moving
															tableInDb.table[dletters.indexOf(moveStr[0])][moveStr[1] - 1][1] + //piece
															moveStr + //the string
															tableInDb.table[dletters.indexOf(moveStr[2])][moveStr[3] - 1][0] + //color of whats hit
															tableInDb.table[dletters.indexOf(moveStr[2])][moveStr[3] - 1][1] //piece
															//en passnal nem latszik a leveett paraszt

														tableInDb.moves.push(toPush)
														//tableInDb.toBeChecked = true
														tableInDb.table = moveIt(moveStr, tableInDb.table)
														
														tableInDb.wNext = !tableInDb.wNext

														evalGame(tableInDb)
														
														tableInDb.learnerIsBusy=false

														tableInDb.pollNum++

														tableInDb.moved = new Date().getTime()
														tableInDb.chat = resJsn.toconsole

														//tableInDb.toBeChecked = false //checked for now. this should be done later, there are other stuff to be checked

														tableInDb.table = addMovesToTable(tableInDb.table, tableInDb.wNext)
														
														//remember this state for 3fold rule
					
					
					
					
					
														tableInDb.allPastTables.push(createState(tableInDb.table))

														popThem(Number(tableInDb.tableNum), tableInDb, 'moved', 'Ai moved: ' + moveStr) //respond to pending longpolls
														
														db.collection("tables")
															.save(tableInDb, function(err3, res) {})
															
														
													}
												}
												//setIntDB2.close()
											//});

								//	});
									/////////
									db.close()
								});
							})
							.end();

					}else{
						db.close()
					}

					//}

					////////////	

				}
				//db.close()
			});

		//db.close()
		res.json({});

	});
});

app.get('/aiMove', function(req, res) {

	var options = {
		host: 'localhost',
		port: 16789,
		path: '/aichoice?t=' + req.query.t
	};

	http.request(options, function(response) {
			var resJsn = {};

			//another chunk of data has been recieved, so append it to `resJsn`
			response.on('data', function(chunk) {
				resJsn = JSON.parse(chunk);
			});

			response.on('end', function() {
				/////////

				mongodb.connect(cn, function(err, db) {
					db.collection("tables")
						.findOne({
							tableNum: Number(req.query.t)
						}, function(err2, tableInDb) {
							// console.log(resJsn)
							// console.log('dssdfsdgs')
							if(!(resJsn == null || tableInDb == null)) {
								var moveStr = String(resJsn.aimove)
								if(!(moveStr == "")) { //there's at least 1 move
									var toPush = String(tableInDb.table[dletters.indexOf(moveStr[0])][moveStr[1] - 1][0]) + //color of whats moving
										tableInDb.table[dletters.indexOf(moveStr[0])][moveStr[1] - 1][1] + //piece
										moveStr + //the string
										tableInDb.table[dletters.indexOf(moveStr[2])][moveStr[3] - 1][0] + //color of whats hit
										tableInDb.table[dletters.indexOf(moveStr[2])][moveStr[3] - 1][1] //piece

									// if(!(toPush==tableInDb.moves[tableInDb.moves.length-1])){
									tableInDb.moves.push(toPush)
									tableInDb.table = moveIt(moveStr, tableInDb.table)
									tableInDb.wNext = !tableInDb.wNext
									tableInDb.pollNum++
										tableInDb.moved = new Date().getTime()
									tableInDb.chat = resJsn.toconsole

									tableInDb.table = addMovesToTable(tableInDb.table, tableInDb.wNext)

									db.collection("tables")
										.save(tableInDb, function(err3, res) {})
								}
							}
							db.close()
						});

				});
				/////////

			});
		})
		.end();

	res.json({});

});

app.get('/getTPollNum', function(req, res) {

	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				tableNum: Number(req.query.t)
			}, function(err2, tableInDb) {

				if(!(tableInDb == null)) {
					var passPollNum = tableInDb.pollNum
				} else {
					var passPollNum = 0
				}

				db.close()
				res.json({
					tablepollnum: passPollNum
				});

			});

	});

});

//////////////////////////			user register

app.get('/newUser', function(req, res) {
	//var initedTable =

	var user = new Dbuser(req.query.n, req.query.p)
	mongodb.connect(cn, function(err, db) {
		db.collection("users")
			.insert(user, function(err, doc) {});
		db.close()

	});
	res.json({});
});

app.get('/checkUser', function(req, res) {
	//var initedTable =

	var retJsn = {}

	//var user=new Dbuser(req.query.n, req.query.p)
	mongodb.connect(cn, function(err, db) {
		//db.collection("users")

		db.collection("users").findOne({
			name: req.query.n
		}, function(err, thing) {
			if(thing == null) {
				retJsn = {
					'exists': false
				}
			} else {
				retJsn = {
					'exists': true
				}
			}
			db.close()
			res.json(retJsn)
		})

	});

});

app.get('/checkUserPwd', function(req, res) {
	//var initedTable =

	var retJsn = {}

	//var user=new Dbuser(req.query.n, req.query.p)
	mongodb.connect(cn, function(err, db) {
		//db.collection("users")

		db.collection("users").findOne({
			name: req.query.n
		}, function(err, thing) {
			if(thing == null) {
				retJsn = {
					'exists': false,
					'denied': true
				}

			} else {
				//record exists, let's check pwd
				if(thing.pwd == req.query.p) {
					//password match, log him in
					//alert('match')
					retJsn = {
						'exists': true,
						'denied': false
					}

				} else {
					//wrong pwd
					//alert("Username and password don't match, try again!")
					retJsn = {
						'exists': true,
						'denied': true
					}
				}
			}
			db.close()
			res.json(retJsn)
		})

	});

});

/////////////////////////

app.get('/getTable', function(req, res) {

	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				tableNum: Number(req.query.t)
			}, function(err2, tableInDb) {
				if(!(tableInDb == null)) {
					var passMoves = tableInDb.moves
					var passTable = tableInDb.table
					var passWnext = tableInDb.wNext
					var passPollNum = tableInDb.pollNum
					var passChat = tableInDb.chat
				} else {
					var passMoves = 0.0
					var passTable = 0.0
					var passWnext = 0.0
					var passPollNum = 0.0
					var passChat = 0.0
				}

				db.close()
				res.json({
					table: passTable,
					next: passWnext,
					allmoves: passMoves,
					chat: passChat,
					tablepollnum: passPollNum
				});
			});

	});

});

app.get('/longPollTable', function(req, res) {

	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				tableNum: Number(req.query.t)
			}, function(err2, tableInDb) {
				if(!(tableInDb == null)) {

					//long
					var passPollNum = tableInDb.pollNum

					if(passPollNum > req.query.pn) {
						//frissebb a tabla, kuldjuk

						var passMoves = tableInDb.moves
						var passTable = tableInDb.table
						var passWnext = tableInDb.wNext

						var passChat = tableInDb.chat

						db.close()

						res.json({
							tablenum: req.query.t,
							table: passTable,
							next: passWnext,
							allmoves: passMoves,
							chat: passChat,
							tablepollnum: passPollNum,
							command: 'sync',
							message: 'sync t' + req.query.t + ', poll' + passPollNum

						});

					} else {
						//nincs mit kuldeni
						if(pendingLongPolls[req.query.t] == undefined) pendingLongPolls[req.query.t] = []

						pendingLongPolls[req.query.t].push(res) //hold that request for that table 
						db.close()
					}

				} else {
					//nincs meg a tabla
					db.close()

				}

			});

	});

});

app.get('/forcePopTable', function(req, res) {

	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				tableNum: Number(req.query.t)
			}, function(err2, tableInDb) {

				if(!(tableInDb == null)) {

					popThem(Number(req.query.t), tableInDb, 'forcepop', 'Forcepop, ' + req.query.p + ': ' + req.query.m)

				}
				db.close()
			});

	});

	res.json({
		ok: 1
	})
});

app.get('/chat', function(req, res) {

	if(req.query.c == 'miki: test') {
		var options = {
			host: 'localhost',
			port: 16789,
			path: '/test'
		};
		/////////

		http.request(options, function(response) {
				var resJsn = {};

				//another chunk of data has been recieved, so append it to `resJsn`
				response.on('data', function(chunk) {
					resJsn = JSON.parse(chunk);
				});

				response.on('end', function() {
					/////////

					mongodb.connect(cn, function(err, db) {
						db.collection("tables")
							.findOne({
								tableNum: Number(req.query.t)
							}, function(err2, tableInDb) {

								if(!(resJsn == null || tableInDb == null)) {

									tableInDb.pollNum++
										//tableInDb.moved = new Date().getTime()
										tableInDb.chat.push(resJsn.toconsole)

									//tableInDb.table = addMovesToTable(tableInDb.table, tableInDb.wNext)
									popThem(Number(req.query.t), tableInDb, 'chat', 'chat')

									db.collection("tables")
										.save(tableInDb, function(err3, res) {})
										//}
								}
								db.close()
							});

					});
					/////////

				});
			})
			.end();

		////////

		res.json({})
	} else {

		mongodb.connect(cn, function(err, db) {
			db.collection("tables")
				.findOne({
					tableNum: Number(req.query.t)
				}, function(err2, tableInDb) {

					tableInDb.chat.push(req.query.c)
					tableInDb.pollNum++

						//var passChat = tableInDb.chat

						db.collection("tables")
						.save(tableInDb, function(err3, res) {})
					db.close()
					res.json({
						chat: tableInDb.chat
					});
				});

		});
	}
});

app.get('/startGame', function(req, res) {

	var wPNum = players[0].indexOf(req.query.w)
	var bPNum = players[0].indexOf(req.query.b)
	
	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				tableNum: "xData"
			}, function(err2, xData) {
				if(xData == null) {

					createXData();

					firstFreeTable = 1
				} else {
					firstFreeTable = xData.firstFreeTable
					xData.firstFreeTable++
				}
				db.collection("tables")
					.save(xData, function(err, doc) {});

				

				db.close()

			});
	});

	var initedTable = new Dbtable(firstFreeTable, req.query.w, req.query.b)

	mongodb.connect(cn, function(err, db) {
		db.collection("users")
			.findOne({
				name: req.query.w
			}, function(err2, userInDb) {
				if(!(userInDb == null)) {
					userInDb.games.unshift(initedTable.tableNum)

					db.collection("users")
						.save(userInDb, function(err3, res) {})

				}
				db.close()
					// res.json({

				// });
			});

	});

	mongodb.connect(cn, function(err, db) {
		db.collection("users")
			.findOne({
				name: req.query.b
			}, function(err2, userInDb) {
				if(!(userInDb == null)) {
					userInDb.games.unshift(initedTable.tableNum)

					db.collection("users")
						.save(userInDb, function(err3, res) {})
				}
				db.close()
					// res.json({

				// });
			});

	});
	
	

	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.insert(initedTable, function(err, doc) {});
		db.close()
	})

	//?dbTables.insert(initedTable, function (err, doc) {});

	players[2][wPNum] = true; //ask wplayer to start game
	players[2][bPNum] = true; //ask bplayer to start game

	players[3][wPNum] = true; //will play w
	players[3][bPNum] = false; //will play b

	players[4][wPNum] = firstFreeTable
	players[4][bPNum] = firstFreeTable

	players[5][wPNum] = req.query.b; //give them the opponents name
	players[5][bPNum] = req.query.w;

	//firstFreeTable++

	// mongodb.connect(cn, function(err, db) {
	// 	db.collection("tables")
	// 		.findOne({
	// 			tableNum: "xData"
	// 		}, function(err2, xData) {

	// 			xData.firstFreeTable = firstFreeTable

	// 			db.collection("tables")
	// 				.save(xData, function(err3, res) {})
	// 			db.close()
	// 		});
	// });

	res.json({
		message: "ok"
	});

});

app.get('/watchGame', function(req, res) {

	var viewerNum = players[0].indexOf(req.query.v)

	//players[6][viewerNum]=true;		//ask viewer to open game
	players[2][viewerNum] = true; //ask viewer to open game

	players[3][viewerNum] = true; //will watch w

	players[4][viewerNum] = req.query.t //tablenum

	// will have to give names

	// players[7][wPNum]=req.query.b;		//give them the opponents name
	players[5][viewerNum] = "Spectator"; //tell lobby to open spect mode

	res.json({
		none: 0
	});

});

app.get('/lobbyChat', function(req, res) {
	//console.log(req)
	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				tableNum: "xData"
			}, function(err2, xData) {

				xData.lobbyChat.push(req.query.c)

				db.collection("tables")
					.save(xData, function(err3, res) {})
				db.close()
			});
	});

	lobbyPollNum++

	res.json({
		//lobbychat: lobbyChat
	});

});

app.get('/getMyRecentGames', function(req, res) {
	//console.log(req)
	mongodb.connect(cn, function(err, db) {
		db.collection("users")
			.findOne({
				name: req.query.n
			}, function(err2, xData) {
				if(!(xData == null)) {

					res.json({
						recentgames: xData.games
					});
				}
				db.close()
			});
	});

});

function clearDisconnectedPlayers() {
	for(var i = players.length - 1; i >= 0; i--) {

		if(players[1][i] + playerDisconnectConst < (new Date())
			.getTime()) {
			players[1].splice(i, 1)
			players[0].splice(i, 1)
			lobbyPollNum++

		}

	}
	//clearInactiveGames()
}

app.get('/getLobby', function(req, res) {
	//console.log(req)
	clearDisconnectedPlayers()
	if(players[0].indexOf(req.query.p) == -1) {
		players[0].push(req.query.p)
		players[1].push((new Date())
			.getTime())

		//players.sort(sortPlayers)
		lobbyPollNum++

	} else {
		players[1][players[0].indexOf(req.query.p)] = (new Date())
			.getTime()
	}

	playerIndex = players[0].indexOf(req.query.p)
	if(players[2][playerIndex]) {
		//var askToOpen=true;
		lobbyPollNum++
		var openTableNum = players[4][playerIndex]
		var openTableColor = players[3][playerIndex]
		var opponentsName = players[5][playerIndex]

		players[2][playerIndex] = false

		res.json({
			players: players[0],
			games: [], //[activeGames],
			lobbypollnum: lobbyPollNum,
			lobbychat: [], //lobbyChat,
			asktoopen: true,
			opentablenum: openTableNum,
			opentablecolor: openTableColor,
			opponentsname: opponentsName
		});

	} else {

		mongodb.connect(cn, function(err, db) {
			if(!(db == null)) {
				db.collection("tables")
					.findOne({
						tableNum: "xData"
					}, function(err2, xData) {
						if(xData == null) {

							createXData()

							var resLChat = []
							var resAGames = []

						} else {

							var resLChat = xData.lobbyChat
							var resAGames = xData.activeTables
						}
						db.close()
							///////
						res.json({
							players: players[0],
							games: resAGames,
							lobbypollnum: lobbyPollNum,
							lobbychat: resLChat,
							asktoopen: false
						});
						///////

					});
			}
		});

	}

});





















///////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////









// function existsInArray()

app.get('/stats', function(req, res) {
	//console.log(req)
	
	var resArray=["wonScore",String.fromCharCode(9),"modVal",String.fromCharCode(9),"modType",String.fromCharCode(13)]
	//var resText=""
	
	var tempArray=[]
	//var arrToString=[]

		mongodb.connect(cn, function(err, db) {
			if(!(db == null)) {
				db.collection("tables")
					.find({
						
						gameIsOn:false,
						bName:"standard"
					

						
						
					}).toArray(function(err28, statData) {
						if(statData != null) {
							
							statData.forEach(function(wModGame){
								
								tempArray.push(wModGame)
								//pairedArray.push(wModGame.wName)
								
							})		//<--statData.forEach(function(wModGame){
							

							
						} 
						db.close()
				

					});	//<--.toArray
					
					
					
					//repeat with bMod and filter unmatched
					
					
					db.collection("tables")
					.find({
						
						gameIsOn:false,
						wName:"standard"
					

						
						
					}).toArray(function(err28, statData) {
						if(statData != null) {
							
							statData.forEach(function(bModGame){
								console.log(".")
								// tempArray.push(wModGame)
								// pairedArray.push(wModGame.wName)
								var wPairModGame=tempArray.find(function(thisWGame){
									if(thisWGame.wName==bModGame.bName){
										return true
									}
									
								})
								
								if(//wPairModGame
									true){
									//van feher parja
									
									//resArray.push(["wonScore","modVal","modType"])
									var wonScore=0
									if(bModGame.blacWon){
										wonScore++
									}else{
										if(bModGame.whiteWon){
											wonScore--
										}
									}
									
									if(wPairModGame.Won){
										wonScore--
									}else{
										if(bModGame.whiteWon){
											wonScore++
										}
									}
									
									//var resArray=["wonScore",String.fromCharCode(9),"modVal",String.fromCharCode(9),"modType",String.fromCharCode(13)]
	
									
									resArray.push(wonScore.toString(),String.fromCharCode(9),bModGame.bName,String.fromCharCode(9),"lpV",String.fromCharCode(13))	//to be fixed
								}
								
								
							})		//<--statData.forEach(function(bModGame){
							

							
						} 
						db.close()
				

					});	//<--.toArray
					
					
					
					
					
					
					
					
								///////
						res.send(resArray.join());
						///////
			}
		});

	

});




















///////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////


// io.on('connection', function(socket){
//   console.log('IO: a user connected');
// });

var server = app.listen(80, function() {

	var host = server.address()
		.address;
	var port = server.address()
		.port;

	console.log('app listening at http://%s:%s', host, port);

});



var server2 = app.listen(17889, function() {

	var host = server.address()
		.address;
	var port = server.address()
		.port;

	console.log('app listening at http://%s:%s', host, port);

});
