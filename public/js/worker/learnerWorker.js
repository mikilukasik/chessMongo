importScripts('../all/classes.js')
importScripts('../all/engine.js')
importScripts('../all/brandNewAi.js')
importScripts('../worker/deepening.js')
importScripts('../index/httpreq.js')

var learnerWorkerGlobals={
    playing:false,
    myID:undefined,
    lastUser:undefined,
    gameNum:undefined,
    reporting:false,
    reportedAt:new Date(),
    sentWResult:{} ,
    modStr:'',
    wModded:false
}

var playGame=function(myGame, mod, wNx, wMod){
    //console.log('playGame called with args:',arguments)
    
    var result = {}
    
    
    if (wNx == wMod) {
        
        result = singleThreadAi(myGame,3,function(){},mod) 
    } else {
        result = singleThreadAi(myGame,3,function(){})
    }
    
    
    
    
    if (result.looped) {
        
       
    }
    
    
    
    if (result.result.length > 0) { //if there are any moves

        var aiMoveString = result.winningMove.move // the winning movestring

         moveInTable(aiMoveString, myGame, true) //true means learnerGame,no need to eval within moveintable

         var gameStatus=checkIfFinished(myGame)

         if(gameStatus.goOn){
             
            setTimeout(function() {
                
                if (learnerWorkerGlobals.reporting){
            
                    learnerToServer('learnerReport',myGame)
                    
                    
                }
                
                var timeNow=new Date()
                
                if(timeNow-learnerWorkerGlobals.reportedAt>30000){
                    
                    learnerWorkerGlobals.reportedAt=timeNow
                    
                    learnerToServer('learnerSmallReport',{
                        _id:myGame._id,
                        //moves:myGame.moves,
                        wName:myGame.wName,
                        bName:myGame.bName,
                        
                        lastDbTable:myGame
                        
                        
                        
                    })
                    
                    
                }
                
            
                playGame(myGame, mod, !wNx, wMod)

            }, 100)

             
         }else{
             
             //eval and report finished game here
             
             
             
             console.log('learnerGame finished',(wMod)?'white':'black')
             
             var modStr= (wMod) ? myGame.wName : myGame.bName
             
             var toSend={
                 
                        _id:myGame._id,
                        moves:myGame.moves,
                        wName:myGame.wName,
                        bName:myGame.bName,
                        result:gameStatus.result,
                        modStr:modStr,
                        wMod:wMod
                        
                    }
                    
             learnerToServer('learnerResult',toSend)
             
             if(wMod){
                 
                 //store stats somewhere
                 
                 learnerWorkerGlobals.sentWResult=toSend
                 
                 
                 
             }else{
                 
                 //compare with wstats and send final result
                 
                 var wResult=learnerWorkerGlobals.sentWResult.result
                 var bResult=toSend.result
                 
                 var winScore=0
                 
                 var moveCountScore=0//winScore*512
                 
                 if(wResult.whiteWon){
                     winScore++
                     moveCountScore-=wResult.totalMoves
                 }else{
                     if(wResult.blackWon)winScore--
                     moveCountScore+=wResult.totalMoves
                 }
                 
                 if(bResult.blackWon){
                     winScore++
                     moveCountScore-=bResult.totalMoves
                 }else{
                     if(bResult.whiteWon)winScore--
                     moveCountScore+=bResult.totalMoves
                 }
                 
                 moveCountScore+=winScore*512
                 
                 
                 var pieceScore=wResult.whiteValue-wResult.blackValue+bResult.blackValue-bResult.whiteValue
                 
                 var finalStat={
                     
                     modType:mod.modType,
                     modConst:mod.modConst,
                     modVal:mod.modVal,
                     
                     winScore:winScore,
                     pieceScore:pieceScore,
                     
                     moveCountScore:moveCountScore,
                     
                     
                     modStr:modStr
                     
                     
                     
                 }
                 
                 learnerToServer('learnerFinalResult',finalStat)
                 
                 console.log('gamePair finished, results:',finalStat)
                 
                 
                 
                 
             }
             
             
             
             
             
             
             
             
             
             
             
             
            if (wMod) {
            
                setTimeout(playModGamePair(mod,true), 500)
                
            } else {
            
                setTimeout(play(), 500)

            }
            
         }
       
    } else{
        
        console.log('ERROR: singleThreadAi returned empty result..')
        
    }
    
       
}

var prePlayGame = function(myGame, mod, wNx, wMod) {

			if (learnerWorkerGlobals.playing) {
                learnerWorkerGlobals.gameNum=myGame._id
                //console.log('###',myGame)
				playGame(myGame, mod, wNx, wMod)
			}
		}

var playModGamePair=function(mod,scndGame,partDone){
    
    var wModded = !scndGame
    
     var initedTable = {}
    
    if(partDone){
        console.log('partDone',partDone)
        initedTable= partDone.lastDbTable
        
        initedTable.modStr=partDone.modStr
        initedTable.wModded=partDone.wModded
        
        // learnerWorkerGlobals.wModded=initedTable.wModded
        
        //learnerGlobals.gameNum=initedTable.gameNum
        
    }else{
        
        if (wModded) { //this tells us if wmodded
				
            initedTable = new Dbtable(-1, mod.modType + " mod: " + mod.modVal, "standard")
        } else {
            
            initedTable = new Dbtable(-1, "standard", mod.modType + " mod: " + mod.modVal)


        }
        
        initedTable.learnerGame = true
        initedTable.modStr=(wModded)?initedTable.wName:initedTable.bName
        initedTable.wModded=wModded
        
    }
    
    
    learnerWorkerGlobals.modStr=initedTable.modStr
    learnerWorkerGlobals.wModded=initedTable.wModded
    
    
    initedTable.learningOn = learnerWorkerGlobals.lastUser
    initedTable.connectionID = learnerWorkerGlobals.myID
    
    
    		simplePost('/api/modGame',initedTable,function(response) {
                    
                    var resp=JSON.parse( response.response)
                    
					if(initedTable._id==-1)initedTable._id = resp._id

					mod.modConst = getMcFromMv(mod.modVal)

					prePlayGame(initedTable, mod, initedTable.wNext, wModded) 
				
                }, function(data) {
                   
				})
    

    
    
    
    
}

var play=function(){
    
    simpleGet('/api/mod/pendingGame',function(ret){
        
         var resp=JSON.parse(ret.response)
        
        if(resp.noPending){
            
            console.log('no pending learnerGame, satrting new')
            
            
            
                    
            simpleGet('/api/mod/type?id='+learnerWorkerGlobals.myID,function(ret){
                
                var resp=JSON.parse(ret.response)
                
            
                var modType=resp[~~(resp.length*Math.random())]
                
                if (modType==undefined)modType='---'
                
                simpleGet('/api/mod/limits?mod='+modType,function(ret2){
                    
                    var mod=JSON.parse(ret2.response)
                    
                    mod.modVal=mod.min+(~~(mod.max-mod.min)*Math.random()*1000)/1000
                    
                    learnerWorkerGlobals.playing=true
                    
                    playModGamePair(mod)
                })
                
            })
            
    
            
            
            
            
            
        }else{
            console.log('received pending learnerGame')
            
            console.log(resp)
            
            var mod={
                modType:resp.modStr.slice(0, 3),
                min:Number(resp.modStr.slice(9)),
                max:Number(resp.modStr.slice(9)),
                modVal:Number(resp.modStr.slice(9))
            }
            
            learnerWorkerGlobals.playing=true
            
            var scndGame=!resp.wModded
            
            playModGamePair(mod,scndGame,resp)
            
            
            
        }
        
        
        
        
        
    })
        
    
    
    
}

onmessage = function(event){
    
  

	switch (event.data.command) {
        
		case undefined:
        
            
        
        break;
        
        case 'start':
            
            //console.log('starting learner')
            
            learnerWorkerGlobals.myID=event.data.myID
            learnerWorkerGlobals.lastUser=event.data.lastUser
            
            play()
            
        
        break;
        
        case 'stop':
            
            //console.log('starting learner')
            
            var obj={
                gameNum:learnerWorkerGlobals.gameNum,
                myID:learnerWorkerGlobals.myID,
                modStr:learnerWorkerGlobals.modStr,
                wModded:learnerWorkerGlobals.wModded
            }
            
            console.log(obj)
            
            learnerToServer('stopLearningGame',obj,'',function(){
               
                postMessage({command:'terminateMe'})
                
            })
            
        
        break;
        
        case 'startReporting':
        
            if(event.data.data==learnerWorkerGlobals.gameNum){
                
                console.log('learner starts reporting')
                
                learnerWorkerGlobals.reporting=true
                
            }else{
                //console.log('@@@',event.data.data,learnerWorkerGlobals.gameNum)
            }
        
        break;
        
        case 'stopReporting':
        
            if(event.data.data==learnerWorkerGlobals.gameNum){
                
                console.log('learner stops reporting')
                learnerWorkerGlobals.reporting=false
                
                
            }else{
                //console.log('@@@',event.data.data,learnerWorkerGlobals.gameNum)
                
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



