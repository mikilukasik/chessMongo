var wsOnmessageFunc= function(evt,$rootScope,$scope,ws,indexGlobals) {
    
                    //var myLastUser=indexGlobals.myLastUser
                    
					var received = JSON.parse(evt.data)// evt.data + ")");

					switch (received.command) {
						
						case 'challenged':
						
							if(received.data.opponentsChoice){
								
								$rootScope.alertUser('Accept challenge',received.data.challenger+' is inviting you for a game, and letting you choose color.',['Accept, play with white.','Accept, play with black.','Decline'],received.data,10,'Decline')

								
							}else{
								
								if(received.data.wPlayer){
									
									$rootScope.alertUser('Accept challenge',received.data.challenger+' is inviting you for a game. You will play with white.',['Accept','Decline'],received.data,10,'Decline')

									
								}else{
									
									$rootScope.alertUser('Accept challenge',received.data.challenger+' is inviting you for a game. You will play with black.',['Accept','Decline'],received.data,10,'Decline')

									
									
								}
								
								
							}
						
							
						
						
						
						
						break;
						
						case 'refreshBrowser':
                            
                            console.log('page reload requested from the server')
                            
                            ws.onclose = function () {}; // disable onclose handler first
                            ws.close()
                            
                            console.log('websocket closed')
                            
                            var lwCount=0
                            
                            learnerGlobals.learnerWorkers.forEach(function(lworker){
                                lworker.terminate()
                                lwCount++
                            })
                            
                            console.log(lwCount+' learnerWorkers terminated')
                            
                            var swCount=0
                            
                            subWorkers.forEach(function (sworker) {
                                sworker.terminate()
                                swCount++
                            })
                            
                            console.log(swCount+' subWorkers terminated')
                            
                            mainWorker.terminate()
                            
                            console.log('mainWorker terminated')
                            console.log('reload in 1s')
                            
                            setTimeout(function() {
                                console.log('reloading...')
                                location.reload(true)
                            }, 1000);
							

							break;

						case 'updateDisplayedGames':

							$rootScope.displayedGames = received.data


							break;

						case 'userRegistered':

							//alert('User ' + received.data.name + ' registered.')
							$rootScope.alertUser('Success','User ' + received.data.name + ' registered.',['OK'],{},5,'OK')
							break;

						case 'userNotRegistered':

							//alert('User not registered, please register first!')
							$rootScope.alertUser('Register first!','User not registered, please register first!',['OK'],{},5,'OK')

							break;

						case 'wrongPwd':

							//alert("Username and password don't match, please try again!")
							$rootScope.alertUser('Wrong password',"Username and password don't match, please try again!",['OK'],{},5,'OK')

							break;

						case 'login':

							$rootScope.loggedIn = true
							$rootScope.isAdmin = received.data.isAdmin
							
							$rootScope.greetUser = 'Logged in as ' + received.data.name + '. '

							$rootScope.loginVals.inOrOut = 'Logoff' //displayed on nav when logged in
							$rootScope.loginName = received.data.name
							$rootScope.showView('lobby.html', 'default')




							break;

						case 'userExists':

							//alert('Username ' + received.data.name + ' already exists, please try another!')
							$rootScope.alertUser('Name exists','Username ' + received.data.name + ' already exists, please try another!',['OK'],{},5,'OK')

							break;

						case 'reHello':


							//socketID = received.data.connectionID
							indexGlobals.myLastUser = received.data.lastUser
                            
                            

							console.log('received connectionID', received.data.connectionID)

							$rootScope.socketID = received.data.connectionID
							sendID = $rootScope.socketID


							ifWorkers(startWorkers)

                            if(indexGlobals.pendingLearners){
                                learnerFuncs.setLearnerCount(indexGlobals.pendingLearners,indexGlobals.myLastUser)
                                indexGlobals.pendingLearners=0
                            }

							if (!$rootScope.ran) {
								console.log('starting...')
								$rootScope.ran = true
								$rootScope.dbTable = new Dbtable(1, 2, 3)
								$rootScope.wPlayer = true
								$rootScope.wNext = true

								$rootScope.tempMoveString = ''
								$rootScope.opponentsNam = 'Computer'

								$rootScope.draTable = 'wtable.html'

								$rootScope.sTable = $rootScope.dbTable.table
								for (var i = 7; i >= 0; i--) {
									$rootScope.sTable[i] = []
									for (var j = 7; j >= 0; j--) {
										$rootScope.sTable[i][j] = [0, 0]
									}

								}

								$rootScope.showView('login.html')

							}


							break;

						case 'saveYourClientMongoId':

							//we said hello without a mongoID so we were given one, let's say hello again


							clientMongoId = received.data.clientMongoId
							setCookie('clientMongoId', clientMongoId, 365)

							//recall Hello

							console.log('clientMongoId ' + clientMongoId + ' registered, saying Hello again...')

							socketSend('Hello', {
									cookieIdRnd: cookieIdRnd,
									clientMongoId: clientMongoId
								}, 'Hello', function() {}) //init




							break;
							
						case 'startReporting':
						
							console.log('start reporting learnerGame',received.data)
							
							learnerGlobals.learnerWorkers.forEach(function(learnerWorker){
								
								learnerWorker.postMessage({
									command:'startReporting',
									data:received.data
								})
								
							})
						
						break;
						
						case 'stopReporting':
						
							console.log('stop reporting learnerGame',received.data)
							
							learnerGlobals.learnerWorkers.forEach(function(learnerWorker){
								
								learnerWorker.postMessage({
									command:'stopReporting',
									data:received.data
								})
								
							})
						
						
						break;
						
						

						case 'openGame':

							if ($rootScope.wPlayer) {
								$scope.drTable("/wtable.html")
							} else {
								$scope.drTable("/btable.html")
							}

							$rootScope.rememberTablenum = received.data._id

							//$rootScope.dbTable={}

							$rootScope.showView('board.html', received.data._id)

							$rootScope.dbTable._id = received.data._id //temp hack!!!!!!!!!!!!!!!!!!!!!!!
							
							if(received.data.wPlayer){
								
								$rootScope.wPlayer=true
								$rootScope.draTable='wtable.html'
								
							}else{
								
								$rootScope.wPlayer=true
								$rootScope.draTable='btable.html'
								
								
								
							}
							
							$rootScope.wPlayer = received.data.wPlayer
							
							
							
							$rootScope.opponentsName = received.data.opponentsName

							$rootScope.tempMoveString = ""



							break;


						case 'showOnConsole':

							console.log('from server to console:', received.data)

							break;

						case 'task':


							mainWorker.postMessage

								({

								reqCommand: 'taskReceived',
								reqData: {
									command: received.data.command, //string
									data: received.data.data
								}

							})




							break;

						case 'updateView':

							updateView($rootScope, $scope, received.data)




							break;

						case 'updateDbTable':

							received.data.aiTable = undefined

							$rootScope.dbTable = received.data
							tempConsole = received.data
								//wplayer info kell itt!!

							$rootScope.wName = received.data.wName
							$rootScope.bName = received.data.bName



							$rootScope.updateSizes()


							$rootScope.showTable(function() {
								//console.log('cb cb cb cb cb cb cb cb cb cb')


								$rootScope.$on('$includeContentLoaded', function() {
									setTimeout(function() {
                
                                        $rootScope.updateSizes(function(){
                                            ////console.log('rootScope.updateSizes ran from global updateView')
                                        })
                                        
                                    }, 500);
								});
											
								

								// $rootScope.$apply
							})


							break;


						case 'lobbyState':




							//console.log('polling lobby')
							if (received.data.asktoopen) {
								////console.log('opening')

								$rootScope.dbTable._id = received.data.opentablenum
								$rootScope.showView('board.html', $rootScope.dbTable._id)
								$rootScope.wPlayer = received.data.opentablecolor
								$scope.opponentsName = received.data.opponentsname
								$rootScope.pollNum = 0

								$scope.openNow = true;

							}

							if (!($scope.lobbyPollNum == received.data.lobbypollnum)) {


								$scope.lobbyChatLines = received.data.lobbychat
								$scope.players = received.data.players
								// $scope.players.unshift("Fastest thinker")
								// $scope.players.unshift("Computer")
								// $scope.players.unshift("Server")

                                //probably i don't need any of this!!!!!!!!!!!!!!!!!!!


								$scope.games = received.data.games
								$scope.players.sort(function(a, b) {
									return a.toLowerCase().localeCompare(b.toLowerCase());
								});
								$scope.lobbyPollNum = received.data.lobbyPollNum
									
							}


							break;
                            
                            case 'setLearnerCount':
                            
                                learnerFuncs.setLearnerCount(received.data,indexGlobals.myLastUser)
                            
                            break;
                          
                            
                            
                            


					}
					if (!$scope.$$phase) {
						$scope.$apply()
					}

				};