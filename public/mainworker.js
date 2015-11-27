importScripts('brandNewAi.js')
importScripts('engine.js')
importScripts('js/deepening.js')
importScripts('js/classes.js')
importScripts('js/httpreq.js')

// //test
// simpleGet('/forceStop?t=99', function(res) {
// 	sendMessage('returned: ', res)
// 		//alert('returned')
// })

var sendID
var mySpeed
var maxWorkerNum

var ranCount=0

var longEchoStarted
var splitMoveStarted

var totalSolved

var workingOnTableNum = 0


var totalSplitMovesReceived
var splitMovesToProcess

var pendingLongEchoes

var longPollOnHold

var toPostSplitMoves


var messageTheServer = function(message) {
			simplePost('/thinkerMessage', message, function(res) {}, function(err) {})
			
	}

var sendMessage = function(message) {

			console.log(message)

			messageTheServer({

				'command': 'log',
				'message': message,
				'thinker': sendID

			})
	}

var workDeepSplitMovesStarted
var waitingSdts
var sentSdtCount

var pollOn = true		//we only make this false before restart

function workerMove(smallMoveTask, thinker) { //for 1 thread, smallmovetask has one of my possible 1st moves

			workDeepSplitMovesStarted = new Date()
				.getTime()

			// var solvedTableCount = 0

			// var value = 0

			var deepeningTask = new DeepeningTask(smallMoveTask)

			oneDeeper(deepeningTask) //this will make about 30 smalldeepeningtasks and create the resolverarray in the deepeningtask
				//first iitem in deepeningtask.smalldeepeningtasks is trigger

			waitingSdts = []
			sentSdtCount = deepeningTask.smallDeepeningTasks.length - 1

			while (deepeningTask.smallDeepeningTasks.length > 1) {

				var smallDeepeningTask = deepeningTask.smallDeepeningTasks.pop()

				toSub('solveSDT',smallDeepeningTask)

			}

		}

function mwProcessDeepSplitMoves(data, thinker){//mt, modConst, looped) {


			//var rtnData = []

			if (data.length > 0) {

				var newData = data.pop()

				workerMove(newData, thinker)


			}
			//return rtnData
		}

var longPollTasks = function(taskNum,sendID,mySpeed) {	
	
	
	var speedTestNum = 1 //temp
	

	simpleGet('/longPollTasks?id=' + sendID + '&tn=' + taskNum + '&spd=' + mySpeed + '&stn=' + speedTestNum, 
		
		function(res) {
		// 1 task received
			var task=eval("(" + res.response + ')')		//http://stackoverflow.com/questions/45015/safely-turning-a-json-string-into-an-object
			
			sendMessage('mw: command received: '+ task.command)
			
			switch(task.command){
				
				case 'longEcho':
					//
					longEchoStarted=new Date().getTime()
					
					pendingLongEchoes=maxWorkerNum
					
					pollOn=false
					
					longPollOnHold=function(){
						longPollTasks(taskNum+1,sendID,mySpeed)
					}
					
					
					for(var i=maxWorkerNum-1;i>=0;i--){
						
						toSub('longEcho',{})
						
						
					}
		
			break;
			
				case "splitMove":

					

					splitMoveStarted = new Date()
						.getTime()

					totalSolved = 0




					if (task.data[0] != undefined) {
						//we received some moves


						if (workingOnTableNum == 0) {
							//thinker is idle
							//mark it busy
							
							workingOnTableNum = task.data[0]._id


							//ifWorkers(function() {
								//workers supported, let's calc 

								

								//var splitMoveCount = task.data.length	//kell ez???
								
								totalSplitMovesReceived = task.data.length //we need this to know when we worked them all out

								splitMovesToProcess = task.data


								mwProcessDeepSplitMoves(splitMovesToProcess, sendID)			//starting to process splitmove from server
								
						
						} else {
							//thinker is already calculating something
							
							sendMessage('thinker is busy')



						}

					} else {
						//error in receiving task



					}
					

					break;

			
				
				
				
			}

			if (pollOn){
				
				sendMessage('mw: pollOn true, recalling longPollTasks (task '+(taskNum+1)+')')
				longPollTasks(taskNum+1,sendID,mySpeed) //recall for new task, server might hold any new task until this one finishes
			
			} 	
		},function(err){
					
			if (pollOn) {
					
				sendMessage('mw: longPollTasks returned error, waiting 2 secs')
		
				setTimeout(function(){
					
					sendMessage('mw: retrying longPollTasks (task '+(taskNum)+')')
					
					longPollTasks(taskNum,sendID,mySpeed) 
				},2000)
			}
			
			//
			
		}) 
		
}

onmessage = function(event) {

	var reqCommand = event.data.reqCommand
	var reqData = event.data.reqData;
	// var reqMessage = event.data.reqMessage;

	// var resData;
	// var resCommand;
	// var resMessage;
	
	//sendMessage('mainWorker onmessage event.data.command: '+event.data.command)

	switch (reqCommand) {
		case undefined:

			break;

		case 'echo':
			
			// resMessage = 'echo: '+reqMessage
			// resData = reqData
			// resCommand = 'reEcho'

			break;
			
		case 'retLongEcho':
			
			pendingLongEchoes--
			
			if(pendingLongEchoes==0){
				//sendMessage('hurray')
				pollOn=true
				longPollOnHold()
				var longEchoTook=new Date().getTime()-longEchoStarted
				sendMessage('longEcho done in '+longEchoTook+' ms.')
			}

			break;
			
			
			
		case 'start':
			
			//setting main vars
			sendID=reqData.sendID
			mySpeed=reqData.mySpeed
			maxWorkerNum=reqData.maxWorkerNum
			
			
			longPollTasks(1,sendID,mySpeed)		//initial longpoll
			
		
			break;
			
		case 'sdtSolved':
				
					/// solved  smalldeepeningtask returned from worker
					
					var resData = event.data.reqData
					
					totalSolved+=resData.ranCount
					
					var toPush = { 
						move: resData.moveTree.slice(0, 4),
						value: resData.score,
						score: resData.score,
						moveTree: resData.moveTree,
						solved: resData.solved,
						_id: workingOnTableNum, // resData._id,
						depth: resData.desiredDepth,
						thinker: sendID,
						ranCont: resData.ranCount
					}

					waitingSdts.push(toPush)
						
					if (waitingSdts.length == sentSdtCount) {
						///////////////////////////////////////////////
						//all SDTs returned,
						//resolve one splitmove now:
						//////////////////////////////////////////////////

						//////console.log('resolve now: '+$scope.waitingSdts[0].moveTree)

						var tempResolveArray = []
						tempResolveArray[1] = []
						tempResolveArray[2] = waitingSdts
						tempResolveArray[3] = []

						resolveDepth(2, tempResolveArray) //some hack to do 2nd level resolved deepmovetask
							//use tempResolveArray[1][0].value

						var pushAgain = tempResolveArray[1][0]
							////console.log('ran again')

						pushAgain._id = workingOnTableNum
						pushAgain.score = pushAgain.value
						pushAgain.thinker = sendID
						pushAgain.move = pushAgain.moveTree.slice(0, 4)

						if(toPostSplitMoves==undefined)toPostSplitMoves=[]
						toPostSplitMoves.push(pushAgain)

						if (totalSplitMovesReceived - toPostSplitMoves.length == 0) {
							//we worked out all the splitmoves

							var postThis = toPostSplitMoves

							postThis[0]._id = workingOnTableNum
							
							
							workingOnTableNum = 0 //available again
							toPostSplitMoves = []
							waitingSdts = []
							
							//var timeNow=new Date().getTime()
							//var timeItTook2 = timeNow - initialWorkerSpeedTestStarted
							//var timeItTook3 = timeNow - splitMoveStarted
							

							//var tempSpd
							//var percDiff// = $scope.setWorkerSpeed($scope.totalSolved, timeItTook2)
							

							// if ($scope.initialSpeedTestOn) {
							// 	$scope.initialSpeedTestOn = false
								
							// 	/////////////////initial speedTest finished
							// 	$scope.speedTestNum=Math.random()
								
							// 	percDiff = $scope.setWorkerSpeed($scope.totalSolved, timeItTook2)
							
								
							// 	$scope.sendMessage('workers t/ms: ' + Math.floor(($scope.totalSolved/ timeItTook2) * 100) / 100 + ' (' +percDiff + '%, '+ $scope.totalSolved + ' / '+timeItTook2+')')
									
									
							// 		//should do the rest of the speedTests here!!!!!!!
									
									
							// 	//!!!!!!!!!!!!!!temp longPollTasks() //start initial longpoll

							//} else {
								
								/////////////////splitMove(s) finished
								
								
							
								simplePost('/myPartIsDone', postThis, function(req, res) {
								
									
								
								})
								
								//temp!!!!!!!!percDiff = setWorkerSpeed(totalSolved, timeItTook3)
							
								//sendMessage('solved, t/ms: ' + Math.floor((totalSolved/ timeItTook3) * 100) / 100 + ' (' +percDiff + '%, '+ $scope.totalSolved + ' / '+timeItTook3+')')
								
							//}

							totalSolved=0

						} else {
							//still moves to work on
							
							mwProcessDeepSplitMoves(splitMovesToProcess, sendID, ranCount)


						}
					}


					//////console.log(event.data.resData)

					break;
	

	}

	// postMessage({
	// 	// command:undefined,
	// 	'resMessage': resMessage,
	// 	'resData': resData,
	// 	'resCommand': resCommand
	// });

};

function toSub(command,data){
	
	
	
	postMessage({
		'resCommand': 'toSub',
		'resMessage': 'toSub',
		'resData':	{
						command:command,
						data:data
					}
		
	})
	
	
}



////////////////////worker func end