var dbFuncs = {
	publishDisplayedGames: function(loginName, connection) {

		mongodb.connect(cn, function(err, db) {


			db.collection("users")
				.findOne({
					name: loginName
				}, function(err, doc) {
					if (!(doc == null)) {


						clients.send(connection, 'updateDisplayedGames', doc.games)

					} else {

						clients.send(connection, 'updateDisplayedGames', null)


					}
					db.close()
				});




		})

	},
    
    knownClientReturned : function(data, connection) {

	data._id = new ObjectID(data.clientMongoId)

	mongodb.connect(cn, function(err, db) {
		
		db.collection("clients").findOne({
			_id: data._id
		}, function(err, doc) {

			if(doc != null){	
				if (doc.loggedInAs) {
					//client has saved login details in db, log it in!
					userFuncs.loginUser(doc.loggedInAs, 0, true, connection, true)
	
					
	
				}else{
					
					if(doc.lastUser){
						
						connection.addedData.lastUser=doc.lastUser
						
						
					}
					
					
					
				}
                
                if(doc.speed){
                    
                    connection.addedData.speed=doc.speed
                   
                    connection.addedData.speedStats=doc.speedStats
                    
                }
				
				if(doc.learnerCount){
					
					connection.addedData.learnerCount=doc.learnerCount
					clients.send(connection,'setLearnerCount',doc.learnerCount)
					
				}
				
				
                
                 connection.addedData.currentState='idle'
			}
            
            db.close()

		})




	});



}
}

