importScripts('brandNewAi.js')
importScripts('engine.js')
importScripts('deepening.js')
importScripts('classes.js')

importScripts('httpreq.js')

	
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
			resMessage = reqMessage
			resData = reqData
			resCommand = 'reEcho'


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



/////////////////////worker func end
