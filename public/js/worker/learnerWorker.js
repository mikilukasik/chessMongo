importScripts('../all/classes.js')
importScripts('../all/engine.js')
importScripts('../all/brandNewAi.js')
importScripts('../worker/deepening.js')
importScripts('../index/httpreq.js')

//var modData={}

var myID=''

var playModGame=function(mod){
    console.log('Starting modded game:',mod)
}

var play=function(){
    simpleGet('/api/mod?id='+myID,function(ret){
        
        playModGame(ret.response)
        
    })
}

onmessage = function(event){
    
  

	switch (event.data.command) {
		case undefined:
        
            
        
        break;
        
        case 'start':
            
            console.log('starting learner')
            
            myID=event.data.myID
            play()
            
            //sockets(event.data.host)
        
        break;
        
    }

    
    
    
    
}


