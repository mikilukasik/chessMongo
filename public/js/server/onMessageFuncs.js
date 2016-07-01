

var registerUser = function(name, pwd, connection) {

        dbFuncs.findOne("users",{
                    name: name
                }, function(thing) {
                    if (thing == null) {

                        //register this user
                        var user = new Dbuser(name, pwd)


                        dbFuncs.insert("users",user, function(err, doc) {

                                clients.send(connection, 'userRegistered', {
                                    name: name
                                })

                            });

                    } else {
                        clients.send(connection, 'userExists', {
                            name: name
                        })
                    }
                    //db.close()

                })

        //});



    }



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
        clients.adminLogStore=[]
        clients.publishView('admin.html','default','adminLog',clients.adminLogStore)
    },
    
    startAdminLog: function(){
        clients.adminLogging=true
    },
    stopAdminLog: function(){
        clients.adminLogging=false
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
	
    addMod:function(connection,data){
        
        var index= serverGlobals.findInAllMods(data.addMod)
        
        if(index<0){
            
            console.log(index)
            
            serverGlobals.allMods.push({modType:data.addMod,min:0,max:100})
            clients.publishView('admin.html','default','allMods',serverGlobals.allMods)
            
        }
        
        
        
        if(data.connectionID=='default'){
            
            if(serverGlobals.defaultMod.indexOf(data.addMod)<0){
                
                 serverGlobals.defaultMod.push(data.addMod)
                
                clients.publishView('admin.html','default','defaultMod',serverGlobals.defaultMod)
                           
            }
            
           
        }else{
            
            var fakeConnection={
                addedData:{
                    connectionID:data.connectionID
                }
            }
            var sendToConnection=clients.fromStore(fakeConnection)

            if(sendToConnection.addedData.mod){
                
                if(sendToConnection.addedData.mod.indexOf(data.addMod)<0){
                    sendToConnection.addedData.mod.push(data.addMod)
                    clients.publishAddedData()
                }
                
                
            }else{
                sendToConnection.addedData.mod=[data.addMod]
                clients.publishAddedData()
            }

            

            
        }
        
       
      
        
    },
    
    removeFromAllMods:function(connection,data){
        serverGlobals.allMods.splice(data,1)
        clients.publishView('admin.html','default','allMods',serverGlobals.allMods)
        
    },
    
    setModValMin:function(connection,data){
      
      console.log('modvalmin',data.setModValMin)
      
      var index=data.setModValMin.index
      var min=Number(data.setModValMin.min)
      
      serverGlobals.allMods[index].min=min
      
      clients.publishView('admin.html','default','allMods',serverGlobals.allMods)
      
      
        
    },
    setModValMax:function(connection,data){
      
      console.log('modvalmax',data.setModValMax)
      
      var index=data.setModValMax.index
      var max=Number(data.setModValMax.max)
      
      serverGlobals.allMods[index].max=max
      
      clients.publishView('admin.html','default','allMods',serverGlobals.allMods)
      
      
        
    },
    
	reporting:function(connection,data){
	
		//clients.adminLog('reporting:',JSON.stringify(data) )
		
		serverGlobals.learning.setReporter(data)
		
		clients.publishView('admin.html','default','learningGames',serverGlobals.learningGames)
		
		
		
	},
	
	learnerReport:function(connection,data){
	
		
	
		if(serverGlobals.gameToReport==data._id){
			
			console.log('learner report received.')
			
			serverGlobals.learnerTable=data
			
			clients.publishView('admin.html','default','learnerTable',data)
			
			
			
		}else{
			console.log('learner report has wrong ID',serverGlobals.gameToReport,data._id)
		}
	
	
	
		
	},
    
    learnerSmallReport:function(connection,data){
	
	   serverGlobals.learnerSmallReport(data)
		
	},
    
    stopLearningGame:function(connection,data){
	
	   serverGlobals.stopLearningGame(data)
		
	},
    
    learnerResult:function(connection,data){
        
		serverGlobals.learnerResult(data)
		
	},
	
	learnerFinalResult:function(connection,data){
		
		serverGlobals.learnerFinalResult(data)
		
	},
	
    removeMod:function(connection,data){
        
        if(data.connectionID=='default'){
            
            serverGlobals.defaultMod.splice(data.removeModIndex,1)
            
            clients.publishView('admin.html','default','defaultMod',serverGlobals.defaultMod)
            
        }else{
            
            
            var fakeConnection={
                addedData:{
                    connectionID:data.connectionID
                }
            }
            var sendToConnection=clients.fromStore(fakeConnection)
            
            sendToConnection.addedData.mod.splice(data.removeModIndex,1)
            
            clients.publishAddedData()
      
        
        
        
        
            
        }
        
        
        
        
    },
    
    customModCheckbox:function(connection,data){
        
        
        var fakeConnection={
			addedData:{
				connectionID:data.connectionID
			}
		}
		var sendToConnection=clients.fromStore(fakeConnection)
		
            
            sendToConnection.addedData.customModCheckbox=data.customModCheckbox
        
		
        clients.publishAddedData()
      
        
        
        
        
    },
    
    
	learnerCount:function(connection,data){
		var fakeConnection={
			addedData:{
				connectionID:data.connectionID
			}
		}
		var sendToConnection=clients.fromStore(fakeConnection)
		
		sendToConnection.addedData.learnerCount=data.learnerCount
		
		clients.send(sendToConnection,'setLearnerCount',data.learnerCount)
        clients.publishAddedData()
		
		
	},
    
    lobbyChat: function(connection,data){
        
      var toPush=  connection.addedData.loggedInAs+': '+data.chatLine
        
      
      mainStore.lobbyChat.push(toPush)
      
      //console.log('lobbyChat: ',mainStore.lobbyChat)
      
      
      clients.publishView('lobby.html', 'default', 'lobbyChat', mainStore.lobbyChat) //nownClients.views.length)
  
    },
    
    boardChat: function(connection,data){
        
        //console.log(data.gameNum)
        
      var toPush=  connection.addedData.loggedInAs+': '+data.chatLine
        
      
      
      
      dbFuncs.update("tables",{
							_id: data.gameNum
						}, function(tableInDb){
                            
                            tableInDb.chat.push(toPush)
                            
                            
                            
                            
                            //db.close()
                            
                        },function (tableInDb) {
                            
                            clients.publishView('board.html', data.gameNum, 'dbTable.chat', tableInDb.chat)
                            
                            
                        })
      //})
      
      
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

	// getLobby: function(connection, data) {

	// 	clearDisconnectedPlayers() //nemide!!!!!!!!!!!!

	// 	if (players[0].indexOf(data.p) == -1) {
	// 		players[0].push(data.p)
	// 		players[1].push((new Date())
	// 			.getTime())

	// 		lobbyPollNum++

	// 	} else {
	// 		players[1][players[0].indexOf(data.p)] = (new Date())
	// 			.getTime()
	// 	}

	// 	var playerIndex = players[0].indexOf(data.p)
	// 	if (players[2][playerIndex]) {
	// 		//var askToOpen=true;
	// 		lobbyPollNum++
	// 		var openTableNum = players[4][playerIndex]
	// 		var openTableColor = players[3][playerIndex]
	// 		var opponentsName = players[5][playerIndex]

	// 		players[2][playerIndex] = false

	// 		clients.send(connection, 'lobbyState', {
	// 			players: players[0],
	// 			games: [], //[activeGames],
	// 			lobbypollnum: lobbyPollNum,
	// 			lobbychat: [], //lobbyChat,
	// 			asktoopen: true,
	// 			opentablenum: openTableNum,
	// 			opentablecolor: openTableColor,
	// 			opponentsname: opponentsName
	// 		}, 'lobbyState', function() {});

	// 	} else {

	// 		mongodb.connect(cn, function(err, db) {
	// 			if (!(db == null)) {
	// 				db.collection("tables")
	// 					.findOne({
	// 						_id: "xData"
	// 					}, function(err2, xData) {
	// 						if (xData == null) {

	// 							createXData()

	// 							var resLChat = []
	// 							var resAGames = []

	// 						} else {

	// 							var resLChat = xData.lobbyChat
	// 							var resAGames = xData.activeTables
	// 						}
	// 						db.close()

	// 						clients.send(connection, 'lobbyState', {
	// 							players: players[0],
	// 							games: resAGames,
	// 							lobbypollnum: lobbyPollNum,
	// 							lobbychat: resLChat,
	// 							asktoopen: false
	// 						}, 'lobbyState', function() {});

	// 					});
	// 			}
	// 		});

	// 	}

	// },
    
	thinkerMessage: function(connection, data, connectionID) {

		

		//var thinker = knownThinkers[doIKnow(data.thinker)]

		switch (data.command) {

			case 'log':

				//postThinkerMessage(thinker, data.message)

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
			console.log('known client came..', data.clientMongoId)

			dbFuncs.knownClientReturned(data, connection,function(lastUser,learnerCount){
                
                
				clients.send(connection, 'reHello', {
					
					connectionID: connectionID,
					lastUser:lastUser
					
				}, 'reHello', function() {})
                
                if(learnerCount){
					
					//connection.addedData.learnerCount=doc.learnerCount
					clients.send(connection,'setLearnerCount',learnerCount)
					
				}
                
                
			},userFuncs) //this will mark it online in the db

			clients.storeVal(connection, 'clientMongoId', data.clientMongoId)

			clients.publishAddedData()

			

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

				//mongodb.connect(cn, function(err, db) {
					dbFuncs.findOne("tables",{
							_id: Number(data.newSubViewName)
						}, function(tableInDb) {
                            
                            
                            
                            
                            if(tableInDb){
                                
                                                        
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
                                
                                
                            }else{
                                
                                userFuncs.removeDisplayedGame(connection, Number(data.newSubViewName))
                                
                                
                                
                            }
    

							//db.close()

						});

				//});

				break;

			case 'lobby.html':

				////console.log(clients.getOnlineUsers(),'miabaj<<<<<<<<<<<<<<')

				clients.send(connection, 'updateView', {

					viewName: 'lobby.html',
					subViewName: 'default',
					viewPart: 'onlineUsers',
					data: clients.getOnlineUsers()

				})
                
                clients.send(connection, 'updateView', {

					viewName: 'lobby.html',
					subViewName: 'default',
					viewPart: 'lobbyChat',
					data: mainStore.lobbyChat

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
                    data: clients.adminLogStore   
                })
                
                clients.send(connection,'updateView',{
                    viewName:'admin.html',
                    subViewName:'default',
                    viewPart: 'defaultMod',
                    data: serverGlobals.defaultMod   
                })
                
                clients.send(connection,'updateView',{
                    viewName:'admin.html',
                    subViewName:'default',
                    viewPart: 'allMods',
                    data: serverGlobals.allMods   
                })
				
				clients.send(connection,'updateView',{
                    viewName:'admin.html',
                    subViewName:'default',
                    viewPart: 'learningGames',
                    data: serverGlobals.learningGames   
                })
                
				serverGlobals.getLearningStats(function(learningStats){
					clients.send(connection,'updateView',{
						viewName:'admin.html',
						subViewName:'default',
						viewPart: 'learningStats',
						data: learningStats   
					})
				})
					
                
                clients.send(connection,'updateView',{
                    viewName:'admin.html',
                    subViewName:'default',
                    viewPart: 'learnerTable',
                    data: serverGlobals.learnerTable   
                })
                
            break;
				
		}

	},

	// movedtemp: function(connection, onTable) {

		
	// 	onTable.moved = new Date()
	// 		.getTime()

	// 	var command = onTable.command

	// 	onTable.command = ''
        
	// 	mongodb.connect(cn, function(err, db) {
	// 		db.collection("tables")
            
    //         .findOne({
    //             _id:onTable._id
    //         },function(err2,dat){
                
    //             //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',dat._id)
    //             var tempID=dat._id
    //             dat=onTable
    //             dat._id=tempID
                
    //             db.collection("tables").save(dat, function(err3, res) {
	// 				//table moved and saved, let's check what to do
	// 				db.close()
                    
    //                 console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',err3)
                

	// 				clients.publishView('board.html', onTable._id, 'dbTable.table', onTable.table)

	// 				clients.publishView('board.html', onTable._id, 'dbTable.wNext', onTable.wNext)

	// 				//popThem(onTable._id, onTable, 'updated', 'table updated.') //respond to pending longpolls

	// 				switch (command) {

	// 					case 'makeAiMove':

	// 						splitMoves.makeAiMove(onTable)

	// 					break;

	// 				}

	// 			})
                
                
                
                
    //         })
            
            
            
				

	// 	});

	// },
    
    
    
	moved: function(connection, onTable) {

		
		onTable.moved = new Date()
			.getTime()

		var command = onTable.command

		onTable.command = ''
        
		dbFuncs.update("tables",{
                _id:onTable._id
            },function(dat){
                
                
                var tempID=dat._id
                dat=onTable
                dat._id=tempID
                
                // db.collection("tables").save(dat, function(err3, res) {
				// 	//table moved and saved, let's check what to do
				// 	db.close()
                    
                //     console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',err3)
                

					

				// })
                
                
                
                
            },function(savedDoc){
                
                clients.publishView('board.html', onTable._id, 'dbTable.table', onTable.table)

                clients.publishView('board.html', onTable._id, 'dbTable.wNext', onTable.wNext)

                switch (command) {

                    case 'makeAiMove':

                        splitMoves.makeAiMove(onTable)

                    break;

                }
            
                
            })
        

	},
	//var 
	// myPartIsDone: function(connection, data) {

	// 	connection = clients.fromStore(connection)

	// 	connection.addedData.speed = connection.addedData.speed * 100

	// 	var index = getTaskIndex(data[0]._id)

	// 	data.forEach(function(move) {

	// 		splitTaskQ[index].returnedMoves.push(move)
	// 		splitTaskQ[index].pendingSolvedMoves--

	// 	})

	// 	splitMoves.markSplitMoveDone(data[0]._id, data[0].thinker)

	// 	if (splitTaskQ[index].pendingSolvedMoves == 0) {

	// 		////////////////////////////////////////////////////////////all moves solved, check best and make a move

			
    //         splitMoves.remove(splitTaskQ[index]._id)
            
    //         splitTaskQ[index].returnedMoves.sort(
	// 			moveSorter
	// 		)

	// 		moveInTable(splitTaskQ[index].returnedMoves[0].move, splitTaskQ[index])

	// 		splitTaskQ[index].chat = [~~((new Date() - splitTaskQ[index].splitMoveStarted) / 10) / 100 + 'sec'] //1st line in chat is timeItTook

	// 		splitTaskQ[index].returnedMoves.forEach(function(returnedMove) {
	// 			splitTaskQ[index].chat = splitTaskQ[index].chat.concat({
	// 				//move: returnedMove.moveStr,
	// 				score: returnedMove.score,
	// 				hex: returnedMove.score.toString(16),
	// 				moves: returnedMove.moveTree

	// 			})

	// 		})

	// 		splitTaskQ[index].pendingMoveCount = undefined

	// 		splitTaskQ[index].returnedMoves = undefined

	// 		splitTaskQ[index].command = undefined

	// 		splitTaskQ[index].aiType = undefined

	// 		splitTaskQ[index].splitMoveStarted = undefined

	// 		splitTaskQ[index].oppKingPos = undefined

	// 		splitTaskQ[index].origProtect = undefined

	// 		splitTaskQ[index].origData = undefined

	// 		splitTaskQ[index].origDeepDatatt = undefined

	// 		splitTaskQ[index].origDeepDatatf = undefined

	// 		splitTaskQ[index].origDeepDataft = undefined

	// 		splitTaskQ[index].origDeepDataff = undefined

	// 		splitTaskQ[index].aiTable = undefined
	// 		splitTaskQ[index].pendingSolvedMoves = undefined

	// 		mongodb.connect(cn, function(err, db) {
	// 			db.collection("tables")
	// 				.save(splitTaskQ[index], function(err3, res) {

	// 					////console.log('publishing-------------------------------->>> ',splitTaskQ[index]._id)
	// 					//clients.publishView('board.html',splitTaskQ[index]._id,'dbTable.table',splitTaskQ[index].table)

	// 					clients.publishView('board.html', splitTaskQ[index]._id, 'dbTable.table', splitTaskQ[index].table)

	// 					clients.publishView('board.html', splitTaskQ[index]._id, 'dbTable.wNext', splitTaskQ[index].wNext)

	// 					clients.publishView('board.html', splitTaskQ[index]._id, 'dbTable.chat', splitTaskQ[index].chat)

	// 					clients.publishView('board.html', splitTaskQ[index]._id, 'dbTable.moves', splitTaskQ[index].moves)

	// 					//popThem(splitTaskQ[index]._id, splitTaskQ[index], 'splitMove', 'splitMove')

	// 					db.close()

	// 					splitTaskQ.splice(index, 1)

	// 				})
	// 		})
	// 	}

	// }

}