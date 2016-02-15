		function ApplicationController($rootScope, $scope, $timeout, $http, $interval, $compile) {

			$rootScope.imgPathStr1 = 'cPiecesPng/'
			$rootScope.imgPathStr2 = '.png'

			testing.getDbTable = function() {
				return $rootScope.dbTable
			}

			testing.getAi = function(depth) {
				if (!depth) depth = 3
				return singleThreadAi(testing.getDbTable(), depth)
			}

			$rootScope.temp1 = {}
			$scope.temp2 = {}

			$rootScope.alertButton = function(thisCase, passData) {

				switch (thisCase) {

					case 'Accept challenge+Accept, play with white.':

						$scope.quickGame(passData.opponentsName, passData.challenger)

						break;

					case 'Accept challenge+Accept, play with black.':

						$scope.quickGame(passData.challenger, passData.opponentsName)

						break;

					case 'Accept challenge+Accept':

						if (passData.wPlayer) {
							$scope.quickGame(passData.opponentsName, passData.challenger)
						} else {
							$scope.quickGame(passData.challenger, passData.opponentsName)
						}

						break;

					case 'Challenge player+White':

						//console.log('challenging '+passData.opponentsName+' with white.')

						socketSend('challenge', {
							opponentsName: passData.opponentsName,
							wPlayer: true
						})

						break;
					case 'Challenge player+Black':

						//console.log('challenging '+passData.opponentsName+' with black.')
						socketSend('challenge', {
							opponentsName: passData.opponentsName,
							wPlayer: false
						})

						break;
					case "Challenge player+Opponent's choice":

						//console.log('challenging '+passData.opponentsName+", who get's to chose color.")
						socketSend('challenge', {
							opponentsName: passData.opponentsName,
							opponentsChoice: true
						})

						break;
					case "Challenge player+Random color":
						socketSend('challenge', {
								opponentsName: passData.opponentsName,
								wPlayer: (Math.random() > 0.5)
							})
							//console.log('jooo')
						break;

				}

				$rootScope.alertData = undefined

			}

			$rootScope.autoButtonOnCountDown = function(alertID, countDown, callWithText) {

				if ($rootScope.alertData && $rootScope.alertData.alertID == alertID) {

					if (countDown > 0) {

						$rootScope.alertCountDown = countDown
						$timeout(function() {
							$rootScope.autoButtonOnCountDown(alertID, countDown - 1, callWithText)
						}, 1000)
					} else {

						$rootScope.alertButton(callWithText)

					}
				}
			}

			$rootScope.alertUser = function(heading, paragraph, buttons, passData, countDown, defaultButton) {

				var alertID = Math.random()

				$rootScope.alertData = {

					h: heading,
					p: paragraph,

					buttons: buttons,
					passData: passData,

					defaultButton: defaultButton,

					alertID: alertID

				}

				$timeout(function() { //this should be some onload!!!!!!!!!!!!!!!!!!!!!!!!!!!!1

					$("#autoFoc").focus();

				}, 100)

				$rootScope.autoButtonOnCountDown(alertID, countDown, heading + '+' + defaultButton)

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
				if (!$scope.$$phase) {
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

					$rootScope.alertUser('Challenge player', "You're about to challenge " + opponentsName + ". Choose your color:", ['White', 'Black', "Opponent's choice", "Random color", 'Cancel'], {
						opponentsName: opponentsName
					}, 10, 'Cancel')

				} else {

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

			$scope.quickGame = function(w, b) {

				socketSend('quickGame', {
					w: w,
					b: b
				}, 'startQuickGame for w:' + w + ' b:' + b, function() {
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

				store.oopsStates[$rootScope.dbTable._id] = $.extend(true, {}, dbTable)

				$scope.clearHighlights(store.oopsStates[$rootScope.dbTable._id].table)

				console.log('before adding pastState:', dbTable.allPastTables.length)
				dbTable = moveInTable(moveStr, dbTable, false)

				console.log('after adding pastState:', dbTable.allPastTables.length)

				dbTable._id = $rootScope.dbTable._id
				dbTable.desiredDepth = $rootScope.depth

				if (dbTable.wName == 'Computer' || dbTable.bName == 'Computer') {

					dbTable.command = 'makeAiMove'
					dbTable.moveTask = new MoveTaskN(dbTable)

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
					$rootScope.alertUser('Password mismatch', "Passwords don't match, try again!", ['OK'], {}, 5, 'OK')
				}
			}

			$scope.adminButtons = function(func, client, data) {

				switch (func) {

					case 'runClientSpeedTest':

						socketSend('clientSpeedTest', client)

						break;

					case 'refreshBrowser':

						socketSend('refreshBrowser', client)

						break;

					case 'setLastUser':
						client.setLastUserTo = data
						socketSend('setLastUser', client)

						break;

					case 'learnerCount':
						if (data >= 0) {
							client.learnerCount = Number(data)
							socketSend('learnerCount', client)
						}

						break;

					case 'removeFromAllMods':

						socketSend('removeFromAllMods', data)

						break;

					case 'setModValMin':
						client.setModValMin = data
						socketSend('setModValMin', client)

						break;

					case 'setModValMax':
						client.setModValMax = data
						socketSend('setModValMax', client)

						break;

					case 'addMod':

						if (data != '' && data != undefined) {
							client.addMod = data
							socketSend('addMod', client)
							data = ''

							if (client.connectionID == 'default') {
								$rootScope.temp1.modToAdd = ''
							}

						}

						// $rootScope.modToAdd=''

						break;

					case 'removeMod':

						client.removeModIndex = data
						socketSend('removeMod', client)

						break;

					case 'customModCheckbox':

						////console.log(data)
						client.customModCheckbox = data
						socketSend('customModCheckbox', client)

						break;

					case 'reporting':

						client.connectionID = socketID
						client.learningOn = indexGlobals.myLastUser
							//console.log('reporting',client)
							//client.customModCheckbox=data
						socketSend('reporting', client)

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
							'learningStats',
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
							'wPlayer',
							'dbTable.allPastTables'

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

			$scope.startAdminLog = function() {
				socketSend('startAdminLog')
			}
			$scope.stopAdminLog = function() {
				socketSend('stopAdminLog')
			}
			$scope.clearAdminLog = function() {
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

				socketSend('boardChat', {
					chatLine: chatLine,
					gameNum: $rootScope.dbTable._id
				}, 'boardChat: ' + chatLine, function() {

					$rootScope.temp1.chatInput = ''

				})

			}

			$scope.sendLobbyChat = function(chatLine) {

				////console.log('sending chat:',chatLine)

				socketSend('lobbyChat', {
					chatLine: chatLine
				}, 'lobbyChat: ' + chatLine, function() {

					$rootScope.temp1.lobbyChatInput = ''

				})

			}

			$rootScope.updateSizes()
				//console.log('appcontr ran')

			$scope.instantGame = function(w, b) {

				// $scope.opponentsName = 'Computer'

				socketSend('quickGame', {
					w: $rootScope.loginName,
					b: 'Computer'
				}, 'startQuickGame for w:' + w + ' b:' + b, function() {
					//console.log("'startGame' callback")
				})

			}

			$scope.showChart = function(mt,min,max) {
                
                $http.get('./api/mod/stats/'+mt).then(function (res) {
                    
                    // res.data=[[540.9653089763369,-3000,-1000,65,-1935],[178148.99820239848,-3000,-2100,69,-3031],[424249.9023750342,-3000,-2100,69,-3031],[1.4622839748843293,0,100,334,434],[0.5500736994121831,0,-300,-36,-336],[565.8308117479933,-3000,-1150,65,-2085],[10.097557877524324,-1500,50,220,-230],[0.22145368477107694,0,-50,14,-36],[2492.103907695976,-3000,-2100,69,-3031],[82.8751316951587,-1500,-500,233,-767],[406.2608648916203,-3000,-950,55,-1895],[3.122913310255254,0,0,32,32],[994.5422405284885,-3000,-900,41,-1859],[350.60439278554765,-3000,-1150,79,-2071],[0.10882929202498272,-1500,0,656,156],[2.3994791771605994,1500,-300,-20,180],[0.8651696165700773,3000,900,-595,1305],[15933193.370846631,-3000,-750,81,-1669],[0.23033968869801402,-1500,-50,410,-140],[0.6271831758462832,1500,1300,7,1807],[4.761250828742278,1500,450,307,1257],[35.38849530928982,0,-50,4,-46],[52.42633629362205,-3000,-400,109,-1291],[95.7298210416218,-1500,-650,229,-921],[0.31864500435403786,3000,350,-249,1101],[0.15042523545805542,1500,400,48,948],[0.6450891003153776,1500,1300,7,1807],[0.050049592735506306,-1500,0,656,156],[0.0012623179693569972,-1500,0,656,156],[2.489664160815128e-7,-1500,0,656,156],[0.40256063723247615,1500,50,232,782],[0.00009388052323510131,-1500,0,656,156],[0.906907955017442,1500,1000,-7,1493],[72.2933564968869,-3000,-200,139,-1061],[0.27117352445602594,3000,350,-249,1101],[23.669623198452605,1500,550,11,1061],[1.0181350892188346,0,0,230,230],[0.6093426208526962,3000,1000,-391,1609],[5.4771165023851776,3000,500,-175,1325],[0.25635892972235247,3000,350,-249,1101],[0.7016067855117515,0,450,50,500],[46.473983512519524,0,-100,-40,-140],[206.11793972466168,0,-350,38,-312],[0.2737530725875844,3000,350,-249,1101],[0.33286744631173915,3000,350,-249,1101],[0.005175026339973102,-1500,0,656,156],[4.4482983311842746e-7,-1500,0,656,156],[0.6616159861485263,3000,1150,-361,1789],[0.0015747944182349176,-1500,0,656,156],[0.0014656315799643396,-1500,0,656,156],[0.5371495575445201,0,-300,-36,-336],[143.14914214861443,-1500,-1450,233,-1717],[0.919346407585991,1500,1200,97,1797],[0.1621456804217932,1500,400,36,936],[0.15009131701146566,1500,400,48,948],[0.021190568434828194,-1500,0,656,156],[0.07763724226177578,0,200,910,1110],[0.07955069915847394,0,200,910,1110],[9.851936080428498,-1500,-800,235,-1065],[0.41330244909118663,1500,50,232,782],[0.37490884360388527,0,-150,608,458],[3.7932125467224154,3000,350,-187,1163],[0.1501249480598892,1500,400,48,948],[1.724270109217356,-3000,-1150,467,-1683],[18.697959041139192,-1500,-1000,383,-1117],[7.393672437071124,0,-200,70,-130],[68.11937003279944,-3000,-200,139,-1061],[0.01659101630437859,-1500,0,656,156],[0.008817847638221849,-1500,0,656,156],[0.9139229131813026,1500,1000,121,1621],[0.07873607097318301,0,200,910,1110],[1.286731647070256,-1500,-550,359,-691],[2.302327156851636,3000,650,-323,1327],[454.1647545112203,-3000,-900,53,-1847],[0.011323123585251008,-1500,0,656,156],[42.50862205695068,0,-100,-40,-140],[0.2078760091391525,0,0,32,32],[0.0017192863151410896,-1500,0,656,156],[5.094990608071571e-8,-1500,0,656,156],[0.00030922105407483346,-1500,0,656,156],[3.3529514771654276,-1500,-700,4393,3193],[16.801204641123938,-1500,400,280,180],[0.14251638429049773,-1500,-50,656,106],[0.10253431090082608,-1500,0,656,156],[2328.375965503908,-3000,-2100,69,-3031],[19.62517607972045,1500,-350,176,326],[0.12651677727386265,-1500,-50,656,106],[0.003652891607763018,-1500,0,656,156],[2.2565511607907354,3000,-150,-313,537],[226.05052060916185,0,-350,38,-312],[21397.942071255606,-3000,-2100,69,-3031],[142.5236510318146,-1500,-1450,233,-1717],[0.2237759698482809,-1500,-50,410,-140],[0.7482397303147003,0,450,50,500],[0.015345855410829697,-1500,0,656,156],[0.09418510611605922,-1500,0,656,156],[321.199822477647,-1500,-850,97,-1253],[0.03960041972727083,-1500,0,656,156],[4.957211218213143,0,150,156,306],[0.05323499003189999,-1500,0,656,156],[0.04780061339832444,-1500,0,656,156],[0.005596791295803888,-1500,0,656,156],[0.7176469530955178,0,450,50,500],[0.0648089633453413,-1500,0,656,156],[5.344687411212412,3000,500,-175,1325],[1.0018513491079108,0,0,230,230],[0.22744265380847864,-1500,-50,410,-140],[0.02485322630482997,-1500,0,656,156],[0.0003226568919640757,-1500,0,656,156],[0.3552099518364714,0,-150,608,458],[0.48654183059074674,1500,50,232,782],[0.9138805034492127,1500,1000,121,1621],[0.3642197419936919,0,-150,608,458],[34.98283974295736,0,-50,4,-46],[0.01189639957689791,-1500,0,144,-356],[0.003467935593463537,-1500,0,144,-356],[28.260107823767758,-1500,-1300,-197,-1997],[0.004837203804917269,-1500,0,144,-356],[174.6065991009714,-3000,-1850,-875,-3725],[2.2067937794518473,1500,50,514,1064],[2.863804126493721,0,0,32,32],[13.744323260728478,0,-250,22,-228],[6.43180875893253,0,-600,170,-430],[60.37023516641136,0,0,-112,-112],[0.45616793805230216,1500,50,744,1294],[1.7100672789800726,-1500,-150,-64,-714],[0.623872581929019,3000,1100,685,2785],[840.0496612123737,-1500,-1200,-95,-1795],[4.128802508017964,3000,300,869,2169],[0.27729333731139816,3000,350,775,2125],[8.443265823617905,-1500,-950,-97,-1547],[5.512892805999626,3000,350,851,2201],[2.2800250997600378,3000,-150,711,1561],[0.0012972777994329204,-1500,0,144,-356],[0.5457313293275444,0,-300,-36,-336],[9.504259086465446,-1500,-750,-163,-1413],[0.000005072269932275887,-1500,0,144,-356],[0.09800428089471068,-1500,0,144,-356],[0.9038879329511611,1500,1000,505,2005],[27.048784616628456,0,-50,0,-50],[0.17603423839378396,-1500,-200,-106,-806],[0.04055033806224344,-1500,0,144,-356],[0.000217323755669593,-1500,0,144,-356],[1.2646223390726545,1500,300,516,1316],[0.011022004762913026,-1500,0,144,-356],[0.8272538003699529,1500,1000,633,2133],[6.408854223390328,0,-600,170,-430],[1.2224001693152673,0,0,230,230],[0.004922486562806434,-1500,0,144,-356],[0.004599664005345055,-1500,0,144,-356],[0.17499620576115807,-1500,-200,-106,-806],[0.06159643398483251,-1500,0,144,-356],[274.960660639837,-3000,-900,-941,-2841],[1.5169203441666348,-1500,-950,317,-1133],[0.0020099046384270706,-1500,0,144,-356],[0.006042727070153468,-1500,0,144,-356],[0.037000587152987645,-1500,0,144,-356],[7.094179558287557,0,-600,170,-430],[0.18881798376557318,-1500,-200,-106,-806],[1.6100326630879973,-1500,150,-36,-386],[259.02449651887815,-3000,-950,-797,-2747],[1.1650422778720766,0,0,230,230],[0.3096607978208194,3000,350,775,2125],[17.11001296597118,-3000,-350,-791,-2141],[0.19645770568060128,-1500,-200,-106,-806],[15.180379968506799,1500,-250,616,866],[12295464.019111767,-3000,-2150,-907,-4057],[1.4811379867970054,0,-100,394,294],[4.100554918107231,1500,-500,626,626],[1.953802616779226,-1500,-150,-64,-714],[1.954266248810173,-1500,-150,-64,-714],[0.8788428509295659,1500,900,481,1881],[3.0789835699688566,0,0,32,32],[1.166013166310478,0,0,230,230],[0.1108796097736643,-1500,0,144,-356],[0.03826132781200094,-1500,0,144,-356],[16.200609815041044,0,0,446,446],[0.0002449116481018353,-1500,0,144,-356],[0.6982379553342256,0,450,50,500],[245.86540798359673,0,-1050,68,-982],[50.1687334197558,-3000,-400,-915,-2315],[0.00895383825447943,-1500,0,144,-356],[0.04099838800517132,-1500,0,144,-356],[0.5815162322355865,0,0,-44,-44],[0.06152330068282393,-1500,0,144,-356],[3.088686090959962,0,0,32,32],[2322.215452206094,-3000,-2100,-955,-4055],[0.03508393229836911,-1500,0,144,-356],[0.09335323587418899,-1500,0,144,-356],[0.0061932354954568475,-1500,0,144,-356],[0.19196872671877363,-1500,-200,-106,-806],[2.5456514788636904,0,-500,-102,-602],[16.118234816026987,0,0,446,446],[186.91631113689408,-3000,-1850,-875,-3725],[2.8876526802485727,0,0,32,32],[49.06106411220021,-3000,-400,-915,-2315],[46.19472809377697,0,-100,-40,-140],[0.14252847180932282,-1500,-50,144,-406],[5.115594081703648,3000,500,849,2349],[0.09322175154347352,-1500,0,144,-356],[0.8089547780843763,1500,1000,505,2005],[0.0004975400074751954,-1500,0,144,-356],[0.03959329816850614,-1500,0,144,-356],[8.302506994792678,-1500,-750,61,-1189],[4.70329529495292,-1500,350,-8,-158],[2.5330194073952614,0,-500,-102,-602],[1.840423267689975,-1500,-150,-64,-714],[15.563557483525333,-1500,-950,-81,-1531],[3.955313804775858,3000,350,837,2187],[20.166913603924684,3000,150,863,2013],[0.8681166530896014,3000,900,429,2329],[1.1706448404907737,0,0,230,230],[74.75014886594232,-3000,-200,-885,-2085],[1.0774376435716857,0,0,230,230],[0.007404437809761986,-1500,0,144,-356],[0.011748701567024752,-1500,0,144,-356],[9.197359936183608,0,-1050,341,-709],[0.0996706610385782,-1500,0,144,-356],[0.46504864845235583,1500,50,744,1294],[4.956372393205753,0,150,156,306],[0.013240925294977723,-1500,0,144,-356],[0.004473965359383728,-1500,0,144,-356],[1.0561509637276738,0,0,230,230],[4.200587068461619,-1500,-750,-95,-1345],[6.305588904269427,1500,-450,990,1040],[0.09173539101984574,-1500,0,144,-356],[1.36122874005035,1500,100,528,1128],[0.22605708111874356,-1500,-50,-102,-652],[397490.8118672028,-3000,-2100,-955,-4055],[7.241006191867226,0,-600,170,-430],[60.63150542429937,0,0,-112,-112],[3.6267079115602563,0,-400,66,-334],[1.054175241152627,0,0,230,230],[3.242892547532884,0,0,32,32],[0.023361434137805004,-1500,0,144,-356],[0.16594925530504684,1500,400,548,1448],[9.136206310438801,0,-1050,341,-709],[124.09152973258871,-1500,-1050,-373,-1923],[0.02649596154744047,-1500,0,144,-356],[12.731715129409592,0,-150,10,-140],[0.22251870579839012,-1500,-50,-102,-652],[0.413105223558879,1500,50,744,1294],[21.14120890956552,3000,150,863,2013],[1.1253874470334273,0,0,230,230],[1.955829906077475,-1500,-150,-64,-714],[6.898718907097374,0,-600,170,-430],[0.5743502117075505,0,0,-44,-44],[0.021123905639709714,-1500,0,144,-356],[1.2855404853968069,1500,300,516,1316],[0.8066137893625632,1500,1000,505,2005],[0.2856280993327274,3000,350,775,2125],[9.728656916857398,-1500,100,-178,-578],[0.8862877874166394,1500,900,481,1881],[0.4296016902531316,1500,50,744,1294],[0.8653194231591748,3000,900,429,2329],[3.474834566407286,-3000,-1050,-671,-2721],[0.7730742794853873,3000,1000,625,2625],[0.4983278128492011,1500,50,744,1294],[7.3509067053498365,0,-200,70,-130],[1.6691322863474194,-1500,-150,-38,-688],[19.333010041774372,1500,-350,688,838],[9.131881823298432,0,-1050,341,-709],[0.814613074693455,1500,1000,505,2005],[5.103878837595198,3000,500,849,2349],[1.3923620074964072,1500,-300,598,798],[0.21791738314679118,0,-50,14,-36],[0.1688027616757784,-1500,-200,-106,-806],[0.8655596451060413,3000,900,429,2329],[1.8237109367892774,-1500,-150,-82,-732],[1.1389428202150662,0,0,230,230],[19.0066118925359,1500,-350,688,838],[1.0401746132078495,0,0,230,230],[0.8457782480943787,1500,1200,609,2309],[0.25277992284712325,3000,350,775,2125],[7.1263200945227965,0,-600,170,-430],[0.6594193719781386,3000,1150,663,2813],[0.6031229825241831,3000,1000,633,2633],[6.777990304931734,0,-600,170,-430],[4.3866291283674625,0,-550,350,-200],[3.838203359552768,3000,350,837,2187],[2.8577362621044524,0,0,32,32],[0.6720930158415676,0,450,50,500],[1.1601043191599822,0,0,230,230],[0.6999008193793415,0,450,50,500],[0.8923592243819621,1500,900,477,1877],[0.85779722010433,3000,900,429,2329],[6.619832045224172,0,-600,170,-430],[4.315705401263186,1500,-500,762,762],[0.4603332674773532,1500,50,744,1294],[1.6485640954063205,-1500,150,-28,-378],[28.47581543279706,-1500,-1300,-197,-1997],[1.4488169374701967,1500,-100,588,988],[16.20764370593476,0,0,446,446],[15.478853095235413,-1500,-950,-81,-1531],[0.5533928917324855,0,-300,-36,-336],[8.428110898637543,-1500,-950,-97,-1547],[8.052472235919263,-1500,-750,61,-1189],[2.2485318772052154,1500,50,514,1064],[0.19172711258748426,-1500,-200,-106,-806],[9.953345868364032,-1500,50,-292,-742],[4.117328266086359,1500,450,949,1899],[28.597388485236394,-1500,-1300,-197,-1997],[2.02160429619882,1500,50,514,1064],[0.4424314586127432,1500,50,744,1294],[0.2668912477936271,3000,350,775,2125],[2.868928523966008,0,0,32,32],[0.27479061708299996,3000,350,775,2125]]
                    
                    
                    var showThis=res.data.filter(function (element) {
                        
                        if(!min)min=0
                                               
                        return element[0]>=min && (element[0]<=max || !max)
                    })
                    
                    showThis.sort(function (a,b) {
                
                        if(a[0]>b[0]){
                            return 1
                        }else{
                            if(a[0]<b[0]) return -1
                        }
                        return 0
                    })
                    
                    
                            
                    
                    var data = new google.visualization.DataTable();
				    data.addColumn('number', 'X');
                    //data.addColumn('number', '1');
                    data.addColumn('number', 'winScore');
                    data.addColumn('number', 'pieceScore');
                    data.addColumn('number', 'moveCountScore');
                    data.addColumn('number', 'score');
                    //data.addColumn('number', 'modConst');
                    
                    
                    data.addRows(showThis)
                    
                    
                    var options = {
                        explorer: {
                            actions: ['dragToZoom', 'rightClickToReset'],
                            //axis: 'horizontal'
                        },
                        hAxis: {
                            title: 'modVal',
                            logScale:true
                        },
                        vAxis: {
                            title: 'results'
                        },
                        //curveType: 'function',
                        colors: ['green', 'blue', 'yellow', 'red'],
                        width:1000,
                        height:500
                    };

                    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
                    chart.draw(data, options);
                                        
                })
                
				
			}

		}
