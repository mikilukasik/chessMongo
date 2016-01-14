var admins=[
			'admin',
			'lenovo',
			'Droid',
			'Miki',
			'a-pc'
		]

var adminLogging=true

var findUsersGameIndex = function(gameNo, games) {

	for (var i = games.length - 1; i >= 0; i--) {
		if (games[i].gameNo == gameNo) return i
	}
	return -1
}

var adminLogStore=[]

var adminLog=function(){
   if(adminlogging){
        var addLine=''
    for(var i=0;i<arguments.length;i++){
    
        addLine=addLine.concat(arguments[i]+' ')
    
    }
   
        
  
    adminLogStore.push(addLine)
   
    clients.publishView('admin.html','default','adminLog',adminLogStore)
    
   }
     console.log(addLine)
}

var userFuncs = {

	removeDisplayedGame: function(connection, data) {
        
		//console.log('remove game from name:', connection.addedData.loggedInAs)
		mongodb.connect(cn, function(err, db2) {
			db2.collection("users")
				.findOne({
					name: connection.addedData.loggedInAs
				}, function(err2, userInDb) {
					if (!(userInDb == null)) {

						var index = findUsersGameIndex(data, userInDb.games)
						userInDb.games.splice(index, 1)
							//unshift(initedTable._id)

						db2.collection("users")
							.save(userInDb, function(err3, res) {

								clients.publishDisplayedGames(connection.addedData.loggedInAs, connection)

							})

					}
					db2.close()
						// res.json({

					// });
				});

		});

	},

	logoff: function(connection, data) {

		var name = data.name

		clients.storeVal(connection, 'loggedInAs', undefined)
		clients.storeVal(connection, 'isAdmin', undefined)
		clients.storeVal(connection, 'stayLoggedIn', undefined)
       
		clients.logoff(name)      //this removes it from store.onlineUsers
        
        
        clients.publishAddedData()
		clients.publishDisplayedGames(undefined, connection)

	},

	loginUser: function(name, pwd, stayLoggedIn, connection, noPwd) {

		mongodb.connect(cn, function(err, db) {
			//db.collection("users")

			db.collection("users")
				.findOne({
					name: name
				}, function(err, thing) {
					if (thing == null) {
						if (name) clients.send(connection, 'userNotRegistered', {
							name: name
						})
					} else {
						//user exists, check pwd 

						if (thing.pwd == pwd || noPwd) {
							//password match, log him in

							var isAdmin=(admins.indexOf(name)!=-1)

							clients.send(connection, 'login', {
									name: name,
									isAdmin: isAdmin
								})
								//console.log('user logging in: ',name)
							clients.storeVal(connection, 'loggedInAs', name)
							clients.storeVal(connection, 'isAdmin', isAdmin)

							if (name) clients.storeVal(connection, 'lastUser', name)
							clients.storeVal(connection, 'stayLoggedIn', stayLoggedIn)
							clients.publishAddedData()
							clients.publishDisplayedGames(name, connection)

							clients.login(connection, name)

						} else {
							//wrong pwd

							clients.send(connection, 'wrongPwd', {
								name: name
							})

						}

					}
					db.close()
						//res.json(retJsn)
				})

		});

	},

	end: 0

}

var startGame = function(w, b, connection, aiGame) {

	var wConnection = clients.getConnectionByName(w)
	var bConnection = clients.getConnectionByName(b)

	mongodb.connect(cn, function(err, db) {
		db.collection("tables")
			.findOne({
				_id: "xData"
			}, function(err2, xData) {
				var firstFreeTable = -5
				if (xData == null) {

					createXData();

					firstFreeTable = 1
				} else {
					firstFreeTable = xData.firstFreeTable
					modType = xData.modType
					xData.firstFreeTable++
				}
				db.collection("tables")
					.save(xData, function(err, doc) {

						var initedTable = new Dbtable(firstFreeTable, w, b)

						//console.log(w,b,'----------------------  ----------------------  ----------------------  ')

						// //console.log(initedTable)

						// //console.log('----------------------  ----------------------  ----------------------  ')

						initedTable._id = firstFreeTable

						db.collection("users")
							.findOne({
								name: w
							}, function(err2, userInDb) {

								//		if (!(userInDb == null)) {
								userInDb && userInDb.games.unshift({
									wPlayer: true,
									gameNo: initedTable._id,
									opponentsName: b
								})

								userInDb && db.collection("users")
									.save(userInDb, function(err3, res) {

										clients.publishDisplayedGames(w, wConnection)

									})

								db.collection("users")
									.findOne({
										name: b
									}, function(err2, userInDb2) {

										userInDb2 && userInDb2.games.unshift({
											wPlayer: false,
											gameNo: initedTable._id,
											opponentsName: w
										})

										userInDb2 && db.collection("users")
											.save(userInDb2, function(err3, res) {

												clients.publishDisplayedGames(b, bConnection)

											})

										db.collection("tables")
											.insert(initedTable, function(err, doc) {

												if (w && w != 'Computer') {

													if (w == 'someone') {

														wConnection = connection

													}

													clients.send(wConnection, 'openGame', {
														_id: firstFreeTable,
														wPlayer: true,
														opponentsName: b

													}, 'openGamemmmmmmmmmmmmmmmmmmmmmmmmmmmmm', function() {})

													if (b) {

														if (b == 'Computer') {

															//hack!!!!!!!!!!!!!!!!!!!

															setTimeout(function() {

																clients.send(wConnection, 'updateView', {

																	viewName: 'board.html',
																	subViewName: firstFreeTable,
																	viewPart: 'wPlayer',
																	data: true

																}, 'updateView')

															}, 500)

														} else {
															clients.send(bConnection, 'openGame', {
																_id: firstFreeTable,
																wPlayer: false,
																opponentsName: w

															}, 'openGamemmmmmmmmmmmmmmmmmmmmmmmmmmmmm', function() {})

														}

													}

												} else {

													if (b && b != 'Computer') {
														clients.send(clients.getConnectionByName(b), 'openGame', {
															_id: firstFreeTable,
															wPlayer: false,
															opponentsName: w

														}, 'openGamemmmmmmmmmmmmmmmmmmmmmmmmmmmmm', function() {})
													} else {
														//against multiple, not logged in
														clients.send(connection, 'openGame', {
															_id: firstFreeTable,
															wPlayer: true,
															opponentsName: b

														}, 'openGamemmmmmmmmmmmmmmmmmmmmmmmmmmmmm', function() {})

													}

												}

												clients.publishView('board.html', firstFreeTable, 'dbTable.table', initedTable.table)

												clients.publishView('board.html', firstFreeTable, 'dbTable.wNext', initedTable.wNext)

											});

										//	}
										//db3.close()

									});

								//		}
								//db2.close()
								// res.json({

								// });
							});

						// db.close()

					});

			});
	});

}

