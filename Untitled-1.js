				gamesToCheck.forEach(function(checkThisGame) {
					if((checkThisGame.wNext && checkThisGame.wName == "Computer") ||
						(!checkThisGame.wNext && checkThisGame.bName == "Computer")) {
						//need to make aiMove
						var options = {
							host: 'localhost',
							port: 16789,
							path: '/aichoice?t=' + checkThisGame.tableNum
						};

						http.request(options, function(response) {
								var resJsn = {};

								//another chunk of data has been recieved, so append it to `resJsn`
								response.on('data', function(chunk) {
									resJsn = JSON.parse(chunk);
								});

								response.on('end', function() {
									/////////

									mongodb.connect(cn, function(err, setIntDB2) { //itt egy server moveitot csinalunk vegulis
										setIntDB2.collection("tables")
											.findOne({
												tableNum: Number(checkThisGame.tableNum)
											}, function(err2, tableInDb) {
												// console.log(resJsn)
												// console.log('dssdfsdgs')
												if(!(resJsn == null || tableInDb == null)) {
													var moveStr = String(resJsn.aimove)
													if(!(moveStr == "")) { //there's at least 1 move
														var toPush = String(tableInDb.table[dletters.indexOf(moveStr[0])][moveStr[1] - 1][0]) + //color of whats moving
															tableInDb.table[dletters.indexOf(moveStr[0])][moveStr[1] - 1][1] + //piece
															moveStr + //the string
															tableInDb.table[dletters.indexOf(moveStr[2])][moveStr[3] - 1][0] + //color of whats hit
															tableInDb.table[dletters.indexOf(moveStr[2])][moveStr[3] - 1][1] //piece
															//en passnal nem latszik a leveett paraszt

														tableInDb.moves.push(toPush)
														tableInDb.toBeChecked=true
														tableInDb.table = moveIt(moveStr, tableInDb.table)
														tableInDb.wNext = !tableInDb.wNext
														
														evalGame(tableInDb)
														
														tableInDb.pollNum++
														
														
														
														tableInDb.moved = new Date().getTime()
														tableInDb.chat = resJsn.toconsole

														//tableInDb.toBeChecked = false //checked for now. this should be done later, there are other stuff to be checked

														tableInDb.table = addMovesToTable(tableInDb.table, tableInDb.wNext)

														popThem(Number(checkThisGame.tableNum),tableInDb,'moved','Ai moved: '+moveStr)	//respond to pending longpolls
	
															
														setIntDB2.collection("tables")
															.save(tableInDb, function(err3, res) {})
													}
												}
												setIntDB2.close()
											});

									});
									/////////

								});
							})
							.end();

					}

					// mongodb.connect(cn, function(err, setIntDB3) { //this is last after game is checked
					// 	if(!(setIntDB3 == null)) {

					// 		setIntDB3.collection("tables")
					// 			.findOne({
					// 				tableNum: Number(checkThisGame.tableNum)
					// 			}, function(err2, tableInDb) {

					// 				if(!(tableInDb == null)) {

					// 					tableInDb.pollNum++

					// 						if(!canIMove(tableInDb.table, tableInDb.wNext)) {
					// 							tableInDb.gameIsOn = false
					// 							if(captured(tableInDb.table, tableInDb.wNext)) {

					// 								if(tableInDb.wNext) {

					// 									tableInDb.blackWon = true
					// 								} else {
					// 									tableInDb.whiteWon = true
					// 								}
					// 							} else {
					// 								tableInDb.isDraw = true
					// 							}
					// 						}

											
					// 					tableInDb.toBeChecked = false

					// 					setIntDB3.collection("tables")
					// 						.save(tableInDb, function(err3, res) {})

					// 				}
					// 				setIntDB3.close()
					// 			});
					// 	}
					// });

				})

				setIntDB.close()