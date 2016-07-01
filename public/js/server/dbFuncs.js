//var cn = 'mongodb://localhost:17890/chessdb'
var mongodb = require('mongodb');
var ObjectID = mongodb.ObjectID

var dbGlobals = {
	err: undefined,
	db: undefined,
	pendingStuff: []
}

var exportThis = {

	connect: function(cn, cb) {

		dbGlobals.err = undefined
		dbGlobals.db = undefined
        console.log('connectind to DB...')
		mongodb.connect(cn, function(gotErr, gotDb) {
            
            
            console.log('connected.')
			dbGlobals.err = gotErr
			dbGlobals.db = gotDb

			if (cb) cb(gotErr, gotDb, dbGlobals.pendingStuff)

			var i = dbGlobals.pendingStuff.length

			while (i--) {

				var thisTask = dbGlobals.pendingStuff.pop()
                
                console.log('processing db call from db Q:',thisTask)

				switch (thisTask.funcToCall) {
					case 'saveLearnerResult':
						exportThis[thisTask.funcToCall](thisTask.arguments[0])
						break;
					case 'newLearningStat':
						exportThis[thisTask.funcToCall](thisTask.arguments[0], thisTask.arguments[1])
						break;
					case 'updateLearningStat':
						exportThis[thisTask.funcToCall](thisTask.arguments[0], thisTask.arguments[1], thisTask.arguments[2])
						break;
					case 'getCollection':
						exportThis[thisTask.funcToCall](thisTask.arguments[0], thisTask.arguments[1])
						break;
					case 'query':
						exportThis[thisTask.funcToCall](thisTask.arguments[0], thisTask.arguments[1], thisTask.arguments[2])
						break;
					case 'update':
						exportThis[thisTask.funcToCall](thisTask.arguments[0], thisTask.arguments[1], thisTask.arguments[2], thisTask.arguments[3])
						break;
					case 'insert':
						exportThis[thisTask.funcToCall](thisTask.arguments[0], thisTask.arguments[1], thisTask.arguments[2])
						break;
					case 'findOne':
						exportThis[thisTask.funcToCall](thisTask.arguments[0], thisTask.arguments[1], thisTask.arguments[2])
						break;
					case 'knownClientReturned':
						exportThis[thisTask.funcToCall](thisTask.arguments[0], thisTask.arguments[1], thisTask.arguments[2], thisTask.arguments[3])
						break;

					default:
						break;
				}

			}

		})

		return dbGlobals

	},

	ObjectID: ObjectID,

	saveLearnerResult: function(data) {

		//mongodb.connect(cn, function(err, db) {

		if (dbGlobals.db) {

			dbGlobals.db.collection("learnerResults")
				.save(data, function(err, res) {

					//db.close()

				});

		} else {
			dbGlobals.pendingStuff.push({
				started: new Date(),
				funcToCall: 'saveLearnerResult',
				arguments: [data]
			})
		}

	},

	newLearningStat: function(data, cb) {

		//console.log(data)

		if (data._id == -1) data._id = undefined

		//mongodb.connect(cn, function(err, dbGlobals.db) {
		if (dbGlobals.db) {

			dbGlobals.db.collection("learningStats")
				.save(data, function(res) {

					if (cb) cb(data)

					//db.close()

				});

		} else {
			dbGlobals.pendingStuff.push({
				started: new Date(),
				funcToCall: 'newLearningStat',
				arguments: [data, cb]
			})

		}

	},

	updateLearningStat: function(modStr, foundCb, savedCb) {

		//console.log('updateLearningStat called with modStr',modStr)
		if (dbGlobals.db) {
			//mongodb.connect(cn, function(err, dbGlobals.db) {
			dbGlobals.db.collection("learningStats")
				.findOne({
					modStr: modStr
				}, function(err, doc) {

					if (doc) foundCb(doc) //

					if (doc) dbGlobals.db.collection("learningStats").save(doc, function(err, savedDoc) {

						savedCb(doc)

						//dbGlobals.db.close()

					})

				})

		} else {

			dbGlobals.pendingStuff.push({
				started: new Date(),
				funcToCall: 'updateLearningStat',
				arguments: [modStr, foundCb, savedCb]
			})

		}

	},

	getCollection: function(collectionName, cb) {

		//mongodb.connect(cn, function(err, dbGlobals.db) {
		if (dbGlobals.db) {

			dbGlobals.db.collection(collectionName).find().toArray(function(err, items) {

				cb(items)
					//dbGlobals.db.close()

			})

		} else {
			dbGlobals.pendingStuff.push({
				started: new Date(),
				funcToCall: 'getCollection',
				arguments: [collectionName, cb]
			})
		}

	},

	query: function(collectionName, query, cb) {

        

		//mongodb.connect(cn, function(err, dbGlobals.db) {
		if (dbGlobals.db) {

			dbGlobals.db.collection(collectionName).find(query).toArray(function(err, items) {

				cb(items,function(toSaveIndexes,saverCb){
            
                    toSaveIndexes.forEach(function(index){
                        if(items[index])dbGlobals.db.collection(collectionName).save(items[index],function(){
                            if(saverCb)saverCb(index)
                        })
                    })
                    
                })
                            //dbGlobals.db.close()

			})

		} else {
			dbGlobals.pendingStuff.push({
				started: new Date(),
				funcToCall: 'query',
				arguments: [collectionName, query, cb]
			})
		}

	},

	update: function(collectionName, query, cb, savedCb) {

		//mongodb.connect(cn, function(err, dbGlobals.db) {
		if (dbGlobals.db) {

			dbGlobals.db.collection(collectionName).findOne(query, function(err, doc) {

				cb(doc)

				doc && dbGlobals.db.collection(collectionName).save(doc, function(err, doc2) {

					if(savedCb)savedCb(doc, err, doc2)

				})

				//dbGlobals.db.close()

			})

		} else {
			dbGlobals.pendingStuff.push({
				started: new Date(),
				funcToCall: 'update',
				arguments: [collectionName, query, cb, savedCb]
			})
		}

	},

	insert: function(collectionName, doc, savedCb) {

		//mongodb.connect(cn, function(err, dbGlobals.db) {
		if (dbGlobals.db) {

			dbGlobals.db.collection(collectionName).save(doc, function(err, doc2) {

				if (savedCb) savedCb(doc, err, doc2)

			})

			//dbGlobals.db.close()

		} else {
			dbGlobals.pendingStuff.push({
				started: new Date(),
				funcToCall: 'insert',
				arguments: [collectionName, doc, savedCb]
			})
		}

	},

	findOne: function(collectionName, query, cb) {

		//mongodb.connect(cn, function(err, dbGlobals.db) {
		if (dbGlobals.db) {

			dbGlobals.db.collection(collectionName).findOne(query, function(err, doc) {

				cb(doc)

				//dbGlobals.db.close()

			})

		} else {
			dbGlobals.pendingStuff.push({
				started: new Date(),
				funcToCall: 'findOne',
				arguments: [collectionName, query, cb]
			})
		}

	},

	knownClientReturned: function(data, connection, cback, userFuncs) {

		if (!cback) cback = function() {}
		try {
			data._id = new ObjectID(data.clientMongoId)
		}
		catch (err) {
			data._id = new ObjectID();
		}
		

		//mongodb.connect(cn, function(err, dbGlobals.db) {
		if (dbGlobals.db) {

			dbGlobals.db.collection("clients").findOne({
				_id: data._id
			}, function(err, doc) {

				if (doc != null) {
					if (doc.loggedInAs) {
						//client has saved login details in dbGlobals.db, log it in!
						userFuncs.loginUser(doc.loggedInAs, 0, true, connection, true)

					} else {

						if (doc.lastUser) {

							connection.addedData.lastUser = doc.lastUser

						}

					}

					if (doc.speed) {

						connection.addedData.speed = doc.speed

						connection.addedData.speedStats = doc.speedStats

					}

					if (doc.learnerCount) {

						connection.addedData.learnerCount = doc.learnerCount
							//clients.send(connection,'setLearnerCount',doc.learnerCount)

					}

					if (doc.mod) {

						connection.addedData.mod = doc.mod

					}

					connection.addedData.customModCheckbox = doc.customModCheckbox

					connection.addedData.currentState = 'idle'
				}

				if (doc && doc.lastUser) {
					cback(doc.lastUser, doc.learnerCount)
				} else {
					cback('new client', 0)
				}

				//dbGlobals.db.close()

			})

		} else {
			dbGlobals.pendingStuff.push({
				started: new Date(),
				funcToCall: 'knownClientReturned',
				arguments: [data, connection, cback, userFuncs]
			})
		};

	}
}

module.exports = exportThis
