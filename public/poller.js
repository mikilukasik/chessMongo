importScripts('brandNewAi.js')
importScripts('engine.js')
importScripts('deepening.js')
importScripts('classes.js')

importScripts('httpreq.js')



function postM(resCommand,resData,resMessage){
	
	postMessage({
				
		'resCommand': resCommand,
		'resData': resData,
		'resMessage': resMessage
		
	});
	
}

postM(1,2,3)
postMessage({
				
		'resCommand': 0,//resCommand,
		'resData': 1,//resData,
		'resMessage': 2//resMessage
		
	});



var btpOn=[]
var btPNum=[]
 
function busyThinkersPoll(_id){
	
	////     console.log(btPNum)
	
	if(btpOn[_id]) simpleGet('/busyThinkersPoll?t='+_id+'&p='+btPNum[_id],
		
		function(respo){
			
			var res=eval("(" + respo.response + ')')
			
			////     console.log('bthinkers received: ',res)
			
			postM(
				'updateBusyThinkers',
				{
					_id:_id,
					busyThinkers:res.busyThinkers
					
				},
				'updateBusyThinkers on t'+res._id
			)
			
			btPNum[_id]=res.pollNum
			
			busyThinkersPoll(_id)
			
		},function(err){
			
			setTimeout(busyThinkersPoll(_id),2000)
			
		}
	
	)
	
}



	
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
			
			
		case 'startBusyThinkersPoll':
		
			btpOn[reqData._id]=true
			btPNum[reqData._id]=-1
			busyThinkersPoll(reqData._id)
			
			//     console.log(btPNum)
		
		break;
		
		case 'stopBusyThinkersPoll':
		
			btpOn[reqData._id]=false
			
			
		
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

	postM(resCommand,resData,resMessage)

};




/////////////////////worker func end
