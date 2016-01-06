/////////////////////////server.js/////////////////////////

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
	//////////// ////////    ////console.log(req)
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

// app.get('/longPollTasks', function(req, res) {
// 	//////////// ////////    ////console.log(req)
// 	// var pollerIndex = doIKnow(req.query.id)

// 	// if (-1 == pollerIndex) {

// 	// 	knownThinkers.push({
// 	// 		id: req.query.id,
// 	// 		lastSeen: new Date()
// 	// 			.getTime(),
// 	// 		busy: false,
// 	// 		polling: true,
// 	// 		spd: ~~(req.query.spd * 100) / 100
// 	// 	})

// 	// } else {

// 	// 	var oldSpeed = knownThinkers[pollerIndex].spd
// 	// 	var newSpeed = ~~(req.query.spd * 100000) / 100000

// 	// 	knownThinkers[pollerIndex].lastSeen = new Date()
// 	// 		.getTime()
// 	// 	knownThinkers[pollerIndex].busy = false
// 	// 	knownThinkers[pollerIndex].polling = true
// 	// 	knownThinkers[pollerIndex].spd = newSpeed

// 	// 	if (knownThinkers[pollerIndex].stn != req.query.stn) { //new speedtest data, check pct

// 	// 		knownThinkers[pollerIndex].pct = ~~(newSpeed / oldSpeed * 1000) / 10

// 	// 		knownThinkers[pollerIndex].stn = req.query.stn

// 	// 	}

// 	// }

// 	// ////console.log('will check if pending for req.query.id', req.query.id)

// 	// if (checkIfPending(req.query.id)) {

// 	// 	//sendTask(new Task('ping',0,'normal ping'),req.query.id)

// 	// 	////console.log('found logpoll, will call clearpending for', req.query.id)

// 	// 	clearPending(req.query.id)

// 	// }

// 	// knownThinkers[pollerIndex].lastSeen = new Date()
// 	// 	.getTime()
// 	// knownThinkers[pollerIndex].busy = false

// 	// pendingThinkerPolls.push([req, res, new Date()
// 	// 	.getTime()
// 	// ])

// 	// var taskForMe = []

// 	// if (false) {

// 	// } else {

// 	// 	if (gotTask(taskForMe, req.query.id)) { //ez beleirja a taskformebe

// 	// 		//////// ////////    ////console.log('for me: '+taskForMe)
// 	// 		sendTask(taskForMe[0][0][0], taskForMe[0][0][1]) //why? !!!!!!!

// 	// 	} else {

// 	// 	}

// 	// }

// 	// //captainPop()

// });

// // app.get('/speedTestResult', function(req, res) {

// // 	if (speedTests[0].indexOf(req.query.thinker) == -1) {
// 		speedTests[0].push(req.query.thinker)
// 		speedTests[1].push((new Date())
// 			.getTime())

// 		speedTests[2].push(req.query.mtSpeed)
// 		speedTests[3].push(req.query.wSpeed)
// 		speedTests[4].push(req.query.faster)

// 	} else {

// 		var learnerIndex = speedTests[0].indexOf(req.query.thinker)

// 		speedTests[1][learnerIndex] = (new Date())
// 			.getTime()

// 		speedTests[2][learnerIndex] = req.query.mtSpeed
// 		speedTests[3][learnerIndex] = req.query.wSpeed
// 		speedTests[4][learnerIndex] = req.query.faster

// 	}

// 	res.json({
// 		message: 'nincs'
// 	})

// 	//captainPop()

// })



// function clearDisconnectedPlayers() {
// 	for (var i = players.length - 1; i >= 0; i--) {

// 		if (players[1][i] + playerDisconnectConst < (new Date())
// 			.getTime()) {
// 			players[1].splice(i, 1)
// 			players[0].splice(i, 1)
// 			lobbyPollNum++

// 		}

// 	}
// 	//clearInactiveGames()
// }

// function clearOldSpeedTests() {
// 	for (var i = speedTests.length - 1; i >= 0; i--) {

// 		if (speedTests[1][i] + oldSpeedTestConst < (new Date())
// 			.getTime()) {
// 			speedTests[1].splice(i, 1)
// 			speedTests[0].splice(i, 1)
// 			speedTests[2].splice(i, 1)
// 			speedTests[3].splice(i, 1)
// 			speedTests[4].splice(i, 1)

// 		}

// 	}

// }

// // function clearDisconnectedLearners() {
// 	for (var i = learners.length - 1; i >= 0; i--) {

// 		if (learners[1][i] + learnerDisconnectConst < (new Date())
// 			.getTime()) {
// 			learners[1].splice(i, 1)
// 			learners[0].splice(i, 1)
// 			learners[2].splice(i, 1)
// 			learners[3].splice(i, 1)
// 			learners[4].splice(i, 1)
// 			learners[5].splice(i, 1)
// 			learners[6].splice(i, 1)
// 			learners[7].splice(i, 1)

// 			//lobbyPollNum++

// 		}

// 	}
// 	//clearInactiveGames()
// }



// function clearPending(id) {
// 	//for (var i = 0; i < pendingThinkerPolls.length; i++) {
// 	//if (pendingThinkerPolls[i][0].query.id == id) {
// 	//client sent repeated poll, remove pending one
// 	//pendingThinkerPolls.splice(i, 1)
// 	// sendTask(new Task('dontCall', {
// 	// 	meantToSendTo: id
// 	// }, 'dontCall'), id)
// 	////console.log('clearpending called')
// 		//}
// 		//}
// 		//return false
// }


// app.get('/getModTypes', function(req, res) {
// 	//////////// ////////    ////console.log(req)
// 	mongodb.connect(cn, function(err, db) {
// 		db.collection("tables")
// 			.findOne({
// 				_id: "xData"
// 			}, function(err2, xData) {

// 				res.json(xData.modTypes);

// 				db.close()
// 			});
// 	});

// 	lobbyPollNum++

// 	// res.json({
// 	// 	//lobbychat: lobbyChat
// 	// });

// });

// // app.get('/getMyRecentGames', function(req, res) {
// // 	//////////// ////////    ////console.log(req)
// // 	mongodb.connect(cn, function(err, db) {
// // 		db.collection("users")
// // 			.findOne({
// // 				name: req.query.n
// 			}, function(err2, xData) {
// 				if (!(xData == null)) {

// 					res.json({
// 						recentgames: xData.games
// 					});
// 				}
// 				db.close()
// 			});
// 	});

// });
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
// // }
// var captainPollNum = 0
// var captainPolls = []
// // app.get('/captainPoll', function(req, res) {

// 	if (req.query.pn != captainPollNum) {

// 		clearDisconnectedLearners()

// 		captainPollNum++
// 		////captainPop()

// 		var texttosnd = []

// 		for (var i = 0; i < learners[0].length; i++) {
// 			texttosnd[i] = [learners[0][i], learners[2][i], learners[4][i], learners[6][i], learners[5][i], learners[7][i]]
// 		}
// 		var waitingThinkers = []
// 		pendingThinkerPolls.forEach(function(task) {
// 			waitingThinkers.push(task[0].query.id) //the req from /longpolltask
// 		})

// 		res.json({

// 			"learners": texttosnd,
// 			// "thinkers":waitingThinkers,
// 			"knownThinkers": knownThinkers,

// 			"captainPollNum": captainPollNum,

// 			"taskQ": taskQ.length,

// 			//"stats": stats,

// 			"speedTests": speedTests

// 		})

// 	} else {

// 		captainPolls.push(res)

// 	}
// 	//var aa=[]

// })




// app.get('/startGame', function(req, res) {

// 		startGame(req.query.w,req.query.b)

// 		res.json({
// 			"message": "ok"
// 			// "_id": firstFreeTable,
// 			// "modType": modType
// 		});

// });

// app.post('/mod', function(req, res) {

// 	mongodb.connect(cn, function(err, db) {
// 		db.collection("tables")
// 			.findOne({
// 				_id: "xData"
// 			}, function(err2, xData) {
// 				//var firstFreeTable=-5
// 				if (xData == null) {

// 					createXData();

// 					// firstFreeTable = 1
// 				} //else {
// 				//firstFreeTable = xData.firstFreeTable
// 				xData.modTypes = req.body
// 					//	xData.firstFreeTable++
// 					//}
// 				db.collection("tables")
// 					.save(xData, function(err, doc) {
// 						db.close()
// 						res.json({
// 							message: 'ok'
// 						})
// 					});

// 			})
// 	})
// })



// app.get('/busyThinkersPoll', function(req, res) {

// 	//    ////console.log('longpoll tNum received: ',req.query.t)

// 	var index = getBusyTableIndex(Number(req.query.t))

// 	if (req.query.p == busyTables.pollNums[index]) {
// 		//no changes, let's store the res
// 		busyTables.pendingPolls[index].push(res)

// 		// //    ////console.log('pushed',index)
// 		// //    ////console.log('pendingpolls',busyTables.pendingPolls)

// 	} else {
// 		//state changed, let's reply

// 		res.json({

// 			busyThinkers: busyTables.splitMoves[index],
// 			pollNum: busyTables.pollNums[index]

// 		})

// 	}

// });

//////////////////////////			user register

// app.get('/newUser', function(req, res) {
// 	//var initedTable =

// 	var user = new Dbuser(req.query.n, req.query.p)
// 	mongodb.connect(cn, function(err, db) {
// 		db.collection("users")
// 			.insert(user, function(err, doc) {});
// 		db.close()

// 	});
// 	res.json({});
// });

// app.get('/checkUser', function(req, res) {
// 	//var initedTable =

// 	var retJsn = {}

// 	//var user=new Dbuser(req.query.n, req.query.p)
// 	mongodb.connect(cn, function(err, db) {
// 		//db.collection("users")

// 		db.collection("users")
// 			.findOne({
// 				name: req.query.n
// 			}, function(err, thing) {
// 				if (thing == null) {
// 					retJsn = {
// 						'exists': false
// 					}
// 				} else {
// 					retJsn = {
// 						'exists': true
// 					}
// 				}
// 				db.close()
// 				res.json(retJsn)
// 			})

// 	});

// });

// app.get('/checkUserPwd', function(req, res) {
// 	//var initedTable =

// 	var retJsn = {}

// 	//var user=new Dbuser(req.query.n, req.query.p)
// 	mongodb.connect(cn, function(err, db) {
// 		//db.collection("users")

// 		db.collection("users")
// 			.findOne({
// 				name: req.query.n
// 			}, function(err, thing) {
// 				if (thing == null) {
// 					retJsn = {
// 						'exists': false,
// 						'denied': true
// 					}

// 				} else {
// 					//record exists, let's check pwd
// 					if (thing.pwd == req.query.p) {
// 						//password match, log him in
// 						//alert('match')
// 						retJsn = {
// 							'exists': true,
// 							'denied': false
// 						}

// 					} else {
// 						//wrong pwd
// 						//alert("Username and password don't match, try again!")
// 						retJsn = {
// 							'exists': true,
// 							'denied': true
// 						}
// 					}
// 				}
// 				db.close()
// 				res.json(retJsn)
// 			})

// 	});

// });

// /////////////////////////

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

// app.get('/longPollTable', function(req, res) {

// 	mongodb.connect(cn, function(err, db) {
// 		db.collection("tables")
// 			.findOne({
// 				_id: Number(req.query.t)
// 			}, function(err2, tableInDb) {
// 				if (!(tableInDb == null)) {

// 					//long
// 					var passPollNum = tableInDb.pollNum

// 					if (passPollNum > req.query.pn) {

// 						db.close()

// 						tableInDb.command = 'sync'
// 						tableInDb.message = 'sync t' + req.query.t + ', poll' + passPollNum

// 						res.json(tableInDb);

// 					} else {
// 						//nincs mit kuldeni
// 						if (pendingLongPolls[req.query.t] == undefined) pendingLongPolls[req.query.t] = []

// 						pendingLongPolls[req.query.t].push(res) //hold that request for that table 
// 						db.close()
// 					}

// 				} else {
// 					//nincs meg a tabla
// 					db.close()

// 				}

// 			});

// 	});

// });
// app.get('/forceStop', function(req, res) {
// 	//////////// ////////    ////console.log(req)
// 	res.send('sg')
// 	mongodb.connect(cn, function(err, db) {
// 		db.collection("tables")
// 			.findOne({
// 				_id: Number(req.query.t)
// 			}, function(err2, stopThisTable) {

// 				if (stopThisTable != null) {

// 					stopThisTable.gameIsOn = false
// 					evalGame(stopThisTable)

// 					db.collection("tables")
// 						.save(stopThisTable, function(err3, res) {

// 						})
// 				} else {

// 				}

// 				db.close()
// 			});
// 	});

// });
// app.get('/forcePopTable', function(req, res) {

// 	mongodb.connect(cn, function(err, db) {
// 		db.collection("tables")
// 			.findOne({
// 				_id: Number(req.query.t)
// 			}, function(err2, tableInDb) {

// 				if (!(tableInDb == null)) {

// 					popThem(Number(req.query.t), tableInDb, 'forcepop', 'Forcepop, ' + req.query.p + ': ' + req.query.m)

// 				}
// 				db.close()
// 			});

// 	});

// 	res.json({
// 		ok: 1
// 	})
// });


// var busyTablesPop = function(tIndex) {

// 	busyTables.pollNums[tIndex]++

// 		while (busyTables.pendingPolls[tIndex].length > 0) {
// 			//    ////console.log('volt egy')
// 			var res = busyTables.pendingPolls[tIndex].pop()

// 			res.json({

// 				busyThinkers: busyTables.splitMoves[tIndex],
// 				pollNum: busyTables.pollNums[tIndex]

// 			})

// 		}

// }


// app.post('/myPartIsDone', function(req, res) {

// 	res.send('received.')

// });



// setInterval(function() {

// 	mongodb.connect(cn, function(err5, db2) {
// 		var laterThan = new Date()
// 			.getTime() - gameInactiveConst

// 		if (!(db2 == null)) {
// 			db2.collection("tables")
// 				.find({
// 					"moved": {
// 						"$gte": laterThan
// 					}
// 				}, {
// 					"_id": true,
// 					"wName": true,
// 					"bName": true
// 				})
// 				.toArray(function(err25, actGames) {

// 					actGames.sort(function(a, b) {
// 						if (a._id > b._id) {
// 							return -1
// 						} else {
// 							return 1
// 						}
// 						//no duplicates
// 					})

// 					db2.collection("tables")
// 						.findOne({
// 							"_id": "xData"
// 						}, function(err24, xData) {

// 							xData.activeTables = actGames

// 							db2.collection("tables")
// 								.save(xData, function(err3, res) {
// 									db2.close()
// 								})
// 								//////////// ////////    ////console.log('Games checked.')

// 						});

// 				});
// 		}

// 	});

// 	////innentol jon az eval by clients

// 	//evalToClient()

// }, checkGamesConst);

// function ping(msecs) {
// 	for (var i = pendingThinkerPolls.length - 1; i > -1; i--) {
// 		if (pendingThinkerPolls[i][2] < new Date()
// 			.getTime() - msecs) {
// 			//polled more tham MSECS time ago, let's pop it
// 			sendTask(new Task('echoTest', 0, 'echoTest'), pendingThinkerPolls[i][0].query.id)

// 		}
// 	}

// }

// setInterval(function() {
// 	ping(10000)
// }, 1000)

// setInterval( function(){	
// 	evalToClient()
// },evalGameConst)

// var evalToClient = function() {

// 	mongodb.connect(cn, function(err7, db4) {
// 		db4.collection('tables')
// 			.findOne({

// 				toBeChecked: false

// 			}, function(errx, gameToEval) {
// 				//send gameToEval to fastest available client
// 				//var arguments=[]

// 				var task = {}
// 				if (gameToEval != null) {

// 					gameToEval.toBeChecked = true

// 					db4.collection('tables')
// 						.save(gameToEval, function() {})
// 						// task={
// 						// 	message:'evalGame, t'+gameToEval._id,
// 						// 	command:'evalGame',
// 						// 	data:gameToEval

// 					// }
// 					task = new Task('resetGame', gameToEval, 'resetGame, t' + gameToEval._id)

// 					//task=new Task('evalGame',gameToEval,'evalGame, t'+gameToEval._id)
// 					sendTask(task)
// 				} else {

// 					// task=new Task('',0,'nothing to eval')

// 					// sendTask(task)
// 				}
// 				db4.close()

// 			})
// 	})

// }

// var popThem = function(tNum, tableInDb, commandToSend, messageToSend) {

// 	if (!(pendingLongPolls[tNum] == undefined)) {

// 		if (pendingLongPolls[tNum].length > 0) {
// 			//van mire valaszolni

// 			while (pendingLongPolls[tNum].length > 0) {

// 				var resp = pendingLongPolls[tNum].pop()

// 				resp.json(
// 					tableInDb

// 				);

// 			}

// 		}
// 	}
// }



















