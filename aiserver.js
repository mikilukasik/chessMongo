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
eval(fs.readFileSync('public/engine.js')+'');

app.get('/aiChoice', function(req, res) {

	mongodb.connect(cn, function(err, db) {
		db.collection("tables").findOne({
			tableNum: Number(req.query.t)
		}, function(err2, tableFromDb) {

			if(!(tableFromDb == null)) {

				var result = ai(tableFromDb.table, tableFromDb.wNext)

				if(result.length > 1) { //if there are any moves

					var aiMoveString = result[1][0] // the winning movestring

					var toConsole = [] //to chat?

					toConsole[0] = result[0][2] //timeItTook

					for(var i = 1; i < result.length; i++) {

						toConsole[i] = result[i][0] + '__' +
							result[i][1] + '__' +
							result[i][2] + '__' +
							result[i][3];

					}

					var sendJson = {
						aimove: aiMoveString,
						fulltable: result,
						toconsole: toConsole
					}
				} else {
					var sendJson = {
						aimove: "",
						fulltable: result
					}
				}
			} else {
				var sendJson = {
					error: "error"
				}
			}

			db.close()
			res.json(sendJson);

		});
	});
});

var server = app.listen(16789, function() {

	var host = server.address().address;
	var port = server.address().port;

	console.log('aiserver is listening at http://%s:%s', host, port);

});