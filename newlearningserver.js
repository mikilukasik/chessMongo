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
eval(fs.readFileSync('public/engine.js') + '');

var dletters = ["a", "b", "c", "d", "e", "f", "g", "h"]
var http = require('http')






var Modtable = function(tableNum, wName, bName) { //class
	
	this.tableNum = tableNum,
	this.wName = wName,
	this.bName = bName,

	
	this.aiToMove=false		//unused
	this.toBeChecked=true		//unused
	this.gameIsOn=true
	this.whiteWon=false
	this.blackWon=false
	this.isDraw=false
	
	this.askWhiteDraw=false
	this.askBlackDraw=false
	
	this.whiteCanForceDraw=false
	this.blackCanForceDraw=false
	
	
	this.learner=false
	this.learnerIsBusy=false
	
	
	
	this.wNext = true,
	this.aiOn = false,
	this.chat = [],
	this.moves = [],
	this.pollNum = 1,
	this.allPastTables = []

	this.created = new Date()
	this.moved = this.created

	this.table = new Array(8) //create 8x8 array
	for(var i = 0; i < 8; i++) {
		this.table[i] = new Array(8)
	}

	for(var j = 2; j < 6; j++) { //make the blanks blank
		for(i = 0; i < 8; i++) {
			this.table[i][j] = [0, 0, 0, false, false]
		}
	}

	for(var i = 0; i < 8; i++) { //row of white pawns

		this.table[i][1] = [0, 0, 0, false, false] //,pawnCanMove]
	}
	for(var i = 0; i < 8; i++) { //NONO row of black pawns
		this.table[i][6] = [0, 0, 0, false, false] //,pawnCanMove]
	}

	this.table[0][0] = [2, 4, 0, true, false] //,rookCanMove]				//rooks		//0 stands for times it moved
	this.table[7][0] = [2, 4, 0, true, false] //,rookCanMove]
	this.table[0][7] = [1, 4, 0, true, false]
	this.table[7][7] = [1, 4, 0, true, false]

	this.table[1][0] = [0, 0, 0, true, false] //,horseCanMove]					//knights
	this.table[6][0] = [0, 0, 0, true, false] //,horseCanMove]
	this.table[1][7] = [0, 0, 0, true, false]
	this.table[6][7] = [0, 0, 0, true, false]

	this.table[2][0] = [2, 2, 0, true, false] //,bishopCanMove]				//bishops
	this.table[5][0] = [2, 2, 0, true, false] //,bishopCanMove]
	this.table[2][7] = [1, 2, 0, true, false]
	this.table[5][7] = [1, 2, 0, true, false]

	this.table[3][0] = [2, 5, 0, true, false] //,queenCanMove]				//w queen
	this.table[4][0] = [2, 9, 0, true, false] //,kingCanMove]				//w king

	this.table[3][7] = [0, 0, 0, true, false]			//b q
	this.table[4][7] = [1, 9, 0, true, false] //,kingCanMove]				//b k

	this.table = addMovesToTable(this.table, true)
		//protectPieces(this.table,true)
		//protectPieces(this.table,false)
}



function playOneGame(wModded,modType,modVal){
		//var myGame=0
	//var wPNum = players[0].indexOf(req.query.w)
	//var bPNum = players[0].indexOf(req.query.b)
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
					xData.firstFreeTable++
				}
				db.collection("tables")
					.save(xData, function(err, doc) {});

				var initedTable = []
				if(wModded){
					initedTable = new Modtable(firstFreeTable, "mod lpV:" + modVal, "standard")
				}else{
					initedTable = new Modtable(firstFreeTable, "standard", "mod lpV:" + modVal)
				}
					

				db.collection("tables")
					.insert(initedTable, function(err, doc) {});

				var myGame = initedTable

				

				console.log('Response sent, thinking 1st move..')

				playgame(myGame,modType,modVal,true,wModded)

				db.close()

			});
	});

	function playgame(myGame, mt, mv, wNx, wMod) {

		var result = []
		if(wNx==wMod){
			result = ai(myGame.table, myGame.wNext, myGame.allPastTables, mt, mv)			//get modded result
		}else{
			result = ai(myGame.table, myGame.wNext, myGame.allPastTables)
		}
			 //		ai	<------------

		if(result.length > 1) { //if there are any moves

			var aiMoveString = result[1][0] // the winning movestring

			var toConsole = [] //to chat?

			toConsole[0] = result[0][2] + " ms." //timeItTook

			for(var i = 1; i < result.length; i++) {

				toConsole[i] = 'Move:' + result[i][0] + ' RMv:' + result[i][2] + ',' + 'Val:' + result[i][1] + 'a' //+

			}

			var sendJson = {
				aimove: aiMoveString,
				fulltable: result,
				toconsole: toConsole
			}
		} else { //can't move

			//eval
			console.log('ran into eval bit')

			myGame.gameIsOn = false

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
		console.log(' DONE. ')

		if(myGame.gameIsOn) {
			console.log('Will move ' + aiMoveString)

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
		} else {
			console.log('Game finished, evaluating..')
			evalGame(myGame)
		}
		mongodb.connect(cn, function(err, db2) {
			db2.collection("tables")
				.findOne({
					tableNum: myGame.tableNum
				}, function(err2, result) {
					console.log('found table:' + result.tableNum)

					if(myGame.gameIsOn) {
						result.table = myGame.table
						result.moves = myGame.moves
						result.pollNum = myGame.pollNum
						result.wNext = myGame.wNext
						result.moved = myGame.moved
						result.allPastTables = myGame.allPastTables
					} else {
						result.gameIsOn = false //as it's just finished
						result.blackWon = myGame.blackWon
						result.whiteWon = myGame.whiteWon
						result.isDraw = myGame.isDraw
					}

					console.log('will save moved table..')
					db2.collection("tables")
						.save(result, function(err3, res) {})

					console.log('saved.')

					db2.close()
					console.log('closed.')

					// var optionsb = {
					// 	host: 'localhost',
					// 	port: 80,
					// 	path: '/forcePopTable?t=' + myGame.tableNum + '&p=learner&m=move: ' + aiMoveString
					// };

					//http.request(optionsb, function(response){

					// 	console.log('jott vmi')

					// 	response.on('data', function(chunk) {
					// 	//resJsn = JSON.parse(chunk);
					// });

					// response.on('end', function() {
					// 	});

					//}).end()

					if(myGame.gameIsOn) {

						console.log('recalling playgame')

						playgame(myGame,mt,mv,!wNx, wMod)

					} else {

						//not calling this function anymore, should recall with opposit color just once
						//console.log('Starting rematch..')

					}
					
					
				});
		});

	}
}




app.get('/startLearningGame', function(req, res) {
	
	console.log('Sending response to start request...')

				res.json({
					message: "..."
				});
	playOneGame(true,'lpV',-100)
	playOneGame(false,'lpV',-100)

});

var server = app.listen(16778, function() {

	var host = server.address().address;
	var port = server.address().port;

	console.log('learningserver is listening at http://%s:%s', host, port);

});
