var PendingThinker=function(){
    
        this.sentMoves=[]
        this.sentCount=0
        
        this.pending=true
        
        this.itsSpeed=1
        
        this.addedData={
            
            connectionID:Math.random(),
            lastUser:'pending..',
            currentState:'busy',
            speed:0.00000001,
			//learnerCount:0
            
            }
            
        
    }
    




var Clients=function(dbFuncs){
	
    dbFuncs.clients=this
    
    this.adminLogging=false
    
    this.adminLogStore=[]

    var c=this

    this.PendingThinker = PendingThinker;

    this.adminLog=function(){
        
        if(c.adminLogging){
                var addLine=''
            for(var i=0;i<arguments.length;i++){
            
                addLine=addLine.concat(arguments[i]+' ')
            
            }
        
                
        
            c.adminLogStore.push(addLine)
        
            c.publishView('admin.html','default','adminLog',c.adminLogStore)
            console.log(addLine)
        }
        
    }


	////////  main store
	var knownClients={
		
		connectedSockets:[new PendingThinker()],		//sockets will have extra data added to them
		offlineSockets:[],
		views:[],
		onlineUsers:[]
		
	}
		
	///////  classes
	
	var View=function(viewName){
		this.viewName=viewName;
		this.subViews=[]
	}
	
	var SubView=function(subViewName){
		this.subViewName=subViewName;
		this.viewParts=[]
	}
	
	var ViewPart=function(viewPartName){
		this.viewPartName=viewPartName;
		this.connections=[]
	}

	
	
	//////////////////////// functions to manage users
	
	this.login=function(connection,userName){
		
		
		knownClients.onlineUsers.push({
			name:userName,
			onlineSince:new Date(),
			connection:connection
		})
		
		c.publishOnlineUsers()
	}
	
    this.getMod=function(connectionID){
        
        var connection=c.fromStore({
            addedData:{connectionID:connectionID}
        },true)
        if(connection){
            if(!connection.addedData.customModCheckbox)return 'default'
            
            return connection.addedData.mod
           
        }else{
            return 'default'
        }
            
    }
    
	this.getOnlineUsers=function(){
		//console.log('meghivtak.')
		var result=[]
		for (var i=knownClients.onlineUsers.length-1;i>=0;i--){
			result[i]={
				name:knownClients.onlineUsers[i].name,
				onlineSince:knownClients.onlineUsers[i].onlineSince
				
			
			}
				
		}
		return result
	}
	
	this.logoff=function(nameOrConnection){
		
		var name
		
		if(nameOrConnection.addedData){
			name=nameOrConnection.addedData.loggedInAs	//in case we received a connection, not a name
		}else{
			name=nameOrConnection
		}
		
		
		var userIndex=findOnlineUserIndex(name)
		if(userIndex!=-1){
			knownClients.onlineUsers.splice(userIndex,1)
			c.publishOnlineUsers()		
		}
		
	
	}
	
	this.getConnectionByName=function(name){
		
		for(var i=knownClients.onlineUsers.length-1;i>=0;i--){
			if(knownClients.onlineUsers[i].name==name){
				return knownClients.onlineUsers[i].connection
			}
		}
		
		return {}
	}
	
	this.publishOnlineUsers=function(){
		
		c.publishView('lobby.html','default','onlineUsers',c.getOnlineUsers())
	}
	
	
	
	var findOnlineUserIndex=function(name){
		
		for (var i=knownClients.onlineUsers.length-1;i>=0;i--){
			
			if(knownClients.onlineUsers[i].name==name)return i
			
		}
		
		return -1
	}
	
	
	
	//////////////////////// functions to manage connections
	
	
	
	var findConnectionIndex=function(connection,dontPush){
		
		var csLen=knownClients.connectedSockets.length
		
		for (var i=csLen-1;i>=0;i--){
			
			if(knownClients.connectedSockets[i].addedData.connectionID==connection.addedData.connectionID){
				return i
			}
			
		}
		
		//connection not found, did not return yet
		if(dontPush){
			//for when destroying
		}else{
			connection.addedData.learnerCount=0				//client just connected, isn't learning
			connection.addedData.mod=[]
            
            
            knownClients.connectedSockets.push(connection)
			return csLen
		}	
		
		
	}
	
	this.sendByName= function(name, command, data, message, cb ,err) {
	
		var connection=c.getConnectionByName(name)
		//console.log('ittagond:<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',name)
	
		c.send(connection, command, data, message, cb ,err)
	}
		
	this.send = function(connection, command, data, message, cb ,err) {
	
		
		if(connection.socket&&connection.socket.writable) {
			
			
				connection.sendUTF(JSON.stringify({
					command: command,
					data: data,
					message: message
				}))
				
				if(cb)cb()
			
			
			
			
		}else{
			
			if(err)err()
			
		}
		
	
	}
	
	
	this.sendToAll = function(command, data, message, cb ,err) {
	
		
		for (var i=knownClients.connectedSockets.length-1;i>=0;i--){
			
			if(knownClients.connectedSockets[i].socket) {
			
			
				knownClients.connectedSockets[i].sendUTF(JSON.stringify({
					command: command,
					data: data,
					message: message
				}))
				
				if(cb)cb()
			
			
			
				
			}else{
				
				if(err)err()
				
			}
			
			
			
		}
		
		
		
	
	}
	
	//////////////////////////////////////////////////  functions to manage views
	
	this.publishDisplayedGames=function(loginName,connection){
		
		if(connection){
			
		  dbFuncs.findOne('users',{name:loginName},function(foundDoc) {
              
              if (!(foundDoc == null)) {


						c.send(connection, 'updateDisplayedGames', foundDoc.games)

					} else {

						c.send(connection, 'updateDisplayedGames', null)


					}
              
              
          })
          
          
    //         //            .publishDisplayedGames(loginName,connection)
	// 		publishDisplayedGames: function(loginName, connection) {

	// 	mongodb.connect(cn, function(err, db) {


	// 		db.collection("users")
	// 			.findOne({
	// 				name: loginName
	// 			}, function(err, doc) {
	// 				if (!(doc == null)) {


	// 					clients.send(connection, 'updateDisplayedGames', doc.games)

	// 				} else {

	// 					clients.send(connection, 'updateDisplayedGames', null)


	// 				}
	// 				db.close()
	// 			});




	// 	})

	// },
			
			
			
			
		}else{
			//find connection??!!!!!!!!!!!!!!!!
			
			
			
		}
		
		
		
	}
	
	
	this.publishAddedData=function(){
		
		c.publishView('admin.html','default','clients',c.addedData())
	}
		
    this.getIdleClientConnections=function(){
        
        var res=[]
        
        for (var i=knownClients.connectedSockets.length-1;i>=0;i--){
            
            if(knownClients.connectedSockets[i].addedData.currentState=='idle'){
                res.push(knownClients.connectedSockets[i])
            }
            
        }
        
        return res
        
    }
	
	this.publishView = function(viewName,subViewName,viewPart,data) {

		var viewIndex= findViewIndex(viewName)
		
		var subViewIndex= findSubViewIndex(viewIndex,subViewName)
		
		var viewPartIndex= findViewPartIndex(viewIndex,subViewIndex,viewPart)
		
		
		for (var i=knownClients.views[viewIndex].subViews[subViewIndex].viewParts[viewPartIndex].connections.length-1;i>=0;i--){
			
			var connection=knownClients.views[viewIndex].subViews[subViewIndex].viewParts[viewPartIndex].connections[i]
			
			c.send(connection,'updateView',{
				
				viewName:viewName,
				subViewName:subViewName,
				viewPart: viewPart,
				data: data
				
	
			},'updateView',function(){},function(){
				//connection is not writeable, splice
				
				knownClients.views[viewIndex].subViews[subViewIndex].viewParts[viewPartIndex].connections.splice(i,1)
				
			})
			
		}
		
		
	}
	
		
	var findViewIndex=function(viewName){
		var len=knownClients.views.length
		for (var i=len-1;i>=0;i--){
			if(knownClients.views[i].viewName==viewName) return i
		}
		knownClients.views.push(new View(viewName))
		return len
	}
	
	var findSubViewIndex=function(viewIndex,subViewName){
		var len=knownClients.views[viewIndex].subViews.length
		for (var i=len-1;i>=0;i--){
			if(knownClients.views[viewIndex].subViews[i].subViewName==subViewName) return i
		}
		knownClients.views[viewIndex].subViews.push(new SubView(subViewName))
		return len
	}
	
	var findViewPartIndex=function(viewIndex,subViewIndex,viewPartName){
		var len=knownClients.views[viewIndex].subViews[subViewIndex].viewParts.length
		for (var i=len-1;i>=0;i--){
			if(knownClients.views[viewIndex].subViews[subViewIndex].viewParts[i].viewPartName==viewPartName) return i
		}
		knownClients.views[viewIndex].subViews[subViewIndex].viewParts.push(new ViewPart(viewPartName))
		return len
	}
	
	this.fromStore=function(connection,dontPush){
		
		return knownClients.connectedSockets[findConnectionIndex(connection,dontPush)]
		
	}
	
	this.addViewer=function(viewName, subViewName, viewParts, connection){
		
		
		connection = c.fromStore(connection)
		//knownClients.connectedSockets[findConnectionIndex(connection)]		//will push it if has to, will return the stored one with local vars in it
		
		var viewIndex= findViewIndex(viewName)
		
		var subViewIndex= findSubViewIndex(viewIndex,subViewName)
		
		for(var i=viewParts.length-1;i>=0;i--){
			
			var viewPart= viewParts[i]
			
			var viewPartIndex=	findViewPartIndex(viewIndex,subViewIndex,viewPart)
		
			knownClients.views[viewIndex].subViews[subViewIndex].viewParts[viewPartIndex].connections.push(connection)
			
		}
		
		
		if(connection){
			if(connection.addedData.viewing)removeViewer(connection.addedData.viewing.viewName,connection.addedData.viewing.subViewName,connection.addedData.viewing.viewParts,connection)
			
			
			connection.addedData.viewing={
				viewName:viewName,
				subViewName:subViewName,
				viewParts:viewParts
				
			}
		}
			
	}
	
	this.storeVal=function(connection,property,value){
		
		//connection must have .addedData.connectionID already
		connection=c.fromStore(connection)
		
        eval("(connection.addedData."+property+"=value)")
		
	}//
    
    this.storeValInArray=function(connection,arrayName,index,value){
		
		//connection must have .addedData.connectionID already
		connection=c.fromStore(connection)
        
        eval('if(!connection.addedData.'+arrayName+')connection.addedData.'+arrayName+'=[]')
		
        eval("(connection.addedData."+arrayName+'['+index+']'+"=value)")
		
	}
	this.updateSpeedStats=function(connection,index,value){
		
		//connection must have .addedData.connectionID already
		connection=c.fromStore(connection)
        

		if(!connection.addedData.speedStats)connection.addedData.speedStats=[]
        
        if(connection.addedData.speedStats[index]){
            
            connection.addedData.speedStats[index]= (value + connection.addedData.speedStats[index]*5)/6
		
            
        }else{
            
            connection.addedData.speedStats[index]=value
            
        }
        
        if(index==3){
            
            connection.addedData.speed=connection.addedData.speedStats[3]
            
        }
        
        
	}
	
	
	
	
	this.destroy=function(connection){
		
		//connection must have .addedData.connectionID already
		
        
		c.logoff(connection)
		
		var connectionIndex=findConnectionIndex(connection,true)	//true for destroying, no push
		
        
		connection = knownClients.connectedSockets.splice(connectionIndex,1)[0]//knownClients.connectedSockets[connectionIndex]		//will push it if has to, will return the stored one with local vars in it

        

		if(connection){
            
            
			if(connection.addedData.viewing)removeViewer(connection.addedData.viewing.viewName,connection.addedData.viewing.subViewName,connection.addedData.viewing.viewParts,connection)
		 
			var connectionData=connection.addedData
			
			if(connectionData){
				
                console.log('destroying connection',connection.addedData)
        
                
				connectionData.currentState='offline'
		
				if(!connectionData.stayLoggedIn){
					
					connectionData.loggedInAs=undefined
					
				}
				
				updateDbClients(connectionData)
				
				
				
			}
		
			//connection.destroy()
		}
		
		
		
	}

	this.addedData=function(connection){
		var result=[]
		if(connection){
			
		}else{
			
			for (var i=knownClients.connectedSockets.length-1;i>=0;i--){
				
                if(knownClients.connectedSockets[i].addedData.lastUser=='pending..'){
                    knownClients.connectedSockets.splice(i,1)
                }else{
                    result.push(knownClients.connectedSockets[i].addedData)
				
                }
               
			}
			
		}
		
		result=result.concat(knownClients.offlineSockets)
	
		return result
		
		
	}
		
	this.simpleKnownClients=function(){
		
		var result=[]
		
		knownClients.views.forEach(function(view){
			
			var tempSubViews=[]
			
			view.subViews.forEach(function(subView){
				
				var tempViewParts=[]
				
				subView.viewParts.forEach(function(viewPart){
					
					tempViewParts.push({
						viewPartName:viewPart.viewPartName,
						viewers:viewPart.connections.length
					})
					
					
				})
					
				tempSubViews.push({
					subViewName:subView.subViewName,
					viewParts:tempViewParts
				
				})
				
				
				
			})
			
			result.push({
					viewName:view.viewName,
					subViews:tempSubViews
				
				})
			
		})
		
		return result
		
		
	}


this.simpleActiveViews=function(){
		
		var result=[]
		
		knownClients.views.forEach(function(view){
			
			var tempSubViews=[]
			
			view.subViews.forEach(function(subView){
				
				var tempViewParts=[]
				
				subView.viewParts.forEach(function(viewPart){
					
					tempViewParts.push({
						viewPartName:viewPart.viewPartName,
						viewers:viewPart.connections.length
					})
					
					
				})
					
				tempSubViews.push({
					subViewName:subView.subViewName,
					viewParts:tempViewParts
				
				})
				
				
				
			})
			
			
			
			//var tempResult=
			
			result.push({
					viewName:view.viewName,
					subViews:tempSubViews
				
				})
			
		})
		
		return result
		
		
	}
	
		
		
		
	var removeViewer=function(viewName, subViewName, viewParts, connection){
		
		
		
		
		var viewIndex= findViewIndex(viewName)
		
		var subViewIndex= findSubViewIndex(viewIndex,subViewName)
		
		for(var i=viewParts.length-1;i>=0;i--){
			
			var viewPart= viewParts[i]
			
			var viewPartIndex=	findViewPartIndex(viewIndex,subViewIndex,viewPart)
			
			
		
			var connections= knownClients.views[viewIndex].subViews[subViewIndex].viewParts[viewPartIndex].connections
			
			for(var j=connections.length-1;j>=0;j--){
				
				if(connections[j].addedData.connectionID==connection.addedData.connectionID){
					connections.splice(j,1)
				}
				
			}
			
			if(connections.length==0){
				
				knownClients.views[viewIndex].subViews[subViewIndex].viewParts.splice(viewPartIndex,1)
				
			}
			
			
			
		}
		
		if(knownClients.views[viewIndex].subViews[subViewIndex].viewParts.length==0){
			
				knownClients.views[viewIndex].subViews.splice(subViewIndex,1)
			
		}
		
		if(knownClients.views[viewIndex].subViews.length==0){
			
				knownClients.views.splice(viewIndex,1)
			
		}
		
		
		
	}
	

	//////////////////////// functions to manage tasks
	
	
	this.fastestThinker = function() {

		var speedArray = []
		
		knownClients.connectedSockets.forEach(function(connection){
			
			
			if(!connection.addedData.speed||isNaN(connection.addedData.speed))connection.addedData.speed=500//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			
            if(connection.addedData.currentState=='idle'){
                speedArray.push(connection.addedData.speed)
                
                
                
            }else{
                speedArray.push(0)
            }
			
		})
		
		        
	
		var mx = speedArray.indexOf(Math.max.apply(Math, speedArray));
	
		
			//hany szazalaka az osszes geperonek a fastest thinker
        
        if (speedArray.length == 0) {
            
            return 0
            
        } else {
            var totalPower = speedArray.reduce(function(a, b) {
                    return a + b
                }) //sum
                
            var maxPower = speedArray[mx]
            
            knownClients.connectedSockets[mx].itsSpeed = [maxPower / totalPower]
            
            return knownClients.connectedSockets[mx]
            
        }
            
            
	
	};
	//
	this.sendTask=function(task, connection) {
		
		if (connection) {
			
			connection=c.fromStore(connection)
			
		}else{
	
			//get fastest available connection
				
			connection = c.fastestThinker()
			
		}
	
    if(connection){		
	
			//////////////get these out of here!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		if(!connection.addedData){
			connection.addedData={}
		}
		if(!connection.addedData.history){
			connection.addedData.history=[]
		}
		if(!connection.addedData.currentState){
			connection.addedData.currentState={}
		}
	
		var timeNow=new Date()
		
		connection.addedData.currentState='busy'
		
		var pushHistoryObject={
			
			taskNum : task.taskNum,
			command : task.command,
			sent : timeNow
			
		}
		
		
		c.send(connection, 'task', task, 'task', function() {}, function() {})
		
		return connection.addedData.connectionID
	
	}else{
        
        console.log('something really went wrong... no available connection??>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        
            
        
        console.log('<<<<<<<<<<<<<<<<<<<<<<<<something really went wrong... no available connection??!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        
        return 'bullshit'
        
    }

    }
}

module.exports=Clients



//