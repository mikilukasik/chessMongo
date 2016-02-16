///////temp/////////////////
// mongodb = dbFuncs.mongodb
// cn = dbFuncs.cn



var findUsersGameIndex = function(gameNo, games) {

	for (var i = games.length - 1; i >= 0; i--) {
		if (games[i].gameNo == gameNo) return i
	}
	return -1
}

var userFuncs = {

	removeDisplayedGame: function(connection, data) {

		//console.log('remove game from name:', connection.addedData.loggedInAs)
		dbFuncs.update("users",{
					name: connection.addedData.loggedInAs
				}, function(userInDb) {
					if (userInDb != null) {

						var index = findUsersGameIndex(data, userInDb.games)
						userInDb.games.splice(index, 1)
							
					}
					
				},function (userInDb) {
                    
                    clients.publishDisplayedGames(connection.addedData.loggedInAs, connection)

							
                });

		
	},

	logoff: function(connection, data) {

		var name = data.name

		clients.storeVal(connection, 'loggedInAs', undefined)
		clients.storeVal(connection, 'isAdmin', undefined)
		clients.storeVal(connection, 'stayLoggedIn', undefined)

		clients.logoff(name) //this removes it from store.onlineUsers

		clients.publishAddedData()
		clients.publishDisplayedGames(undefined, connection)

	},

	loginUser: function(name, pwd, stayLoggedIn, connection, noPwd) {

		dbFuncs.update('users', {

			name: name

		}, function(doc) {

			if (doc == null) {
				if (name) clients.send(connection, 'userNotRegistered', {
					name: name
				})
			} else {
				//user exists, check pwd 

				if (doc.pwd == pwd || noPwd) {
					//password match, log him in

					var isAdmin = (admins.indexOf(name) != -1)

					clients.send(connection, 'login', {
							name: name,
							isAdmin: isAdmin
						})
						//console.log('user logging in: ',name)
					clients.storeVal(connection, 'loggedInAs', name)
					clients.storeVal(connection, 'isAdmin', isAdmin)

					if (name) clients.storeVal(connection, 'lastUser', name)
					clients.storeVal(connection, 'stayLoggedIn', stayLoggedIn)
					clients.publishAddedData()
					clients.publishDisplayedGames(name, connection)

					clients.login(connection, name)

				} else {
					//wrong pwd

					clients.send(connection, 'wrongPwd', {
						name: name
					})

				}

			}

		}, function(doc) {

		})

	},

	end: 0

}

////////////////////////global vars/////////////////////////////////

var serverGlobals = {
		defaultMod: [],
		allMods: [],
		learningGames: [],
		gameToReport: -1,
		//reportedGame:{},
		learnerTable: new Dbtable('pre-init', 'pre-init', 'pre-init'),
		learningStats: [],

		LearningStat: function(modStr, modConst, initCb, dbCb, idCb) {

			var modType = modStr.slice(0, 3)
			var modVal = Number(modStr.slice(9))

			if (!modConst) modConst = getMcFromMv(modVal)

			this._id = -1 //idCb will receive and update _id

			this.modStr = modStr

			this.modType = modType
			this.modVal = modVal
			this.modConst = modConst

			this.finalResult = {

			}

			this.wModGame = {
				_id: -1,
				learnedOn: '',
				connectionID: '',
				result: {},
				status: 'pending',
				moves: [],
				modStr: modStr

			}
			this.bModGame = {
				_id: -1,
				learnedOn: '',
				connectionID: '',
				result: {},
				status: 'pending',
				moves: [],
				modStr: modStr

			}

			if (initCb) initCb(this)

			if (dbCb && idCb) {

				dbCb(this, idCb)

			}

		},

		createXData : function() {

			dbFuncs.insert('tables', {
				"_id": "xData",
				"firstFreeTable": 1,
				"lobbyChat": [],
				"activeTables": [],
				"modTypes": []
			})
		}

	}
	//
	
serverGlobals.getLearningStats=function(cb){
	var result=[]
	
	dbFuncs.query('learningStats',{currentStatus:'active'},function(resultArray,saverFunc){
		
		resultArray.forEach(function(learningStat){
			
			result.push({
				modType:learningStat.modType,
				modVal:learningStat.modVal,
				modConst:learningStat.modConst,
				modStr:learningStat.modStr,
				currentStatus:learningStat.currentStatus,
				
				finalResult:learningStat.finalResult,
				
				wModGame:{
					_id:learningStat.wModGame._id,
					learnedOn:learningStat.wModGame.learnedOn,
					movesLength:(learningStat.wModGame.lastDbTable)?learningStat.wModGame.lastDbTable.moves.length:0,
					result:{
						blackWon:learningStat.wModGame.result.blackWon,
						whiteWon:learningStat.wModGame.result.whiteWon,
						isDraw:learningStat.wModGame.result.isDraw,
						totalMoves:learningStat.wModGame.result.totalMoves
					},
					status:learningStat.wModGame.status
				},
				
				
				bModGame:{
					_id:learningStat.bModGame._id,
					learnedOn:learningStat.bModGame.learnedOn,
					movesLength:(learningStat.bModGame.lastDbTable)?learningStat.bModGame.lastDbTable.moves.length:0,
					result:{
						blackWon:learningStat.bModGame.result.blackWon,
						whiteWon:learningStat.bModGame.result.whiteWon,
						isDraw:learningStat.bModGame.result.isDraw,
						totalMoves:learningStat.bModGame.result.totalMoves
					},
					status:learningStat.bModGame.status
				},
				
				
			})
		})
		cb(result)
	})
	
	

	
	//console.log('###sglob @ 228',result )
	
	
},

serverGlobals.getLearningGames=function(){
	
},

	
serverGlobals.learnerResult = function(data) {

	var modStr = data.modStr
	var wMod = data.wMod

	var i = serverGlobals.learningGames.length
		while (i--) {
	
			if (serverGlobals.learningGames[i]._id == data._id) {
				
				serverGlobals.learningGames.splice(i, 1)
				
				
			}
	
		}

	serverGlobals.learningStats.forEach(function(learningStat) {

		if (learningStat.modStr == modStr) {

			if (wMod) {

				learningStat.wModGame.result = data.result
				learningStat.wModGame.status = 'done'

			} else {

				learningStat.bModGame.result = data.result
				learningStat.bModGame.status = 'done'

			}

			dbFuncs.saveLearnerResult(learningStat)

			dbFuncs.updateLearningStat(modStr, function(foundData) {

				if (wMod) {
					foundData.wModGame.result = data.result
				} else {
					foundData.bModGame.result = data.result
					foundData.currentStatus = 'done'
					

				}
			}, function(learningStats) {

				clients.publishView('admin.html', 'default', 'learningStats', learningStats)

			})

		}
	})

}

serverGlobals.learnerFinalResult = function(data) {

	var modStr = data.modStr

	serverGlobals.learningStats.forEach(function(learningStat) {

		if (learningStat.modStr == modStr) {

			learningStat.finalResult = data

			dbFuncs.saveLearnerResult(learningStat)

			dbFuncs.updateLearningStat(modStr, function(foundData) {

				foundData.finalResult = data
				foundData.currentStatus = 'done'

			}, function(learningStats) {

				clients.publishView('admin.html', 'default', 'learningStats', learningStats)

			})

		}
	})

}

serverGlobals.learnerSmallReport = function(data) {

	var modStr = data.wName
	var wModded = true

	if (data.wName == 'standard') {
		wModded = false
		modStr = data.bName
	}

	// console.log('------------------',modStr)

	dbFuncs.updateLearningStat(modStr, function(foundDoc) {

		if (foundDoc) {

			if (wModded) {

				//foundDoc.wModGame.moves = data.moves
                foundDoc.wModGame.lastDbTable= data.lastDbTable

			} else {

				//foundDoc.bModGame.moves = data.moves
                foundDoc.bModGame.lastDbTable= data.lastDbTable
			}

		}

	}, function(savedDoc) {
		
		serverGlobals.getLearningStats(function(learningStats){
			
			//serverGlobals.updateLearningStat(savedDoc, function(learningStats2) {

				clients.publishView('admin.html', 'default', 'learningStats',learningStats )
	
			//})
				
		})

		

	})

}


serverGlobals.stopLearningGame = function(data) {

	var modStr=data.modStr
    //var wModded=data.wModded

	dbFuncs.updateLearningStat(modStr, function(foundDoc) {

		if (foundDoc) {
            
            foundDoc.currentStatus='inactive'

		}

	}, function(savedDoc) {

	
		serverGlobals.getLearningStats(function(learningStats){
			clients.publishView('admin.html', 'default', 'learningStats', learningStats )
		})
	

	})

}

serverGlobals.updateLearningStat = function(savedDoc, cb) {

	var i = serverGlobals.learningStats.length

	while (i--) {

		if (serverGlobals.learningStats[i].modStr == savedDoc.modStr) {

			serverGlobals.learningStats[i] = savedDoc

			if (cb) cb(serverGlobals.learningStats)

			break;
		}

	}

}

serverGlobals.findInAllMods = function(what) {

	var counter = serverGlobals.allMods.length

	while (counter--) {

		if (serverGlobals.allMods[counter].modType == what) return counter

	}

	return counter

}

serverGlobals.getModLimits = function(modType) {

	var index = serverGlobals.findInAllMods(modType)

	if (index < 0) {
		return {
			modType: modType,
			min: 0,
			max: 100
		}
	}

	return (serverGlobals.allMods[index])

}

serverGlobals.learning = {

	markGamesInactive: {
		byConnectionID: function(id) {

			var i = serverGlobals.learningGames.length
			while (i--) {

				if (serverGlobals.learningGames[i].connectionID == id) {
                    
					serverGlobals.learningGames.splice(i, 1)
                    clients.publishView('admin.html', 'default', 'learningGames', serverGlobals.learningGames)
				}

			}
            
            
            var i=serverGlobals.learningStats.length
            while (i--) {
                
                if(serverGlobals.learningStats[i].currentConnectionID == id){
                    
                    serverGlobals.learningStats[i].currentStatus='inactive'
                    
                }
                
            }
            
            dbFuncs.query('learningStats',{currentConnectionID:id},function(myGames,saverFunc){
                
                var modifiedIndexes=[]
                
                myGames.forEach(function (myGame,index) {
                    myGame.currentStatus='inactive'
                    modifiedIndexes.push(index)
                })
                
                saverFunc(modifiedIndexes)
                
                
            })

		}
	},
	add: function(game,connectionID) {

		var modStr = game.wName
		var wModded = true

		if (game.wName == 'standard') {
			wModded = false
			modStr = game.bName
		}

		if (wModded) {
			//wmodded started
			new serverGlobals.LearningStat(modStr, undefined, function(statBeforeSaving) {

				statBeforeSaving.wModGame._id = game._id
				statBeforeSaving.wModGame.learnedOn = game.learningOn
				statBeforeSaving.wModGame.connectionID = game.connectionID
				
                statBeforeSaving.wModGame.status = 'in progress'
                statBeforeSaving.wModGame.wModded = true
                
                statBeforeSaving.currentConnectionID=connectionID
                
                statBeforeSaving.currentStatus='active'//+game.learningOn
                statBeforeSaving.wModGame.lastDbTable=game
                

			}, dbFuncs.newLearningStat, function(statWithId) {

				serverGlobals.learningStats.push(statWithId)
				serverGlobals.getLearningStats(function(learningStats){
					clients.publishView('admin.html', 'default', 'learningStats', learningStats )
				})
				
					//console.log(statWithId)

			})

		} else {
			//bmodded started
			dbFuncs.updateLearningStat(modStr, function(foundDoc) {

				foundDoc.bModGame._id = game._id
				foundDoc.bModGame.learnedOn = game.learningOn
				foundDoc.bModGame.connectionID = game.connectionID
                
				foundDoc.bModGame.status = 'in progress'
                foundDoc.bModGame.wModded = false
                foundDoc.currentConnectionID=connectionID
                foundDoc.bModGame.lastDbTable=game

			}, function(savedDoc) {

				//serverGlobals.updateLearningStat(savedDoc, function(learningStats) {
				serverGlobals.getLearningStats(function(learningStats){
					clients.publishView('admin.html', 'default', 'learningStats', learningStats)
				})
					

				//})

			})

		}

		serverGlobals.learningGames.push({
			_id: game._id,
			reporting: false,

			modStr: modStr,
			wModded: wModded,

			learningOn: game.learningOn,
			connectionID: game.connectionID
		})
		clients.publishView('admin.html', 'default', 'learningGames', serverGlobals.learningGames)
	},


    	newLearnerForOldGame: function(game,connectionID) {

		var modStr = game.wName
		var wModded = true

		if (game.wName == 'standard') {
			wModded = false
			modStr = game.bName
		}

		if (wModded) {
			//wmodded started
			dbFuncs.updateLearningStat(modStr, function(foundDoc) {

				foundDoc.wModGame._id = game._id
				foundDoc.wModGame.learnedOn = game.learningOn
				foundDoc.wModGame.connectionID = game.connectionID
                
				foundDoc.wModGame.status = 'in progress'
                foundDoc.wModGame.wModded = true
                foundDoc.wModGame.lastDbTable=game
                foundDoc.currentConnectionID=connectionID

			}, function(savedDoc) {

				//serverGlobals.updateLearningStat(savedDoc, function(learningStats) {
				serverGlobals.getLearningStats(function(learningStats){
					clients.publishView('admin.html', 'default', 'learningStats', learningStats)
				})
					

				//})

			})

		} else {
			//bmodded started
			dbFuncs.updateLearningStat(modStr, function(foundDoc) {

				foundDoc.bModGame._id = game._id
				foundDoc.bModGame.learnedOn = game.learningOn
				foundDoc.bModGame.connectionID = game.connectionID
                
				foundDoc.bModGame.status = 'in progress'
                foundDoc.bModGame.wModded = false
                foundDoc.currentConnectionID=connectionID
                foundDoc.bModGame.lastDbTable=game

			}, function(savedDoc) {

		//serverGlobals.updateLearningStat(savedDoc, function(learningStats) {
				serverGlobals.getLearningStats(function(learningStats){
					clients.publishView('admin.html', 'default', 'learningStats', learningStats)
				})
					

				//})

			})

		}

		serverGlobals.learningGames.push({
			_id: game._id,
			reporting: false,

			modStr: modStr,
			wModded: wModded,

			learningOn: game.learningOn,
			connectionID: game.connectionID
		})
		clients.publishView('admin.html', 'default', 'learningGames', serverGlobals.learningGames)
	},



	setReporter: function(data) {

		//console.log('setreporter data',data)
		if (data) {

			if (data.reporting) {
				//set new reporter
				serverGlobals.gameToReport = data._id

				serverGlobals.learningGames.forEach(function(learningGame) {

					if (learningGame._id == data._id) {

						learningGame.reporting = true

						//console.log('set to report:',learningGame)

						var connection = clients.fromStore({
							addedData: {
								connectionID: learningGame.connectionID
							}
						})

						clients.send(connection, 'startReporting', learningGame._id)
							//tell client to start reporting implement!!!!!!!

					} else {

						if (learningGame.reporting) {
							learningGame.reporting = false
								//tell client to stop reporting implement!!!!!!!
							console.log('set to stop reporting:', learningGame)

							var connection = clients.fromStore({
								addedData: {
									connectionID: learningGame.connectionID
								}
							})

							clients.send(connection, 'stopReporting', learningGame._id)

						}

					}

				})

			} else {

				//just clear reporter

				var i = serverGlobals.learningGames.length
				while (i--) {

					if (serverGlobals.learningGames[i]._id == data._id) {

						serverGlobals.learningGames[i].reporting = false

						var connection = clients.fromStore({
							addedData: {
								connectionID: serverGlobals.learningGames[i].connectionID
							}
						})

						clients.send(connection, 'stopReporting', serverGlobals.learningGames[i]._id)

					}

				}

			}
		}

	}
}
