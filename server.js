 
var express = require('express');
var morgan = require('morgan');
var bodyParser = require("body-parser");
var fs = require('fs');

var http = require('http')
var WebSocketServer = require('websocket').server;


var dbFuncs = require('./public/js/server/dbFuncs.js')
dbFuncs.connect('mongodb://localhost:17890/chessdb')

var SplitMoves = require('./public/js/server/splitMoves.js')
var Engine=require('./public/js/all/engine.js')


var Clients = require('./public/js/server/clients.js')
var clients=new Clients(dbFuncs)

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

eval(fs.readFileSync('public/js/server/routerFuncs.js') + '');


//eval(fs.readFileSync('public/js/server/clients.js') + '');




eval(fs.readFileSync('public/js/all/classes.js') + '');
eval(fs.readFileSync('public/js/all/engine.js') + '');
eval(fs.readFileSync('public/js/server/serverGlobals.js') + '');




//get rid of brandnewai !!!!!!!!!!!!!!!!!!!!
eval(fs.readFileSync('public/js/all/brandNewAi.js') + '');









var splitMoves = new SplitMoves.withClient(clients,dbFuncs,Engine,{mongodb:dbFuncs.mongodb,cn:dbFuncs.cn,dbFuncs:dbFuncs})

var mainStore={
    lobbyChat:[]
}

eval(fs.readFileSync('public/js/server/serverFuncs.js') + '');
//eval(fs.readFileSync('public/js/server/dbFuncs.js') + '');

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
	
	connection.on('close', function(statusCode) {
        
        //var newConnectionID2 = request.key 

        // connection2.addedData = {
        //     connectionID: newConnectionID.toString()
        // }

		
    console.log('Websocket closed, status code:', statusCode)
		clients.destroy(connection)
        
        serverGlobals.learning.markGamesInactive.byConnectionID(connection.addedData.connectionID)
        

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


initRouter(router,app);



//var t1const = 11
var dletters = ["a", "b", "c", "d", "e", "f", "g", "h"]

// var lobbyPollNum = 0
// var lobbyChat = []



dbFuncs.findOne('tables',{_id:'xData'},function (doc) {
    if(doc==null){
        serverGlobals.createXData();
    }
})


updateDbClients = function(connectionData) {

	connectionData._id = new dbFuncs.ObjectID(connectionData.clientMongoId)

	dbFuncs.insert("clients",connectionData, function(doc) {});

}

registerNewClient = function(initialData, connection) {
	dbFuncs.insert("clients",initialData, function(err, doc) {});
		//db.close()
		clients.send(connection, 'saveYourClientMongoId', {
				clientMongoId: initialData._id

			}, 'saveYourClientMongoId', function() {})
			
	//});
}


function postThinkerMessage(thinker, message) {
	if (thinker.messages == undefined) thinker.messages = []
	thinker.messages.push(message) //) = req.body.message
	if (thinker.messages.length > 12) thinker.messages.shift()
	thinker.lastSeen = new Date()
		.getTime()

}
