importScripts('brandNewAi.js')
importScripts('engine.js')
importScripts('js/deepening.js')
importScripts('js/classes.js')
importScripts('js/httpreq.js')

//test
simpleGet('/forceStop?t=99',function(res){
	console.log('returned: ',res)
	//alert('returned')
})

var taskNum=1
var sendID='temp '+Math.random()
var mySpeed=1			//temp
var speedTestNum=1		//temp
var pollOn=true

var longPollTasks = function() {
	////console.log($scope.workerSpeed)

	simpleGet('/longPollTasks?id=' + sendID + '&tn=' + taskNum + '&spd=' + mySpeed + '&stn=' + speedTestNum,function(res) {

			// 1 task received

			console.log('mw: task received: ',res.response)

			taskNum = res.response.taskNum

			
			
			//$scope.sendMessage('task #' + response.data.taskNum + ' received, ' + response.data.command + ': ' + response.data.message)

			//$scope.doTask(response.data)


			//  if($scope.idle){
			if (pollOn) longPollTasks() //recall for new task, server might hold any new task until this one finishes
				//}
		})//, function(data) {
			//error, retry
		// 	$scope.receivedMessage = 'error'
		// 	$scope.refreshWhenUp() //retry kene?
		// })

}

longPollTasks()
































	
onmessage = function(event) {

	var reqCommand = event.data.reqCommand
	var reqData = event.data.reqData;
	var reqMessage = event.data.reqMessage;

	var resData;
	var resCommand;
	var resMessage;


	switch (reqCommand) {
		case undefined:

			break;

		case 'echo':
//
			resMessage = 'echo'
			resData = reqData
			resCommand = 'reEcho'


			break;
			
			case 'solveSdt':
			
			
			////console.log('solveSdt in worker')
			
			resMessage = 'sdtSolved'
			//var ranCount=0
			resData = solveDeepeningTask(reqData,'sdt')//,ranCount)
			resData._id=reqData._id
			//resData.ranCount=ranCount
			////console.log(ranCount)
			resCommand = 'sdtSolved'

			////console.log('solveSdt goes back to main thread')
			

			break;

		case 'speedTest':

			resMessage = 'speedTest done'
				//reqData=reqData
			resData = {
				speed: checkSpeed(),
				worker: reqData.worker
			}
			resCommand = 'speedTest'


			break;

		case 'bullShit':

			resMessage = 'dont bullshit'
			resData = undefined
			resCommand = 'bullshit'

			break;

	}


	postMessage({
		// command:undefined,
		'resMessage': resMessage,
		'resData': resData,
		'resCommand': resCommand
	});


};




////////////////////worker func end
