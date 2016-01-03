var findUsersGameIndex=function(gameNo,games){
	
	for(var i=games.length-1;i>=0;i--){
		if(games[i].gameNo==gameNo)return i
	}
	return -1
}

var userFuncs={
	
	removeDisplayedGame:function(connection,data){
		//console.log('remove game from name:',connection.addedData.loggedInAs)
			mongodb.connect(cn, function(err, db2) {
				db2.collection("users")
					.findOne({
						name: connection.addedData.loggedInAs
					}, function(err2, userInDb) {
						if (!(userInDb == null)) {
							
							var index=findUsersGameIndex(data,userInDb.games)
							userInDb.games.splice(index,1)
							//unshift(initedTable._id)

							db2.collection("users")
								.save(userInDb, function(err3, res) {
									
									
									
									clients.publishDisplayedGames(connection.addedData.loggedInAs,connection)
									
									
								})

						}
						db2.close()
							// res.json({

						// });
					});

			});
		
	},
	
	logoff:function(connection,data){
		
		var name=data.name
		
		clients.update(connection,'loggedInAs',undefined)
		clients.update(connection,'stayLoggedIn',undefined)
		clients.publishAddedData()
		
		clients.logoff(name)
		
		clients.publishDisplayedGames(undefined,connection)
							

			
	},

	loginUser:function(name,pwd, stayLoggedIn, connection, noPwd){
		
		mongodb.connect(cn, function(err, db) {
			//db.collection("users")
	
			db.collection("users")
				.findOne({
					name: name
				}, function(err, thing) {
					if (thing == null) {
						clients.send(connection,'userNotRegistered',{name:name})
					} else {
						//user exists, check pwd 
				
						if (thing.pwd == pwd || noPwd) {
							//password match, log him in
							
							clients.send(connection,'login',{name:name})
							//console.log('user logging in: ',name)
							clients.update(connection,'loggedInAs',name)
							clients.update(connection,'stayLoggedIn',stayLoggedIn)
							clients.publishAddedData()
							clients.publishDisplayedGames(name,connection)
							
							clients.login(connection,name)
	
						} else {
							//wrong pwd
							
							
							clients.send(connection,'wrongPwd',{name:name})
							
						}
					
						
					}
					db.close()
					//res.json(retJsn)
				})
	
		});
		
		
	},
	
	end:0

}
	

var startGame=function(w,b,connection,aiGame){
	
		
	
		//var modType = ""

		// var wPNum = players[0].indexOf(w)
		// var bPNum = players[0].indexOf(b)
		
		var wConnection=clients.getConnectionByName(w)
		var bConnection=clients.getConnectionByName(b)
		

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
							
							var initedTable = new Dbtable(firstFreeTable, w, b)
							
							
							 //console.log(w,b,'----------------------  ----------------------  ----------------------  ')
					
					// //console.log(initedTable)
					
					// //console.log('----------------------  ----------------------  ----------------------  ')
					
					
					
					initedTable._id=firstFreeTable
					
					
					
					
					db.collection("users")
							.findOne({
								name: w
							}, function(err2, userInDb) {
								
								
							
					
								
								
						//		if (!(userInDb == null)) {
									userInDb&&userInDb.games.unshift({
										wPlayer:true,
										gameNo:initedTable._id,
										opponentsName:b
									})
										
									userInDb&&db.collection("users")
										.save(userInDb, function(err3, res) {
											
											clients.publishDisplayedGames(w,wConnection)
											
											
										
											
											
														
											
										})
										
										
										
												
											db.collection("users")
							.findOne({
								name: b
							}, function(err2, userInDb2) {
								
								
							//	if (!(userInDb == null)) {
									////console.log('----------------------  ----------------------  ----------------------  ')
					
									userInDb2&&userInDb2.games.unshift({
										wPlayer:false,
										gameNo:initedTable._id,
										opponentsName:w
									})

									userInDb2&&db.collection("users")
										.save(userInDb2, function(err3, res) {
											
											clients.publishDisplayedGames(b,bConnection)
											
											
											
								
										})
										
										
										
												db.collection("tables")
													.insert(initedTable, function(err, doc) {
								
								
													 //console.log(w,b,'----------------------  ----------------------  ----------------------  ')
					
													if(w&&w!='Computer'){
														
														if(w=='someone'){
															
															wConnection=connection
															
														}
														
														clients.send(wConnection,'openGame',{
														_id:firstFreeTable,
														wPlayer:true,
																opponentsName:b
														
													},'openGamemmmmmmmmmmmmmmmmmmmmmmmmmmmmm',function(){})
													
													
													if(b&&b!='Computer'){
															clients.send(bConnection,'openGame',{
																_id:firstFreeTable,
																wPlayer:false,
																opponentsName:w
																
															},'openGamemmmmmmmmmmmmmmmmmmmmmmmmmmmmm',function(){})
														}
													
													
													
													
													}else{
														
														if(b&&b!='Computer'){
															clients.send(clients.getConnectionByName(b),'openGame',{
																_id:firstFreeTable,
																wPlayer:false,
																opponentsName:w
																
															},'openGamemmmmmmmmmmmmmmmmmmmmmmmmmmmmm',function(){})
														}else{
															//against multiple, not logged in
																clients.send(connection,'openGame',{
																	_id:firstFreeTable,
																	wPlayer:true,
																opponentsName:b
																	
																},'openGamemmmmmmmmmmmmmmmmmmmmmmmmmmmmm',function(){})
															
															
														}
														
													}
													
													
													
								
								
								
													clients.publishView('board.html',firstFreeTable,'dbTable.table',initedTable.table)
													
													clients.publishView('board.html',firstFreeTable,'dbTable.wNext',initedTable.wNext)
													
								
								
								
												
								
								
								
								
								
								
								
								
								
								
								
								
								
								
								
												});
											
													
							//	}
								//db3.close()

							});
											
											
										

						//		}
								//db2.close()
									// res.json({

								// });
							});
					
					
					
					
					
							
							
							
							
							
							
							// db.close()
							
							
							

							
							
						});

					
					
					//initedTable.table= addMovesToTable(initedTable.table,true)
					

					// mongodb.connect(cn, function(err, db2) {
						

					// });

					// mongodb.connect(cn, function(err, db3) {
						

					// });

					// mongodb.connect(cn, function(err, db4) {
					// 	//////console.log(initedTable._id	)
					
					// 	db4.close()
					// })

					// players[2][wPNum] = true; //ask wplayer to start game
					// players[2][bPNum] = true; //ask bplayer to start game

					// players[3][wPNum] = true; //will play w
					// players[3][bPNum] = false; //will play b

					// players[4][wPNum] = firstFreeTable
					// players[4][bPNum] = firstFreeTable

					// players[5][wPNum] = b; //give them the opponents name
					// players[5][bPNum] = w;

				});
		});
		
	
}


var onMessageFuncs = {
	
	
	challenge: function(connection,data){
		////console.log('challenge:>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',connection.addedData.loggedInAs)	
		
		//var challengedConnection=clients.getConnectionByName(data.opponentsName)
		
		data.challenger=connection.addedData.loggedInAs
		
		data.wPlayer=!data.wPlayer
		
		clients.sendByName(data.opponentsName,'challenged',data)
	
	},
	
	quickGame: function(connection, data){
		
		var w = data.w
		var b = data.b
		 //console.log(w,b,'----------------------  ----------------------  ----------------------  ')
					
		startGame(w,b,connection,true)		//true stands for aiGame
		
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

		//res.send('something')

		var thinker = knownThinkers[doIKnow(data.thinker)]

		switch (data.command) {

			case 'log':

				postThinkerMessage(thinker, data.message)

				break;

			case 'progress':

				updateSplitMoveProgress(data.data._id, data.thinker, data.data.progress)

				break;
				
				
			case 'saveVal':
			
				
				//connection.addedData.connectionID=connectionID
				//connection.speed=data.speed
				
				clients.update(connection,data.data.name,data.data.value)
				////console.log('hjkl;ez:',clients.addedData())
				clients.publishAddedData()//View('captain.html','default','clients',clients.addedData())
				
			
			
			
			
			break;

		}

	},
	saveVal:function(connection, data, connectionID){
		clients.update(connection,data.name,data.value)
		clients.publishAddedData()
			
	},
	
	registerUser: function(connection,data,id){
		
		registerUser(data.name,data.pwd,connection)
		
		
	},
	
	refreshAllBrowsers: function(connection,data,id){
		
		clients.sendToAll('refreshBrowser')
		
	},
	
	loginUser: function(connection,data,id){
		
		userFuncs.loginUser(data.name,data.pwd,data.stayLoggedIn,connection)
		
		
	},
	
	logoff: function(connection,data){
		
		userFuncs.logoff(connection,data)
		
	},
	
		
	removeDisplayedGame: function(connection,data){
		////console.log('removeGame',data)
		
		
		
		userFuncs.removeDisplayedGame(connection,data)
		
	},
	
	Hello: function(connection, data, connectionID) {
		
		// clients.publishView('captain.html','knownClients',knownClients)
		//var newConnectionIndex=connectionIndex(connectionID,connection)
		
		////console.log('cookieIdRnd received:',data.cookieIdRnd)
		
		clients.update(connection,'cookieIdRnd',data.cookieIdRnd)
		
		//var newClientMongoId
		
		if(data.clientMongoId==''){
			
			registerNewClient(data,connection)	//this will put it in db and ask client to return with new mongoID
			
			
			
		}else{
			//we must know this client already, look it up in DB!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			////console.log('known client came.......................................')
			
			knownClientReturned(data,connection)	//this will mark it online in the db
			
			clients.update(connection,'clientMongoId',data.clientMongoId)
			
			clients.publishAddedData()
			
			clients.send(connection, 'reHello', {
				connectionID: connectionID
				
			}, 'reHello', function() {})
			
		}
		
		
		
		
	},
	
	
	
	showView:function(connection, data, id){
		
		// connection.addedData={
		// 	connectionID:id
		// }
		
		clients.addViewer(data.newViewName,data.newSubViewName,data.newViewParts,connection)
		
		// if(data.oldViewName==data.newViewName&&data.newSubViewName==data.oldSubViewName){}else{
		// 	removeViewer(data.oldViewName,data.oldSubViewName,data.oldViewParts,connection)
		// }		///this should be inside the class!!!!!!!!!!!!!!!
		var sendThis=clients.simpleActiveViews()
		var sendThis2=clients.addedData()
		
		clients.publishView('captain.html','default','activeViews',sendThis)//nownClients.views.length)
		clients.publishView('captain.html','default','clients',sendThis2)//nownClients.views.length)
		
		
		switch(data.newViewName){//=='board.html'&&data.newSubViewName!='default'){
			//send the dbtable 
		//////console.log('...........................................................')
			
			case 'board.html':
			
			
			mongodb.connect(cn, function(err, db) {
				db.collection("tables")
					.findOne({
						_id: Number(data.newSubViewName)
					}, function(err2, tableInDb) {
						clients.send(connection,'updateDbTable',tableInDb,'updateDbTable',function(){},function(){})
						
						if(tableInDb.wName==connection.addedData.loggedInAs){
							
							clients.send(connection,'updateView',{
				
								viewName:'board.html',
								subViewName:tableInDb._id,
								viewPart: 'wPlayer',
								data: true
								
					
							},'updateView')
							
							//clients.publishView('board.html',tableInDb._id,'wPlayer',true)
						}else{
							clients.send(connection,'updateView',{
				
								viewName:'board.html',
								subViewName:tableInDb._id,
								viewPart: 'wPlayer',
								data: false
								
					
							},'updateView')
							
							////console.log('rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',tableInDb.wName,connection.addedData.loggedInAs)
							
							
						}
						
						db.close()
						
					});
		
			});
					
					break;
			
			case 'lobby.html':
				
				////console.log(clients.getOnlineUsers(),'miabaj<<<<<<<<<<<<<<')
				
				clients.send(connection,'updateView',{
				
				viewName:'lobby.html',
				subViewName:'default',
				viewPart: 'onlineUsers',
				data: clients.getOnlineUsers()
				
	
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

		mongodb.connect(cn, function(err, db) {
			db.collection("tables")
				.save(onTable, function(err3, res) {
					//table moved and saved, let's check what to do
					db.close()
					
					
					
						clients.publishView('board.html',onTable._id,'dbTable.table',onTable.table)
								
						clients.publishView('board.html',onTable._id,'dbTable.wNext',onTable.wNext)
							
					//popThem(onTable._id, onTable, 'updated', 'table updated.') //respond to pending longpolls

					switch (command) {

						case 'makeAiMove':

							//////    //////console.log('calling makeaimove..')
							makeAiMove(onTable)

							break;

					}

				})

		});

	},
	//var 
	myPartIsDone: function(connection, data) {
		
		connection=clients.fromStore(connection)
		
		connection.addedData.speed=connection.addedData.speed*100

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
			
			
			splitTaskQ[index].pendingMoveCount=undefined
			
			
			
			splitTaskQ[index].returnedMoves=undefined
			
			splitTaskQ[index].command=undefined
			
			splitTaskQ[index].aiType=undefined
			
			splitTaskQ[index].splitMoveStarted=undefined
			
			splitTaskQ[index].oppKingPos=undefined
			
			splitTaskQ[index].origProtect=undefined
			
			splitTaskQ[index].origData=undefined
			
			splitTaskQ[index].origDeepDatatt=undefined
			
			splitTaskQ[index].origDeepDatatf=undefined
			
			splitTaskQ[index].origDeepDataft=undefined
			
			splitTaskQ[index].origDeepDataff=undefined
			
			
			splitTaskQ[index].aiTable=undefined
			splitTaskQ[index].pendingSolvedMoves=undefined
			// splitTaskQ[index].
			// splitTaskQ[index].
			// splitTaskQ[index].
			// splitTaskQ[index].
			
			
				//console.log('here:---------------------------------')
			//console.log(splitTaskQ[index])
			//console.log('length',splitTaskQ[index].length)
			//console.log('thats all.---------------------------------')
			
			
			
			mongodb.connect(cn, function(err, db) {
				db.collection("tables")
					.save(splitTaskQ[index], function(err3, res) {
						
						////console.log('publishing-------------------------------->>> ',splitTaskQ[index]._id)
						//clients.publishView('board.html',splitTaskQ[index]._id,'dbTable.table',splitTaskQ[index].table)
						
						clients.publishView('board.html',splitTaskQ[index]._id,'dbTable.table',splitTaskQ[index].table)
								
						clients.publishView('board.html',splitTaskQ[index]._id,'dbTable.wNext',splitTaskQ[index].wNext)
							
						
						
						
						//popThem(splitTaskQ[index]._id, splitTaskQ[index], 'splitMove', 'splitMove')

						db.close()

						splitTaskQ.splice(index, 1)

					})
			})
		}

	}

	// ,
	// end: 1
}

