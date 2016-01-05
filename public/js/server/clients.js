var Clients=function(){
	
	////////  main store
	var knownClients={
		
		connectedSockets:[],		//sockets will have extra data added to them
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
		
		
		//console.log('after login',knownClients.onlineUsers)
		this.publishOnlineUsers()
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
			this.publishOnlineUsers()		
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
		//console.log('engem hivtak',this.getOnlineUsers())
		this.publishView('lobby.html','default','onlineUsers',this.getOnlineUsers())
	}
	
	// this.getOnlineUsers=function(){
	// 	return knownClients.onlineUsers
	// }
	
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
			knownClients.connectedSockets.push(connection)
			return csLen
		}	
		
		
	}
	
	this.sendByName= function(name, command, data, message, cb ,err) {
	
		var connection=this.getConnectionByName(name)
		//console.log('ittagond:<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',name)
	
		this.send(connection, command, data, message, cb ,err)
	}
		
	this.send = function(connection, command, data, message, cb ,err) {
	
		////console.log('ittagond:<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',connection)
	
		////console.log('connection writable:',connection.socket.writable)
		// this.publishView('admin.html','default','clients',this.addedData())			//loops it!!!!!!!!!!!!!!!
		
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
	
		////console.log('connection writable:',connection.socket.writable)
		// this.publishView('admin.html','default','clients',this.addedData())			//loops it!!!!!!!!!!!!!!!
		
		for (var i=knownClients.connectedSockets.length-1;i>=0;i--){
			
			if(knownClients.connectedSockets[i].socket.writable) {
			
			
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
			
			dbFuncs.publishDisplayedGames(loginName,connection)
			
			
			
			
			
		}else{
			//find connection??!!!!!!!!!!!!!!!!
			
			
			
		}
		
		
		
	}
	
	
	this.publishAddedData=function(){
		////console.log('3333333333333333333333333333333333333333333333333333333333333333333333333333')
		this.publishView('admin.html','default','clients',this.addedData())
	}
		
		
	
	this.publishView = function(viewName,subViewName,viewPart,data) {
		////console.log('viewPop called',viewName,viewPart)
		var viewIndex= findViewIndex(viewName)
		
		var subViewIndex= findSubViewIndex(viewIndex,subViewName)
		
		var viewPartIndex= findViewPartIndex(viewIndex,subViewIndex,viewPart)
		
		
		for (var i=knownClients.views[viewIndex].subViews[subViewIndex].viewParts[viewPartIndex].connections.length-1;i>=0;i--){
			
			var connection=knownClients.views[viewIndex].subViews[subViewIndex].viewParts[viewPartIndex].connections[i]
			
			clients.send(connection,'updateView',{
				
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
	
	this.fromStore=function(connection){
		
		return knownClients.connectedSockets[findConnectionIndex(connection)]
		
	}
	
	this.addViewer=function(viewName, subViewName, viewParts, connection){
		
		//connection must have .addedData.connectionID already
		//////console.log(knownClients)
		
		connection = this.fromStore(connection)
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
		connection=this.fromStore(connection)
		
        eval("(connection.addedData."+property+"=value)")
		
	}
	
	
	
	
	this.destroy=function(connection){
		
		//connection must have .addedData.connectionID already
		
		this.logoff(connection)
		
		var connectionIndex=findConnectionIndex(connection,true)	//true for destroying, no push
		
		connection = knownClients.connectedSockets.splice(connectionIndex,1)[0]//knownClients.connectedSockets[connectionIndex]		//will push it if has to, will return the stored one with local vars in it
		////console.log('---------------->>>',connectionIndex,connection.addedData,'<<<----------------')
		if(connection){
			if(connection.addedData.viewing)removeViewer(connection.addedData.viewing.viewName,connection.addedData.viewing.subViewName,connection.addedData.viewing.viewParts,connection)
		
			var connectionData=connection.addedData
			
			if(connectionData){
				
				connectionData.currentState='offline'
		
				//knownClients.offlineSockets.push(connectionData)
				
				//below function is from another file loaded before this script
				
				////console.log()
				
				if(!connectionData.stayLoggedIn){
					//console.log('user disconnected, stayLoggedIn was oped out. Clearing login details for client.')
					
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
				
				result[i]=knownClients.connectedSockets[i].addedData
				
				if(!knownClients.connectedSockets[i].socket.writable){
					result[i].speed='non-writable'
				}
				
				
				
			}
			
		}
		
		result=result.concat(knownClients.offlineSockets)
		
		//console.log('ccccccccccccccccccccccccccccc::::::',knownClients.offlineSockets)
		
		return result
		
		
	}
		
	this.simpleKnownClients=function(){
		////console.log('oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo	')
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
	
	
	this.fastestThinker = function(spdPct) {

		var speedArray = []
		// for (var i = 0; i < knownClients.connectedSockets.length; i++) {
		// 	////console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
		
		// 	speedArray.push(~~(100 * (knownClients.connectedSockets[i].addedData.speed)))
		// }
		
		knownClients.connectedSockets.forEach(function(connection){
			////console.log(connection.addedData)
			
			if(!connection.addedData.speed)connection.addedData.speed=0.000001//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			
			speedArray.push(connection.addedData.speed)
		})
		
		
	
		var mx = speedArray.indexOf(Math.max.apply(Math, speedArray));
	
		if (!spdPct) {
			////console.log(speedArray[0], mx,speedArray.length,'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
		
			return knownClients.connectedSockets[mx]
		} else { //parameter true
			//hany szazalaka az osszes geperonek a fastest thinker
			if (speedArray.length == 0) {
				//no thinkers??????????!! server move?
				return 0
			} else {
				var totalPower = speedArray.reduce(function(a, b) {
						return a + b
					}) //sum
				var maxPower = speedArray[mx]
				return maxPower / totalPower
			}
	
		}
	
	};
	//
	this.sendTask=function(task, connection) {
		
		//var sentTo = ''
	
		if (connection) {
			
			connection=this.fromStore(connection)
			
		}else{
	
			//get fastest available connection
			
			////console.log('a')		
			connection = this.fastestThinker()
			////console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',connection,'yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy')
		
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
	
		if(task.command='splitMove'){
			connection.addedData.speed=connection.addedData.speed/100
		}
	
	
		var timeNow=new Date()
		
		connection.addedData.currentState='busy'
		//connection.addedData.currentState.lastSeen=timeNow
		
		var pushHistoryObject={
			
			taskNum : task.taskNum,
			command : task.command,
			sent : timeNow
			
		}
		
		if(connection.addedData.history.length>3)connection.addedData.history.shift()
		connection.addedData.history.push(pushHistoryObject)
		
		this.send(connection, 'task', task, 'task', function() {}, function() {})
		
	
			//adminPop()!!!!!!!!!!!!!!!!!!!!!!!!!
		////console.log('this ID:',connection.addedData.connectionID)
		return connection.addedData.connectionID
	
	}else{
        
        console.log('something really went wrong... no available connection??>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        
            
        
        console.log('<<<<<<<<<<<<<<<<<<<<<<<<something really went wrong... no available connection??!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        
        
    }

    }
}

//