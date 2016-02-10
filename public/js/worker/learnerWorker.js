importScripts('../all/classes.js')
importScripts('../all/engine.js')
importScripts('../all/brandNewAi.js')
importScripts('../worker/deepening.js')
importScripts('../index/httpreq.js')

var learnerGlobals={
    playing:false,
    myID:undefined,
    lastUser:undefined,
    gameNum:undefined,
    reporting:false
}


var playGame=function(myGame, mod, wNx, wMod){
    //console.log('playGame called with args:',arguments)
    
    var result = []
    
    
    if (wNx == wMod) {
        // result = singleThreadAi(myGame, modType, modConst, $scope.sendID) 
        result = singleThreadAi(myGame,3,function(){},mod) 
    } else {
        result = singleThreadAi(myGame,3,function(){})
    }
    
    //console.log('result',result)
    
    
    if (result.looped) {
        
        //console.log('looped')
        
        // //looped implement!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // myGame.gameIsOn = false //looped
        // evalGame(myGame, true)
        // myGame.looped = true
            
        // $http.post('/moved', myGame, function(req, res) {})


        // $http.get('/forceStop?t=' + $scope._id)
        //     .then(function(response) {
                
        //     }, function(data) {
        //         $scope.headMessage = 'Connection error, refreshing'

        //         $scope.refreshWhenUp()

        // })
    }
    
    if (result.result.length > 0) { //if there are any moves

        var aiMoveString = result.winningMove.move // the winning movestring

        //var toConsole = [] //to chat?
         moveInTable(aiMoveString, myGame, true) //true means learnerGame,no need to eval within moveintable

         


         setTimeout(function() {
             
             if (learnerGlobals.reporting){
        
                learnerToServer('learnerReport',myGame)
                
                
            }
        
            playGame(myGame, mod, !wNx, wMod)

        }, 100)



        //$scope.whatToDo = 'idle'
    } else { //can't move

        myGame.gameIsOn = false
        evalGame(myGame, true)
        
        
        if (wMod) {
            
            setTimeout(playModGamePair(mod,true), 500)
            
        } else {
           
            setTimeout(play(), 500)

		}

    }
    
    
       
}

var prePlayGame = function(myGame, mod, wNx, wMod) {

			if (learnerGlobals.playing) {
                learnerGlobals.gameNum=myGame._id
                //console.log('###',myGame)
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
    initedTable.learningOn = learnerGlobals.lastUser
    initedTable.connectionID = learnerGlobals.myID
    
    
    		simplePost('/api/modGame',initedTable,function(response) {
                    
                    var resp=JSON.parse( response.response)
                    
                    //console.log('starting modded game _id:',resp._id)


					initedTable._id = resp._id

					mod.modConst = getMcFromMv(mod.modVal)

					prePlayGame(initedTable, mod, true, wModded) //true stands for wNext
				
                }, function(data) {
                    
                    //console.log('error:',data)


				})
    

    
    
    
    
}

var play=function(){
    simpleGet('/api/mod/type?id='+learnerGlobals.myID,function(ret){
        
        var resp=JSON.parse(ret.response)
        
        var modType=resp[~~(resp.length*Math.random())]
        
        simpleGet('/api/mod/limits?mod='+modType,function(ret2){
            var mod=JSON.parse(ret2.response)
            
            mod.modVal=mod.min+(~~(mod.max-mod.min)*Math.random()*1000)/1000
            
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
            
            //console.log('starting learner')
            
            learnerGlobals.myID=event.data.myID
            learnerGlobals.lastUser=event.data.lastUser
            
            play()
            
        
        break;
        
        case 'startReporting':
        
            if(event.data.data==learnerGlobals.gameNum){
                
                console.log('learner starts reporting')
                
                learnerGlobals.reporting=true
                
            }else{
                //console.log('@@@',event.data.data,learnerGlobals.gameNum)
            }
        
        break;
        
        case 'stopReporting':
        
            if(event.data.data==learnerGlobals.gameNum){
                
                console.log('learner stops reporting')
                learnerGlobals.reporting=false
                
                
            }else{
                //console.log('@@@',event.data.data,learnerGlobals.gameNum)
                
            }
        
        
        break;
        
        
        
    }

    
    
    
    
}


function learnerToServer(command, data, message, cb) {

	postMessage({
		'command': 'toServer',
		'message': 'toServer',
		'data': {
			command: command,
			data: data,
			message: message,

		}

	})

	if (cb) cb()

}



