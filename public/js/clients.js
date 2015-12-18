var Clients=function(){
	
	/////  main store
	
	var knownClients={
		
		connectedSockets:[],
		views:[]
		
	}
		
	
	/////   sub classes
	
		
	var ConnectedSocket=function(id,connection){
		this.id=id;
		this.loginName=''
		this.thinkerName=''
		
		this.connection=connection;
		this.view=undefined
	}

	
		
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

	
	
	//// functions to manage connections
	
	
	
	// var connectionIndex=function(id,connection){
		
	// 	var csLen=knownClients.connectedSockets.length
		
	// 	for (var i=csLen-1;i>=0;i--){
			
	// 		if(knownClients.connectedSockets[i].id==id){
	// 			return i
	// 		}
			
	// 	}
		
	// 	//not found, did not return
			
	// 	knownClients.connectedSockets.push(new ConnectedSocket(id,connection))
	// 	return csLen
		
	// }
	
		
		
	this.send = function(connection, command, data, message, cb ,err) {
	
		console.log('connection writable:',connection.socket.writable)
		
		if(connection.socket.writable) {
			
			
				connection.sendUTF(JSON.stringify({
					command: command,
					data: data,
					message: message
				}))
				
				cb()
			
			
			
			
		}else{
			
			if(err)err()
			
		}
		
	
	}
	
	/////////////  functions to manage views
	
		
	
	this.publishView = function(viewName,subViewName,viewPart,data) {
		console.log('viewPop called',viewName,viewPart)
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
	
	this.save=function(viewName, subViewName, viewParts, connection){
		
		
		
		var viewIndex= findViewIndex(viewName)
		
		var subViewIndex= findSubViewIndex(viewIndex,subViewName)
		
		for(var i=viewParts.length-1;i>=0;i--){
			
			var viewPart= viewParts[i]
			
			var viewPartIndex=	findViewPartIndex(viewIndex,subViewIndex,viewPart)
		
			knownClients.views[viewIndex].subViews[subViewIndex].viewParts[viewPartIndex].connections.push(connection)
			
		}
		
		
		
		if(connection.viewing)removeViewer(connection.viewing.viewName,connection.viewing.subViewName,connection.viewing.viewParts,connection)
		
		
		connection.viewing={
			viewName:viewName,
			subViewName:subViewName,
			viewParts:viewParts
			
		}
		
		
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
				
				if(connections[j].connectionID==connection.connectionID){
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
	

	
		
	
}




// function noCircular(input){
	
// 	//http://stackoverflow.com/questions/11616630/json-stringify-avoid-typeerror-converting-circular-structure-to-json
		
// 	var cache = [];
// 	var result = JSON.stringify(input, function(key, value) {
// 		if (typeof value === 'object' && value !== null) {
// 			if (cache.indexOf(value) !== -1) {
// 				// Circular reference found, discard key
// 				return;
// 			}
// 			// Store value in our collection
// 			cache.push(value);
// 		}
// 		return value;
// 	});
// 	cache = null; // Enable garbage collection
		
// 	return result
	
// }