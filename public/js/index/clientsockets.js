
		var showTable = function() {}

		var socketOn = false

		var socketID = undefined

		var socketSend = function(command, data, message, cb) {}


		


		function sockets($rootScope, $scope) {
			if ("WebSocket" in window) {

				socketOn = true
					
				// Let us open a web socket
				var ws = new WebSocket('ws://' + document.location.host+ '/sockets/' );

				ws.onopen = function() {
					// Web Socket is connected, send data using send()




					socketSend = function(command, data, message, cb) {

						var sendThis = {

							command: command,
							data: data,
							message: message,
							socketID: socketID
						}

						if (!cb) {
							var cb = function() {}
						}

						ws.send(JSON.stringify(sendThis), cb());

					}

					console.log("socket connected, let's say hello...")

					socketSend('Hello', {
							cookieIdRnd: cookieIdRnd,
							clientMongoId: clientMongoId
						}, 'Hello', function() {}) 

				};

				ws.onmessage = function(evt){
                    wsOnmessageFunc(evt,$rootScope,$scope,ws,indexGlobals)
                }

				ws.onclose = function() {
					// websocket is closed.

					socketOn = false

					socketID = undefined

					console.log("socketConnection is closed, retry in 2s..");

					window.setTimeout(function() {
						if (!socketOn) sockets($rootScope, $scope)
					}, 2000)
				};
			} else {
				// The browser doesn't support WebSocket
				console.log("WebSocket NOT supported by your Browser!");
			}
		}

