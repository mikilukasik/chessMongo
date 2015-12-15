		var maxWorkerNum = 8
		var nextWorkerNum = 0


		var mainWorker;
		var subWorkers = []


		function checkWorkerSupport() {
			
			if (typeof(Worker) != 'undefined') return true
			
			return false
		}

		var workerSupport = checkWorkerSupport()

		function ifWorkers(cb, nocb) {
			
			if (workerSupport) {
				
				cb()
				
			} else {
				
				nocb()
			}
			
		}


		var nextSubWorker = function(subWorkers) {
			if (nextWorkerNum < maxWorkerNum - 1) {
				nextWorkerNum++
			} else {
				nextWorkerNum = 0
			}
			return subWorkers[nextWorkerNum]
		}
		
		
		subWorkerMsgInThinker = function(event) {
			//check resCommand

			switch (event.data.resCommand) {
				
				case 'toMain':
				
					mainWorker.postMessage	
					
						({
																
							reqCommand: event.data.resData.command,			//string
							reqData: event.data.resData.data
							
						})
				
					
				
				break;
				
				case 'imUp':
				
					workerToStart--
					
					if(workerToStart==0){
						startTaskPoll()
					}
				
				
				break;

				

			}




		};



		
		var mainWorkerMsgInThinker = function(event) {
			

			switch (event.data.resCommand) {
				
				case 'toSub':
				
					nextSubWorker(subWorkers).postMessage	
					
						({
																
							reqCommand: event.data.resData.command,			//string
							reqData: event.data.resData.data
							
						})
				
					
				
				break;
				
				case 'refreshBrowser':
				
				
				
				break;
				
				case 'refreshUs':
				
					refreshWorkers()
				
				break;
				
			}
		}
				
		var workerToStart

		function startWorkers() {
			

			if (typeof(mainWorker) == "undefined") {
			
				mainWorker = new Worker("js/mainworker.js");
				mainWorker.onmessage = mainWorkerMsgInThinker
			
			}			
			
			
	

			workerToStart = 0
				
			while (workerToStart < maxWorkerNum) {

				subWorkers[workerToStart] = new Worker("js/subworker.js");

				var subWorkerNo = workerToStart
				
				subWorkers[subWorkerNo].onmessage = subWorkerMsgInThinker
				
				//init it here!!!!!!!!!!!!!
				
				workerToStart++

				
			}
			
			


			//here we started all workers, they'll message us when up. When all are up, we ask mw to start, that will do a speedtest and start longpolltasks
			
			

		}
		
		function startTaskPoll(){
			
			mainWorker.postMessage({
				reqCommand:'start',
				reqMessage:'start',
				reqData:{
					sendID: sendID,
					mySpeed: workerSpeed,
					maxWorkerNum: maxWorkerNum
				}
			})
			
			
		}



		function stopWorkers() {
			mainWorker.terminate();
			mainWorker = undefined;

			for (var i = 0; i < maxWorkerNum; i++) {

				subWorkers[i].terminate();
				subWorkers[i] = undefined;

			}
			
			return

		}
		
		
		var refreshWorkers=function(){
			stopWorkers()
			startWorkers()
			
		}

		function sendToWorker(command,data) {

			nextSubWorker(subWorkers).postMessage({
				
				reqCommand: command,			//string
				reqData: data
			})


		}

		// thinker stuff end		
		
		
		
		
		
		