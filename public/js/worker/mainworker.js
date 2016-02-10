importScripts('../all/classes.js')
importScripts('../all/engine.js')
importScripts('../all/brandNewAi.js')
importScripts('../worker/deepening.js')

var sendID
var mySpeed
var maxWorkerNum
var ranCount = 0
var longEchoStarted
var splitMoveStarted
var totalSolved
var workingOnGameNum = 0
	//var progress.splitMoves
	//var progress.moves
var pendingLongEchoes
var longPollOnHold
var toPostSplitMoves
var pollingTask = -1
var workingOnDepth
var forgetItAll=false
var throwAwayGame=-1

var sendSpeedStats=false



var messageTheServer = function(command, data, message, cb) {

	var postThis = {

		'command': command,
		'data': data,
		'message': message,
		'thinker': sendID
	}

	toServer('thinkerMessage', postThis, 'thinkerMessage', function() {})

	if (cb) cb()

}

function saveValOnServer(name, value) {

	messageTheServer('saveVal', {

		name: name,
		value: value

	}, 'saveVal: ' + name + ': ' + value, function() {})

}

var sendLog = function(message) {

	messageTheServer('log', {}, message)

}

//var workDeepSplitMovesStarted
//var progress.waitingSdts
//var progress.sentSdtCount

var pollOn = true //we only make this false before restart			//not true

var progress = {}

//var progress.tempDTasks=[]

function workerMove(smallMoveTask, thinker) { // smallmovetask has one of my possible 1st moves

	var deepeningTask = new DeepeningTask(smallMoveTask)

	oneDeeper(deepeningTask) //this will make about 30 smalldeepeningtasks from the initial 1 and create deepeningtask.resolverarray
		//first item in deepeningtask.smalldeepeningtasks is trigger

	//!!!!!!!!!!!implement !!!!!!!!!!typedarray

	progress.tempDTasks = deepeningTask

	progress.waitingSdts = []

	progress.sentSdtCount = deepeningTask.smallDeepeningTasks.length - 1

	progress.oneDeeperMoves = progress.sentSdtCount //set this splitmoves max
    
	progress.doneDM = 0 //val
    progress.doneDMtotal = 0 //val
    

	
    for (var j = maxWorkerNum; j > 0; j--) {

		if (deepeningTask.smallDeepeningTasks.length > 1) {

			waitingForIdle++

			var smallDeepeningTask = deepeningTask.smallDeepeningTasks.pop()
            
            smallDeepeningTask.progress=deepeningTask.progress

			toSub('solveSDT', smallDeepeningTask)

		}

	}

}

function mwProcessDeepSplitMoves(data, thinker) { //mt, modConst, looped) {

	//var rtnData = []

	if (data.length > 0) {

		var newData = data.pop()

		workerMove(newData, thinker)

	}
	//return rtnData
}

var speedTestOn = false
var speedTestStarted


var lastOverallProgressCalc = new Date()

var lastResultSent = new Date()

var taskReceived = function(task) {
	// 1 task received
	
	console.log('received', task)

	pollingTask = task.data.tn + 1
    
    

	switch (task.command) {
        
        
        
        case "removeSplitMove":
        
            sendSpeedStats=false
        
            task.data.forEach(function(moveToRemove){
                
                progress.splitMoves--
                
                for(var i=progress.moves.length-1;i>=0;i--){
                    
                    
                    if(progress.moves[i].moveIndex==moveToRemove.moveIndex){
                        
                        console.log('got help, removing move',progress.moves[i].moveIndex)
                        progress.moves.splice(i,1)
                    }
                    
                }
                
                
                
            })
            
            if (progress.splitMoves<=0){
                
                var sendThis={

                            final: true,
							
                            _id: workingOnGameNum,
							
                            
                           // dmpm:,
                            depth: workingOnDepth,
                            
                            smTakes:10000,
                            
                            //results:sendResults

                        }
                        
                if(sendSpeedStats){
                    sendThis.dmpm= ~~(60000 * progress.splitMoves * progress.overall / (tdate - progress.started))
                    
                    console.log('dmpm calc:',sendThis.dmpm,tdate)
                            
                            
                }
                
                messageTheServer('progress',sendThis,'',function(){
                            console.log('splitmove task done')
                        })
                
                
            }
        
        break;
        case 'forgetSplitMoves':
        
        
            console.log('should be forgetting moves on table',task.data.gameID)
            
            sendSpeedStats=false
            
            
            if(workingOnGameNum==0){
                
            }else{
               forgetItAll=true          //buggy??????????????!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
            }
              
        
        break;
        
		case "splitMove":
        
            sendSpeedStats=true

			splitMoveStarted = new Date() // remove this!!!!!!!!!!!!!!!!!!!!
            progress = {

				started: new Date(),

				splitMoves: 0, //totalcount
				oneDeeperMoves: 0,
				doneSM: 0, //donecount
				doneDM: 0,
                doneDmtotal: 0,

				moves: task.data,

				tempDTasks: [],
                
                queuedMoves: [],
                
                shouldIDraw:task.data[0].sharedData.shouldIDraw,
                
                origAllPastTables:task.data[0].sharedData.origAllPastTables,
                origTable:task.data[0].sharedData.origTable

				//updatedMoves:[]

			}

			progress.moves.forEach(function(splitMove) {

				splitMove.progress = {

					moveCoords: splitMove.moveCoords,
					moveIndex: splitMove.moveIndex,

					done: false,
					result: {},

					expected: undefined,

				}
                
                progress.queuedMoves[splitMove.moveIndex]={
                    done:false,
                    expectedIn:undefined,
                }

			})

			workingOnDepth = task.data[0].sharedData.desiredDepth        //global??!!!!!!!!!!!!

			if (task.data[0] != undefined) {
				//we received some moves

					workingOnGameNum = task.data[0].sharedData.gameNum
					
					progress.splitMoves = task.data.length //count

					mwProcessDeepSplitMoves(progress.moves, sendID) //starting to process splitmove from server


			} else {
				//error in receiving task

			}

			break;

		case 'longEcho':
			
			longEchoStarted = new Date().getTime()


			for (var i = maxWorkerNum - 1; i >= 0; i--) {

				toSub('longEcho', {})

			}

			break;
		case 'refresh':

			//asking main thread to refresh all web workers

			pollOn = false

			postMessage({
				'resCommand': 'refreshUs',
				'resMessage': 'refreshUs',
				'resData': {}

			})

			break;

		case 'speedTest':

			if (mySpeed == 1) mySpeed = 0.99 //!!!!!!!!!!!!!!!!!!!!!

		
			break;

	}

	
}

onmessage = function(event) {
    
    var tdate = Number(new Date())

	var reqCommand = event.data.reqCommand
	var reqData = event.data.reqData;

	switch (reqCommand) {
		case undefined:

			break;

		case 'echo':

			break;

		case 'retLongEcho':

			pendingLongEchoes--

			if (pendingLongEchoes == 0) {

				pollOn = true
				longPollOnHold()
				var longEchoTook = new Date().getTime() - longEchoStarted

			}

			break;

		case 'taskReceived':

			taskReceived(reqData)

			break;

		case 'start':

			//setting main vars
			sendID = reqData.sendID
			mySpeed = reqData.mySpeed
			maxWorkerNum = reqData.maxWorkerNum

			
			break;

		case 'sdtSolved':
        
       
        
			var resData = event.data.reqData
            
             if(throwAwayGame!=resData.gameNum){
                 
                 
                 
                 
            //console.log(resData.gameNum)
       
            
			progress.doneDM++
            progress.doneDMtotal++

            waitingForIdle--

            //tdate = Number(new Date())

			var toPush = {
				move: resData.moveTree.slice(0, 4),
				value: resData.score,
				score: resData.score,
				moveTree: resData.moveTree,
				solved: resData.solved,
				_id: workingOnGameNum, 
				depth: resData.desiredDepth,
				thinker: sendID,
				
			}

			progress.waitingSdts.push(toPush)

			if (progress.waitingSdts.length == progress.sentSdtCount) {
				///////////////////////////////////////////////
				//all SDTs returned,
				//resolve one splitmove now:
				//////////////////////////////////////////////////

				progress.doneSM++
             
               
				var tempResolveArray = []
                
				tempResolveArray[1] = []
				tempResolveArray[2] = progress.waitingSdts
				tempResolveArray[3] = []

				resolveDepth(2, tempResolveArray) //some hack to do 2nd level resolved deepmovetask
                
                
                
				var pushAgain = tempResolveArray[1][0]
				var moveStr=pushAgain.moveTree.slice(0, 4)
                
                if(!progress.shouldIDraw){
                    
                    var movedTable=moveIt(moveStr,progress.origTable)
                    //console.log(movedTable)
                    var wouldLoop=evalFuncs.checkIfLooped(movedTable,progress.origAllPastTables)
                    console.log(wouldLoop)
                    
                    
                }
                
				pushAgain.moveIndex=resData.progress.moveIndex
				pushAgain._id = workingOnGameNum
				pushAgain.score = pushAgain.value
				pushAgain.thinker = sendID.toString() //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
				pushAgain.move = moveStr

				if (toPostSplitMoves == undefined) toPostSplitMoves = []
				toPostSplitMoves.push(pushAgain)
                
                var thisResult=pushAgain
                
                
                   if(progress.pendingResults){
                            progress.pendingResults.push(thisResult)
                        }else{
                            progress.pendingResults=[thisResult]
                        }
                        
                        
				if (progress.splitMoves - toPostSplitMoves.length < 1) {
					//we worked out all the splitmoves


                    var postThis = toPostSplitMoves

                    postThis[0]._id = workingOnGameNum
                    postThis[0].sendID = sendID.toString() //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1


                       var sendResults=progress.pendingResults.slice()
                        progress.pendingResults=[]
                         
                         
                       var sendThis=  {

                            final: true,
							
                            _id: workingOnGameNum,
							
                            
                            
                            depth: workingOnDepth,
                            
                            smTakes:(tdate-progress.started)/progress.splitMoves,
                            
                            
                            results:sendResults

                        }
                        
                        if(sendSpeedStats){
                           sendThis.dmpm= ~~(60000 * progress.splitMoves / (tdate - progress.started))
                           
                           console.log('dmpm',sendThis.dmpm,tdate)
                        }
                         
                         
                        //console.log('smTakesCalc:',(tdate-progress.started)/progress.splitMoves,tdate,progress.started,progress.splitMoves)
                        messageTheServer('progress',sendThis,'',function(){
                            console.log('splitmove task done')
                        })

					workingOnGameNum = 0 //available again
					toPostSplitMoves = []
					progress.waitingSdts = []

					totalSolved = 0

				} else {
					//still moves to work on
                    
                       
                    
                    if (tdate - lastResultSent > 256) {
                        
                        var sendResults=progress.pendingResults.slice()
                        progress.pendingResults=[]
                        
                        var sendThis={
                           
                            

                            final: false,
                            
                            movesLeft: progress.splitMoves-progress.doneSM,
							//moveIndex: resData.progress.moveIndex,
                            
                            _id: workingOnGameNum,
                            
                            //smTakes:progress.smTakes,
                            
                           
                            
                           
                            
                            depth: workingOnDepth,
                            
                            results:sendResults
                            
                        }
                        
                        // if(sendSpeedStats){
                        //     var dmpm=~~(60000 * progress.doneDMtotal / (tdate - progress.started))
                        
                        //     console.log('dmpm calc:',dmpm,tdate,progress.doneDMtotal)
                            
                        //     sendThis.dmpm=dmpm
                            
                        // }
                        
                    
                       messageTheServer('progress', sendThis)
                        
                        lastResultSent   = tdate
                        
                    }else{
                        
                    }
                    
                   

					mwProcessDeepSplitMoves(progress.moves, sendID, ranCount)

				}
                
			} else {

				if (waitingForIdle == 0) {
                            
                    if (forgetItAll){
                                    
                        forgetItAll=false
                                    
                        progress = {

                           // started: new Date(),
                           
                           tempDTasks : [],

	                       waitingSdts : [],

	                       sentSdtCount :0,

	
    

                            splitMoves: 0, //totalcount
                            oneDeeperMoves: 0,
                            doneSM: 0, //donecount
                            doneDM: 0,
                            doneDMtotal: 0,

                            moves: [],

                            
                            queuedMoves: []

                            //updatedMoves:[]

                        }
                        
                        workingOnGameNum=0
                        
                        messageTheServer('progress', {

                            final: true,
                            
                            forced: true,
                           
                        })
                                
                            
                        
                        
                    }else{
                        
                            
                        if (tdate - lastOverallProgressCalc > 256&&tdate - lastResultSent >256) {

                            progress.overall = progress.doneSM * (100 / progress.splitMoves) + (progress.doneDM * (100 / progress.oneDeeperMoves)) / progress.splitMoves

                            var beBackIn = ~~(((tdate - progress.started) / progress.overall) * (100 - progress.overall))
                            var dmpm=undefined
                            
                          
                            
                            var sendThis={
                                
                                final: false,
                                
                                movesLeft: progress.splitMoves-progress.doneSM,
                                
                                depth: workingOnDepth,
                                
                                _id: workingOnGameNum,
                                progress: progress.overall,
                                beBackIn: beBackIn,
                              //  dmpm: dmpm

                            }
                            
                            

                            if (sendSpeedStats) {
                                
                                
                                sendThis.dmpm = ~~(60000 * progress.splitMoves * progress.overall / (tdate - progress.started)) / 100
                                
                                
                                //console.log('dmpm',sendThis.dmpm,tdate)
                                
                            }
                            
                            
                            messageTheServer('progress',sendThis, 'progress', function() {

                                for (var j = maxWorkerNum; j > 0; j--) {

                                    if (progress.tempDTasks.smallDeepeningTasks.length > 1) {

                                        waitingForIdle++

                                        var deepeningTask = progress.tempDTasks //.pop()

                                        var smallDeepeningTask = deepeningTask.smallDeepeningTasks.pop()
                                        
                                        smallDeepeningTask.progress=deepeningTask.progress
                                        
                                        //console.log('temp',smallDeepeningTask)
                                        
                                        toSub('solveSDT', smallDeepeningTask)

                                    }

                                }

                            })

                            lastOverallProgressCalc = tdate
                        } else {

                            for (var j = maxWorkerNum; j > 0; j--) {

                                if (progress.tempDTasks.smallDeepeningTasks.length > 1) {

                                    waitingForIdle++

                                    var deepeningTask = progress.tempDTasks //.pop()

                                    var smallDeepeningTask = deepeningTask.smallDeepeningTasks.pop()
                                    
                                    smallDeepeningTask.progress=deepeningTask.progress

                                    toSub('solveSDT', smallDeepeningTask)

                                }

                            }

                        }
                        
                    }


				}

			}
                 
                 
                 
                 
                 
                 
                 
                 
                 
                 
                 
                 
                 
                 
                 
                 
                 
             }
            

			break;

	}

};

var waitingForIdle = 0

function toSub(command, data) {

	postMessage({
		'resCommand': 'toSub',
		'resMessage': 'toSub',
		'resData': {
			command: command,
			data: data
		}

	})

}

function toServer(command, data, message, cb) {

	postMessage({
		'resCommand': 'toServer',
		'resMessage': 'toServer',
		'resData': {
			command: command,
			data: data,
			message: message,

		}

	})

	if (cb) cb()

}

////////////////////worker func end
