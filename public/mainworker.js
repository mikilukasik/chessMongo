importScripts('brandNewAi.js')
importScripts('engine.js')
importScripts('js/deepening.js')
importScripts('js/classes.js')
importScripts('js/httpreq.js')

//test
simpleGet('/forceStop?t=99', function(res) {
	console.log('returned: ', res)
		//alert('returned')
})

var sendID
var mySpeed
var maxWorkerNum


var pendingLongEchoes

var longPollOnHold




var pollOn = true		//we only make this false before restart

var longPollTasks = function(taskNum,sendID,mySpeed) {	
	
	
	var speedTestNum = 1 //temp
	

	simpleGet('/longPollTasks?id=' + sendID + '&tn=' + taskNum + '&spd=' + mySpeed + '&stn=' + speedTestNum, 
		
		function(res) {
		// 1 task received
			var task=eval("(" + res.response + ')')		//http://stackoverflow.com/questions/45015/safely-turning-a-json-string-into-an-object
			
			console.log('mw: task received: ', task)
			
			switch(task.command){
				
				case 'longEcho':
					//
					
					pendingLongEchoes=maxWorkerNum
					
					pollOn=false
					
					longPollOnHold=function(){
						longPollTasks(taskNum+1,sendID,mySpeed)
					}
					
					
					for(var i=maxWorkerNum-1;i>=0;i--){
						
						toSub('longEcho',{})
						
						
					}
		
			break;
			
				
				
				
			}

			//taskNum = res.response.taskNum

			if (pollOn){
				
				console.log('mw: pollOn true, recalling longPollTasks (task '+(taskNum+1)+')')
				longPollTasks(taskNum+1,sendID,mySpeed) //recall for new task, server might hold any new task until this one finishes
			
			} 	
		},function(err){
					
			if (pollOn) {
					
				console.log('mw: longPollTasks returned error, waiting 2 secs')
		
				setTimeout(function(){
					
					console.log('mw: retrying longPollTasks (task '+(taskNum)+')')
					
					longPollTasks(taskNum,sendID,mySpeed) 
				},2000)
			}
			
			
			
		}) 
		
}

onmessage = function(event) {

	var reqCommand = event.data.reqCommand
	var reqData = event.data.reqData;
	// var reqMessage = event.data.reqMessage;

	// var resData;
	// var resCommand;
	// var resMessage;
	
	console.log('mainWorker onmessage event.data: ',event.data)

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
				console.log('hurray')
				pollOn=true
				longPollOnHold()
			}

			break;
			
			
			
		case 'start':
			
			//setting main vars
			sendID=reqData.sendID
			mySpeed=reqData.mySpeed
			maxWorkerNum=reqData.maxWorkerNum
			
			
			longPollTasks(1,sendID,mySpeed)		//initial longpoll
			
		
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