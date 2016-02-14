var cn = 'mongodb://localhost:17890/chessdb'
var mongodb = require('mongodb');
var ObjectID = mongodb.ObjectID




module.exports = {
    
    ///////////////temp
    
    mongodb:mongodb,
    cn:cn,
    ObjectID:ObjectID,
    
    
    
    
	saveLearnerResult: function(data) {

		mongodb.connect(cn, function(err, db) {


			db.collection("learnerResults")
				.save(data,function(err,res){
                    
                    
                    db.close()
                    
                });




		})

	},
    
    
    
    newLearningStat: function(data,cb) {
        
        //console.log(data)
        
        if(data._id==-1)data._id=undefined

		mongodb.connect(cn, function(err, db) {


			db.collection("learningStats")
				.save(data,function(res){
                    
                    if(cb)cb(data)
                    
                    db.close()
                    
                });




		})

	},
    
    
    
    updateLearningStat: function(modStr,foundCb,savedCb) {
       
       
       
       //console.log('updateLearningStat called with modStr',modStr)
        
		mongodb.connect(cn, function(err, db) {
            db.collection("learningStats")
                .findOne({
                    modStr:modStr
                },function(err,doc){
                    
                    if(doc)foundCb(doc)//
                    
                    if(doc)db.collection("learningStats").save(doc,function(err,savedDoc){
                        
                        savedCb(doc)
                        
                        db.close()
                        
                    })
                    
                    
                    
                    
                    
                })
				




		})

	},
    
   
    
    
    getCollection: function(collectionName,cb) {
       
		mongodb.connect(cn, function(err, db) {
            
            db.collection(collectionName).find().toArray(function(err,items){
                
                cb(items)
                db.close()
            
            })
			
		})

	},
    
    query: function(collectionName,query,cb) {
       
		mongodb.connect(cn, function(err, db) {
            
            db.collection(collectionName).find(query).toArray(function(err,items){
                
                cb(items)
                db.close()
            
            })
			
		})

	},
    
    updateDocument: function(collectionName,query,cb,savedCb) {
       
		mongodb.connect(cn, function(err, db) {
            
            db.collection(collectionName).findOne(query,function(err,doc){
                
                cb(doc)
                
                db.collection(collectionName).save(doc,function(err,doc2){
                    
                    savedCb(doc,err,doc2)
                    
                })
                
                
                db.close()
            
            })
			
		})

	},
    findOne: function(collectionName,query,cb) {
       
		mongodb.connect(cn, function(err, db) {
            
            db.collection(collectionName).findOne(query,function(err,doc){
                
                cb(doc)
                
                db.close()
            
            })
			
		})

	},
    
    
    
    
    
    
    
    knownClientReturned : function(data, connection,cback,userFuncs) {
		
	if(!cback)cback=function(){}
	
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
					//clients.send(connection,'setLearnerCount',doc.learnerCount)
					
				}
                
                if(doc.mod){
					
					connection.addedData.mod=doc.mod
					
					
				}
				
				connection.addedData.customModCheckbox=doc.customModCheckbox
                
                 connection.addedData.currentState='idle'
			}
			
			if(doc&&doc.lastUser){
				cback(doc.lastUser,doc.learnerCount)
			}else{
				cback('new client',0)
			}
            
            db.close()

		})




	});



}
}

