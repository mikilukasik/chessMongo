var admins=[
			'admin',
			'lenovo',
			'Droid',
			'Miki',
			'a-pc'
		]


var startGame = function(w, b, connection, aiGame, idCb) {
    
    if(!idCb)idCb=function(){}

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
                        
						
						
						initedTable._id = firstFreeTable

						idCb(initedTable)
						
						db.collection("users")
							.findOne({
								name: w
							}, function(err2, userInDb) {

								
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
                                                
                                                // idCb(initedTable)

												if (w && w != 'Computer') {

													if (w == 'someone') {

														wConnection = connection

													}

													clients.send(wConnection, 'openGame', {
														_id: firstFreeTable,
														wPlayer: true,
														opponentsName: b

													}, '', function() {})

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

															}, '', function() {})

														}

													}

												} else {

													if (b && b != 'Computer') {
														clients.send(clients.getConnectionByName(b), 'openGame', {
															_id: firstFreeTable,
															wPlayer: false,
															opponentsName: w

														}, '', function() {})
													} else {
														//against multiple, not logged in
														// clients.send(connection, 'openGame', {
														// 	_id: firstFreeTable,
														// 	wPlayer: true,
														// 	opponentsName: b

														// }, '', function() {})

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

