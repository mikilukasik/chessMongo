	var options = {
							host: 'miki.space',
							port: 16789,
							path: '/forcePop?t=' + checkThisGame.tableNum
						};

http.request(options, function(response) {
								var resJsn = {};

								//another chunk of data has been recieved, so append it to `resJsn`
								response.on('data', function(chunk) {
									resJsn = JSON.parse(chunk);
								});

								response.on('end', function() {
									/////////

							
									/////////

								});
							})
							.end();
