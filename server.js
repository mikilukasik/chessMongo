var express = require('express');
var morgan = require('morgan');
var bodyParser = require("body-parser");
var fs = require('fs');
var mongodb = require('mongodb');
var http = require('http')
var WebSocketServer = require('websocket').server;

var ObjectID = mongodb.ObjectID

var app = express()
var httpServ = http.createServer(app)

var server = httpServ.listen(3000, function() {
	var host = server.address()
		.address;
	var port = server.address()
		.port;
	console.log('app listening at http://%s:%s', host, port);
});

var wsServer = new WebSocketServer({
	httpServer: httpServ,
	//port: 3000,
	path: '/sockets/'
});

var updateDbClients=function(){
	//console.log('updateDbClients function not inited')
}

var registerNewClient=function(){
	//console.log('registerNewClient function not inited')
}

var knownClientReturned=function(){
	//console.log('knownClientReturned function not inited')
}


var registerUser=function(){
	//console.log('registerUser function not inited')
}

eval(fs.readFileSync('public/js/all/classes.js') + '');
eval(fs.readFileSync('public/js/all/engine.js') + '');
eval(fs.readFileSync('public/js/all/brandNewAi.js') + '');
//eval(fs.readFileSync('public/js/all/deepening.js') + '');
eval(fs.readFileSync('public/js/server/serverFuncs.js') + '');
eval(fs.readFileSync('public/js/server/clients.js') + '');



var clients=new Clients()

wsServer.on('request', function(request) {
	
	var connection = request.accept(null, request.origin);

	var newConnectionID=Math.random()*Math.random()
	
	connection.addedData={
			connectionID:newConnectionID.toString()
		}
		
		
		
	//console.log('new connection, id:',newConnectionID)// connectionIndex())
		

	// This is the most important callback for us, we'll handle
	// all messages from users here.
	connection.on('message', function(message) {
		if (message.type === 'utf8') {
			// process WebSocket message
			var received = eval("(" + message.utf8Data + ")")

			//console.log('received:', received.message)

			eval("(onMessageFuncs." + received.command + "(connection,received.data,newConnectionID))") //this is in serverfuncs.js

		}
	});
//
	connection.on('close', function(connection2) {
		console.log('closed-------------------------------------------------------------')
		
		console.log(connection2)
		console.log('really closed-------------------------------------------------------------')
		
		clients.destroy(connection)
		
		clients.publishView('captain.html','default','activeViews',clients.simpleKnownClients())
		clients.publishAddedData()
		
	});
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

///var io = require('socket.io')(httpServ);

app.use(express.static('public'))
app.use(morgan("combined"))

var cn = 'mongodb://localhost:17890/chessdb'

//eval(fs.readFileSync('public/tableClass.js') + '');
//http://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files

var t1const = 11
var dletters = ["a", "b", "c", "d", "e", "f", "g", "h"]

var players = []
var learners = []
var speedTests = []

learners[0] = [] //learner IDs
learners[1] = [] //learners last polled
learners[2] = [] //learner is on table
learners[3] = [] //learner plays white
learners[4] = [] //learner modType
learners[5] = [] //learner modVal
learners[6] = [] //learner at pollnum
learners[7] = [] //learner at pollnum

speedTests[0] = [] //learner IDs
speedTests[1] = [] //speedTests last polled
speedTests[2] = [] //learner mtspeed
speedTests[3] = [] //learner wspeed
speedTests[4] = [] //learner faster
	// speedTests[5]=[]	//learner modVal
	// speedTests[6]=[]	//learner at pollnum
	// speedTests[7]=[]	//learner at pollnum

var oldSpeedTestConst = 10000
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
var knownThinkers = []
var pendingThinkerPolls = []

function doIKnow(id) {
	for (var i = 0; i < knownThinkers.length; i++) {
		if (knownThinkers[i].id == id) return i
	}

	knownThinkers.push({
			id: id
		})
		//itt mar benne lesz a tombben

	return knownThinkers.length - 1
}

var getThinkerIndex = function(id) {

	for (var i = 0; i < pendingThinkerPolls.length; i++) {

		if (pendingThinkerPolls[i][0].query.id == id) return i
	}
	return -1

};


var taskQ = []
var splitTaskQ = []



function sendToAll(task) {

	while (pendingThinkerPolls.length > 0) {

		var thisPop = pendingThinkerPolls.pop()
		task.taskNum = Number(thisPop[0].query.tn) + 1
		task.sentRnd = Math.random()

		var thinkerIndex = doIKnow(thisPop[0].query.id)

		if (thinkerIndex == -1) {
			knownThinkers.push({
				id: thisPop[0].query.id
			})
			thinkerIndex = doIKnow(thisPop[0].query.id) //itt mar benne lesz a tombben

		}

		knownThinkers[thinkerIndex].busy = true

		knownThinkers[thinkerIndex].taskNum = task.taskNum //we need to remember the tasknum we sent

		postThinkerMessage(knownThinkers[thinkerIndex], task.message)

		//knownThinkers[thinkerIndex].message = task.message //do we we need to remember the message we sent?
		knownThinkers[thinkerIndex].command = task.command //we need to remember the task we sent
		knownThinkers[thinkerIndex].sent = new Date()
			.getTime()
		knownThinkers[thinkerIndex].lastSeen = knownThinkers[thinkerIndex].sent
		knownThinkers[thinkerIndex].polling = false

		//console.log('aaaaaa')
		clients.send(thisPop[1],'task',task,'task',function(){console.log('somecb')})
		//thisPop[1].json(task)

	}

	//captainPop()
}

app.get('/refreshAllThinkers', function(req, res) {
	//////////// ////////    //console.log(req)
	sendToAll(new Task('refresh', 0, 'refresh all'))
	res.end()

});

app.get('/startAllLearners', function(req, res) {
	//////////// ////////    //console.log(req)
	//sendToAll('learnStart','learnStart all')
	sendToAll(new Task('learnStart', 0, 'learnStart all'))
	res.end()

});
app.get('/echoTestAll', function(req, res) {
	//////////// ////////    //console.log(req)
	//sendToAll('learnStart','learnStart all')
	sendToAll(new Task('longEcho', 0, 'echoTest all'))
	res.end()

});

app.get('/stopAllLearners', function(req, res) {
	//////////// ////////    //console.log(req)
	//sendToAll('learnStop','learnStop all')
	sendToAll(new Task('learnStop', 0, 'learnStop all'))
	res.end()

});

function createXData() {
	////////// ////////    //console.log("can't find xData in db, creating..") //header in db

	mongodb.connect(cn, function(err, db) {

		db.collection("tables")
			.insert({
				"_id": "xData",
				"firstFreeTable": 1,
				"lobbyChat": [],
				"activeTables": [],
				"modTypes": []
			}, function(err3, res) {})
		db.close()

	});
}

mongodb.connect(cn, function(err, db) {
	db.collection("tables")
		.findOne({
			_id: "xData"
		}, function(err2, xData) {
			if (xData == null) {

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

registerUser=function(name,pwd,connection){
	
	mongodb.connect(cn, function(err, db) {
		//db.collection("users")

		db.collection("users")
			.findOne({
				name: name
			}, function(err, thing) {
				if (thing == null) {
					// retJsn = {
					// 	'exists': false
					// }
					//register this user
					var user = new Dbuser(name, pwd)
					//mongodb.connect(cn, function(err, db) {
						db.collection("users")
							.insert(user, function(err, doc) {
								
								clients.send(connection,'userRegistered',{name:name})
								
							});
					
				} else {
					clients.send(connection,'userExists',{name:name})
				}
				db.close()
				//res.json(retJsn)
			})

	});
	
	
	
}

var dbFuncs={
	publishDisplayedGames:function(loginName,connection){
		
		mongodb.connect(cn, function(err, db) {
			
			
			db.collection("users")
			.findOne({
				name: loginName
			}, function(err, doc) {
				if (!(doc == null)) {

					
					clients.send(connection,'updateDisplayedGames',doc.games)
					
				}
				db.close()
			});
			
			
			
			
			
			
			
		})
		
	}
}

knownClientReturned=function(data,connection){
	
	data._id=new ObjectID(data.clientMongoId)
	
	// data.currentState='online'
	
	mongodb.connect(cn, function(err, db) {
	// 	db.collection("clients")
	// 		.save(data, function(err, doc) {});
		
		db.collection("clients").findOne({
			_id:data._id
			},function(err,doc){
				
				////console.log('found client in db:  ',doc)
						
				db.close()
				
				if(doc!=null&&doc.loggedInAs!=''){
					//client has saved login details in db, log it in!
					userFuncs.loginUser(doc.loggedInAs,0,true,connection,true)
					
					
					
				}

				
			})
			
			
			
			
			
	
	});	

	
	
}

updateDbClients=function(connectionData){
	
	connectionData._id=new ObjectID(connectionData.clientMongoId)
	
	mongodb.connect(cn, function(err, db) {
		db.collection("clients")
			.save(connectionData, function(err, doc) {});
		db.close()

	});	
}

registerNewClient=function(initialData,connection){
	mongodb.connect(cn, function(err, db) {
		db.collection("clients")
			.insert(initialData, function(err, doc) {});
		db.close()
		clients.send(connection, 'saveYourClientMongoId', {
			clientMongoId: initialData._id
			
		}, 'saveYourClientMongoId', function() {})
		////console.log('asasasasasasasasasasasasasa',initialData._id)
	});
}

setInterval(function() {

	mongodb.connect(cn, function(err5, db2) {
		var laterThan = new Date()
			.getTime() - gameInactiveConst

		if (!(db2 == null)) {
			db2.collection("tables")
				.find({
					"moved": {
						"$gte": laterThan
					}
				}, {
					"_id": true,
					"wName": true,
					"bName": true
				})
				.toArray(function(err25, actGames) {

					actGames.sort(function(a, b) {
						if (a._id > b._id) {
							return -1
						} else {
							return 1
						}
						//no duplicates
					})

					db2.collection("tables")
						.findOne({
							"_id": "xData"
						}, function(err24, xData) {

							xData.activeTables = actGames

							db2.collection("tables")
								.save(xData, function(err3, res) {
									db2.close()
								})
								//////////// ////////    //console.log('Games checked.')

						});

				});
		}

	});

	////innentol jon az eval by clients

	//evalToClient()

}, checkGamesConst);

function ping(msecs) {
	for (var i = pendingThinkerPolls.length - 1; i > -1; i--) {
		if (pendingThinkerPolls[i][2] < new Date()
			.getTime() - msecs) {
			//polled more tham MSECS time ago, let's pop it
			sendTask(new Task('echoTest', 0, 'echoTest'), pendingThinkerPolls[i][0].query.id)

		}
	}

}

// setInterval(function() {
// 	ping(10000)
// }, 1000)

// setInterval( function(){	
// 	evalToClient()
// },evalGameConst)

var evalToClient = function() {

	mongodb.connect(cn, function(err7, db4) {
		db4.collection('tables')
			.findOne({

				toBeChecked: false

			}, function(errx, gameToEval) {
				//send gameToEval to fastest available client
				//var arguments=[]

				var task = {}
				if (gameToEval != null) {

					gameToEval.toBeChecked = true

					db4.collection('tables')
						.save(gameToEval, function() {})
						// task={
						// 	message:'evalGame, t'+gameToEval._id,
						// 	command:'evalGame',
						// 	data:gameToEval

					// }
					task = new Task('resetGame', gameToEval, 'resetGame, t' + gameToEval._id)

					//task=new Task('evalGame',gameToEval,'evalGame, t'+gameToEval._id)
					sendTask(task)
				} else {

					// task=new Task('',0,'nothing to eval')

					// sendTask(task)
				}
				db4.close()

			})
	})

}

var popThem = function(tNum, tableInDb, commandToSend, messageToSend) {

	if (!(pendingLongPolls[tNum] == undefined)) {

		if (pendingLongPolls[tNum].length > 0) {
			//van mire valaszolni

			while (pendingLongPolls[tNum].length > 0) {

				var resp = pendingLongPolls[tNum].pop()

				resp.json(
					tableInDb

				);

			}

		}
	}
}

var splitMoveTasks = [] //store ongoing splitmoves

var getSplitMoveTask = function(aiTable, percent) {

	//var numberOfTasks=movesToSend.length/100
	var numberToSend = Math.ceil(percent * aiTable.movesToSend.length)
		//var aiTable=dbTable.aiTable

	var splitMoveTask = []

	for (var i = 0; i < numberToSend; i++) {
		splitMoveTask.push(aiTable.movesToSend.pop())
	}

	return splitMoveTask

}

function pushSplitTask(splitTask) {

	splitTaskQ.push(splitTask) //use this when receiving

}

function makeSplitMove(dbTable) {

	dbTable.splitMoveStarted = new Date()

	var aiTable = new MoveTask(dbTable) //this should happen on the calling client, not on the server

	dbTable.aiTable = aiTable

	dbTable.pendingSolvedMoves = aiTable.moves.length //set it here, it will be decreased as the moves come in

	dbTable.returnedMoves = []

	// splitTaskQ.push(dbTable) //use this when receiving
	pushSplitTask(dbTable)

	var sentTNum = dbTable._id

	clearSentMoves(sentTNum)

	var index
//
	//for(var i=busyTables.splitMoves[])

	while (aiTable.movesToSend.length > 0) {

		var tempLength = aiTable.movesToSend.length

		var aa = clients.fastestThinker(true)

		if (isNaN(aa)) {
			//////    //console.log('hacking',aa)
			aa = 1 //quickfix!!!!!!!!!!!!!!!!!!!!!!//but doesn't work
		}

		var sendThese = getSplitMoveTask(aiTable, aa)

		//////    //console.log('calling sendTask')

		var sentCount = sendThese.length

		var sentTo = clients.sendTask(new Task('splitMove', sendThese, 'splitMove t' + sentTNum + ' sentCount: ' + sentCount)) //string
		//console.log(sentTo)
		
		index = registerSentMoves(sentTNum, sentTo, sentCount)
		//clients.publishView()

	}//

	//busyTablesPop(index)
	clients.publishView('board.html',sentTNum,'busyThinkers',busyTables.splitMoves[index])
	clients.publishAddedData()

}

var BusyTables = function() {

	this.tables = []
	this.splitMoves = []
	this.pollNums = []
	this.pendingPolls = []

}

var busyTables = new BusyTables()

var getBusyTableIndex = function(tNum) {

	var index = busyTables.tables.indexOf(tNum)

	if (index == -1) {
		//table not in array, lets push it

		busyTables.tables.push(tNum)
		busyTables.splitMoves.push([])
		busyTables.pollNums.push(0)
		busyTables.pendingPolls.push([])

		return busyTables.tables.length - 1

	} else {

		return index

	}

}

var clearSentMoves = function(sentTNum) {

	var index = getBusyTableIndex(sentTNum)

	for (var i = busyTables.splitMoves[index].length - 1; i >= 0; i--) {
		busyTables.splitMoves[index][i].sentCount = 0
	}

}

var getMIndex = function(index, sentTo) {

	//var mIndex=-1

	for (var i = busyTables.splitMoves[index].length - 1; i >= 0; i--) {

		// busyTables.splitMoves[index][i].sentCount=0

		if (busyTables.splitMoves[index][i].thinker == sentTo.toString()) {
			return i
		}
	}

	return -1

}

var registerSentMoves = function(sentTNum, sentTo, sentCount) {
	////console.log('ez',sentTo)
	var index = getBusyTableIndex(sentTNum)

	var mIndex = getMIndex(index, sentTo)

	if (mIndex == -1) {

		busyTables.splitMoves[index].push({

			thinker: sentTo,
			sentCount: sentCount,
			done: false,
			progress: 0

		})

	} else {

		busyTables.splitMoves[index][mIndex] = {

			thinker: sentTo,
			sentCount: sentCount,
			done: false,
			progress: 0

		}

	}

	return index

}

var updateSplitMoveProgress = function(sentTNum, sentTo, progress) {

	var index = getBusyTableIndex(sentTNum)

	var mIndex = getMIndex(index, sentTo)

	if (busyTables.splitMoves[index][mIndex]) {

		if (progress > busyTables.splitMoves[index][mIndex].progress) {

			busyTables.splitMoves[index][mIndex].progress = progress

		}

		//busyTablesPop(index)
		clients.publishView('board.html',sentTNum,'busyThinkers',busyTables.splitMoves[index])

	}

}

//

function makeAiMove(dbTable) {

	switch (dbTable.aiType) {

		case 'fastest thinker':

			var moveTask = new Task('move', dbTable, 'fastest thinker move t' + dbTable._id)

			sendTask(moveTask) //sends to fastest thinker

			//callback handled as another post

			break;

		case 'thinkers':

			//split between available thinkers to make it as fast as possible
			//////    //console.log('calling makeSplitMove..')
			makeSplitMove(dbTable) //starts processing table in multi-thinker mode

			break;

		case 'server':

			////////////////////////ez mikor kerul mar ide?????!!!!!!!!!!!!!!!!!!!!!!

			break;

	}

}
//
function getTaskIndex(tNum) {

	for (var i = 0; i < splitTaskQ.length; i++) {
		if (splitTaskQ[i]._id == tNum) return i
	}

}

function postThinkerMessage(thinker, message) {
	if (thinker.messages == undefined) thinker.messages = []
	thinker.messages.push(message) //) = req.body.message
	if (thinker.messages.length > 12) thinker.messages.shift()
	thinker.lastSeen = new Date()
		.getTime()

	//captainPop();

}

app.post('/myPartIsDone', function(req, res) {

	res.send('received.')

});

function findMIndex(tIndex, thinker) {

	for (var i = busyTables.splitMoves[tIndex].length - 1; i >= 0; i--) {
		//console.log(tIndex, busyTables.splitMoves[tIndex],busyTables.splitMoves[tIndex][i].thinker,thinker)
		if (busyTables.splitMoves[tIndex][i].thinker == thinker) {

			return i

		}
	}
}

var busyTablesPop = function(tIndex) {

	busyTables.pollNums[tIndex]++

		while (busyTables.pendingPolls[tIndex].length > 0) {
			//    //console.log('volt egy')
			var res = busyTables.pendingPolls[tIndex].pop()

			res.json({

				busyThinkers: busyTables.splitMoves[tIndex],
				pollNum: busyTables.pollNums[tIndex]

			})

		}

}

function markSplitMoveDone(tNum, thinker) {

	var tIndex = getBusyTableIndex(tNum)

	var mIndex = findMIndex(tIndex, thinker.toString())//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

	//console.log(tIndex,mIndex,thinker)

	busyTables.splitMoves[tIndex][mIndex].done = true

	busyTables.splitMoves[tIndex][mIndex].progress = 100

	//busyTablesPop(tIndex)
	clients.publishView('board.html',tNum,'busyThinkers',busyTables.splitMoves[tIndex])
	clients.publishAddedData()

}

// app.get('/busyThinkersPoll', function(req, res) {

// 	//    //console.log('longpoll tNum received: ',req.query.t)

// 	var index = getBusyTableIndex(Number(req.query.t))

// 	if (req.query.p == busyTables.pollNums[index]) {
// 		//no changes, let's store the res
// 		busyTables.pendingPolls[index].push(res)

// 		// //    //console.log('pushed',index)
// 		// //    //console.log('pendingpolls',busyTables.pendingPolls)

// 	} else {
// 		//state changed, let's reply

// 		res.json({

// 			busyThinkers: busyTables.splitMoves[index],
// 			pollNum: busyTables.pollNums[index]

// 		})

// 	}

// });

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

		db.collection("users")
			.findOne({
				name: req.query.n
			}, function(err, thing) {
				if (thing == null) {
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

		db.collection("users")
			.findOne({
				name: req.query.n
			}, function(err, thing) {
				if (thing == null) {
					retJsn = {
						'exists': false,
						'denied': true
					}

				} else {
					//record exists, let's check pwd
					if (thing.pwd == req.query.p) {
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

// app.get('/getTable', function(req, res) {

// 	mongodb.connect(cn, function(err, db) {
// 		db.collection("tables")
// 			.findOne({
// 				_id: Number(req.query.t)
// 			}, function(err2, tableInDb) {
// 				// if(!(tableInDb == null)) {
// 				// 	var passMoves = tableInDb.moves
// 				// 	var passTable = tableInDb.table
// 				// 	var passWnext = tableInDb.wNext
// 				// 	var passPollNum = tableInDb.pollNum
// 				// 	var passChat = tableInDb.chat
// 				// } else {
// 				// 	var passMoves = 0.0
// 				// 	var passTable = 0.0
// 				// 	var passWnext = 0.0
// 				// 	var passPollNum = 0.0
// 				// 	var passChat = 0.0
// 				// }

// 				db.close()
// 				res.json(tableInDb);
// 			});

// 	});

// });

app.get('/longPollTable', function(req, res) {

	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				_id: Number(req.query.t)
			}, function(err2, tableInDb) {
				if (!(tableInDb == null)) {

					//long
					var passPollNum = tableInDb.pollNum

					if (passPollNum > req.query.pn) {

						db.close()

						tableInDb.command = 'sync'
						tableInDb.message = 'sync t' + req.query.t + ', poll' + passPollNum

						res.json(tableInDb);

					} else {
						//nincs mit kuldeni
						if (pendingLongPolls[req.query.t] == undefined) pendingLongPolls[req.query.t] = []

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
	//////////// ////////    //console.log(req)
	res.send('sg')
	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				_id: Number(req.query.t)
			}, function(err2, stopThisTable) {

				if (stopThisTable != null) {

					stopThisTable.gameIsOn = false
					evalGame(stopThisTable)

					db.collection("tables")
						.save(stopThisTable, function(err3, res) {

						})
				} else {

				}

				db.close()
			});
	});

});
app.get('/forcePopTable', function(req, res) {

	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				_id: Number(req.query.t)
			}, function(err2, tableInDb) {

				if (!(tableInDb == null)) {

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

	if (req.query.c == 'miki: test') {
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
								_id: Number(req.query.t)
							}, function(err2, tableInDb) {

								if (!(resJsn == null || tableInDb == null)) {

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
					_id: Number(req.query.t)
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

// app.get('/startGame', function(req, res) {

// 		startGame(req.query.w,req.query.b)

// 		res.json({
// 			"message": "ok"
// 			// "_id": firstFreeTable,
// 			// "modType": modType
// 		});

// });

app.post('/mod', function(req, res) {

	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				_id: "xData"
			}, function(err2, xData) {
				//var firstFreeTable=-5
				if (xData == null) {

					createXData();

					// firstFreeTable = 1
				} //else {
				//firstFreeTable = xData.firstFreeTable
				xData.modTypes = req.body
					//	xData.firstFreeTable++
					//}
				db.collection("tables")
					.save(xData, function(err, doc) {
						db.close()
						res.json({
							message: 'ok'
						})
					});

			})
	})
})

app.get('/watchGame', function(req, res) {

	var viewerNum = players[0].indexOf(req.query.v)

	//players[6][viewerNum]=true;		//ask viewer to open game
	players[2][viewerNum] = true; //ask viewer to open game

	players[3][viewerNum] = true; //will watch w

	players[4][viewerNum] = req.query.t //_id

	// will have to give names

	// players[7][wPNum]=req.query.b;		//give them the opponents name
	players[5][viewerNum] = "Spectator"; //tell lobby to open spect mode

	res.json({
		none: 0
	});

});

app.get('/lobbyChat', function(req, res) {
	//////////// ////////    //console.log(req)
	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				_id: "xData"
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

app.get('/getModTypes', function(req, res) {
	//////////// ////////    //console.log(req)
	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				_id: "xData"
			}, function(err2, xData) {

				res.json(xData.modTypes);

				db.close()
			});
	});

	lobbyPollNum++

	// res.json({
	// 	//lobbychat: lobbyChat
	// });

});

app.get('/getMyRecentGames', function(req, res) {
	//////////// ////////    //console.log(req)
	mongodb.connect(cn, function(err, db) {
		db.collection("users")
			.findOne({
				name: req.query.n
			}, function(err2, xData) {
				if (!(xData == null)) {

					res.json({
						recentgames: xData.games
					});
				}
				db.close()
			});
	});

});
// var captainPop = function() {
// 	captainPollNum++
// 	while (captainPolls.length > 0) {
// 		var res = captainPolls.pop()

// 		//clearDisconnectedLearners()

// 		var texttosnd = []

// 		for (var i = 0; i < learners[0].length; i++) {
// 			texttosnd[i] = [learners[0][i], learners[2][i], learners[4][i], learners[6][i], learners[5][i], learners[7][i]]
// 		}
// 		// var waitingThinkers=[]
// 		// pendingThinkerPolls.forEach(function(task){
// 		// 	waitingThinkers.push(task[0].query.id)			//the req from /longpolltask
// 		// })

// 		res.json({

// 			"learners": texttosnd,
// 			// "thinkers":waitingThinkers,
// 			"knownThinkers": knownThinkers,

// 			"captainPollNum": captainPollNum,

// 			"taskQ": taskQ.length,

// 			//"stats": stats,

// 			"speedTests": speedTests

// 		})

// 	}
// }
var captainPollNum = 0
var captainPolls = []
app.get('/captainPoll', function(req, res) {

	if (req.query.pn != captainPollNum) {

		clearDisconnectedLearners()

		captainPollNum++
		////captainPop()

		var texttosnd = []

		for (var i = 0; i < learners[0].length; i++) {
			texttosnd[i] = [learners[0][i], learners[2][i], learners[4][i], learners[6][i], learners[5][i], learners[7][i]]
		}
		var waitingThinkers = []
		pendingThinkerPolls.forEach(function(task) {
			waitingThinkers.push(task[0].query.id) //the req from /longpolltask
		})

		res.json({

			"learners": texttosnd,
			// "thinkers":waitingThinkers,
			"knownThinkers": knownThinkers,

			"captainPollNum": captainPollNum,

			"taskQ": taskQ.length,

			//"stats": stats,

			"speedTests": speedTests

		})

	} else {

		captainPolls.push(res)

	}
	//var aa=[]

})

function checkIfPending(id) {
	for (var i = 0; i < pendingThinkerPolls.length; i++) {
		if (pendingThinkerPolls[i][0].query.id == id) {
			return true
		}
	}
	return false
}

function clearPending(id) {
	//for (var i = 0; i < pendingThinkerPolls.length; i++) {
	//if (pendingThinkerPolls[i][0].query.id == id) {
	//client sent repeated poll, remove pending one
	//pendingThinkerPolls.splice(i, 1)
	// sendTask(new Task('dontCall', {
	// 	meantToSendTo: id
	// }, 'dontCall'), id)
	//console.log('clearpending called')
		//}
		//}
		//return false
}

function gotTask(taskForMe, id) {

	//var forMe=false
	var forAny = -1
	for (var i = 0; i < taskQ.length; i++) {
		//////// ////////    //console.log(taskQ[i][1])
		if (taskQ[i][1] == id) {
			//task for me
			taskForMe.push(taskQ.splice(i, 1))
			return true

		} else {

			if (taskQ[i][1] == 'fastest') {
				forAny = i
			}

		}
	}
	if (forAny > -1) {
		taskForMe.push(taskQ.splice(forAny, 1))
		return true
	}

	return false

}

app.get('/longPollTasks', function(req, res) {
	//////////// ////////    //console.log(req)
	// var pollerIndex = doIKnow(req.query.id)

	// if (-1 == pollerIndex) {

	// 	knownThinkers.push({
	// 		id: req.query.id,
	// 		lastSeen: new Date()
	// 			.getTime(),
	// 		busy: false,
	// 		polling: true,
	// 		spd: ~~(req.query.spd * 100) / 100
	// 	})

	// } else {

	// 	var oldSpeed = knownThinkers[pollerIndex].spd
	// 	var newSpeed = ~~(req.query.spd * 100000) / 100000

	// 	knownThinkers[pollerIndex].lastSeen = new Date()
	// 		.getTime()
	// 	knownThinkers[pollerIndex].busy = false
	// 	knownThinkers[pollerIndex].polling = true
	// 	knownThinkers[pollerIndex].spd = newSpeed

	// 	if (knownThinkers[pollerIndex].stn != req.query.stn) { //new speedtest data, check pct

	// 		knownThinkers[pollerIndex].pct = ~~(newSpeed / oldSpeed * 1000) / 10

	// 		knownThinkers[pollerIndex].stn = req.query.stn

	// 	}

	// }

	// //console.log('will check if pending for req.query.id', req.query.id)

	// if (checkIfPending(req.query.id)) {

	// 	//sendTask(new Task('ping',0,'normal ping'),req.query.id)

	// 	//console.log('found logpoll, will call clearpending for', req.query.id)

	// 	clearPending(req.query.id)

	// }

	// knownThinkers[pollerIndex].lastSeen = new Date()
	// 	.getTime()
	// knownThinkers[pollerIndex].busy = false

	// pendingThinkerPolls.push([req, res, new Date()
	// 	.getTime()
	// ])

	// var taskForMe = []

	// if (false) {

	// } else {

	// 	if (gotTask(taskForMe, req.query.id)) { //ez beleirja a taskformebe

	// 		//////// ////////    //console.log('for me: '+taskForMe)
	// 		sendTask(taskForMe[0][0][0], taskForMe[0][0][1]) //why? !!!!!!!

	// 	} else {

	// 	}

	// }

	// //captainPop()

});

app.get('/speedTestResult', function(req, res) {

	if (speedTests[0].indexOf(req.query.thinker) == -1) {
		speedTests[0].push(req.query.thinker)
		speedTests[1].push((new Date())
			.getTime())

		speedTests[2].push(req.query.mtSpeed)
		speedTests[3].push(req.query.wSpeed)
		speedTests[4].push(req.query.faster)

	} else {

		var learnerIndex = speedTests[0].indexOf(req.query.thinker)

		speedTests[1][learnerIndex] = (new Date())
			.getTime()

		speedTests[2][learnerIndex] = req.query.mtSpeed
		speedTests[3][learnerIndex] = req.query.wSpeed
		speedTests[4][learnerIndex] = req.query.faster

	}

	res.json({
		message: 'nincs'
	})

	//captainPop()

})



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

function clearOldSpeedTests() {
	for (var i = speedTests.length - 1; i >= 0; i--) {

		if (speedTests[1][i] + oldSpeedTestConst < (new Date())
			.getTime()) {
			speedTests[1].splice(i, 1)
			speedTests[0].splice(i, 1)
			speedTests[2].splice(i, 1)
			speedTests[3].splice(i, 1)
			speedTests[4].splice(i, 1)

		}

	}

}

function clearDisconnectedLearners() {
	for (var i = learners.length - 1; i >= 0; i--) {

		if (learners[1][i] + learnerDisconnectConst < (new Date())
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
