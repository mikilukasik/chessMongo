
var express = require('express');
var morgan = require('morgan');


var bodyParser = require("body-parser");



var fs = require('fs');

var mongodb = require('mongodb');

var http = require('http')
// var httpServ = http.createServer(function(request, response) {
//     // Not important for us. We're writing WebSocket server, not HTTP server
// });
//http.Server(app);


var httpServ = http.Server(app);


//

//var express = require("express");
var app = express//.createServer(); 

// app.get('/', function(req, res){ 
//     res.redirect("/index.html");
// }); 

// app.configure(function(){
//   app.use(express.static('/public'));
// });

// app.listen(80); 

// var io = require('socket.io'); 
// var socket = io.listen(app); 
// socket.on('connection', function(client){ 
//   client.on('message', function(){...});
// })





var WebSocketServer = require('websocket').server;

var wsServer = new WebSocketServer({
    httpServer: httpServ,
    path: '/sockets'
});

// WebSocket server
wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
			
			
			console.log('got some msg...')
			
            // process WebSocket message
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


var server = app.listen(80, function() {

	var host = server.address()
		.address;
	var port = server.address()
		.port;

 console.log('app listening at http://%s:%s', host, port);

});
