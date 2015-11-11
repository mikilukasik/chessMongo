importScripts('brandNewAi.js')
importScripts('engine.js')
importScripts('js/deepening.js')

	

////////////////////worker func

// var workerI = 0;

// function timedCount() {
//     workerI++// = workerI + 1;
//     postMessage('a'+checkSpeed());
//     setTimeout("timedCount()",500);
// }

// timedCount();

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
			
			
			//console.log('solveSdt in worker')
			
			resMessage = 'sdtSolved'
			resData = solveDeepeningTask(reqData,'sdt')
			resData._id=reqData._id
			resCommand = 'sdtSolved'

			//console.log('solveSdt goes back to main thread')
			

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
