		function ApplicationController($rootScope, $scope, $timeout, $http, $interval, $compile) {
			
			$rootScope.imgPathStr1='cPiecesPng/'
			$rootScope.imgPathStr2='.png'
			
			
            testing.getDbTable=function(){
                return $rootScope.dbTable
            }
            
            testing.getAi=function(depth){
                if(!depth)depth=3
                return singleThreadAi(testing.getDbTable(),depth)
            }
            
			$rootScope.temp1={}
            $scope.temp2={}
			
			$rootScope.alertButton=function(thisCase,passData){
				
				switch (thisCase){
					
					case 'Accept challenge+Accept, play with white.':
						
						$scope.quickGame(passData.opponentsName,passData.challenger)
						
						
					break;
					
					case 'Accept challenge+Accept, play with black.':
						
						$scope.quickGame(passData.challenger,passData.opponentsName)
						
						
					break;
					
					case 'Accept challenge+Accept':
					
						if(passData.wPlayer){
							$scope.quickGame(passData.opponentsName,passData.challenger)
						}else{
							$scope.quickGame(passData.challenger,passData.opponentsName)
						}
					
					
					break;
					
					case 'Challenge player+White':
					
						//console.log('challenging '+passData.opponentsName+' with white.')
						
						socketSend('challenge',{
							opponentsName:passData.opponentsName,
							wPlayer:true
						})
						
						
						
					break;
					case 'Challenge player+Black':
					
						//console.log('challenging '+passData.opponentsName+' with black.')
						socketSend('challenge',{
							opponentsName:passData.opponentsName,
							wPlayer:false
						})
						
					break;
					case "Challenge player+Opponent's choice":
						
						//console.log('challenging '+passData.opponentsName+", who get's to chose color.")
					socketSend('challenge',{
							opponentsName:passData.opponentsName,
							opponentsChoice:true
						})
						
					break;
					case "Challenge player+Random color":
						socketSend('challenge',{
							opponentsName:passData.opponentsName,
							wPlayer:(Math.random()>0.5)
						})
						//console.log('jooo')
					break;
					
					
				}
				
				$rootScope.alertData=undefined
				
			}
			
            
            
			$rootScope.autoButtonOnCountDown=function(alertID,countDown,callWithText){
				
				if($rootScope.alertData&&$rootScope.alertData.alertID==alertID){
					
					if(countDown>0){
						
						$rootScope.alertCountDown=countDown
						$timeout(function(){
							$rootScope.autoButtonOnCountDown(alertID,countDown-1,callWithText)
						},1000)
					}else{
						
							$rootScope.alertButton(callWithText)
						
					}
				}
			}
			
			$rootScope.alertUser=function(heading,paragraph,buttons,passData,countDown,defaultButton){
				
				var alertID=Math.random()
				
				$rootScope.alertData={
					
					h:heading,
					p:paragraph,
				
					buttons:buttons,
					passData:passData,
					
					defaultButton:defaultButton,
					
					alertID:alertID
					
				}
				
				$timeout(function(){        //this should be some onload!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
					
					 $( "#autoFoc" ).focus();
				
				},100) 
				
				$rootScope.autoButtonOnCountDown(alertID,countDown,heading+'+'+defaultButton)
			
			}
			
	
			
			if (!$rootScope.ran) {
				
				$rootScope.loginVals = {
					inOrOut: 'Login',
					viewName: 'login.html'
				}
                
                $rootScope.depth = 3
			}

			if (!socketOn) sockets($rootScope, $scope)




			var pollerMessage = function(event) {

				////console.log('something')

				switch (event.data.resCommand) {

					case undefined:

						break;

					case 'updateBusyThinkers':

						//		//console.log(event.data.resData.busyThinkers)

						$rootScope.busyThinkers = event.data.resData.busyThinkers
						$scope.$apply()
						$rootScope.updateSizes()

						break;


				}


			}

			
			$rootScope.cookieId = cookieId

			$rootScope.setID = function(id) {

				setID(id)

				$rootScope.cookieId = id


			}

			$scope.refreshAllBrowsers = function() {

				socketSend('refreshAllBrowsers')

			}

			$scope.setDepth = function(depth) {
				$rootScope.depth = depth
			}

			$rootScope.updateSizes = function(cb) {

				

				//console.log('updateSizes')

				
				var sw = window.innerWidth
				var sh = window.innerHeight

				var sr = sh / sw

				if (sr < 0.8) {
					$rootScope.screenRatio = 0
				} else {

					if (sr < 1.1) {
						$rootScope.screenRatio = 1
					} else {

						if (sr < 1.5) {
							$rootScope.screenRatio = 2
						} else {
							$rootScope.screenRatio = 3
						}


					}

				}



				var nw = $('.navvv').width()
				var sbh = $('.statusBox').height()

				$('.frame-table').css({
					'width': nw + 'px'
				});
				$('.frame-table').css({
					'height': (sh - 50) + 'px'
				});



				switch ($rootScope.screenRatio) {

					case 0:

						$('.leftBar').css({
							'width': 130 + 'px'
						});


						$('.iderakd').css({
							'height': (1) + 'px'
						});
						$('.iderakd').css({
							'width': (1) + 'px'
						});

						$('.main-table').css({
							'height': (sh - 72) + 'px'
						});
						$('.main-table').css({
							'width': (sh - 72) + 'px'
						});


						$('.chatCell').css({
							'width': (sw - sh - 90) + 'px'
						});
						$('.chatCell').css({
							'height': (sh - 92) + 'px'
						});

						$('.chatInpt').css({
							'width': (sw - sh - 144) + 'px'
						});

						$('.moves').css({
							'height': (sh - sbh - 75) + 'px'
						});


						break;

					case 1:

						$('.leftBar').css({
							'width': 230 + 'px'
						});



						$('.tableAndChat').css({
							'width': (nw - 241) + 'px'
						});


						$('.chatCell').css({
							'width': (nw - 214) + 'px'
						});
						$('.chatCell').css({
							'height': (sh - sw + 342) + 'px'
						});

						$('.chatInpt').css({
							'width': (nw - 268) + 'px'
						});


						$('.iderakd').css({
							'height': (1) + 'px'
						});
						$('.iderakd').css({
							'width': (1) + 'px'
						});


						$('.main-table').css({
							'height': (nw - 215) + 'px'
						});
						$('.main-table').css({
							'width': (nw - 215) + 'px'
						});


						$('.moves').css({
							'height': (sh - sbh + 112) + 'px'
						});

						

						break;

					case 2:

						$('.leftBar').css({
							'width': 130 + 'px'
						});


						$('.tableAndChat').css({
							'width': (1) + 'px'
						});

						$('.iderakd').css({
							'height': (1) + 'px'
						});
						$('.iderakd').css({
							'width': (1) + 'px'
						});



						$('.chatCell').css({
							'width': (nw - 150) + 'px'
						});
						$('.chatCell').css({
							'height': (sh - nw + 42) + 'px'
						});

						$('.chatInpt').css({
							'width': (nw - 214) + 'px'
						});



						$('.main-table').css({
							'height': (nw - 150) + 'px'
						});
						$('.main-table').css({
							'width': (nw - 150) + 'px'
						});

						$('.moves').css({
							'height': (sh - sbh - 82) + 'px'
						});

						

						break;

					case 3:




						$('.leftBar').css({
							'height': (sh - nw - 68) + 'px'
						});

						$('.chatCell').css({
							'width': (nw - 148) + 'px'
						});
						$('.chatInpt').css({
							'width': (nw - 202) + 'px'
						});


						$('.chatCell').css({
							'height': (sh - nw - 90) + 'px'
						});

						$('.iderakd').css({
							'height': (1) + 'px'
						});
						$('.iderakd').css({
							'width': (1) + 'px'
						});

						$('.main-table').css({
							'height': (nw - 8) + 'px'
						});
						$('.main-table').css({
							'width': (nw - 8) + 'px'
						});

						$('.moves').css({
							'height': (sh - sbh - nw - 73) + 'px'
						});



						break;

				}
				
				if (cb) {
					
					cb()
				}
                if(!$scope.$$phase) {
                    $scope.$apply()
                }
			}

			window.onresize = function() {


				//http://stackoverflow.com/questions/14902321/how-to-determine-if-a-resize-event-was-triggered-by-soft-keyboard-in-mobile-brow


				var t = $(document.activeElement).prop('type')
				if (t === 'text' || t === 'password') {
					// Logic for while keyboard is shown
				} else {
					// Logic for while keyboard is hidden
                    
					setTimeout($rootScope.updateSizes(), 800)


				}

			}

			var dletters = ["a", "b", "c", "d", "e", "f", "g", "h"]

			$scope.lobbyPollNum = 0

			$rootScope.pollNum = -2 //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			


			$scope.askToStart = function(opponentsName) {
				
				if (opponentsName != $rootScope.loginName) {
				
					$rootScope.alertUser('Challenge player',"You're about to challenge "+opponentsName+". Choose your color:",['White','Black',"Opponent's choice","Random color",'Cancel'],{
						opponentsName:opponentsName
					},10,'Cancel')
			
				}else{
					
					//clicked to challange himself
					
					
				}
					
			}
 

			$scope.askToWatch = function(gameID) {

				$http.get('/watchGame?v=' + $rootScope.loginName + "&t=" + gameID)

			}
			$rootScope.applyIt = function() {

				//console.log('should apply')

				if (!$scope.$$phase) {

					//console.log('does apply')
					$scope.$apply()

				} 

			}

			$scope.quickGame = function(w,b) {


				socketSend('quickGame', {
					w: w,
					b: b
				}, 'startQuickGame for w:' + w +' b:'+b, function() {
					//console.log("'startGame' callback")
				})

			}

			$scope.setTableNum = function(num) {

				var oldNum = $rootScope.dbTable._id

				$rootScope.dbTable._id = num
				$rootScope.pollNum = -1

				$http.get('/forcePopTable?t=' + oldNum + '&p=' + $rootScope.loginName + '&m=Went to t' + num)
				$rootScope.longPollTable()

			}

			
			$scope.clickedItTrans = function(i, j) {
				
				//console.log('clickedItTrans',i,j)
				
				var clickedField = [j, 8 - i]
				var clickedString = dletters[j] + (9 - i)

				if (!($scope.opponentsName == "Spectator")) {
					$scope.clickedIt(clickedField, clickedString)
				}
				
			}

			$scope.makeAMove = function(whatMove) {

					var moveStr = whatMove

					var dbTable = $rootScope.dbTable 
                       	
                    dbTable.command = ''
						
                    store.oopsStates[$rootScope.dbTable._id]=$.extend(true, {}, dbTable)
					
					$scope.clearHighlights(store.oopsStates[$rootScope.dbTable._id].table)
					
					dbTable = moveInTable(moveStr, dbTable, false)
                       
                       
                    dbTable._id = $rootScope.dbTable._id
					dbTable.desiredDepth = $rootScope.depth
                    
                    


					if (dbTable.wName == 'Computer' || dbTable.bName == 'Computer') {
						
                        dbTable.command = 'makeAiMove'
                        dbTable.moveTask=new MoveTaskN(dbTable)
                      
					}


					
					socketSend('moved', dbTable, 'moved', function() {

						$rootScope.dbTable.table = dbTable.table
						$rootScope.dbTable.wNext = dbTable.wNext
						$rootScope.dbTable.moves = dbTable.moves
                        
					})

			}

			$rootScope.takeItBack = function() {
				socketSend('moved', store.oopsStates[$rootScope.dbTable._id], 'moved', function() {
                    
					$rootScope.dbTable.table = store.oopsStates[$rootScope.dbTable._id].table
					$rootScope.dbTable.wNext = store.oopsStates[$rootScope.dbTable._id].wNext
					$rootScope.dbTable.moves = store.oopsStates[$rootScope.dbTable._id].moves

				})
			}

			$scope.refreshTable = function() {

				$http.get('/getTPollNum?t=' + $rootScope.dbTable._id)
					.success(function(response) {
						
                        if (!(response.tablepollnum == $rootScope.pollNum)) {
							$rootScope.pollNum = response.tablepollnum
								//////console.log('calling getandshow')
							$rootScope.longPollTable()
							if (!$scope.$$phase) {
								$scope.$apply()
							}
						}

					})

			}

			$rootScope.showTable = function(cb) { //this will update the displayed table

				$rootScope.stable = $rootScope.dbTable.table
               
              
				if (cb) {
                    cb()
                   
                }

			}

			showTable = $rootScope.showTable

			$scope.login = function(user) {

				socketSend('loginUser', {
					name: user.name,
					pwd: user.pwd,
					stayLoggedIn: user.stayLoggedIn
				})


			}

			$scope.register = function(user) {

				if (user.pwd1 == user.pwd2) {
					if (!(user.pwd1 == undefined || user.rName == undefined || user.rName == "")) {


						socketSend('registerUser', {
							name: user.rName,
							pwd: user.pwd1
						})

					}
				} else {
					$rootScope.alertUser('Password mismatch',"Passwords don't match, try again!",['OK'],{},5,'OK')
				}
			}
			
			
			
			$scope.adminButtons=function(func,client,data){
                
				switch(func){
					
					case 'runClientSpeedTest':
					
						socketSend('clientSpeedTest',client)
					
					break;
					
					case 'refreshBrowser':
					
						socketSend('refreshBrowser',client)
					
					break;
					
					case 'setLastUser':
						client.setLastUserTo=data
						socketSend('setLastUser',client)
					
					break;
					
					case 'learnerCount':
                        if(data>=0){
                           client.learnerCount=Number(data)
					   	   socketSend('learnerCount',client)
                        }
						
					
					break;
					
                    case 'removeFromAllMods':
                    
                        socketSend('removeFromAllMods',data)
                    
                    break;
                    
                    case 'setModValMin':
                        client.setModValMin=data
                        socketSend('setModValMin',client)
                    
                    break;
                    
                    case 'setModValMax':
                        client.setModValMax=data
                        socketSend('setModValMax',client)
                    
                    break;
                    
                    case 'addMod':
                    
                        if(data!=''&&data!=undefined){
                            client.addMod=data
                            socketSend('addMod',client)
                            data=''
                            
                            if(client.connectionID=='default'){
                                $rootScope.temp1.modToAdd=''
                            }
                            
                        }
                        
                        // $rootScope.modToAdd=''
                        
                    break;
                    
                    case 'removeMod':
                    
                        client.removeModIndex=data
                        socketSend('removeMod',client)
                    
                    break;
                    
                    case 'customModCheckbox':
                    
                    
                        ////console.log(data)
                        client.customModCheckbox=data
                        socketSend('customModCheckbox',client)
                    
                    break;
					
					case 'reporting':
                    
                    	client.connectionID=socketID
						client.learningOn=indexGlobals.myLastUser
                        //console.log('reporting',client)
                        //client.customModCheckbox=data
                        socketSend('reporting',client)
                    
                    break;
					
					
					
					
				}
				
				
			}

			$scope.newView = function(viewName) {
				if (viewName == 'board.html') {


					// $timeout($rootScope.updateSizes(), 800)

					if ($rootScope.wPlayer) {
						$scope.drTable("/wtable.html")
					} else {
						$scope.drTable("/btable.html")
					}
				} else {
					if (viewName == 'login.html') {

						focusOnLogin()

					} else {


						if (viewName == 'lobby.html') {

						}



					}
				}
			}

			$scope.drTable = function(viewName) {
				$rootScope.draTable = viewName;
			}



			$rootScope.showView = function(viewName, subViewName, requestUpdate) {

				//let the server know what we're watching

				if (!(subViewName)) {

					if (viewName == $rootScope.loginVals.viewName && $rootScope.subViewName) {
						subViewName = $rootScope.subViewName
					} else {
						subViewName = 'default'
					}

				}

				var newViewParts = []
					//var oldViewParts=$rootScope.activeViewParts

				//console.log('test', viewName, $rootScope.loginVals.inOrOut)

				switch (viewName) {
					case 'login.html':

						newViewParts = [
							'default'
						]


						////console.log('inorout',$rootScope.inOrOut)
						if ($rootScope.loginVals.inOrOut == 'Logoff') {

							socketSend('logoff', {
								name: $rootScope.loginName
							})
							
							$rootScope.greetUser = ''
							$rootScope.loginVals.inOrOut = 'Login'
							$rootScope.loginName = 'someone'
							$rootScope.loggedIn = false
							$rootScope.isAdmin = false

						}

						


						break;

					case 'lobby.html':

						newViewParts = [
							'lobbyChat',
							'activeGames',
							'onlineUsers'
						]


						//
						break;

					case 'admin.html':

						newViewParts = [
							'clients',
							'activeViews',
                            'splitMoves',
                            'adminLog',
                            'defaultMod',
                            'allMods',
							'learningGames',
                            'learnerTable'
						]

						//

						break;

					case 'board.html':

						//if(subViewName=='default'&&$rootScope.dbTable._id)subViewName=$rootScope.dbTable._id

						newViewParts = [
							'dbTable.table',
							'dbTable.chat',
							'dbTable.moves',
							'busyThinkers',
							'dbTable.wNext',
							'wPlayer'

						]

						break;
				}

				//var oldViewParts=$rootScope.activeViewParts.slice()

				if (!($rootScope.activeViewParts)) $rootScope.activeViewParts = [] //init here

				socketSend('showView', {

					oldViewName: $rootScope.loginVals.viewName,
					oldSubViewName: $rootScope.subViewName,
					oldViewParts: $rootScope.activeViewParts.slice(),

					newViewName: viewName,
					newSubViewName: subViewName,
					newViewParts: newViewParts

				}, 'showView', function() {

					//console.log('showView socketSend callback ran')

					$rootScope.loginVals.viewName = viewName;
					$rootScope.subViewName = subViewName;
					$rootScope.activeViewParts = newViewParts.slice()
					
					
					if (requestUpdate) {
					// socketSend('updateMe',{
	
						// })
	
						//console.log('here would be "updateMe"')
	
						$rootScope.applyIt()
					} else {
						$rootScope.applyIt()
					}



				})

				

			}
            
            $scope.startAdminLog=function(){
                socketSend('startAdminLog')
            }
            $scope.stopAdminLog=function(){
                socketSend('stopAdminLog')
            }
            $scope.clearAdminLog=function(){
                socketSend('clearAdminLog')
            }

			$scope.clickedIt = function(clickedField, clickedString) {


				var x = clickedField[0]
				var y = clickedField[1]
				var clickedColor = false

				////console.log('testing',$rootScope.dbTable.table[x][y][5] , $rootScope.tempMoveString.length ,$rootScope.dbTable.wNext , $rootScope.wPlayer)	
				if ((!($rootScope.dbTable.table[x][y][5] == []) || $rootScope.tempMoveString.length > 0) && $rootScope.dbTable.wNext == $rootScope.wPlayer) {
					//console.log('clickeit called', clickedField, clickedString)

					if (clickedString == $rootScope.tempMoveString) {
						$rootScope.dbTable.table[x][y][8] = false
						$scope.clearHighlights($rootScope.dbTable.table)
						$rootScope.showTable()
						$rootScope.tempMoveString = ""
					} else {

						if ($rootScope.dbTable.table[x][y][0] > 0 && $rootScope.tempMoveString == "") {
							////console.log('testtesttesttesttesttesttesttest')

							for (var i = 0; i < 8; i++) {
								for (var j = 0; j < 8; j++) {
									$rootScope.dbTable.table[i][j][15] = false

								}
							}


							$rootScope.dbTable.table[x][y][5].forEach($scope.highLightThem) //5odik elem ahova lephet
							$rootScope.showTable()

						};
						if ($rootScope.dbTable.table[x][y][0] > 0 || 0 < $rootScope.tempMoveString.length) {

							$rootScope.tempMoveString += clickedString

							if ($rootScope.tempMoveString.length < 3) {
								$rootScope.dbTable.table[x][y][8] = true;
							}

						}
						if ($rootScope.tempMoveString.length > 3) {

							if ($rootScope.dbTable.table[x][y][9] == true) {

								$scope.makeAMove($rootScope.tempMoveString)
								$rootScope.dbTable.wNext = !$rootScope.dbTable.wNext

								$rootScope.tempMoveString = ""

							} else {
								$rootScope.tempMoveString = $rootScope.tempMoveString[0] + $rootScope.tempMoveString[1]
							}

						}
						$rootScope.showTable()

					}
				}
			}
			$scope.highLightThem = function(arrayOfCoords) {
				$rootScope.dbTable.table[arrayOfCoords[0]][arrayOfCoords[1]][9] = true;
			}

			$scope.removeDisplayedGame = function(gameNo) {
				////console.log('removeGame',gameNo)
				socketSend('removeDisplayedGame', gameNo)
			}

			$scope.clearHighlights = function(onTable) {
				for (var i = 0; i < 8; i++) {
					for (var j = 0; j < 8; j++) {
						onTable[i][j][8] = false;
						onTable[i][j][9] = false;

					}
				}
			}
			$scope.sendChat = function(chatLine) {

                //console.log('sending chat:',chatLine,$rootScope.dbTable._id)
                
				socketSend('boardChat',{
                    chatLine:chatLine,
                    gameNum:$rootScope.dbTable._id
                },'boardChat: '+chatLine,function(){
                    
                    $rootScope.temp1.chatInput=''
                    
                })

			}

            $scope.sendLobbyChat = function(chatLine) {
                
                ////console.log('sending chat:',chatLine)

				socketSend('lobbyChat',{
                    chatLine:chatLine
                },'lobbyChat: '+chatLine,function(){
                    
                    $rootScope.temp1.lobbyChatInput=''
                    
                })
                
                

			}



			$rootScope.updateSizes()
			//console.log('appcontr ran')
			
			$scope.instantGame = function(w,b) {


				// $scope.opponentsName = 'Computer'

				socketSend('quickGame', {
					w: $rootScope.loginName,
					b: 'Computer'
				}, 'startQuickGame for w:' + w +' b:'+b, function() {
					//console.log("'startGame' callback")
				})

			}



		}
		