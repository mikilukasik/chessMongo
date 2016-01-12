

var MoveToSend = function(moveCoord, index, dbTableWithMoveTask,splitMoveId) {
    
    var moveTask=dbTableWithMoveTask.moveTask
    
    this.moveIndex=index
    
    this.moveCoords=moveCoord       //one move only
     
    this.sharedData=moveTask.sharedData
    
    this.sharedData.origTable=dbTableWithMoveTask.table
    
    this.sharedData.gameNum=dbTableWithMoveTask._id
    
    this.sharedData.desiredDepth=moveTask.sharedData.desiredDepth
    
    this.sharedData.splitMoveID=splitMoveId
    
    this.timer={}
    
    this.history=[]
     
}


var SplitMove = function(dbTableWithMoveTask) {

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

	this.origMoveTask = dbTableWithMoveTask.moveTask

	this.pendingMoveCount = dbTableWithMoveTask.moveTask.moveCoords.length
    
    

}



var SplitMoves = function(clients) {
    
    
    

	var store = {

		q: [],

	}
    
    
        
    this.intervalFunc=function(){
        if(store.q.length>0){
            
            var idleClientConnections=clients.getIdleClientConnections()
           
            var until=idleClientConnections.length
            
            console.log('idle connections:',until)
            
            
            
            for(var i=0; i<until; i++){
                
                
                assistOtherTables(idleClientConnections[i])
                
                
                
            }
        }
        
        
        
    }

    setInterval(this.intervalFunc,2000)


    
    
    

	this.nakedQ = function() {

		//var res = []
        store.nakedQ=[]

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
    
    var nakedQ=this.nakedQ
    
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

		var numberToSend = Math.ceil(percent * splitMove.movesToSend.length)

		var splitMoveTasks = []

		for (var i = 0; i < numberToSend; i++) {
			splitMoveTasks.push(splitMove.movesToSend.pop())
		}

		return splitMoveTasks

	}

	this.add = function(dbTableWithMoveTask) {

		var splitMove = new SplitMove(dbTableWithMoveTask)

		var splitMoveIndex = store.q.push(splitMove) - 1

		splitMove.splitMoveIndex = splitMoveIndex

		splitMove.origTable = dbTableWithMoveTask

		// var itsSpeed=[0.1]

		while (splitMove.movesToSend.length > 0) {

			var thinker = clients.fastestThinker()
            
            var sendAll=false
            
            if(thinker.addedData.currentState=='busy'){
                
                console.log('============================all busy, storing into busy thinker..')
                sendAll=true
                //break;
                
            }

			var sendThese=[]
			if(sendAll){
                sendThese = getSplitMoveTask(splitMove, 1)
            }else{
                sendThese = getSplitMoveTask(splitMove, thinker.itsSpeed)
            }
            sendThese.forEach(function(move){
                
                //console.log('ssss',thinker,'sssssssssss')
                move.sentToName=thinker.addedData.lastUser
                move.history.push('initial: '+thinker.addedData.lastUser   )
            })

			var sentCount = sendThese.length

			//var connection={}
            
            var sentTo
            
            if(sendAll){
                sentTo = 'pending'// thinker.addedData.connectionID//clients.sendTask(new Task('splitMove', sendThese, 'splitMove t' + dbTableWithMoveTask._id + ' sentCount: ' + sentCount), thinker) //string
            
            }else{
                sentTo = clients.sendTask(new Task('splitMove', sendThese, 'splitMove t' + dbTableWithMoveTask._id + ' sentCount: ' + sentCount), thinker) //string
                //console.log('sentTo',sentTo,'thinker',thinker)
            }
			//var 
           

			registerSentMoves(dbTableWithMoveTask._id, sentTo, sentCount, sendThese, thinker)

		}

        this.nakedQ()
		this.publishNakedQ()

		return splitMove

	}

	var getThinkerIndex = function(qIndex, thinker) {

		if (store.q[qIndex])
			for (var i = store.q[qIndex].thinkers.length - 1; i >= 0; i--) {

				if (store.q[qIndex].thinkers[i].thinker == thinker.toString()) {
					return i
				}
			}

		return -1

	}

	this.registerSentMoves = function(gameID, thinkerID, sentCount, sentMoves, connection) {

		var qIndex = qIndexByGameID(gameID)
        
        var tIndex = getThinkerIndex(qIndex, thinkerID)
        
        var timeNow=new Date()
        
        //console.log('herererere: ',tIndex)
        //console.log('tIndex',tIndex)
        if(tIndex==-1){
            
       		return store.q[qIndex].thinkers.push({

                thinker: thinkerID,
                sentCount: sentCount,
                done: false,
                progress: 0,
                sentMoves: sentMoves,
                movesLeft: sentCount,
                beBackIn: 100000,
                connection: connection,
                lastSeen:timeNow,
                addProgress: 0,
                history:[]
                
                

            }) - 1
        }else{
            
            var thinker=store.q[qIndex].thinkers[tIndex]
            
            
            //console.log('jeeeeeeeeee',thinker)
            
            thinker.addProgress=Number( thinker.sentCount/(thinker.sentCount+sentCount))
            
            thinker.sentCount+=sentCount
            
            //deal with progress here??
            
            thinker.progress=6
            
            thinker.sentMoves=thinker.sentMoves.concat(sentMoves)
            
            //console.log('thinker.movesLeft: ',thinker.movesLeft)
            
            thinker.movesLeft=sentCount
            
            thinker.beBackIn=100000
            
            thinker.lastSeen=timeNow
            
            thinker.done=false
            
            sentMoves.forEach(function(move){
                if(move.history){
                    move.history.push(thinker.lastUser)
                }else(
                    move.history=[]
                )
            })
            //thinker.history.push()
            
            
            return tIndex
            
            
        }

	}
    
    registerSentMoves=this.registerSentMoves

	var removeSentMove = function(thinker, move, timeNow) {
        
        thinker.lastSeen=timeNow

        var moveArray=thinker.sentMoves
        
		var index = undefined

		for (var i = moveArray.length - 1; i >= 0; i--) {

			if (moveArray[i].moveIndex == move.moveIndex) {

				index = i
					////console.log('found!!!!')

			}

		}

		if (index != undefined) {

			moveArray.splice(i, 1)
				////console.log('removed!!!!')

		} else {

			////console.log('not found!!!!')

		}

	}
    
    this.makeAiMove=function(dbTableWithMoveTask) {
    
        var splitMove= this.add(dbTableWithMoveTask)
        
        splitMove.pendingSolvedMoves = splitMove.moves.length
    
        splitMove.returnedMoves = []

        //clients.publishView('board.html', dbTableWithMoveTask._id, 'busyThinkers', [])
        clients.publishAddedData()
    
    }
    
    var getSplitMoveIndexToAssist=function(){
        
        var kuszob=1000     //!!!!!!!!
        
        var len=store.q.length
        
        for(var i=0;i<len;i++){
            
            var tempBeBackIn=0
            
            for(var j=store.q[i].thinkers.length-1;j>=0;j--){//.forEach(function(thinker){
                
                console.log('store.q[i].thinkers[j].beBackIn',store.q[i].thinkers[j].beBackIn,'tempBeBackIn',tempBeBackIn)
                
                if(store.q[i].thinkers[j].beBackIn>=tempBeBackIn&&(!store.q[i].thinkers[j].done))tempBeBackIn=store.q[i].thinkers[j].beBackIn
                
                if(tempBeBackIn>kuszob)break;
                
            }
            
            
            if(tempBeBackIn>1000)break;
            
        }
        
        if(tempBeBackIn>kuszob||tempBeBackIn==0)return i
        
    }

    this.assistOtherTables=function(connection){
        
        var lastSeenConst=2000
        
        var timeNow=new Date()
        
        var splitMove
        
        var splitMoveIndex=getSplitMoveIndexToAssist()
        
        if(splitMoveIndex!=undefined){
            console.log('van index:',splitMoveIndex)
            splitMove=store.q[splitMoveIndex]
        }
        
        
        if(splitMove){
            
            console.log('here assist other moves')
            
            var tempBeBackIn=-1
            var tempThinker=undefined
            var tempTIndex=undefined
            
            splitMove.thinkers.forEach(function(thinker,index){
                
               
                
                if(((thinker.beBackIn>tempBeBackIn)||timeNow - thinker.lastSeen>lastSeenConst)&&(!thinker.done)   ){       //!!!!!!!!!!!!!!!!!!!!!
                    tempBeBackIn=thinker.beBackIn
                    tempThinker=thinker
                    tempTIndex=index
                    
                    console.log('xxxxxxxxxxx innen:',timeNow - thinker.lastSeen,thinker.done,thinker.lastUser,'idaig')
                }
                              
            })
            
            console.log('chosen:',tempTIndex)
            
            var mySpeed=connection.addedData.speed
            
            //var hisSpeed
            
            //console.log(tempBeBackIn,'tempBeBackIn')
            
            if(tempBeBackIn>500) {
                
                
                
                var hisSpeed=tempThinker.connection.addedData.speed
                var  myRatio=mySpeed/(mySpeed+hisSpeed)
                
                if(timeNow - tempThinker.lastSeen > lastSeenConst&&myRatio<0.8)myRatio=0.8
                
                
            
                var tempMoves=tempThinker.sentMoves
                var len=tempMoves.length
                
                var count=Math.round(len*myRatio)
                
                var moves=tempMoves.splice(0,count)
                
                console.log('tempThinker',tempThinker,'count',count,'len',len,'myRatio',myRatio)
                
                if(moves&&moves.length>0){
                
                    var qRes=[]
                
                    moves.forEach(function(move){
                        move.history.push('join in: '+connection.addedData.lastUser   )
                        qRes.push(move.moveIndex)
                    })
                
                    console.log('doing it now, count:',count,'moves:',qRes)
                
                    clients.sendTask(new Task('removeSplitMove', moves, 'remove splitMove'), tempThinker.connection)
                    
                    
                    store.q[splitMoveIndex].thinkers[tempTIndex].sentCount-=moves.length
                    //store.q[splitMoveIndex].thinkers[].sentCount+=moves.length
                    
                    
                    removeSentMove(store.q[splitMoveIndex].thinkers[tempTIndex], moves, timeNow)
                
                    
                    var sentTo=clients.sendTask(new Task('splitMove', moves, 'assist another splitMove'), connection)
                    
                    
                    
                    
                    
                    
                    registerSentMoves(moves[0].sharedData.gameNum, sentTo, count, moves, connection)

                    clients.send(connection,'aa',0,'aa')
                
                }
            
                
               
                
            }else{
                
                // console.log('disconnect???')
             
            
                console.log('disconnect???',tempBeBackIn)
             
            
                
                
                
            }

            
        }else{
            console.log('no splitmove')
        }
        
        
    }
    
    assistOtherTables=this.assistOtherTables
    
    this.getNakedQ=function(){
        return store.nakedQ
    }

	this.updateSplitMoveProgress = function(gameID, thinker, data, connection) {

		var timeNow = new Date()

		var qIndex = qIndexByGameID(gameID)
        
        

		if (qIndex == undefined)  {
            
            if(data.final){
                
                connection.addedData.currentState = 'idle'
                // if(store.q[qIndex]){
                    
                //     store.q[qIndex].thinkers[tIndex].progress = 100 
                //     store.q[qIndex].thinkers[tIndex].done = true
				//     store.q[qIndex].thinkers[tIndex].beBackIn = 0
                    
                //  }
                      
                 this.assistOtherTables(connection)
                
            }
          
		}else{
            
             var tIndex = getThinkerIndex(qIndex, thinker)
            

            
            if(store.q[qIndex].thinkers[tIndex]){
                
                var isDone = false
                var progress = undefined
                var beBackIn = undefined
                var beBackAt = undefined
                //var lastSeen = 1
            

                var willMove = false

                if (data.final) {

                    progress = 100
                    beBackIn = 0
                    beBackAt = timeNow
                    isDone=true
                    

                    connection.addedData.currentState = 'idle' //'reCheck'

                    clients.updateSpeedStats(connection, data.depth, data.dmpm)

                    clients.publishAddedData()

                } else {

                    progress = data.progress
                    beBackIn = data.beBackIn
                    beBackAt = Number(timeNow) + beBackIn
                        

                }

                var dmpm = data.dmpm

                if (progress > store.q[qIndex].thinkers[tIndex].progress) {

                    store.q[qIndex].thinkers[tIndex].progress = progress
                    store.q[qIndex].thinkers[tIndex].beBackIn = beBackIn
                    store.q[qIndex].thinkers[tIndex].beBackAt = beBackAt
                    store.q[qIndex].thinkers[tIndex].lastSeen = timeNow
                    store.q[qIndex].thinkers[tIndex].done = isDone
                    

                    store.q[qIndex].thinkers[tIndex].dmpm = dmpm
                        
                    store.q[qIndex].thinkers[tIndex].mspm = beBackIn / store.q[qIndex].thinkers[tIndex].movesLeft
                    store.q[qIndex].thinkers[tIndex].smTakes = data.smTakes

                }

                if (store.q[qIndex] && store.q[qIndex].thinkers[tIndex]) {

                    if (data.results) {
                        
                        var noNaked=false

                        data.results.forEach(function(res) {

                            if (store.q[qIndex].moves[res.moveIndex].done) {
                                console.log('error: move solved twice(or more)')
                                
                            } else {

                                store.q[qIndex].moves[res.moveIndex].done = true
                                store.q[qIndex].moves[res.moveIndex].result = res
                                store.q[qIndex].moves[res.moveIndex].doneBy = connection.addedData.lastUser//.lastUser

                                store.q[qIndex].pendingMoveCount--
                                store.q[qIndex].thinkers[tIndex].movesLeft--

                                removeSentMove(store.q[qIndex].thinkers[tIndex], res, timeNow)
                                
                                // this.nakedQ()

                                if (store.q[qIndex].pendingMoveCount == 0) {
                                    
                                    noNaked=true
                                    
                                    nakedQ()
                                    
                                    
                                    
                                    store.q[qIndex].moves.sort(function(a, b) {
                                        if (a.result.value > b.result.value) {
                                            return -1
                                        } else {
                                            return 1
                                        }

                                    })

                                    console.log('will move ', store.q[qIndex].moves[0].result.move)
                                    
                                    
                                    
                                    store.q[qIndex].thinkers.forEach(function(thinker){
                                    
                                        thinker.progress=100    
                                            
                                    })
                                    
                                    
                                    willMove = true

                                    var tableInDb = store.q[qIndex].origTable

                                    moveInTable(store.q[qIndex].moves[0].result.move, tableInDb)

                                    tableInDb.chat = [~~((timeNow - store.q[qIndex].started) / 10) / 100 + 'sec'] //1st line in chat is timeItTook

                                    store.q[qIndex].moves.forEach(function(returnedMove) {

                                        tableInDb.chat = tableInDb.chat.concat({

                                            // hex: returnedMove.result.value.toString(16),
                                            score: returnedMove.result.value,

                                            moves: returnedMove.result.moveTree,
                                            
                                            thinker: returnedMove.doneBy

                                        })

                                    })

                                    tableInDb.moveTask = {}
                                    
                                    //this.nakedQ()

                                    mongodb.connect(cn, function(err2, db2) {

                                        db2.collection("tables")
                                            .save(tableInDb, function(err3, res) {

                                                publishTable(tableInDb)
                                                
                                                db2.close()
                                                
                                                

                                                store.q.splice(qIndex, 1)

                                                //clients.publishView('admin.html', 'default', 'splitMoves', store.nakedQ)

                                            })
                                    })

                                }

                            }

                        })
                        
                        if(!noNaked)this.nakedQ()

                    }

                    if (data.final) {
                        
                        var assistData=getAssistData(qIndex,tIndex,timeNow)
                        
                        if(assistData&&!willMove){
                            
                            this.assist(assistData.assisted,assistData.assistant,qIndex,assistData.assistedIndex,timeNow)
                            
                        }else{
                            
                            //check if we can assist other tables
                            
                            this.assistOtherTables(connection)    //done already
                            
                        }

                    }

                    clients.publishView('board.html', gameID, 'busyThinkers', getNakedThinkers(qIndex))
                    
                    this.publishNakedQ()
                    
                }
                  
            }else{
                this.assistOtherTables(connection)
            }

			

		} 
	}
    
    var publishTable=function(dbTable){
        
        clients.publishView('board.html', dbTable._id, 'dbTable.table', dbTable.table)

        clients.publishView('board.html', dbTable._id, 'dbTable.wNext', dbTable.wNext)

        clients.publishView('board.html', dbTable._id, 'dbTable.chat', dbTable.chat)

        clients.publishView('board.html', dbTable._id, 'dbTable.moves', dbTable.moves)

        
    }

    var getAssistData=function(qIndex,tIndex,timeNow){
        
					////console.log('thinker finished, starting assist..')

					var thinkerToHelp = undefined

					var tempBackIn = 0
                    var tHelpIndex

					var found = false

					store.q[qIndex].thinkers.forEach(function(thinkerInMove, index) {

						if (thinkerInMove.movesLeft) { //

							var accuBackIn = thinkerInMove.beBackAt - timeNow


							if (accuBackIn > 1000) {

								var diff = thinkerInMove.beBackIn - accuBackIn
								var percDone = diff / thinkerInMove.beBackIn

								var guessedMovesLeft = (1 - percDone) * thinkerInMove.movesLeft

								if (guessedMovesLeft < 1) {

									//should be done soon, check it again with settimeout from here???!!!!!!!!!!!!!!!!!!!

								} else {

									if (accuBackIn > tempBackIn) {

										thinkerInMove.guessedMovesLeft = guessedMovesLeft
										thinkerInMove.accuBackIn = accuBackIn

										thinkerToHelp = thinkerInMove
                                        tHelpIndex=index
										tempBackIn = accuBackIn

									}

									found = true

								}

							}

						}

					})

					if (found) {
						
						if (thinkerToHelp.thinker) {
							
                            return{
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
				moveIndex:move.moveIndex,
                done:move.done,
                doneBy:move.doneBy,//.result.thinker
                startedBy:move.sentToName,
                history:move.history,
			})
		})

		return naked

	}

	this.assist = function(assisted, assistant, qIndex, tIndex, timeNow) {
        
        

		var moves = getAssistMoves(assisted, assistant)
        
        if(moves.length>0){
            
            
            
            moves.forEach(function(move){
                    move.history.push('assist: '+assistant.connection.addedData.lastUser   )
                })
            
            assistant.progress=0
        
            clients.sendTask(new Task('removeSplitMove', moves, 'remove splitMove'), assisted.connection)
            
            
            //console.log('joez??',tIndex)
            
            store.q[qIndex].thinkers[tIndex].sentCount-=moves.length
            
            removeSentMove(store.q[qIndex].thinkers[tIndex], moves, timeNow)
            
            

            var sentTo=clients.sendTask(new Task('splitMove', moves, 'assist splitMove'), assistant.connection)
            
            registerSentMoves(moves[0].sharedData.gameNum, sentTo, moves.length, moves, assistant.connection)

            
        }
        
	}

	var getAssistMoves = function(assisted, assistant) {

		var result = []

		var count = 0

		var assistantSpeed = assistant.smTakes

		var assistedSpeed = assisted.accuBackIn / assisted.guessedMovesLeft
        
        
		var assistedBackIn = assisted.accuBackIn
        
        console.log('assist stat...     assistantSpeed',assistantSpeed,' assistedSpeed',assistedSpeed,'assistedBackIn',assistedBackIn)

		var maxMoves = assisted.guessedMovesLeft

		var fromMoves = assisted.sentMoves

		//var more = false

		while(assistantSpeed * count < assistedBackIn - (assistedSpeed * count)){
        
				count++
			
		}
        
        count--

        console.log('assist resulted in...     maxMoves',maxMoves,' count',count)


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

			//console.log('no id')

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
