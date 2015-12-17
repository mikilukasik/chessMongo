var socketFuncs = {
	getLobby: function(connection, data) {

		clearDisconnectedPlayers() //nemide!!!!!!!!!!!!

		if (players[0].indexOf(data.p) == -1) {
			players[0].push(data.p)
			players[1].push((new Date())
				.getTime())

			lobbyPollNum++

		} else {
			players[1][players[0].indexOf(data.p)] = (new Date())
				.getTime()
		}

		var playerIndex = players[0].indexOf(data.p)
		if (players[2][playerIndex]) {
			//var askToOpen=true;
			lobbyPollNum++
			var openTableNum = players[4][playerIndex]
			var openTableColor = players[3][playerIndex]
			var opponentsName = players[5][playerIndex]

			players[2][playerIndex] = false

			socketSend(connection, 'lobbyState', {
				players: players[0],
				games: [], //[activeGames],
				lobbypollnum: lobbyPollNum,
				lobbychat: [], //lobbyChat,
				asktoopen: true,
				opentablenum: openTableNum,
				opentablecolor: openTableColor,
				opponentsname: opponentsName
			}, 'lobbyState', function() {});

		} else {

			mongodb.connect(cn, function(err, db) {
				if (!(db == null)) {
					db.collection("tables")
						.findOne({
							_id: "xData"
						}, function(err2, xData) {
							if (xData == null) {

								createXData()

								var resLChat = []
								var resAGames = []

							} else {

								var resLChat = xData.lobbyChat
								var resAGames = xData.activeTables
							}
							db.close()

							socketSend(connection, 'lobbyState', {
								players: players[0],
								games: resAGames,
								lobbypollnum: lobbyPollNum,
								lobbychat: resLChat,
								asktoopen: false
							}, 'lobbyState', function() {});

						});
				}
			});

		}

	},
	thinkerMessage: function(connection,data) {

		//res.send('something')

		var thinker = knownThinkers[doIKnow(data.thinker)]

		switch (data.command) {

			case 'log':

				postThinkerMessage(thinker, data.message)

				break;

			case 'progress':

				updateSplitMoveProgress(data.data._id, data.thinker, data.data.progress)

				break;

		}

	},
	longPollTasks: function(connection, data) {

		var pollerIndex = doIKnow(data.id)

		if (-1 == pollerIndex) {

			knownThinkers.push({
				id: data.id,
				lastSeen: new Date()
					.getTime(),
				busy: false,
				polling: true,
				spd: ~~(data.spd * 100) / 100
			})

		} else {

			var oldSpeed = knownThinkers[pollerIndex].spd
			var newSpeed = ~~(data.spd * 100000) / 100000

			knownThinkers[pollerIndex].lastSeen = new Date()
				.getTime()
			knownThinkers[pollerIndex].busy = false
			knownThinkers[pollerIndex].polling = true
			knownThinkers[pollerIndex].spd = newSpeed

			if (knownThinkers[pollerIndex].stn != data.stn) { //new speedtest data, check pct

				knownThinkers[pollerIndex].pct = ~~(newSpeed / oldSpeed * 1000) / 10

				knownThinkers[pollerIndex].stn = data.stn

			}

		}

		console.log('will check if pending for data.id', data.id)

		if (checkIfPending(data.id)) {

			//sendTask(new Task('ping',0,'normal ping'),data.id)

			console.log('found longpoll, will call clearpending for', data.id)

			clearPending(data.id)

		}

		knownThinkers[pollerIndex].lastSeen = new Date()
			.getTime()
		knownThinkers[pollerIndex].busy = false
		var tempReq = {
			query: data
		}
		pendingThinkerPolls.push([tempReq, connection, new Date() ///!!!!!!!!!!!!!!!!!!!!
			.getTime()
		])

		console.log('lpt pushed.')

		var taskForMe = []

		if (false) {

		} else {

			if (gotTask(taskForMe, data.id)) { //ez beleirja a taskformebe

				//////// ////////    console.log('for me: '+taskForMe)
				sendTask(taskForMe[0][0][0], taskForMe[0][0][1]) //why? !!!!!!!

			} else {

			}

		}

		captainPop()

	},
	Hello: function(connection,data){
		socketSend(connection, 'reHello', {}, 'reHello', function() {})
	},
	startGame: function(connection,data) {

		var w=data.w
		var b=data.b
		

		var modType = ""

		var wPNum = players[0].indexOf(w)
		var bPNum = players[0].indexOf(b)

		mongodb.connect(cn, function(err, db) {
			db.collection("tables")
				.findOne({
					_id: "xData"
				}, function(err2, xData) {
					var firstFreeTable = -5
					if (xData == null) {

						createXData();

						firstFreeTable = 1
					} else {
						firstFreeTable = xData.firstFreeTable
						modType = xData.modType
						xData.firstFreeTable++
					}
					db.collection("tables")
						.save(xData, function(err, doc) {
							db.close()
						});

					var initedTable = new Dbtable(firstFreeTable, w, b)

					mongodb.connect(cn, function(err, db2) {
						db2.collection("users")
							.findOne({
								name: w
							}, function(err2, userInDb) {
								if (!(userInDb == null)) {
									userInDb.games.unshift(initedTable._id)

									db2.collection("users")
										.save(userInDb, function(err3, res) {})

								}
								db2.close()
									// res.json({

								// });
							});

					});

					mongodb.connect(cn, function(err, db3) {
						db3.collection("users")
							.findOne({
								name: b
							}, function(err2, userInDb) {
								if (!(userInDb == null)) {
									userInDb.games.unshift(initedTable._id)

									db3.collection("users")
										.save(userInDb, function(err3, res) {})
								}
								db3.close()

							});

					});

					mongodb.connect(cn, function(err, db4) {
						db4.collection("tables")
							.insert(initedTable, function(err, doc) {});
						db4.close()
					})

					players[2][wPNum] = true; //ask wplayer to start game
					players[2][bPNum] = true; //ask bplayer to start game

					players[3][wPNum] = true; //will play w
					players[3][bPNum] = false; //will play b

					players[4][wPNum] = firstFreeTable
					players[4][bPNum] = firstFreeTable

					players[5][wPNum] = b; //give them the opponents name
					players[5][bPNum] = w;

				});
		});

	},

	moved: function(connection,onTable) {

		//var onTable = received.data// req.body

		onTable.moved = new Date()
			.getTime()

		var command = onTable.command

		onTable.command = ''

		mongodb.connect(cn, function(err, db) {
			db.collection("tables")
				.save(onTable, function(err3, res) {
					//table moved and saved, let's check what to do
					db.close()
					popThem(onTable._id, onTable, 'updated', 'table updated.') //respond to pending longpolls

					switch (command) {

						case 'makeAiMove':

							//////    console.log('calling makeaimove..')
							makeAiMove(onTable)

							break;

					}

				})

		});

	},
	//var 
	myPartIsDone: function(connection,data) {

		var index = getTaskIndex(data[0]._id)

		data.forEach(function(move) {

			splitTaskQ[index].returnedMoves.push(move)
			splitTaskQ[index].pendingSolvedMoves--

		})

		markSplitMoveDone(data[0]._id, data[0].thinker)

		if (splitTaskQ[index].pendingSolvedMoves == 0) {

			////////////////////////////////////////////////////////////all moves solved, check best and make a move

			splitTaskQ[index].returnedMoves.sort(
				moveSorter
			)

			moveInTable(splitTaskQ[index].returnedMoves[0].move, splitTaskQ[index])

			splitTaskQ[index].chat = [~~((new Date() - splitTaskQ[index].splitMoveStarted) / 10) / 100 + 'sec'] //1st line in chat is timeItTook

			splitTaskQ[index].returnedMoves.forEach(function(returnedMove) {
				splitTaskQ[index].chat = splitTaskQ[index].chat.concat({
					//move: returnedMove.moveStr,
					score: returnedMove.score,
					hex: returnedMove.score.toString(16),
					moves: returnedMove.moveTree

				})

			})

			mongodb.connect(cn, function(err, db) {
				db.collection("tables")
					.save(splitTaskQ[index], function(err3, res) {
						popThem(splitTaskQ[index]._id, splitTaskQ[index], 'splitMove', 'splitMove')

						db.close()

						splitTaskQ.splice(index, 1)

					})
			})
		}

	}

	,
	end: 1
}