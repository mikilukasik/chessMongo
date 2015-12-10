importScripts('brandNewAi.js')
importScripts('engine.js')
importScripts('deepening.js')
importScripts('classes.js')

	
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
			
			
			case 'longEcho':
//
			resMessage = 'toMain longEcho'
			resData = {
				command: 'retLongEcho'
			}
			resCommand = 'toMain'


			break;
			
			case 'solveSDT':
			
			
				////console.log('solveSdt in worker')
				
				resCommand = 'toMain'
				resMessage = 'toMain solveSDT'
				
				var result=solveDeepeningTask(reqData,'sdt')
				result._id=reqData._id
				
				
				resData = {
					command: 'sdtSolved',
					data: result,
					
				}
				
				
					

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

postMessage({
		// command:undefined,
		'resMessage': 'imUp',
		'resData': 'imUp',
		'resCommand': 'imUp'
	});


/////////////////////worker func end
