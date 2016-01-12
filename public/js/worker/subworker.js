


importScripts('../all/classes.js')
importScripts('../all/engine.js')
importScripts('../all/brandNewAi.js')
importScripts('../worker/deepening.js')

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
			
			
				
				resCommand = 'toMain'
				resMessage = 'toMain solveSDT'
				
                //console.log(reqData.progress)
				var result=solveDeepeningTask(reqData,'sdt')
               
				result.gameNum=reqData.gameNum
				
				
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

		case 'init':

		
postMessage({
		// command:undefined,
		'resMessage': 'imUp',
		'resData': 'imUp',
		'resCommand': 'imUp'
	});


			break;

	}


	postMessage({
		// command:undefined,
		'resMessage': resMessage,
		'resData': resData,
		'resCommand': resCommand
	});


};

/////////////////////worker func end
