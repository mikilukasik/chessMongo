

var SplitMoves = function(clients,dbFuncs,Engine,mongo) {
    
    var timeNow=new Date()
    
    var mongodb=mongo.mongodb
    var cn=mongo.cn
    
    var moveInTable=Engine.moveInTable


    
    var MoveToSend = function(moveCoord, index, dbTableWithMoveTask, splitMoveId) {

        var moveTask = dbTableWithMoveTask.moveTask
        
        this.mod=moveTask.mod

        this.moveIndex = index

        this.moveCoords = moveCoord //one move only

        this.sharedData = moveTask.sharedData
        

        this.sharedData.origTable = dbTableWithMoveTask.table
        
        this.sharedData.origAllPastTables = dbTableWithMoveTask.allPastTables
        
        

        this.sharedData.gameNum = dbTableWithMoveTask._id

        this.sharedData.desiredDepth = moveTask.sharedData.desiredDepth

        this.sharedData.splitMoveID = splitMoveId

        this.timer = {}

        this.history = []

    }
    
        
    var Task = function(command, data, message, taskNum) {

        var rnd = Math.random()
        this.rnd = rnd

        if (taskNum) {
            this.taskNum = taskNum
        }
        else {
            this.taskNum = rnd
        }



        this.command = command
        this.message = message
        this.data = data
        this.response = {}

        var fstTime = new Date()
            .getTime()

        this.created = fstTime
        this.called = fstTime




    }
        

    var SplitMove = function(dbTableWithMoveTask) {
    
    //console.log(JSON.stringify(dbTableWithMoveTask.moveTask))
    
    this.shouldIDraw=dbTableWithMoveTask.moveTask.shouldIDraw

	this.started = new Date()

	this.splitMoveIndex = undefined

	this.splitMoveID = Math.random() * Math.random()

	var movesToSend = []

	dbTableWithMoveTask.moveTask.moveCoords.forEach(function(moveCoord, index) {

		movesToSend.push(new MoveToSend(moveCoord, index, dbTableWithMoveTask, this.splitMoveID))

	})

	this.movesToSend = movesToSend //this will get empty as we send the moves out for processing

	this.moves = movesToSend.slice() //this should stay full

	this.thinkers = [] //this will get filled with the clients working on this splitmove

	this.gameNum = dbTableWithMoveTask._id

	this.origTable = dbTableWithMoveTask.table

	this.origMoveTask = dbTableWithMoveTask.moveTask

	this.pendingMoveCount = dbTableWithMoveTask.moveTask.moveCoords.length

}

    var adminLog=clients.adminLog

	var store = {

		q: [],

	}//

	this.intervalFunc = function() {
		if (store.q.length > 0) {

			var idleClientConnections = clients.getIdleClientConnections()
            
           
			var until = idleClientConnections.length

			//adminLog('idle connections:',until)

			for (var i = 0; i < until; i++) {

				if(! this.assistOtherTables(idleClientConnections[i],-2,timeNow)){
            
                    adminLog('No other move to assist.')
                    connection.addedData.currentState='idle'
            
        }//-1 for no justFinishedOnTable

			}
		}

	}
//

	//setInterval(this.intervalFunc, 2000)

	this.nakedQ = function() {

		//var res = []
		store.nakedQ = []

		store.q.forEach(function(splitMove, i) {

			var nakedT = getNakedThinkers(i)
			var nakedM = getNakedMoves(i)

			store.nakedQ.push({

				gameNum: splitMove.gameNum,
				thinkers: nakedT,
				moves: nakedM,
				//a: splitMove.movesToSend

			})
		})

		//return res

	}

	var nakedQ = this.nakedQ

	//var getNakedQ=this.getNakedQ

	var qIndexBysplitMoveID = function(splitMove) {

		for (var i = store.q.length - 1; i >= 0; i--) {

			if (splitMove.splitMoveID === store.q[i].splitMoveID) return i

		}

	}

	var qIndexByGameID = function(gameID) {

		for (var i = store.q.length - 1; i >= 0; i--) {

			if (gameID == store.q[i].gameNum) return i

		}

	}

	this.publishNakedQ = function() {

		//this.nakedQ()
		clients.publishView('admin.html', 'default', 'splitMoves', store.nakedQ)

	}

	var getSplitMoveTask = function(splitMove, percent) {
        
        //adminLog('#######################################')
        
		var numberToSend = Math.ceil(percent * splitMove.movesToSend.length)

        adminLog('numberToSend',numberToSend)

		var splitMoveTasks = []

		for (var i = 0; i < numberToSend; i++) {
			splitMoveTasks.push(splitMove.movesToSend.pop())
		}

		return splitMoveTasks

	}
    
    

	this.add = function(dbTableWithMoveTask) {
        
        adminLog('----->   new splitmove, game ',dbTableWithMoveTask._id)

        //adminLog(JSON.stringify(dbTableWithMoveTask))


		var splitMove = new SplitMove(dbTableWithMoveTask)

		var splitMoveIndex = store.q.push(splitMove) - 1
        
        
		splitMove.splitMoveIndex = splitMoveIndex

		splitMove.origTable = dbTableWithMoveTask

		

		while (splitMove.movesToSend.length > 0) {

			var thinker = clients.fastestThinker()

			var sendAll = false

			if (thinker.addedData.currentState == 'busy') {

				adminLog('NO AVAILABLE THINKER: all busy, storing in new PendingThinker()')
                
                thinker=new clients.PendingThinker()
                
				sendAll = true
				

			}
            
            

			var sendThese = getSplitMoveTask(splitMove, thinker.itsSpeed)
			
			sendThese.forEach(function(move) {

				
                //adminLog(JSON.stringify(move))



                
				if(move)move.sentToName = thinker.addedData.lastUser
					
			})

			var sentCount = sendThese.length


			var sentTo = clients.sendTask(new Task('splitMove', sendThese, 'splitMove t' + dbTableWithMoveTask._id + ' sentCount: ' + sentCount), thinker) //string
			
			registerSentMoves(dbTableWithMoveTask._id, sentTo, sentCount, sendThese, thinker)

		}

		this.nakedQ()
		this.publishNakedQ()
        
        adminLog('New splitMove for game',dbTableWithMoveTask._id,'added.')


		return splitMove

	}

	this.processAnswer = function(data, timeNow, qIndex, tIndex, gameID, connection) {
        
        
        var sentSomething=false
        
    	var isDone = false
		var progress = data.progress
		var beBackIn
        if(data.beBackIn){
            beBackIn = data.beBackIn
        } else {
            beBackIn = 100000
        }
        if (beBackIn<0)beBackIn=0
		var beBackAt = undefined
        
        var dmpm

		if(data.dmpm) {
            dmpm = data.dmpm
            clients.updateSpeedStats(connection, data.depth, data.dmpm)
            //progress = 100
        }

		

		if (false){//data.final) {

			progress = 100
			beBackIn = 0
			beBackAt = timeNow
			isDone = true

			

			clients.publishAddedData()
            
            //connection.addedData.currentState='fidle'

		} else {
            
            if(data.smTakes){
                store.q[qIndex].thinkers[tIndex].smTakes = data.smTakes
                adminLog('smTakes stored:',data.smTakes)

            }else{
                //adminLog('no smTakes received.',1)
            }

			beBackAt = Number(timeNow) + beBackIn
            //adminLog('bebackat:::',beBackAt)

		}

		if (progress > store.q[qIndex].thinkers[tIndex].progress) {

			store.q[qIndex].thinkers[tIndex].progress = progress
			store.q[qIndex].thinkers[tIndex].beBackIn = beBackIn
			store.q[qIndex].thinkers[tIndex].beBackAt = beBackAt
			store.q[qIndex].thinkers[tIndex].lastSeen = timeNow
			store.q[qIndex].thinkers[tIndex].done = isDone

			if(data.dmpm)store.q[qIndex].thinkers[tIndex].dmpm = dmpm

			store.q[qIndex].thinkers[tIndex].mspm = beBackIn / store.q[qIndex].thinkers[tIndex].movesLeft
            
            
            
			
		}

		if (data.results) this.processResults(data,qIndex,tIndex,connection)

        if (data.final) {
            
            var tryOthers=false

			var assistData = getAssistData(qIndex, tIndex, timeNow)

			if (assistData){
                
                adminLog('Assisting in current move')
                
				if(!(this.assist(assistData.assisted, assistData.assistant, qIndex, assistData.assistedIndex, timeNow))) tryOthers=true

			} else {
                
                tryOthers=true
                
                
			}
            
            if(tryOthers){
                
                // adminLog('Attempting to assist other moves..')

                if( this.assistOtherTables(connection,gameID,timeNow) ){
                    adminLog('Assisting in other move')

                    sentSomething=true
                }else{
                    
                    adminLog('No other move to assist.')
                    connection.addedData.currentState='idle'

                    
                }
                
            }

		}

		clients.publishView('board.html', gameID, 'busyThinkers', getNakedThinkers(qIndex))

		this.publishNakedQ()
        
        return sentSomething

	}
    
    this.processResults=function(data,qIndex,tIndex,connection){
        
        //var willMove = false
        
        var timeNow=new Date();

        var noNaked = false
        

        data.results.forEach(function(res) {
            
            if(store.q[qIndex]&&store.q[qIndex].moves[res.moveIndex]){
                
                           if (store.q[qIndex].moves[res.moveIndex].done) {
                adminLog('error: move solved twice(or more)')
                forgetThis=true

            } else {

                store.q[qIndex].moves[res.moveIndex].done = true
                store.q[qIndex].moves[res.moveIndex].result = res
                store.q[qIndex].moves[res.moveIndex].doneBy = connection.addedData.lastUser //.lastUser

                store.q[qIndex].pendingMoveCount--
                    store.q[qIndex].thinkers[tIndex].movesLeft--

                    removeSentMove(store.q[qIndex].thinkers[tIndex], res, timeNow)

                // this.nakedQ()

                if (store.q[qIndex].pendingMoveCount == 0) {

                    noNaked = true

                    nakedQ()

                    store.q[qIndex].moves.sort(function(a, b) {
                        if (a.result.value > b.result.value) {
                            return -1
                        } else {
                            return 1
                        }

                    })

                    adminLog('will move ', store.q[qIndex].moves[0].result.move)

                    store.q[qIndex].thinkers.forEach(function(thinker) {

                        thinker.progress = 100

                    })

                    //willMove = true

                    var tableInDb = store.q[qIndex].origTable

                    moveInTable(store.q[qIndex].moves[0].result.move, tableInDb)

                    tableInDb.chat = [~~((timeNow - store.q[qIndex].started) / 10) / 100 + 'sec'] //1st line in chat is timeItTook

                    store.q[qIndex].moves.forEach(function(returnedMove) {

                        tableInDb.chat = tableInDb.chat.concat({

                            score: returnedMove.result.value,

                            moves: returnedMove.result.moveTree,

                            thinker: returnedMove.doneBy

                        })

                    })

                    tableInDb.moveTask = {}

                    dbFuncs.insert("tables",tableInDb, function(err3, res) {
                                
                                //db2.close()

                                publishTable(tableInDb)

                                

                                store.q.splice(qIndex, 1)

                                //clients.publishView('admin.html', 'default', 'splitMoves', store.nakedQ)

                            })
                   // })

                }

            }
            // if(forgetThis){
                
                
            }
            
 
            // }

        })

        if (!noNaked) this.nakedQ()



    }

	var getThinkerIndex = function(qIndex, thinker) {

		if (store.q[qIndex])
			for (var i = store.q[qIndex].thinkers.length - 1; i >= 0; i--) {

				if (store.q[qIndex].thinkers[i].thinker == thinker) {
					return i
				}
			}

		return -1

	}

	this.registerSentMoves = function(gameID, thinkerID, sentCount, sentMoves, connection) {

		var qIndex = qIndexByGameID(gameID)

		var tIndex = getThinkerIndex(qIndex, thinkerID)

		var timeNow = Number(new Date())

		//adminLog('herererere: ',tIndex)
		//adminLog('tIndex',tIndex)
		if (tIndex == -1) {

			return store.q[qIndex].thinkers.push({

				thinker: thinkerID,
				sentCount: sentCount,
				done: false,
				progress: 0,
				sentMoves: sentMoves,
				movesLeft: sentCount,
				beBackIn: 10000000,
                beBackAt:Number(new Date())+100000,
				connection: connection,
				lastSeen: timeNow,
				addProgress: 0,
				history: []

			}) - 1
		} else {

			var thinker = store.q[qIndex].thinkers[tIndex]

			//adminLog('jeeeeeeeeee',thinker)

			thinker.addProgress = Number(thinker.sentCount / (thinker.sentCount + sentCount))

			thinker.sentCount += sentCount

			//deal with progress here??

			thinker.progress = 0

			thinker.sentMoves = thinker.sentMoves.concat(sentMoves)

			//adminLog('thinker.movesLeft: ',thinker.movesLeft)

			thinker.movesLeft = sentCount

			thinker.beBackIn = 10000000

			thinker.lastSeen = timeNow

			thinker.done = false
            
      // var 

			sentMoves.forEach(function(move) {
					if (move.history) {
						move.history.push(thinker.lastUser)
					} else(
						move.history = []
					)
				})
				//thinker.history.push()

			return tIndex

		}

	}

	registerSentMoves = this.registerSentMoves

	var removeSentMove = function(thinker, move, timeNow) {

		thinker.lastSeen = timeNow

		var moveArray = thinker.sentMoves

		var index = undefined

		for (var i = moveArray.length - 1; i >= 0; i--) {

			if (moveArray[i].moveIndex == move.moveIndex) {

				index = i
					////adminLog('found!!!!')

			}

		}

		if (index != undefined) {

			moveArray.splice(i, 1)
				////adminLog('removed!!!!')

		} else {

			////adminLog('not found!!!!')

		}

	}

	this.makeAiMove = function(dbTableWithMoveTask) {

		var splitMove = this.add(dbTableWithMoveTask)

		splitMove.pendingSolvedMoves = splitMove.moves.length

		splitMove.returnedMoves = []

		
		clients.publishAddedData()

	}

	var getSplitMoveIndexToAssist = function(ignoreGameNum) {

		var kuszob = 1000 //!!!!!!!!

		var len = store.q.length

		for (var i = 0; i < len; i++) {
            
            //adminLog('@@@@@@@@@here:',store.q[i].gameNum)
            
            if(ignoreGameNum!=store.q[i].gameNum){
    
                var tempBeBackIn = 0

                for (var j = store.q[i].thinkers.length - 1; j >= 0; j--) { //.forEach(function(thinker){

                    //adminLog('store.q[i].thinkers[j].beBackIn',store.q[i].thinkers[j].beBackIn,'tempBeBackIn',tempBeBackIn)

                    if (store.q[i].thinkers[j].beBackIn >= tempBeBackIn && (!store.q[i].thinkers[j].done)) tempBeBackIn = store.q[i].thinkers[j].beBackIn

                    if (tempBeBackIn > kuszob) break;

                }

                if (tempBeBackIn > 1000) break;

            }else{
                adminLog('game ignored')
            }

			
		}

		if (tempBeBackIn > kuszob || tempBeBackIn == 0) return i

	}

	this.assistOtherTables = function(connection,ignoreGameNum,timeNow) {
        adminLog('Attempting to assist other moves..')
        
        
        var sentSomeMoves=false

		var lastSeenConst = 2000

		//var timeNow = new Date()

		var splitMove=undefined

		var splitMoveIndex = getSplitMoveIndexToAssist(ignoreGameNum)

		if (splitMoveIndex != undefined) {
			//adminLog('van index:',splitMoveIndex)
			splitMove = store.q[splitMoveIndex]
		}else{
            adminLog('no splitmove to assist.')
            splitMove=false
            //connection.addedData.currentState='aidle'
        }

		if (splitMove) {

			adminLog(connection.addedData.lastUser,'to assist other moves')

			var tempBeBackIn = -1
			var tempThinker = undefined
			var tempTIndex = undefined


            var tempBeBackIn2 = -1
			var tempThinker2 = undefined
			var tempTIndex2 = undefined

			splitMove.thinkers.forEach(function(thinker, index) {

				if (((thinker.beBackIn > tempBeBackIn)  && (!thinker.done))) { //!!!!!!!!!!!!!!!!!!!!!      || (timeNow - thinker.lastSeen > lastSeenConst)
					tempBeBackIn = thinker.beBackIn
					tempThinker = thinker
					tempTIndex = index

				}
                
                if(timeNow - thinker.lastSeen > lastSeenConst){
                    
                    tempBeBackIn2 = thinker.beBackIn
					tempThinker2 = thinker
					tempTIndex2 = index
                   
                    
                }

			})
            
            if(!tempThinker){
                
                tempThinker=tempThinker2
                tempBeBackIn=tempBeBackIn2
                tempTIndex=tempTIndex2
                
                
                
            }

			//adminLog('moves to join:', splitMove.thinkers[tempTIndex])

			var mySpeed = connection.addedData.speed

			if (tempBeBackIn > 500||tempBeBackIn<=0) {                //!!!!!!!!!!!!!!!!!

				var hisSpeed = tempThinker.connection.addedData.speed
				var myRatio = mySpeed / (mySpeed + hisSpeed)

				if (timeNow - tempThinker.lastSeen > lastSeenConst && myRatio < 0.8) myRatio = 0.8

				var tempMoves = tempThinker.sentMoves
				var len = tempMoves.length

				var count = Math.round(len * myRatio)

                var removeThinker=false
                if (len==count)removeThinker=true

				var moves = tempMoves.splice(0, count)
                
                
				adminLog('get moves from ',tempThinker.connection.addedData.lastUser,', count',count,'len',len,'myRatio',myRatio)

				if (moves && moves.length > 0) {
                    
                    sentSomeMoves=true

					var qRes = []

					moves.forEach(function(move) {
						move.history.push('join in: ' + connection.addedData.lastUser)
						qRes.push(move.moveIndex)
					})

					adminLog('doing it now, count:', count, 'moves:', qRes)

					clients.sendTask(new Task('removeSplitMove', moves, 'remove splitMove'), tempThinker.connection)

					store.q[splitMoveIndex].thinkers[tempTIndex].sentCount -= moves.length
                    if(store.q[splitMoveIndex].thinkers[tempTIndex].sentCount==0){
                        //tempThinker.connection.addedData.currentState='idle'
                    }
						//store.q[splitMoveIndex].thinkers[].sentCount+=moves.length

					removeSentMove(store.q[splitMoveIndex].thinkers[tempTIndex], moves, timeNow)

					var sentTo = clients.sendTask(new Task('splitMove', moves, 'assist another splitMove'), connection)

					registerSentMoves(moves[0].sharedData.gameNum, sentTo, count, moves, connection)

					clients.send(connection, 'aa', 0, 'aa')

				}else{
                    //miert kerul ide??????
                    
                    
                }
                
                if(removeThinker){
                    
                    //splitMove.thinkers.splice(tempTIndex,1)
                    splitMove.thinkers[tempTIndex].progress=100
                    splitMove.thinkers[tempTIndex].beBackIn=0
                    
                    
                }
//
                //return true

			} else {

				// adminLog('disconnect???')

				adminLog('disconnect???', tempBeBackIn)
                
                //connection.addedData.currentState = 'bidle'
                 
                //return false

			}
            
            //

		} else {
            
            //connection.addedData.currentState = 'cidle'
            
            //return false
			 //adminLog('no splitmove')
		}
        
        
        return sentSomeMoves
        

	}

	var assistOtherTables = this.assistOtherTables

	this.getNakedQ = function() {
		return store.nakedQ
	}
    
    this.forceIdle=function(connection){
        
        adminLog('forceIdle',connection.addedData)
        connection.addedData.currentState='idle'
      
    }

	this.updateSplitMoveProgress = function(gameID, thinker, data, connection) {
        
       
        
        if(data.final&&thinker){
            adminLog('--------------------------START--------------------------------')
            thinker.progress=100
            adminLog('final returned from',connection.addedData.lastUser)
            if(data.forced)adminLog('FORCED!!')
        }
        
        var setIdle=true
        
		var timeNow = Number(new Date())

		var qIndex = qIndexByGameID(gameID)
        
		if (qIndex == undefined) {

			adminLog("error: received progress from",connection.addedData.lastUser," for game that doesn't exist:",gameID," final:", data.final)
            
            if(data.forced){
                
                connection.addedData.currentState='idle'
            
            }else{
                
                connection.addedData.currentState='idle'
                
            
            }
            
		} else {
			//move exists in q

			var tIndex = getThinkerIndex(qIndex, thinker) //returns -1 if not found

			if (tIndex == -1) {

				adminLog('FORBIDDEN progress received: move exists but thinker is not in it')

				clients.sendTask(new Task('forgetSplitMoves', {
                    gameID:gameID
                }, 'thinker not in q'), connection)
                
                connection.addedData.currentState='idle'
            
       		} else {

				//move exists, thinker is registered in move

				if( this.processAnswer(data, timeNow, qIndex, tIndex, gameID, connection)   )   setIdle=false

			}
		}
        
       
        if(data.final) adminLog('--------------------------END--------------------------------')
	
    }

	var publishTable = function(dbTable) {

		clients.publishView('board.html', dbTable._id, 'dbTable.table', dbTable.table)

		clients.publishView('board.html', dbTable._id, 'dbTable.wNext', dbTable.wNext)

		clients.publishView('board.html', dbTable._id, 'dbTable.chat', dbTable.chat)

		clients.publishView('board.html', dbTable._id, 'dbTable.allPastTables', dbTable.allPastTables)
        
        clients.publishView('board.html', dbTable._id, 'dbTable.moves', dbTable.moves)
        
        

	}
    
    

	var getAssistData = function(qIndex, tIndex, timeNow) {

		////adminLog('thinker finished, starting assist..')

		var thinkerToHelp = undefined

		var tempBackIn = 0
		var tHelpIndex

		var found = false

		store.q[qIndex].thinkers.forEach(function(thinkerInMove, index) {

			if (thinkerInMove.movesLeft) { //

				var accuBackIn = thinkerInMove.beBackAt - timeNow
                
                
                
               
                if(thinkerInMove.sentMoves[0])adminLog('assistData for',thinkerInMove.sentMoves[0].sentToName ,'accubackin',accuBackIn,'timeNow',timeNow,'thinkerInMove.beBackAt',thinkerInMove.beBackAt)

				if (accuBackIn > 1000) {

					var diff = thinkerInMove.beBackIn - accuBackIn
                    
                    adminLog('diff: ',diff,'tinmove.bbin',thinkerInMove.beBackIn)
                    
					var percDone
                    
                    if(thinkerInMove.beBackIn==10000000){
                        percDone = 0
                    }else{
                        percDone = diff / thinkerInMove.beBackIn
                    }

					var guessedMovesLeft = (1 - percDone) * thinkerInMove.movesLeft
                    adminLog('gmovesleft',guessedMovesLeft,'(1 - percDone)',(1 - percDone))


					if (guessedMovesLeft < 1) {

						//should be done soon, check it again with settimeout from here???!!!!!!!!!!!!!!!!!!!

					} else {

						if (accuBackIn > tempBackIn) {

							thinkerInMove.guessedMovesLeft = guessedMovesLeft
							thinkerInMove.accuBackIn = accuBackIn

							thinkerToHelp = thinkerInMove
							tHelpIndex = index
							tempBackIn = accuBackIn

						}

						found = true

					}

				}

			}

		})

		if (found) {

			if (thinkerToHelp.thinker) {

				return {
					assisted: thinkerToHelp,
					assistant: store.q[qIndex].thinkers[tIndex],
					assistedIndex: tHelpIndex
				}

			}
		}
	}

	var getNakedThinkers = function(qIndex) {

		var naked = []

		store.q[qIndex].thinkers.forEach(function(thinker) {
			naked.push({
				sentCount: thinker.sentCount,
				done: thinker.done,
				beBackIn: thinker.beBackIn,
				dmpm: thinker.dmpm,
				progress: thinker.progress,
				addProgress: thinker.addProgress,
				lastUser: thinker.connection.addedData.lastUser,
			})
		})

		return naked

	}

	var getNakedMoves = function(qIndex) {

		var naked = []

		store.q[qIndex].moves.forEach(function(move) {
			naked.push({
				moveIndex: move.moveIndex,
				done: move.done,
				doneBy: move.doneBy, //.result.thinker
				startedBy: move.sentToName,
				history: move.history,
			})
		})

		return naked

	}

	this.assist = function(assisted, assistant, qIndex, tIndex, timeNow) {

        var res=false

		var moves = getAssistMoves(assisted, assistant)

        adminLog('moves to pass:',moves.length)

		if (moves.length > 0) {

			moves.forEach(function(move) {
				move.history.push('assist: ' + assistant.connection.addedData.lastUser)
			})

			assistant.progress = 0

			clients.sendTask(new Task('removeSplitMove', moves, 'remove splitMove'), assisted.connection)
            
            
			//adminLog('joez??',tIndex)

            adminLog('before',store.q[qIndex].thinkers[tIndex].sentCount)
			store.q[qIndex].thinkers[tIndex].sentCount -= moves.length
            adminLog('after',store.q[qIndex].thinkers[tIndex].sentCount)
            

			removeSentMove(store.q[qIndex].thinkers[tIndex], moves, timeNow)
            
            
            if(store.q[qIndex].thinkers[tIndex].sentCount==0){
                //assisted.connection.addedData.currentState='idle'
                //assistOtherTables(assisted.connection,-2,timeNow)
                
            }

			var sentTo = clients.sendTask(new Task('splitMove', moves, 'assist splitMove'), assistant.connection)
            


			registerSentMoves(moves[0].sharedData.gameNum, sentTo, moves.length, moves, assistant.connection)
            
            res=true

		}
        
        return res

	}

	var getAssistMoves = function(assisted, assistant) {

		var result = []

		var count = 0

		var assistantSpeed = assistant.smTakes

		var assistedSpeed = assisted.accuBackIn / assisted.guessedMovesLeft
        
        if(isNaN(assistedSpeed)||assistedSpeed==0){
            assistedSpeed=30000 //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!hack
        }

		var assistedBackIn = assisted.accuBackIn

		adminLog('stat:    assistantSpeed', assistantSpeed, ' assistedSpeed', assistedSpeed, 'assistedBackIn', assistedBackIn)

		var maxMoves = assisted.guessedMovesLeft

		var fromMoves = assisted.sentMoves

		//var more = false

		while (assistantSpeed * count < assistedBackIn - (assistedSpeed * count)) {

			count++

		}

		if(count>0)count--

		adminLog('assist resulted in...     maxMoves', maxMoves, ' count', count)

		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!count is too high, problems with measuring assistedspeed

		if (count > maxMoves / 1.8) {
			count = Math.ceil(maxMoves / 1.8)
		}

		// take moves, but max 1/1.8 from each thinker, speedtests can be vey inaccurate?????? not anymore , get some averages!!!!!!!!!!!!!!!!!!!!!!!!1

		result = fromMoves.splice(0, count)

		return result

	}

	this.update = function(splitMove, propertyName, value) {

		//  var forcePublish=false
		var index

		if (splitMove.splitMoveID) {

			index = qIndexBysplitMoveID(splitMove)

		} else {

			//adminLog('no id')

		}

		if (propertyName) {

			eval('(store.q[index].' + propertyName + '=value)')

			this.nakedQ()

		}

		return splitMove

	}

	this.pushToArray = function(splitMove, arrayName, value) {

		var forcePublish = false
		var index

		if (splitMove.splitMoveID) {

			index = qIndexBysplitMoveID(splitMove)

		} else {

			splitMove.splitMoveID = Math.random() * Math.random()

			index = store.q.push(splitMove) - 1

			forcePublish = true

		}

		if (arrayName) {

			eval(
				'if(store.q[index].' + arrayName + '){(store.q[index].' + arrayName + '.push(value))}else{store.q[index].' + arrayName + '=[value]}'
			)

			this.nakedQ()

		} else {

			if (forcePublish) {

				this.nakedQ()

			}

		}

		return splitMove

	}

	this.remove = function(gameID) {

		var res

		var index = qIndexByGameID(gameID)

		if (index !== -1) {

			res = store.q.splice(index, 1)[0]

		}

		return res

	}

	this.qLength = function() {
		return store.q.length
	}

}

module.exports={
    withClient:SplitMoves
}
