importScripts('../all/classes.js')
importScripts('../all/engine.js')
importScripts('../all/brandNewAi.js')
importScripts('../worker/deepening.js')
importScripts('../index/httpreq.js')

var learnerGlobals={
    playing:false
}


var playModGamePair=function(mod,secondGame){
    
    console.log('Starting modded game:',mod,'isSecond:',secondGame)
    
    
    
    
    
    
    

    
    
    
    
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


