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

function workerMove(smallMoveTask, thinker) { //for 1 thread, smallmovetask has one of my possible 1st moves

	
	var deepeningTask = new DeepeningTask(smallMoveTask)

    //console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~',deepeningTask.progress)

	oneDeeper(deepeningTask) //this will make about 30 smalldeepeningtasks from the initial 1 and create deepeningtask.resolverarray
		//first item in deepeningtask.smalldeepeningtasks is trigger

	//!!!!!!!!!!!implement !!!!!!!!!!typedarray

	progress.tempDTasks = deepeningTask

	progress.waitingSdts = []

	progress.sentSdtCount = deepeningTask.smallDeepeningTasks.length - 1

	progress.oneDeeperMoves = progress.sentSdtCount //set this splitmoves max
    
	progress.doneDM = 0 //val

	
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

// function speedTest(){

// 	//console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx that shit was actually called..')

// 	if (workingOnGameNum == 0) {
// 		workingOnGameNum = -1				//speedTest tableNum

// 		speedTestStarted = new Date()
// 						.getTime()

// 		totalSolved = 0

// 		var stTable= new Dbtable(-1)

// 		var aiTable = new MoveTask(stTable)

// 		aiTable.movesToSend=[aiTable.movesToSend[0],aiTable.movesToSend[1],aiTable.movesToSend[2]]

// 		progress.moves = aiTable.movesToSend

// 		progress.splitMoves = progress.moves.length //we need this to know when we worked them all out

// 		mwProcessDeepSplitMoves(progress.moves, sendID)

// 	}else{
// 		sendLog("can't start speedTest, thinker is busy")
// 	}

// }

// var longPollTasks = function(taskNum,sendID,mySpeed) {	

// 	var speedTestNum = 1 //temp

// 	toServer('longPollTasks',{
// 		id:sendID,
// 		tn: taskNum,
// 		spd: mySpeed,
// 		stn:speedTestNum
// 	})

// }

var lastOverallProgressCalc = new Date()

var lastResultSent = new Date()

//var globalCounter=new Uint32Array([0])
//var globalTimer

var taskReceived = function(task) {
	// 1 task received
	//var task=eval("(" + res.response + ')')		//http://stackoverflow.com/questions/45015/safely-turning-a-json-string-into-an-object

	//sendLog('mw: command received: '+ task.command)

	console.log('received', task)

	pollingTask = task.data.tn + 1

	switch (task.command) {

		case "splitMove":

			splitMoveStarted = new Date() // globalTimer//new Date().getTime()

			progress = {

				started: new Date(),

				splitMoves: 0, //totalcount
				oneDeeperMoves: 0,
				doneSM: 0, //donecount
				doneDM: 0,

				moves: task.data,

				tempDTasks: []

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

			})

			workingOnDepth = task.data[0].sharedData.desiredDepth

			if (task.data[0] != undefined) {
				//we received some moves

				if (workingOnGameNum == 0) {
					//thinker is idle
					//mark it busy

					workingOnGameNum = task.data[0].sharedData.gameNum
					
					progress.splitMoves = task.data.length //count

					mwProcessDeepSplitMoves(progress.moves, sendID) //starting to process splitmove from server

				} else {
					//thinker is already calculating something

					sendLog('thinker is busy')

				}

			} else {
				//error in receiving task

			}

			break;

		case 'longEcho':
			//
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

			if (mySpeed == 1) mySpeed = 0.99 //at initial, temp, !!!!!!!!otherwise server would keep trying to test us

			//call speedtest

			// pollOn=false

			// longPollOnHold=function(speed){
			// 	longPollTasks(pollingTask,sendID,speed)
			// }

			//speedTest()

			break;

	}

	// if (pollOn&&task.command!='dontCall'){

	// 	//sendLog('mw: pollOn true, recalling longPollTasks (task '+(taskNum+1)+')')

	// 	longPollTasks(pollingTask,sendID,mySpeed) //recall for new task, server might hold any new task until this one finishes

	// } 	
}

onmessage = function(event) {

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

			// longPollOnHold=function(speed){
			// 			longPollTasks(1,sendID,speed)
			// 		}

			//speedTest()

			break;

		case 'sdtSolved':

			var resData = event.data.reqData
            
            // console.log(resData.progress)

			progress.doneDM++

            waitingForIdle--

            var tdate = new Date()

			// globalCounter[0]++//+=new Number(resData.counter)

			var toPush = {
				move: resData.moveTree.slice(0, 4),
				value: resData.score,
				score: resData.score,
				moveTree: resData.moveTree,
				solved: resData.solved,
				_id: workingOnGameNum, // resData._id,
				depth: resData.desiredDepth,
				thinker: sendID,
				//counter: resData.counter
			}

			progress.waitingSdts.push(toPush)

			if (progress.waitingSdts.length == progress.sentSdtCount) {
				///////////////////////////////////////////////
				//all SDTs returned,
				//resolve one splitmove now:
				//////////////////////////////////////////////////

				progress.doneSM++
                if(progress.smTakes){
                    
                    progress.smReadings.push((tdate-progress.secondSmStarted)/progress.doneSM-1)
                    
                    if(progress.doit){
                        
                        progress.doit=false
                        
                        progress.smTakes=tdate-progress.secondSmStarted
                        
                    }else{
                        
                        
                        
                        var total=0
                        var len=progress.smReadings.length
                        
                        for (var i=len-1;i>=0;i--){
                            
                            total+=progress.smReadings[i]
                            
                        }
                        
                        
                        progress.smTakes=total/len
                        
                        
                    }
                    
                    
                    
                    
                }else{
                    
                    progress.secondSmStarted=tdate
                    
                    progress.smTakes=(tdate-progress.started)
                    progress.smReadings=[progress.smTakes]
                    
                    progress.doit=true
                    
                }
                //var 

				var tempResolveArray = []
                
				tempResolveArray[1] = []
				tempResolveArray[2] = progress.waitingSdts
				tempResolveArray[3] = []

				resolveDepth(2, tempResolveArray) //some hack to do 2nd level resolved deepmovetask
                
				var pushAgain = tempResolveArray[1][0]
				
				pushAgain.moveIndex=resData.progress.moveIndex
				pushAgain._id = workingOnGameNum
				pushAgain.score = pushAgain.value
				pushAgain.thinker = sendID.toString() //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
				pushAgain.move = pushAgain.moveTree.slice(0, 4)

				if (toPostSplitMoves == undefined) toPostSplitMoves = []
				toPostSplitMoves.push(pushAgain)
                
                var thisResult=pushAgain
                
                
                   if(progress.pendingResults){
                            progress.pendingResults.push(thisResult)
                        }else{
                            progress.pendingResults=[thisResult]
                        }
                        
                        
				if (progress.splitMoves - toPostSplitMoves.length == 0) {
					//we worked out all the splitmoves


                    var postThis = toPostSplitMoves

                    postThis[0]._id = workingOnGameNum
                    postThis[0].sendID = sendID.toString() //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1


                   //console.log('>>>>>>>>>>>>>>>>>>', postThis[0].speed)

                   // toServer('myPartIsDone', postThis, 'myPartIsDone', function() {
                       
                       var sendResults=progress.pendingResults.slice()
                        progress.pendingResults=[]
                          // console.log('(((((((((((((((((((((((((+'workingOnDepth'+)))))))))))))))))))))))))')
                        messageTheServer('progress', {

                            final: true,
							//moveIndex: resData.progress.moveIndex,
                            _id: workingOnGameNum,
							
                            
                            dmpm: ~~(60000 * progress.splitMoves / (tdate - progress.started)),
                            depth: workingOnDepth,
                            
                           smTakes:progress.smTakes,
                            
                            results:sendResults

                        })

                       // console.log('(((((((((', workingOnDepth, ')))))))))')

                  //  })

					
					workingOnGameNum = 0 //available again
					toPostSplitMoves = []
					progress.waitingSdts = []

					totalSolved = 0

				} else {
					//still moves to work on
                    
                       
                    
                    if (tdate - lastResultSent > 256) {
                        
                        var sendResults=progress.pendingResults.slice()
                        progress.pendingResults=[]
                    
                       messageTheServer('progress', {
                           
                            

                            final: false,
							//moveIndex: resData.progress.moveIndex,
                            
                            _id: workingOnGameNum,
                            
                            smTakes:progress.smTakes,
                            
                            dmpm: ~~(60000 * progress.splitMoves / (tdate - progress.started)),
                            depth: workingOnDepth,
                            
                            results:sendResults
                            
                            

                        })
                        
                        lastResultSent   = tdate
                        
                    }else{
                        
                    }
                    
                   

					mwProcessDeepSplitMoves(progress.moves, sendID, ranCount)

				}
			} else {

				if (waitingForIdle == 0) {

					if (tdate - lastOverallProgressCalc > 256&&tdate - lastResultSent >256) {

						progress.overall = progress.doneSM * (100 / progress.splitMoves) + (progress.doneDM * (100 / progress.oneDeeperMoves)) / progress.splitMoves

						var beBackIn
						var dmpm

						if (progress.overall > 0) {
							//var timeNow = new Date()
							beBackIn = ~~(((tdate - progress.started) / progress.overall) * (100 - progress.overall))
							dmpm = ~~(60000 * progress.splitMoves * progress.overall / (tdate - progress.started)) / 100
						}
						messageTheServer('progress', {
							
							final: false,
							
							depth: workingOnDepth,
                            
                            //smTakes:smTakes,
                            
							//moveIndex: undefined,//here!!!!
							_id: workingOnGameNum,
							progress: progress.overall,
							beBackIn: beBackIn,
							dmpm: dmpm

						}, 'progress', function() {

							for (var j = maxWorkerNum; j > 0; j--) {

								if (progress.tempDTasks.smallDeepeningTasks.length > 1) {

									waitingForIdle++

									var deepeningTask = progress.tempDTasks //.pop()

									var smallDeepeningTask = deepeningTask.smallDeepeningTasks.pop()
                                    
                                    smallDeepeningTask.progress=deepeningTask.progress
                                    
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
