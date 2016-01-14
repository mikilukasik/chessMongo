var onMessageFuncs = {
	
	clientSpeedTest:function(connection,data){
		//console.log('clientSpeedTest',data)
		var fakeConnection={
			addedData:{
				connectionID:data.connectionID
			}
		}
		var sendToConnection=clients.fromStore(fakeConnection)
		
		clients.send(sendToConnection,'speedTest')
		
	},
	
    clearAdminLog: function(){
        adminLogStore=[]
        clients.publishView('admin.html','default','adminLog',adminLogStore)
    },
    
    startAdminLog: function(){
        adminLogging=true
    },
    stopAdminLog: function(){
        adminLogging=false
    },
    
	setLastUser:function(connection,data){
		
		//console.log('setLastUser',data)
		
		var fakeConnection={
			addedData:{
				connectionID:data.connectionID
			}
		}
		var sendToConnection=clients.fromStore(fakeConnection)
		
		sendToConnection.addedData.lastUser=data.setLastUserTo
		
		clients.publishAddedData()
		
		
		
		//clients.send(sendToConnection,'setLastUser',data.setLastUserTo)
		
	},
	
	refreshBrowser:function(connection,data){
		//console.log('clientSpeedTest',data)
		var fakeConnection={
			addedData:{
				connectionID:data.connectionID
			}
		}
		var sendToConnection=clients.fromStore(fakeConnection)
		
		clients.send(sendToConnection,'refreshBrowser')
		
	},

	challenge: function(connection, data) {
		////console.log('challenge:>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',connection.addedData.loggedInAs)	

		//var challengedConnection=clients.getConnectionByName(data.opponentsName)

		data.challenger = connection.addedData.loggedInAs

		data.wPlayer = !data.wPlayer

		clients.sendByName(data.opponentsName, 'challenged', data)

	},

	quickGame: function(connection, data) {

		var w = data.w
		var b = data.b
			//console.log(w,b,'----------------------  ----------------------  ----------------------  ')

		startGame(w, b, connection, true) //true stands for aiGame

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

			clients.send(connection, 'lobbyState', {
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

							clients.send(connection, 'lobbyState', {
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
    
	thinkerMessage: function(connection, data, connectionID) {

		

		var thinker = knownThinkers[doIKnow(data.thinker)]

		switch (data.command) {

			case 'log':

				postThinkerMessage(thinker, data.message)

				break;

			case 'progress':

				splitMoves.updateSplitMoveProgress(data.data._id, data.thinker, data.data, connection)

				break;
                
            case 'forceIdle':
            
                console.log('forceidle received from',connection.addedData.lastUser)
                splitMoves.forceIdle(connection)

			case 'saveVal':

				
				clients.storeVal(connection, data.data.name, data.data.value)
					
				clients.publishAddedData()

				break;

		}

	},
	saveVal: function(connection, data, connectionID) {
		clients.storeVal(connection, data.name, data.value)
		clients.publishAddedData()

	},

	registerUser: function(connection, data, id) {

		registerUser(data.name, data.pwd, connection)

	},

	refreshAllBrowsers: function(connection, data, id) {

		clients.sendToAll('refreshBrowser')

	},

	loginUser: function(connection, data, id) {

		userFuncs.loginUser(data.name, data.pwd, data.stayLoggedIn, connection)

	},

	logoff: function(connection, data) {

		userFuncs.logoff(connection, data)

	},

	removeDisplayedGame: function(connection, data) {
		
		userFuncs.removeDisplayedGame(connection, data)

	},

	Hello: function(connection, data, connectionID) {


		clients.storeVal(connection, 'cookieIdRnd', data.cookieIdRnd)

		if (data.clientMongoId == '') {

			registerNewClient(data, connection) //this will put it in db and ask client to return with new mongoID

		} else {
			//we must know this client already, look it up in DB!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			////console.log('known client came.......................................')

			dbFuncs.knownClientReturned(data, connection) //this will mark it online in the db

			clients.storeVal(connection, 'clientMongoId', data.clientMongoId)

			clients.publishAddedData()

			clients.send(connection, 'reHello', {
				connectionID: connectionID

			}, 'reHello', function() {})

		}

	},

	showView: function(connection, data, id) {

		// connection.addedData={
		// 	connectionID:id
		// }

		clients.addViewer(data.newViewName, data.newSubViewName, data.newViewParts, connection)

		// if(data.oldViewName==data.newViewName&&data.newSubViewName==data.oldSubViewName){}else{
		// 	removeViewer(data.oldViewName,data.oldSubViewName,data.oldViewParts,connection)
		// }		///this should be inside the class!!!!!!!!!!!!!!!
		var sendThis = clients.simpleActiveViews()
		var sendThis2 = clients.addedData()

		clients.publishView('admin.html', 'default', 'activeViews', sendThis) //nownClients.views.length)
		clients.publishView('admin.html', 'default', 'clients', sendThis2) //nownClients.views.length)

		switch (data.newViewName) { //=='board.html'&&data.newSubViewName!='default'){
			//send the dbtable 
			//////console.log('...........................................................')

			case 'board.html':

				mongodb.connect(cn, function(err, db) {
					db.collection("tables")
						.findOne({
							_id: Number(data.newSubViewName)
						}, function(err2, tableInDb) {
							clients.send(connection, 'updateDbTable', tableInDb, 'updateDbTable', function() {}, function() {})

							if (tableInDb.wName == connection.addedData.loggedInAs) {

								clients.send(connection, 'updateView', {

									viewName: 'board.html',
									subViewName: tableInDb._id,
									viewPart: 'wPlayer',
									data: true

								}, 'updateView')

								//clients.publishView('board.html',tableInDb._id,'wPlayer',true)
							} else {
								clients.send(connection, 'updateView', {

									viewName: 'board.html',
									subViewName: tableInDb._id,
									viewPart: 'wPlayer',
									data: false

								}, 'updateView')

								////console.log('rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',tableInDb.wName,connection.addedData.loggedInAs)

							}

							db.close()

						});

				});

				break;

			case 'lobby.html':

				////console.log(clients.getOnlineUsers(),'miabaj<<<<<<<<<<<<<<')

				clients.send(connection, 'updateView', {

					viewName: 'lobby.html',
					subViewName: 'default',
					viewPart: 'onlineUsers',
					data: clients.getOnlineUsers()

				})

			break;
            
            
            case 'admin.html':
                
                clients.send(connection,'updateView',{
                    viewName:'admin.html',
                    subViewName:'default',
                    viewPart: 'splitMoves',
                    data: splitMoves.getNakedQ()   
                })
                
                clients.send(connection,'updateView',{
                    viewName:'admin.html',
                    subViewName:'default',
                    viewPart: 'adminLog',
                    data: adminLogStore   
                })
                
            break;
				//clients.send(connection,'updateDbTable',)
				//	
		}

	},

	moved: function(connection, onTable) {

		//var onTable = received.data// req.body

		onTable.moved = new Date()
			.getTime()

		var command = onTable.command

		onTable.command = ''
        
        //onTable._id=new ObjectID(onTable._id)

		mongodb.connect(cn, function(err, db) {
			db.collection("tables")
            
            .findOne({
                _id:onTable._id
            },function(err2,dat){
                
                //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',dat._id)
                var tempID=dat._id
                dat=onTable
                dat.id=tempID
                
                db.collection("tables").save(dat, function(err3, res) {
					//table moved and saved, let's check what to do
					db.close()
                    
                    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',err3)
                

					clients.publishView('board.html', onTable._id, 'dbTable.table', onTable.table)

					clients.publishView('board.html', onTable._id, 'dbTable.wNext', onTable.wNext)

					//popThem(onTable._id, onTable, 'updated', 'table updated.') //respond to pending longpolls

					switch (command) {

						case 'makeAiMove':

							splitMoves.makeAiMove(onTable)

						break;

					}

				})
                
                
                
                
            })
            
            
            
				

		});

	},
	//var 
	myPartIsDone: function(connection, data) {

		connection = clients.fromStore(connection)

		connection.addedData.speed = connection.addedData.speed * 100

		var index = getTaskIndex(data[0]._id)

		data.forEach(function(move) {

			splitTaskQ[index].returnedMoves.push(move)
			splitTaskQ[index].pendingSolvedMoves--

		})

		splitMoves.markSplitMoveDone(data[0]._id, data[0].thinker)

		if (splitTaskQ[index].pendingSolvedMoves == 0) {

			////////////////////////////////////////////////////////////all moves solved, check best and make a move

			
            splitMoves.remove(splitTaskQ[index]._id)
            
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

			splitTaskQ[index].pendingMoveCount = undefined

			splitTaskQ[index].returnedMoves = undefined

			splitTaskQ[index].command = undefined

			splitTaskQ[index].aiType = undefined

			splitTaskQ[index].splitMoveStarted = undefined

			splitTaskQ[index].oppKingPos = undefined

			splitTaskQ[index].origProtect = undefined

			splitTaskQ[index].origData = undefined

			splitTaskQ[index].origDeepDatatt = undefined

			splitTaskQ[index].origDeepDatatf = undefined

			splitTaskQ[index].origDeepDataft = undefined

			splitTaskQ[index].origDeepDataff = undefined

			splitTaskQ[index].aiTable = undefined
			splitTaskQ[index].pendingSolvedMoves = undefined

			mongodb.connect(cn, function(err, db) {
				db.collection("tables")
					.save(splitTaskQ[index], function(err3, res) {

						////console.log('publishing-------------------------------->>> ',splitTaskQ[index]._id)
						//clients.publishView('board.html',splitTaskQ[index]._id,'dbTable.table',splitTaskQ[index].table)

						clients.publishView('board.html', splitTaskQ[index]._id, 'dbTable.table', splitTaskQ[index].table)

						clients.publishView('board.html', splitTaskQ[index]._id, 'dbTable.wNext', splitTaskQ[index].wNext)

						clients.publishView('board.html', splitTaskQ[index]._id, 'dbTable.chat', splitTaskQ[index].chat)

						clients.publishView('board.html', splitTaskQ[index]._id, 'dbTable.moves', splitTaskQ[index].moves)

						//popThem(splitTaskQ[index]._id, splitTaskQ[index], 'splitMove', 'splitMove')

						db.close()

						splitTaskQ.splice(index, 1)

					})
			})
		}

	}

}