//
var express = require('express');
var morgan = require('morgan');
var http = require('http');
var fs = require('fs');
var mongodb = require('mongodb');


var app = express();

app.use(express.static('public'))
app.use(morgan("combined"))

var cn = 'mongodb://localhost:17890/chessdb'

eval(fs.readFileSync('public/brandNewAi.js') + '');
eval(fs.readFileSync('public/tableClass.js') + '');
//http://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files

var t1const = 11
var dletters = ["a", "b", "c", "d", "e", "f", "g", "h"]

var players = []
	
var playerDisconnectConst = 15000 //15sec
var gameInactiveConst = 300000 //5min

players[0] = [] //player names

players[1] = [] //players last polled

players[2] = [] //bolleans true if game is to start
players[3] = [] //player colors for new games
players[4] = [] //table numbers for new games
players[5] = [] //opponents name

var lobbyPollNum = 0
var lobbyChat = []
	

var firstFreeTable = 0

function createXData(){
	console.log("can't find xData in db, creating..")
		
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
			if (xData == null) {
				

				createXData();
				
				firstFreeTable = 1
			} else {
				firstFreeTable = xData.firstFreeTable
			}
			
			

			db.close()
		});
});

// setInterval(function(){
	
// 	mongodb.connect(cn, function(err, db) {
// 		db.collection("tables")
// 			.find({
// 				moved: {$gte: new Date()-gameInactiveConst}
// 			}, function(err2, actGames) {
				
				
// 				mongodb.connect(cn, function(err, db2) {
// 					db2.collection("tables")
// 						.findOne({
// 							tableNum: "xData"
// 						}, function(err4, xData) {
			
// 							xData.activeTables = actGames
// 			console.log('eddig jo')
// 							db2.collection("tables")
// 								.save(xData, function(err3, res) {})
// 								console.log('eddig dddjo')
// 							db2.close()
// 						});
// 				});
	
// 				db.close()
// 			});
// 	});

	
// },3000);

app.get('/move', function(req, res) {

	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				tableNum: Number(req.query.t)
			}, function(err2, tableInDb) {

				var moveStr = String(req.query.m)

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
					tableInDb.moved = new Date()

				tableInDb.table = addMovesToTable(tableInDb.table, tableInDb.wNext)

				//}

				db.collection("tables")
					.save(tableInDb, function(err3, res) {})
				db.close()
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
			var str = {};

			//another chunk of data has been recieved, so append it to `str`
			response.on('data', function(chunk) {
				str = JSON.parse(chunk);
			});

			//the whole response has been recieved, so we just print it out here
			response.on('end', function() {
				//res.json(str);
				/////////

				mongodb.connect(cn, function(err, db) {
					db.collection("tables")
						.findOne({
							tableNum: Number(req.query.t)
						}, function(err2, tableInDb) {
							// console.log(str)
							// console.log('dssdfsdgs')
							if (!(str == null || tableInDb == null)) {
								var moveStr = String(str.aimove)

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
								tableInDb.moved = new Date()

								tableInDb.table = addMovesToTable(tableInDb.table, tableInDb.wNext)

								db.collection("tables")
									.save(tableInDb, function(err3, res) {})

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

				if (!(tableInDb == null)) {
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
app.get('/getTable', function(req, res) {

	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				tableNum: Number(req.query.t)
			}, function(err2, tableInDb) {
				if (!(tableInDb == null)) {
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
					chat: passChat
				}); 
			});

	});

});

app.get('/chat', function(req, res) {
	
	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				tableNum: Number(req.query.t)
			}, function(err2, tableInDb) {

				tableInDb.chat.push(req.query.c)
				tableInDb.pollNum++

					var passChat = tableInDb.chat

				db.collection("tables")
					.save(tableInDb, function(err3, res) {})
				db.close()
				res.json({
					chat: tableInDb.chat
				});
			});

	});

});

app.get('/startGame', function(req, res) {

	var wPNum = players[0].indexOf(req.query.w)
	var bPNum = players[0].indexOf(req.query.b)

	var initedTable = new Dbtable(firstFreeTable, req.query.w, req.query.b)

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

	firstFreeTable++

	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				tableNum: "xData"
			}, function(err2, xData) {

				xData.firstFreeTable = firstFreeTable

				db.collection("tables")
					.save(xData, function(err3, res) {})
				db.close()
			});
	});

	res.json({
		none: 0
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

function clearDisconnectedPlayers() {
	for (var i = players.length - 1; i >= 0; i--) {

		if (players[1][i] + playerDisconnectConst < (new Date())
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
	if (players[0].indexOf(req.query.p) == -1) {
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
	if (players[2][playerIndex]) {
		//var askToOpen=true;
		lobbyPollNum++
		var openTableNum = players[4][playerIndex]
		var openTableColor = players[3][playerIndex]
		var opponentsName = players[5][playerIndex]

		players[2][playerIndex] = false

		res.json({
			players: players[0],
			games: [],//[activeGames],
			lobbypollnum: lobbyPollNum,
			lobbychat: [],//lobbyChat,
			asktoopen: true,
			opentablenum: openTableNum,
			opentablecolor: openTableColor,
			opponentsname: opponentsName
		});

	} else {
		
		mongodb.connect(cn, function(err, db) {
			db.collection("tables")
				.findOne({
					tableNum: "xData"
				}, function(err2, xData) {
					if (xData == null) {
						
						createXData()
						
						var resLChat = []
					} else {
						var resLChat = xData.lobbyChat
					}
					db.close()
					///////
					res.json({
						players: players[0],
						games: [],//activeGames[0],
						lobbypollnum: lobbyPollNum,
						lobbychat: resLChat,
						asktoopen: false
					});
					///////
					
				});
		});
		
	}

});

var server = app.listen(80, function() {

	var host = server.address()
		.address;
	var port = server.address()
		.port;

	console.log('app listening at http://%s:%s', host, port);

});