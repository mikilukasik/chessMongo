
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
									/////////

				
												if(!(resJsn == null)) {
													var moveStr = String(resJsn.aimove)
													if(!(moveStr == "")) { //there's at least 1 move
														
														
														
													}
												}
												//setIntDB2.close()
											//});

								//	});
									/////////
								//	db.close()
								});
							})
							.end();

					