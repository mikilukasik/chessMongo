importScripts('../all/classes.js')
importScripts('../all/engine.js')
importScripts('../all/brandNewAi.js')
importScripts('../worker/deepening.js')
importScripts('../index/httpreq.js')

var learnerGlobals={
    playing:false,
    myID:undefined
}


var playGame=function(myGame, mod, wNx, wMod){
    console.log('playGame called with args:',arguments)
    
    var result = []
    
    
    if (wNx == wMod) {
        // result = singleThreadAi(myGame, modType, modConst, $scope.sendID) 
        result = singleThreadAi(myGame,3,function(){},mod) 
    } else {
        result = singleThreadAi(myGame,3,function(){})
    }
    
    console.log('result',result)
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
}

var prePlayGame = function(myGame, mod, wNx, wMod) {

			if (learnerGlobals.playing) {
				playGame(myGame, mod, wNx, wMod)
			}
		}

var playModGamePair=function(mod,scndGame){
    
   
    
    /////////////////////////copied from old thinker
    
    var initedTable = {}

    var wModded = !scndGame
  
    
    if (wModded) { //this tells us if wmodded
				
        initedTable = new Dbtable(-1, mod.modType + " mod: " + mod.modVal, "standard")
    } else {
        
        initedTable = new Dbtable(-1, "standard", mod.modType + " mod: " + mod.modVal)


    }

    initedTable.learnerGame = true
    initedTable.learnedOn = learnerGlobals.myID
    
    
    		simplePost('/api/modGame',initedTable,function(response) {
                    
                    
                    console.log('starting modded game _id:',JSON.parse( response.response)._id)


					initedTable._id = response.response._id

					//$scope.sendMessage('learning ' + modType + ' on t' + initedTable._id + ", wModded: " + wModded)
				
					mod.modConst = getMcFromMv(mod.modVal)

					// $http.get('/learnerPoll?n=' + $scope.sendID +
					// 	'&t=' + initedTable._id +
					// 	'&modType=' + modType +
					// 	'&modVal=' + modVal + '&p=' + modConst + '&a=' + $scope.mainThreadSpeed
						
					// )

					//initedTable.modConst = mod.modConst

					prePlayGame(initedTable, mod, true, wModded) //true stands for wNext
				
                }, function(data) {
                    
                    console.log('error:',data)

                    
					// $scope.headMessage = 'Connection error, refreshing'

					// $scope.refreshWhenUp()

				})
    

    
    
    
    
}

var play=function(){
    simpleGet('/api/mod/type?id='+learnerGlobals.myID,function(ret){
        
        var resp=JSON.parse(ret.response)
        
        var modType=resp[~~(resp.length*Math.random())]
        
        simpleGet('/api/mod/limits?mod='+modType,function(ret2){
            var mod=JSON.parse(ret2.response)
            
            mod.modVal=mod.min+(mod.max-mod.min)*Math.random()
            
            learnerGlobals.playing=true
            
            playModGamePair(mod)
        })
        
        
        
    })
}

onmessage = function(event){
    
  

	switch (event.data.command) {
        
		case undefined:
        
            
        
        break;
        
        case 'start':
            
            console.log('starting learner')
            
            learnerGlobals.myID=event.data.myID
            
            play()
            
        
        break;
        
    }

    
    
    
    
}


