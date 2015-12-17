var toConnection = function(connection, command, data, message, cb ,err) {
	
	console.log('connection writable:',connection.socket.writable)
	
	if(connection.socket.writable) {
		
		
			connection.sendUTF(JSON.stringify({
				command: command,
				data: data,
				message: message
			}))
			
			cb()
		
		
		
		
	}else{
		
		if(err)err()
		
	}
	

}

var View=function(viewName){
	this.viewName=viewName;
	this.subViews=[]
	// this.connections=[]
}



var SubView=function(subViewName){
	this.subViewName=subViewName;
	this.viewParts=[]
}
var ViewPart=function(viewPartName){
	this.viewPartName=viewPartName;
	this.connections=[]
}

var findViewIndex=function(viewName){
	var len=knownClients.views.length
	for (var i=len-1;i>=0;i--){
		if(knownClients.views[i].viewName==viewName) return i
	}
	knownClients.views.push(new View(viewName))
	return len
}

var findSubViewIndex=function(viewIndex,subViewName){
	var len=knownClients.views[viewIndex].subViews.length
	for (var i=len-1;i>=0;i--){
		if(knownClients.views[viewIndex].subViews[i].subViewName==subViewName) return i
	}
	knownClients.views[viewIndex].subViews.push(new SubView(subViewName))
	return len
}

var findViewPartIndex=function(viewIndex,subViewIndex,viewPartName){
	var len=knownClients.views[viewIndex].subViews[subViewIndex].viewParts.length
	for (var i=len-1;i>=0;i--){
		if(knownClients.views[viewIndex].subViews[subViewIndex].viewParts[i].viewPartName==viewPartName) return i
	}
	knownClients.views[viewIndex].subViews[subViewIndex].viewParts.push(new ViewPart(viewPartName))
	return len
}

var addViewer=function(viewName, subViewName, viewParts, connection){
	
	var viewIndex= findViewIndex(viewName)
	
	var subViewIndex= findSubViewIndex(viewIndex,subViewName)
	
	for(var i=viewParts.length-1;i>=0;i--){
		
		var viewPart= viewParts[i]
		
		var viewPartIndex=	findViewPartIndex(viewIndex,subViewIndex,viewPart)
	
		knownClients.views[viewIndex].subViews[subViewIndex].viewParts[viewPartIndex].connections.push(connection)
		
	}
	
}

var removeViewer=function(viewName, subViewName, viewParts, connection){
	
	
	
	
	var viewIndex= findViewIndex(viewName)
	
	var subViewIndex= findSubViewIndex(viewIndex,subViewName)
	
	for(var i=viewParts.length-1;i>=0;i--){
		
		var viewPart= viewParts[i]
		
		var viewPartIndex=	findViewPartIndex(viewIndex,subViewIndex,viewPart)
		
		
	
		var connections= knownClients.views[viewIndex].subViews[subViewIndex].viewParts[viewPartIndex].connections
		
		for(var j=connections.length-1;j>=0;j--){
			
			if(connections[j].connectionID==connection.connectionID){
				connections.splice(j,1)
			}
			
		}
		
		if(connections.length==0){
			
			knownClients.views[viewIndex].subViews[subViewIndex].viewParts.splice(viewPartIndex,1)
			
		}
		
		
		
	}
	
	if(knownClients.views[viewIndex].subViews[subViewIndex].viewParts.length==0){
		
			knownClients.views[viewIndex].subViews.splice(subViewIndex,1)
		
	}
	
	if(knownClients.views[viewIndex].subViews.length==0){
		
			knownClients.views.splice(viewIndex,1)
		
	}
	
	
	
}

var knownClients={
	connectedSockets:[],
	
	views:[]
	
	
	
}



var ConnectedSocket=function(id,connection){
	this.id=id;
	this.loginName=''
	this.thinkerName=''
	
	this.connection=connection;
	this.view=undefined
}

var connectionIndex=function(id,connection){
	
	var csLen=knownClients.connectedSockets.length
	
	for (var i=csLen-1;i>=0;i--){
		
		if(knownClients.connectedSockets[i].id==id){
			return i
		}
		
	}
	
	//not found, did not return
		
	knownClients.connectedSockets.push(new ConnectedSocket(id,connection))
	return csLen
	
}



var viewPop = function(viewName,subViewName,viewPart,data) {
	console.log('viewPop called',viewName,viewPart)
	var viewIndex= findViewIndex(viewName)
	
	var subViewIndex= findSubViewIndex(viewIndex,subViewName)
	
	var viewPartIndex= findViewPartIndex(viewIndex,subViewIndex,viewPart)
	
	
	for (var i=knownClients.views[viewIndex].subViews[subViewIndex].viewParts[viewPartIndex].connections.length-1;i>=0;i--){
		
		var connection=knownClients.views[viewIndex].subViews[subViewIndex].viewParts[viewPartIndex].connections[i]
		
		toConnection(connection,'updateView',{
			
			viewName:viewName,
			subViewName:subViewName,
			viewPart: viewPart,
			data: data
			

		},'updateView',function(){},function(){
			//connection is not writeable, splice
			
			knownClients.views[viewIndex].subViews[subViewIndex].viewParts[viewPartIndex].connections.splice(i,1)
			
			
			
			
		})
		
	}
	
	
	
	
		

	
}

function noCircular(input){
	
	//http://stackoverflow.com/questions/11616630/json-stringify-avoid-typeerror-converting-circular-structure-to-json
		
	var cache = [];
	var result = JSON.stringify(input, function(key, value) {
		if (typeof value === 'object' && value !== null) {
			if (cache.indexOf(value) !== -1) {
				// Circular reference found, discard key
				return;
			}
			// Store value in our collection
			cache.push(value);
		}
		return value;
	});
	cache = null; // Enable garbage collection
		
	return result
	
}

var simpleKnownClients=function(){
	
	var result=[]
	
	knownClients.views.forEach(function(view){
		
		var tempSubViews=[]
		
		view.subViews.forEach(function(subView){
			
			var tempViewParts=[]
			
			subView.viewParts.forEach(function(viewPart){
				
				tempViewParts.push({
					viewPartName:viewPart.viewPartName,
					viewers:viewPart.connections.length
				})
				
				
			})
				
			tempSubViews.push({
				subViewName:subView.subViewName,
				viewParts:tempViewParts
			
			})
			
			
			
		})
		
		
		
		//var tempResult=
		
		result.push({
				viewName:view.viewName,
				subViews:tempSubViews
			
			})
		
	})
	
	return result
	
	
}


var onMessageFuncs = {
	quickGame: function(connection, data){
		var w = data.w
		var b = data.b

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
							
							toConnection(connection,'openGame',{
								_id:firstFreeTable,
								wPlayer:true
								
							},'openGame',function(){})

							
							
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
							.insert(initedTable, function(err, doc) {
								
								
								
								
								
								
								
								
							});
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
		
		
		/////////////below quickgame specific
		
	
	},

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

			toConnection(connection, 'lobbyState', {
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

							toConnection(connection, 'lobbyState', {
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
	thinkerMessage: function(connection, data) {

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

		//captainPop()

	},
	Hello: function(connection, data, connectionID) {
		
		// viewPop('captain.html','knownClients',knownClients)
		//var newConnectionIndex=connectionIndex(connectionID,connection)
		
		toConnection(connection, 'reHello', {
			connectionID: connectionID
			
		}, 'reHello', function() {})
	},
	
	showView:function(connection, data, id){
		
		connection.connectionID=id
		
		addViewer(data.newViewName,data.newSubViewName,data.newViewParts,connection)
		
		removeViewer(data.oldViewName,data.oldSubViewName,data.oldViewParts,connection)
		
		var sendThis=simpleKnownClients(knownClients)
		
		viewPop('captain.html','default','knownClients',sendThis)//nownClients.views.length)
		
	
	},
	
	
	startGame: function(connection, data) {
		
		// viewPop('captain.html','knownClients',knownClients.views.length)			//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		//console.log('viewpop works.............................................')



		var w = data.w
		var b = data.b

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

	moved: function(connection, onTable) {

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
	myPartIsDone: function(connection, data) {

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

	// ,
	// end: 1
}