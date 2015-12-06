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

				

			}




		};



		
		mainWorkerMsgInThinker = function(event) {
			

			switch (event.data.resCommand) {
				
				case 'toSub':
				
					nextSubWorker(subWorkers).postMessage	
					
						({
																
							reqCommand: event.data.resData.command,			//string
							reqData: event.data.resData.data
							
						})
				
					
				
				break;
				
				case 'refreshUs':
				
					refreshWorkers()
				
				break;
				
			}
		}
				
				

		function startWorkers() {
			

			if (typeof(mainWorker) == "undefined") {
			
				mainWorker = new Worker("js/mainworker.js");
				mainWorker.onmessage = mainWorkerMsgInThinker
			
			}			
			
			
	

			var workerToStrart = 0
				
			while (workerToStrart < maxWorkerNum) {

				subWorkers[workerToStrart] = new Worker("js/subworker.js");

				var subWorkerNo = workerToStrart
				
				subWorkers[subWorkerNo].onmessage = subWorkerMsgInThinker
				
				//init it here!!!!!!!!!!!!!
				
				workerToStrart++

				
			}
			
			


			//here we have all workers running
			
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
		
		
		
		
		
		