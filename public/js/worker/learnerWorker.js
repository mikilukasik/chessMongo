importScripts('../all/classes.js')
importScripts('../all/engine.js')
importScripts('../all/brandNewAi.js')
importScripts('../worker/deepening.js')
importScripts('../index/httpreq.js')

var learnerGlobals={
    playing:false,
    myID:undefined
}


var playModGamePair=function(mod,scndGame){
    
    console.log('Starting modded game:',mod,'isSecond:',scndGame)
    
    
    
    /////////////////////////copied from old thinker
    
    var initedTable = {}

    var wModded = !scndGame// true
    //if (scndGame) wModded = false
    
    if (wModded) { //this tells us if wmodded
				
        initedTable = new Dbtable(1, mod.modType + " mod: " + mod.modVal, "standard")
    } else {
        
        initedTable = new Dbtable(1, "standard", mod.modType + " mod: " + mod.modVal)


    }

    initedTable.learnerGame = true
    initedTable.learnedOn = learnerGlobals.myID
    
    

    

    
    
    
    
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


