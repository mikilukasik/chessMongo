

var express = require('express');
var morgan = require('morgan');
var bodyParser = require("body-parser");
var fs = require('fs');
var mongodb = require('mongodb');
var http = require('http')
var WebSocketServer = require('websocket').server;

var SplitMoves = require('./public/js/server/splitMoves.js')
var Engine=require('./public/js/all/engine.js')

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
	
	path: '/sockets/'
    
});

var currentMod={
    modType:'',
    modVal:1
}


//change the below to require!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

eval(fs.readFileSync('public/js/server/clients.js') + '');

var clients = new Clients()


eval(fs.readFileSync('public/js/all/classes.js') + '');
eval(fs.readFileSync('public/js/all/engine.js') + '');
eval(fs.readFileSync('public/js/server/serverGlobals.js') + '');




//get rid of brandnewai !!!!!!!!!!!!!!!!!!!!
eval(fs.readFileSync('public/js/all/brandNewAi.js') + '');







var cn = 'mongodb://localhost:17890/chessdb'

var splitMoves = new SplitMoves.withClient(clients,new Date(),Engine,{mongodb:mongodb,cn:cn})

var mainStore={
    lobbyChat:[]
}

eval(fs.readFileSync('public/js/server/serverFuncs.js') + '');
eval(fs.readFileSync('public/js/server/dbFuncs.js') + '');

eval(fs.readFileSync('public/js/server/onMessageFuncs.js') + '');




wsServer.on('request', function(request) {

	var connection = request.accept(null, request.origin);

	var newConnectionID = request.key 

	connection.addedData = {
		connectionID: newConnectionID.toString()
	}

	connection.on('message', function(message) {
		if (message.type === 'utf8') {
			
			var received = JSON.parse( message.utf8Data )
            
			onMessageFuncs[received.command](connection,received.data,newConnectionID)
		}
	});
	
	connection.on('close', function(connection2) {
		
        
		clients.destroy(connection)

		clients.publishView('admin.html', 'default', 'activeViews', clients.simpleKnownClients())
		clients.publishAddedData()

	});
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static('public'))
app.use(morgan("combined"))


var router=express.Router()

router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/mod/type').get(function(req,res){
    
    var sendMod=clients.getMod(req.query.id)
    
    if(sendMod=='default'){
        res.json(serverGlobals.defaultMod)
    }else{
        res.json(sendMod)
    }
    
    
    
})

router.route('/mod/limits').get(function(req,res){
    
    var modLimits=serverGlobals.getModLimits(req.query.mod)
    
    
    
    res.json(modLimits)
    
    
})

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);


//var t1const = 11
var dletters = ["a", "b", "c", "d", "e", "f", "g", "h"]

// var lobbyPollNum = 0
// var lobbyChat = []

function createXData() {
	
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



updateDbClients = function(connectionData) {

	connectionData._id = new ObjectID(connectionData.clientMongoId)

	mongodb.connect(cn, function(err, db) {
		if(db)db.collection("clients")//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11
			.save(connectionData, function(err, doc) {
                
                db.close()
                
            });
		

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
			
	});
}


function postThinkerMessage(thinker, message) {
	if (thinker.messages == undefined) thinker.messages = []
	thinker.messages.push(message) //) = req.body.message
	if (thinker.messages.length > 12) thinker.messages.shift()
	thinker.lastSeen = new Date()
		.getTime()

}
