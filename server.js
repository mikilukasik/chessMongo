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

var updateDbClients = function() {
	////console.log('updateDbClients function not inited')
}

var registerNewClient = function() {
	////console.log('registerNewClient function not inited')
}

// var knownClientReturned = function() {
// 	////console.log('knownClientReturned function not inited')
// }


var registerUser = function() {
	////console.log('registerUser function not inited')
}


// var publishSplitMoves = function() {
// 	////console.log('publishSplitMoves function not inited')
// }


//eval(fs.readFileSync('public/js/all/deepening.js') + '');

eval(fs.readFileSync('public/js/all/classes.js') + '');
eval(fs.readFileSync('public/js/all/engine.js') + '');
eval(fs.readFileSync('public/js/all/brandNewAi.js') + '');


eval(fs.readFileSync('public/js/server/clients.js') + '');

eval(fs.readFileSync('public/js/server/splitMoves.js') + '');


var clients = new Clients()

var splitMoves = new SplitMoves(clients)

eval(fs.readFileSync('public/js/server/serverFuncs.js') + '');

eval(fs.readFileSync('public/js/server/functions.js') + '');




wsServer.on('request', function(request) {


	//console.log('++++++++++++++++++++++++++++++++++++++++++')
	//console.log(request.key)
	//console.log('++++++++++++++++++++++++++++++++++++++++++')




	var connection = request.accept(null, request.origin);

	var newConnectionID = request.key //Math.random()*Math.random()

	connection.addedData = {
		connectionID: newConnectionID.toString()
	}



	////console.log('new connection, id:',newConnectionID)// connectionIndex())


	// This is the most important callback for us, we'll handle
	// all messages from users here.
	connection.on('message', function(message) {
		if (message.type === 'utf8') {
			// process WebSocket message
			var received = eval("(" + message.utf8Data + ")")

			////console.log('received:', received.message)

			eval("(onMessageFuncs." + received.command + "(connection,received.data,newConnectionID))") //this is in serverfuncs.js

		}
	});
	//
	connection.on('close', function(connection2) {
		//console.log('closed-------------------------------------------------------------')

		//console.log(connection2)
		//console.log('really closed-------------------------------------------------------------')

		clients.destroy(connection)

		clients.publishView('admin.html', 'default', 'activeViews', clients.simpleKnownClients())
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

		////console.log('aaaaaa')
		clients.send(thisPop[1], 'task', task, 'task', function() {
				//console.log('somecb')
			})
			//thisPop[1].json(task)

	}

	//adminPop()
}

app.get('/refreshAllThinkers', function(req, res) {
	//////////// ////////    ////console.log(req)
	sendToAll(new Task('refresh', 0, 'refresh all'))
	res.end()

});

app.get('/startAllLearners', function(req, res) {
	//////////// ////////    ////console.log(req)
	//sendToAll('learnStart','learnStart all')
	sendToAll(new Task('learnStart', 0, 'learnStart all'))
	res.end()

});
app.get('/echoTestAll', function(req, res) {
	//////////// ////////    ////console.log(req)
	//sendToAll('learnStart','learnStart all')
	sendToAll(new Task('longEcho', 0, 'echoTest all'))
	res.end()

});

app.get('/stopAllLearners', function(req, res) {
	//////////// ////////    ////console.log(req)
	//sendToAll('learnStop','learnStop all')
	sendToAll(new Task('learnStop', 0, 'learnStop all'))
	res.end()

});

function createXData() {
	////////// ////////    ////console.log("can't find xData in db, creating..") //header in db

	mongodb.connect(cn, function(err, db) {

		db.collection("tables")
			.insert({
				"_id": "xData",
				"firstFreeTable": 1,
				"lobbyChat": [],
				"activeTables": [],
				"modTypes": []
			}, function(err3, res) {
				db.close()
			})


	});
}

mongodb.connect(cn, function(err, db) {
	db.collection("tables")
		.findOne({
			_id: "xData"
		}, function(err2, xData) {
			if (xData == null) {

				createXData();

			}

			db.close()

		});
});

registerUser = function(name, pwd, connection) {

	mongodb.connect(cn, function(err, db) {
		//db.collection("users")

		db.collection("users")
			.findOne({
				name: name
			}, function(err, thing) {
				if (thing == null) {

					//register this user
					var user = new Dbuser(name, pwd)


					db.collection("users")
						.insert(user, function(err, doc) {

							clients.send(connection, 'userRegistered', {
								name: name
							})

						});

				} else {
					clients.send(connection, 'userExists', {
						name: name
					})
				}
				db.close()

			})

	});



}

var dbFuncs = {
	publishDisplayedGames: function(loginName, connection) {

		mongodb.connect(cn, function(err, db) {


			db.collection("users")
				.findOne({
					name: loginName
				}, function(err, doc) {
					if (!(doc == null)) {


						clients.send(connection, 'updateDisplayedGames', doc.games)

					} else {

						clients.send(connection, 'updateDisplayedGames', null)


					}
					db.close()
				});




		})

	},
    
    knownClientReturned : function(data, connection) {

	data._id = new ObjectID(data.clientMongoId)

	// data.currentState='online'

	mongodb.connect(cn, function(err, db) {
		// 	db.collection("clients")
		// 		.save(data, function(err, doc) {});

		db.collection("clients").findOne({
			_id: data._id
		}, function(err, doc) {

			//////console.log('found client in db:  ',doc)

			
			if(doc != null){	
				if (doc.loggedInAs) {
					//client has saved login details in db, log it in!
					userFuncs.loginUser(doc.loggedInAs, 0, true, connection, true)
	
					
	
				}else{
					
					if(doc.lastUser){
						
						
						console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>lastUser from db:',doc)
						
						connection.addedData.lastUser=doc.lastUser
						
						
					}
					
					
					
				}
                
                if(doc.speed){
                    
                    connection.addedData.speed=doc.speed
                   
                    connection.addedData.speedStats=doc.speedStats
                    
                }
                
                 connection.addedData.currentState='idle'
			}
            
            db.close()

		})




	});



}
}



updateDbClients = function(connectionData) {

	connectionData._id = new ObjectID(connectionData.clientMongoId)

	mongodb.connect(cn, function(err, db) {
		db.collection("clients")
			.save(connectionData, function(err, doc) {});
		db.close()

	});
}

registerNewClient = function(initialData, connection) {
	mongodb.connect(cn, function(err, db) {
		db.collection("clients")
			.insert(initialData, function(err, doc) {});
		db.close()
		clients.send(connection, 'saveYourClientMongoId', {
				clientMongoId: initialData._id

			}, 'saveYourClientMongoId', function() {})
			//////console.log('asasasasasasasasasasasasasa',initialData._id)
	});
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

	//adminPop();

}

function checkIfPending(id) {
	for (var i = 0; i < pendingThinkerPolls.length; i++) {
		if (pendingThinkerPolls[i][0].query.id == id) {
			return true
		}
	}
	return false
}

function gotTask(taskForMe, id) {

	//var forMe=false
	var forAny = -1
	for (var i = 0; i < taskQ.length; i++) {
		//////// ////////    ////console.log(taskQ[i][1])
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
