//
var express = require('express');
var morgan = require('morgan');


var bodyParser     =         require("body-parser");


var fs = require('fs');
var mongodb = require('mongodb');
//var io = require('socket.io');

var app = express();
var http = require('http')
var httpServ = http.Server(app);


app.use( bodyParser.json() ); 
app.use(bodyParser.urlencoded({ extended: false }));

//var io = require('socket.io')(httpServ);

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
var learners=[]
learners[0]=[]  		//learner IDs
learners[1]=[]		//learners last polled
learners[2]=[]	//learner is on table
learners[3]=[]	//learner plays white
learners[4]=[]	//learner modType
learners[5]=[]	//learner modVal
learners[6]=[]	//learner at pollnum
learners[7]=[]	//learner at pollnum


var playerDisconnectConst = 15000 //15sec
var learnerDisconnectConst = 240000 //4min
var gameInactiveConst = 100000 //100sec
var checkGamesConst = 4000
var evalGameConst = 100

var pendingLongPolls = []

players[0] = [] //player names

players[1] = [] //players last polled

players[2] = [] //bolleans true if game is to start
players[3] = [] //player colors for new games
players[4] = [] //table numbers for new games
players[5] = [] //opponents name

var lobbyPollNum = 0
var lobbyChat = []
var knownThinkers=[]
var pendingThinkerPolls=[]



function doIKnow(id){
	for (var i=0; i<knownThinkers.length; i++){
		if(knownThinkers[i].id==id)return i
	}
	return -1
}




var getThinkerIndex = function(id){
	var speedArray=[]
	for(var i=0; i<pendingThinkerPolls.length;i++){
		if(pendingThinkerPolls[i].id=id)return i
	}
	return -1
	
	
	
    //return speedArray.indexOf(Math.max.apply( Math, speedArray ));
};
var maxIndex = function(){
	var speedArray=[]
	for(var i=0; i<pendingThinkerPolls.length;i++){
		speedArray.push(Math.floor(100*(pendingThinkerPolls[i][0].query.spd)))
	}
	
	var mx=speedArray.indexOf(Math.max.apply( Math, speedArray ));
	//console.log('highest: '+Math.max.apply( Math, speedArray ))
	
	
	
    return mx
};
function sendTask(task,thinkerId){
// 	var popThem = function(tNum, tableInDb, commandToSend, messageToSend) {
	//var message=task.message
	var thinkerPollIndex=0
	if(thinkerId){
			
		
		thinkerPollIndex=getThinkerIndex(thinkerId)
		
	}else{
		//replace id to fastest available!!!!!!!!!!!!!!!
	
		thinkerPollIndex=maxIndex()
	}
	
	//console.log(thinkerId+' '+thinkerPollIndex)
	
	var thisRes=null
	
	if(thinkerPollIndex>-1){
		
		thinkerId=pendingThinkerPolls[thinkerPollIndex][0].query.id
	
	thisRes=pendingThinkerPolls.splice(thinkerPollIndex,1)[0]
	//console.log(thisRes,thinkerPollIndex)
		//var newTaskNum=Number(thisRes[0].query.tn)+1	//!!!!!!!!!!!!!!!!!!! get real tasknum
			task.taskNum=Number(thisRes[0].query.tn)+1
				task.sentRnd=Math.random()
				
				// if(thisPop[0].query.id!=knownThinkers[thisPop[0].query.id].id) {
				// 	knownThinkers[thisPop[0].query.id]={id:thisPop[0].query.id}	// object has knownThinkers id
				// }
				
				var thinkerIndex=doIKnow(thinkerId)
				
				if(thinkerIndex==-1){
					knownThinkers.push({
						id:thinkerId						
					})
					thinkerIndex=doIKnow(thinkerId)		//itt mar benne lesz a tombben
					
				}
				
				knownThinkers[thinkerIndex].busy=true
				
				//knownThinkers[thinkerIndex].taskNum=newTaskNum		//we need to remember the tasknum we sent
				knownThinkers[thinkerIndex].message=task.message		//do we we need to remember the message we sent?
				knownThinkers[thinkerIndex].command=task.command		//we need to remember the task we sent
				knownThinkers[thinkerIndex].sent=new Date().getTime()
				knownThinkers[thinkerIndex].lastSeen=knownThinkers[thinkerIndex].sent

				
				
				/////
				
				//knownThinkers[thinkerIndex].busy=true
				
				knownThinkers[thinkerIndex].taskNum=task.taskNum		//we need to remember the tasknum we sent
				// knownThinkers[thinkerIndex].message=task.message		//do we we need to remember the message we sent?
				// knownThinkers[thinkerIndex].command=task.command		//we need to remember the task we sent
				// knownThinkers[thinkerIndex].sent=new Date().getTime()
				// knownThinkers[thinkerIndex].lastSeen=knownThinkers[thinkerIndex].sent

				
				
										
				
				thisRes[1].json(task)
				
				/////
				
										
				
				// thisRes[1].json({
				// 	message:message,
				// 	taskNum:newTaskNum,
				// 	task:task
				// })
				captainPop()
				
	}

	
 }
function sendToAll(task){
	
	// var command=task.command
	// var message=task.message
	// var data=task.data
	
	
	
	while(pendingThinkerPolls.length > 0) {

				var thisPop = pendingThinkerPolls.pop()
				task.taskNum=Number(thisPop[0].query.tn)+1
				task.sentRnd=Math.random()
				
				// if(thisPop[0].query.id!=knownThinkers[thisPop[0].query.id].id) {
				// 	knownThinkers[thisPop[0].query.id]={id:thisPop[0].query.id}	// object has knownThinkers id
				// }
				
				var thinkerIndex=doIKnow(thisPop[0].query.id)
				
				if(thinkerIndex==-1){
					knownThinkers.push({
						id:thisPop[0].query.id						
					})
					thinkerIndex=doIKnow(thisPop[0].query.id)		//itt mar benne lesz a tombben
					
				}
				
				knownThinkers[thinkerIndex].busy=true
				
				knownThinkers[thinkerIndex].taskNum=task.taskNum		//we need to remember the tasknum we sent
				knownThinkers[thinkerIndex].message=task.message		//do we we need to remember the message we sent?
				knownThinkers[thinkerIndex].command=task.command		//we need to remember the task we sent
				knownThinkers[thinkerIndex].sent=new Date().getTime()
				knownThinkers[thinkerIndex].lastSeen=knownThinkers[thinkerIndex].sent

				
				
										
				
				thisPop[1].json(task)
	
	

	}
	
	captainPop()
}

app.get('/refreshAllThinkers', function(req, res) {
	////console.log(req)
	sendToAll(new Task('refresh',0,'refresh all'))
	res.end()

});

app.get('/startAllLearners', function(req, res) {
	////console.log(req)
	//sendToAll('learnStart','learnStart all')
	sendToAll(new Task('learnStart',0,'learnStart all'))
	res.end()

});

app.get('/stopAllLearners', function(req, res) {
	////console.log(req)
	//sendToAll('learnStop','learnStop all')
	sendToAll(new Task('learnStop',0,'learnStop all'))
	res.end()

});



	

function createXData() {
	//console.log("can't find xData in db, creating..") //header in db

	mongodb.connect(cn, function(err, db) {

		db.collection("tables")
			.insert({
				"tableNum": "xData",
				"firstFreeTable": 1,
				"lobbyChat": [],
				"activeTables": [],
				"modType":""
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

				//firstFreeTable = 1
			} else {
				//firstFreeTable = xData.firstFreeTable
					//xData.firstFreeTable++
			}
			// db.collection("tables")
			// 	.save(xData, function(err, doc) {});

			db.close()

		});
});

setInterval(function() {



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
					
					actGames.sort(function(a,b){
						if(a.tableNum>b.tableNum){
							return -1
						}else{
							return 1
						}
						//no duplicates
					})

					db2.collection("tables")
						.findOne({
							"tableNum": "xData"
						}, function(err24, xData) {
							
							

							xData.activeTables = actGames

							db2.collection("tables")
								.save(xData, function(err3, res) {
									db2.close()
								})
								////console.log('Games checked.')

						});

				});
		}

	});
	
	
	
	////innentol jon az eval by clients
	
	
	//evalToClient()
	

}, checkGamesConst);

function ping(msecs){
	for (var i=pendingThinkerPolls.length-1;i>-1;i--){
		if(pendingThinkerPolls[i][2] < new Date().getTime()-msecs){
			//polled more tham MSECS time ago, let's pop it
			sendTask(new Task('ping',0,'ping'),pendingThinkerPolls[i][0].query.id)
			
		}
	}
	
	
	//sendToAll('ping','ping')
	
}

setInterval( function(){
	ping(7000)
},1000)


setInterval( function(){
	evalToClient()
},evalGameConst)

var evalToClient=function(){
	
	mongodb.connect(cn, function(err7, db4) {
		db4.collection('tables').findOne({
			
			gameIsOn:false,
			whiteWon:false,
			blackWon:false,
			isDraw:false,
			aiOn:false,
			toBeChecked:true
			
		},function(errx,gameToEval){
			//send gameToEval to fastest available client
			//var arguments=[]
			
			
			
			var task={}
			if(gameToEval!=null){
				
				
				gameToEval.toBeChecked=false
			
			db4.collection('tables').save(gameToEval,function(){})
				// task={
				// 	message:'evalGame, t'+gameToEval.tableNum,
				// 	command:'evalGame',
				// 	data:gameToEval
					
				// }
				task=new Task('evalGame',gameToEval,'evalGame, t'+gameToEval.tableNum)
				sendTask(task)
			}else{
				
				task=new Task('',0,'nothing to eval')
			
				sendTask(task)
			}
			db4.close()
			
			
		})
	})
	
}

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
	
	var proper=true
	if(req.query.s==1)proper=false

	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				tableNum: Number(req.query.t)
			}, function(err2, tableInDb) {

				var moveStr = String(req.query.m)

				if(tableInDb == null) {
					db.close()
				} else {
					//var toPush = 

					// if(!(toPush==tableInDb.moves[tableInDb.moves.length-1])){
					
					if(proper){
						tableInDb.moves.push(getPushString(tableInDb.table,moveStr))		//getPushString external, en passed when table is ok
					}else{
						tableInDb.moves.push("00"+moveStr+"00")
					}
					
					if(proper) tableInDb.table = moveIt(moveStr, tableInDb.table)		//ezt is elhagyhatnank ha !proper, needs eval after!!

					tableInDb.wNext = !tableInDb.wNext

					//tableInDb.pollNum++ //<---- majd increment a checkTableStatus ha kiertekelte	//nemis

					if(proper)evalGame(tableInDb)

					tableInDb.pollNum++

						

					tableInDb.moved = new Date().getTime()

					//if(proper)//kell az allpasttablehoz
					if(proper)tableInDb.table = addMovesToTable(tableInDb.table, tableInDb.wNext)

					//remember this state for 3fold rule

					if(proper)tableInDb.allPastTables.push(createState(tableInDb.table))		//we'll have all moves anyway

					popThem(req.query.t, tableInDb, 'moved', 'Player moved: ' + moveStr) //respond to pending longpolls

					//}

					db.collection("tables")
						.save(tableInDb, function(err3, res) {})

					///////

					

					if(tableInDb.gameIsOn &&
						((tableInDb.wNext && tableInDb.wName == "Computer") ||
							(!tableInDb.wNext && tableInDb.bName == "Computer"))) {		//if computer's next
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

											tableInDb.learnerIsBusy = false

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
								
									db.close()
								});
							})
							.end();

					} else {
						db.close()
					}

			

				}
			
			});

		
		res.json({message: "moved"});

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
							// //console.log(resJsn)
							// //console.log('dssdfsdgs')
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
app.get('/forceStop', function(req, res) {
	////console.log(req)
	res.send('sg')
	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				tableNum: Number(req.query.t)
			}, function(err2, stopThisTable) {

				if(stopThisTable!=null){
				
				stopThisTable.gameIsOn=false

				db.collection("tables")
					.save(stopThisTable, function(err3, res) {
						
							
						
					})
				}else{
					
				}
				
				db.close()
			});
	});

});
////////////////////////////post
app.post('/evaledGame', function(req, res) {
	////console.log(req)
	res.send('started, check DB for t'+req.body.tableNum)
	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				tableNum: req.body.tableNum
			}, function(err2, evaledTable) {

				if(evaledTable!=null){
				
				evaledTable.evaled=true
				
				evaledTable.moves=req.body.moves
				evaledTable.table=req.body.table
				evaledTable.gameIsOn=req.body.gameIsOn
				evaledTable.whiteWon=req.body.whiteWon
				evaledTable.blackWon=req.body.blackWon
				evaledTable.closingVal=req.body.closingVal
				evaledTable.isDraw=req.body.isDraw
				evaledTable.allPastTables=req.body.allPastTables
								
				evaledTable.wNext=req.body.wNext
								
				evaledTable.pollNum=req.body.pollNum
								

				db.collection("tables")
					.save(evaledTable, function(err3, res) {
						
							
						
					})
				}else{
					
				}
				
				db.close()
			});
	});

});/////////////////////////////

app.get('/aiOn', function(req, res) {
	////console.log(req)
	res.send('sg')
	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				tableNum: Number(req.query.t)
			}, function(err2, ttable) {

				if(ttable!=null){
				
				ttable.aiOn=true

				db.collection("tables")
					.save(ttable, function(err3, res) {})
				}else{
					
				}
				
				db.close()
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
	
	var modType=""
	
	var wPNum = players[0].indexOf(req.query.w)
	var bPNum = players[0].indexOf(req.query.b)
	//var firstFreeTable=-5
	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				tableNum: "xData"
			}, function(err2, xData) {
				var firstFreeTable=-5
				if(xData == null) {

					createXData();

					firstFreeTable = 1
				} else {
					firstFreeTable = xData.firstFreeTable
					modType=xData.modType
					xData.firstFreeTable++
				}
				db.collection("tables")
					.save(xData, function(err, doc) {
						db.close()
					});

				
				
				//ide
				
				
				var initedTable = new Dbtable(firstFreeTable, req.query.w, req.query.b)

	mongodb.connect(cn, function(err, db2) {
		db2.collection("users")
			.findOne({
				name: req.query.w
			}, function(err2, userInDb) {
				if(!(userInDb == null)) {
					userInDb.games.unshift(initedTable.tableNum)

					db2.collection("users")
						.save(userInDb, function(err3, res) {})

				}
				db2.close()
					// res.json({

				// });
			});

	});

	mongodb.connect(cn, function(err, db3) {
		db3.collection("users")
			.findOne({
				name: req.query.b
			}, function(err2, userInDb) {
				if(!(userInDb == null)) {
					userInDb.games.unshift(initedTable.tableNum)

					db3.collection("users")
						.save(userInDb, function(err3, res) {})
				}
				db3.close()
					// res.json({

				// });
			});

	});

	mongodb.connect(cn, function(err, db4) {
		db4.collection("tables")
			.insert(initedTable, function(err, doc) {});
		db4.close()
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
		"message": "ok",
		"tableNum": firstFreeTable,
		"modType": modType
	});
				
				//ide

			});
	});

	

});

app.get('/mod', function(req, res) {
	
	
	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				tableNum: "xData"
			}, function(err2, xData) {
				var firstFreeTable=-5
				if(xData == null) {

					createXData();

					// firstFreeTable = 1
				} //else {
					//firstFreeTable = xData.firstFreeTable
					xData.modType=req.query.m
				//	xData.firstFreeTable++
				//}
				db.collection("tables")
					.save(xData, function(err, doc) {
						db.close()
						res.json({
							message:'ok'
						})
					});

	
	
	
}
)
}
)})


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
	////console.log(req)
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


app.get('/getModType', function(req, res) {
	////console.log(req)
	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				tableNum: "xData"
			}, function(err2, xData) {
				
				res.json({
		
		
		"modType": xData.modType
	});
				
				db.close()
			});
	});

	lobbyPollNum++

	// res.json({
	// 	//lobbychat: lobbyChat
	// });

});

app.get('/getMyRecentGames', function(req, res) {
	////console.log(req)
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
var captainPop=function(){
	captainPollNum++
	while(captainPolls.length>0){
		var res=captainPolls.pop()
		
		
		clearDisconnectedLearners()
	
		var texttosnd=[]
	
		for (var i=0;i<learners[0].length;i++){
			texttosnd[i]=[learners[0][i],learners[2][i],learners[4][i],learners[6][i],learners[5][i],learners[7][i]]
		}
		// var waitingThinkers=[]
		// pendingThinkerPolls.forEach(function(task){
		// 	waitingThinkers.push(task[0].query.id)			//the req from /longpolltask
		// })
	
		
			res.json({
		
		"learners":texttosnd,
		// "thinkers":waitingThinkers,
		"knownThinkers":knownThinkers,
		
		"captainPollNum":captainPollNum
		
		
		})
		
	}
}
var captainPollNum=0
var captainPolls=[]
app.get('/captainPoll', function(req, res) {
	
	if(req.query.pn!=captainPollNum){
	
		
		clearDisconnectedLearners()
		
		captainPollNum++
		//captainPop()
	
		var texttosnd=[]
	
		for (var i=0;i<learners[0].length;i++){
			texttosnd[i]=[learners[0][i],learners[2][i],learners[4][i],learners[6][i],learners[5][i],learners[7][i]]
		}
		var waitingThinkers=[]
		pendingThinkerPolls.forEach(function(task){
			waitingThinkers.push(task[0].query.id)			//the req from /longpolltask
		})
	
		
			res.json({
		
		"learners":texttosnd,
		// "thinkers":waitingThinkers,
		"knownThinkers":knownThinkers,
		
		"captainPollNum":captainPollNum
		
		
		})
		
	}else{
		
			captainPolls.push(res)
	
	
	
		
		
		
	}
	//var aa=[]
	
})


function checkIfPending(id){
	for (var i=0;i<pendingThinkerPolls.length;i++){
		if(pendingThinkerPolls[i][0].query.id==id){
			return true
		}
	}
	return false
}

function clearPending(id){
	for (var i=0;i<pendingThinkerPolls.length;i++){
		if(pendingThinkerPolls[i][0].query.id==id){
			//client sent repeated poll, remove pending one
			pendingThinkerPolls.splice(i,1)
		}
	}
	//return false
}



app.get('/longPollTasks', function(req, res) {
	////console.log(req)
	var pollerIndex=doIKnow(req.query.id)
	if(-1==pollerIndex){
		knownThinkers.push({
			id:req.query.id,
			lastSeen:new Date().getTime(),
			busy:false
		})
		
		
	}else{
		knownThinkers[pollerIndex].lastSeen=new Date().getTime()
		knownThinkers[pollerIndex].busy=false
		
	}
	
	
	if(checkIfPending(req.query.id))clearPending(req.query.id)	//remove clients old pending polls so we always have the latest only
	
	captainPop()
	
	pendingThinkerPolls.push([req,res,new Date().getTime()])		//remember when it came
	
	
	
	
	
	

});


app.get('/learnerPoll', function(req, res) {
	////console.log(req)
	
	if(learners[0].indexOf(req.query.n) == -1) {
		learners[0].push(req.query.n)
		learners[1].push((new Date())
			.getTime())
			
			
		learners[2].push(req.query.t)
		learners[3].push(req.query.w)
		learners[4].push(req.query.mt)
		learners[5].push(req.query.mv)
		learners[6].push(req.query.p)
		learners[7].push(req.query.a)
		
		
		//pendingThinkerPolls[req.query.n]=[]	!!!!!!!!!!!!!!!!!!
			
	// var players = []
	// var learners=[]
	// learners[0]=[]  		//learner IDs
	// learners[1]=[]		//learners last polled
	// learners[2]=[]	//learner is on table
	// learners[3]=[]	//learner plays white
	// learners[4]=[]	//learner modType
	// learners[5]=[]	//learner modVal
	// learners[6]=[]	//learner at pollnum


		//players.sort(sortPlayers)
		//lobbyPollNum++

	} else {
		
		var learnerIndex = learners[0].indexOf(req.query.n)
		
		learners[1][learnerIndex] = (new Date())
			.getTime()
			
			
		learners[2][learnerIndex] = req.query.t
		learners[3][learnerIndex] = req.query.w
		learners[4][learnerIndex] = req.query.mt
		learners[5][learnerIndex] = req.query.mv
		learners[6][learnerIndex] = req.query.p
		learners[7][learnerIndex] = req.query.a
		
			
	}

	
	res.json({
		message:'nincs'
	})
	

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
var pingThinkersConst=10000	//10 sec, only pings them where inactive


function pingWaitingThinkers() {
	for(var i = pendingThinkerPolls.length - 1; i >= 0; i--) {

		if(pendingThinkerPolls[i][2] + pingThinkersConst < (new Date())
			.getTime()) {
			
			//pendingThinkerPolls
			var pingThisPoll=pendingThinkerPolls.splice(i, 1)
			var retThis=new Task('ping','ping','ping')
			
			pingThisPoll[1].json(retThis)
			//lobbyPollNum++

		}

	}
	//clearInactiveGames()
}



function clearDisconnectedLearners() {
	for(var i = learners.length - 1; i >= 0; i--) {

		if(learners[1][i] + learnerDisconnectConst < (new Date())
			.getTime()) {
			learners[1].splice(i, 1)
			learners[0].splice(i, 1)
			learners[2].splice(i, 1)
			learners[3].splice(i, 1)
			learners[4].splice(i, 1)
			learners[5].splice(i, 1)
			learners[6].splice(i, 1)
			learners[7].splice(i, 1)
			
			//lobbyPollNum++

		}

	}
	//clearInactiveGames()
}

app.get('/getLobby', function(req, res) {
	////console.log(req)
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


app.get('/stats.txt', function(req, res) {
	//console.log(req)
	res.writeHead(200, {
  
  'Content-Type': 'text/plain' 
  
  });
  
	var resArray = []
	resArray.push("wonScore", String.fromCharCode(9), "modVal", String.fromCharCode(9), "resText", String.fromCharCode(13))
		//var resText=""

	var tempArray = []
		//var arrToString=[]

	var asyncHack=0


	mongodb.connect(cn, function(err, db) {
		if(!(db == null)) {
			db.collection("tables")
				.find({

					gameIsOn: false,
					bName: "standard"

				})
				// .sort( {
					
				// 	 tableNum: 1 
					 
				// } )
				//.toArray(function(err28, statData) {
					//if(statData != null) {
						// statData.sort(function(a,b){
						// 	if(a.tableNum>b.tableNum){
						// 		return 1
						// 	}else{
						// 		return -1
						// 	}
						// })
						//statData
						
						
						.forEach(function(wModGame) {

							//var kellEz=0
								asyncHack++	//countRequests
								
								
								tempArray.push(wModGame)

								db.collection("tables")
									.findOne({
										gameIsOn: false,
										wName: "standard",
										bName: wModGame.wName
									}, function(errs, bModGame) {
										if(bModGame) {
											//van matching pair game
											//console.log('van')
											var wonScore = 0
											var resText=''
											resText=resText.concat('t'+bModGame.tableNum)
											if(bModGame.blacWon) {
												wonScore++
												resText=resText.concat(' black won, ')
											} else {
												if(bModGame.whiteWon) {
													wonScore--
													resText=resText.concat(' black lost, ')
												}else{
													resText=resText.concat(' black drew, ')
												}
											}
											
											resText=resText.concat('t'+wModGame.tableNum)
											

											if(wModGame.whiteWon) {
												wonScore++
												resText=resText.concat(' white won.')
											} else {
												if(wModGame.blackWon) {
													wonScore--
													resText=resText.concat(' white lost.')
												}else{
													resText=resText.concat(' white drew.')
												}
											}

											//var resArray=["wonScore",String.fromCharCode(9),"modVal",String.fromCharCode(9),"modType",String.fromCharCode(13)]
											resArray=[]
											resArray.push(wonScore, String.fromCharCode(9), bModGame.bName, String.fromCharCode(9), resText, String.fromCharCode(13)) //to be fixed
											console.log([wonScore, String.fromCharCode(9), bModGame.bName, String.fromCharCode(9)])
											res.write(resArray.join(''));
											
											// if(statIndex==statData.length()-1){
											// 	res.end()
											// }
											
											// if(statIndex==statData.length-1){
											// 	res.write('end')
											// 	//res.end()
										//}

										}else{
											// if(statIndex==statData.length-1){
											// 	res.write('end')
											// 	//res.end()
										//}

											
											
											//console.log('nincs')
										}
										// if(statIndex==statData.length-1){
										// 		res.write('end')
										// 		//res.end()
										// 		}
										asyncHack--	//request answered
										if(asyncHack==0){
											//res.write('end')
											//res.end()
										}
									})
												
								//pairedArray.push(wModGame.wName)

							}) //<--statData.forEach(function(wModGame){
							//res.send(resArray.join(''));

			//		}
					//db.close()

		//		}); //<--.toArray

			

			///////
			
			///////
		}
	});

});


///////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////

// io.on('connection', function(socket){
//   //console.log('IO: a user connected');
// });

var server = app.listen(80, function() {

	var host = server.address()
		.address;
	var port = server.address()
		.port;

	//console.log('app listening at http://%s:%s', host, port);

});

var server2 = app.listen(17889, function() {

	var host = server.address()
		.address;
	var port = server.address()
		.port;

	//console.log('app listening at http://%s:%s', host, port);

});