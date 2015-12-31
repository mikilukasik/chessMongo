
var express = require('express');
var morgan = require('morgan');
var bodyParser = require("body-parser");
var fs = require('fs');
var mongodb = require('mongodb');
var http = require('http')
var WebSocketServer = require('websocket').server;


var app=express()
var httpServ = http.createServer(app)


var server = httpServ.listen(80, function() {

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


wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
			// process WebSocket message
            var received=message.utf8Data
            console.log('received',received)
            
            
            
            
            
        }
    });

    connection.on('close', function(connection) {
        // close user connection
        
        
        
        
    });
});










app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(express.static('public'))
app.use(morgan("combined"))

var cn = 'mongodb://localhost:17890/chessdb'

eval(fs.readFileSync('public/js/brandNewAi.js') + '');
eval(fs.readFileSync('public/js/deepening.js') + '');
eval(fs.readFileSync('public/js/classes.js') + '');
eval(fs.readFileSync('public/js/engine.js') + '');



