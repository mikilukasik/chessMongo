 var indexGlobals={
            myLastUser:'Computer',
            pendingLearners:0
        }
		
        
        
		 var store={
            
            oopsStates:[]
            
            
        }



//////////////////////////	cookie stuff	////////////////////////////////////////////////

		function setCookie(cname, cvalue, exdays) {

			var d = new Date();

			d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));

			var expires = "expires=" + d.toUTCString();

			document.cookie = cname + "=" + cvalue + "; " + expires;

		}

		function getCookie(cname) {

			var name = cname + "=";
			var ca = document.cookie.split(';');

			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') c = c.substring(1);
				if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
			}

			return "";

		}


		//init cookie vars

		var cookieId = ""
		var workerSpeed = ""
		var mainThreadSpeed = ""
		var cookieIdRnd = ""

		var clientMongoId = ''
		var userMongoId = ''


		//load cookies

		cookieId = getCookie("myID");
		cookieIdRnd = getCookie("rndId");

		clientMongoId = getCookie("clientMongoId");
		userMongoId = getCookie("userMongoId");



		if (cookieIdRnd == "") {
			cookieIdRnd = (Math.random() * Math.random()).toString()
			setCookie("rndId", cookieIdRnd, 365)
		}

		//console.log('cookieIdRnd', cookieIdRnd)

		if (workerSpeed == "" || isNaN(workerSpeed)) {

			workerSpeed = 1 
		}

		var sendID;

		if (cookieId == "") {



			sendID = cookieIdRnd



		}

		var setID = function(id) {

			setCookie("myID", id, 365)
			cookieId = id
			sendID = id

			//should send some rename info to server to rename me!!!!!!!!!!!!!!!!!!!!!


		}



		var setWorkerSpeed = function(count, time) {

			var tempSpeed = Number(count) / Number(time)

			var percDiff = ~~(tempSpeed / Number(workerSpeed) * 100)

			tempSpeed = (workerSpeed + 2 * tempSpeed) / 3 //average of last few

			workerSpeed = tempSpeed

			setCookie("workerSpeed", workerSpeed, 365)

			return percDiff

		}

		var setSpeedCookies = function() {

			setWorkerSpeed(workerSpeed, 1)

		}


function focusOnLogin() {

			window.setTimeout(function() {
					document.getElementById("inputLoginUser").focus();
				}, 500)
				// document.getElementById("inputLoginUser").focus();



		}


function updateView(rootScope, scope, data) {

			////console.log('updateview called',data)

			if (rootScope.loginVals.viewName == data.viewName) {


				if (rootScope.subViewName == data.subViewName) {
					//we're on the right view

					
					//rootScope[data.viewPart]=data.data
                    eval("(rootScope." + data.viewPart + "=data.data)")

					switch(data.viewPart){
						
						case 'dbTable.table':
						    //console.log('table received')
                            
							rootScope.showTable();
											
								

								// rootScope.$apply
							//})
								
						break;
						
						case 'wPlayer':
						
							if(rootScope.wPlayer){
								
								rootScope.draTable='wtable.html'
								
								
							}else{
								
								rootScope.draTable='btable.html'
								
								
							}
						
						break;
						
					}


				} else {
					//view must have changed, let the server know maybe...
					
				}

			} else {
				//view must have changed, let the server know maybe...

			}

			rootScope.$apply()
            setTimeout(function() {
                
                rootScope.updateSizes(function(){
                    ////console.log('rootScope.updateSizes ran from global updateView')
                })
                
            }, 500);
            
            
            
		}
