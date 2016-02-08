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
    simpleGet('/api/mod/type?id='+myID,function(ret){
        
        var resp=JSON.parse( ret.response)
        
        var modType=resp[~~(resp.length*Math.random())]
        simpleGet('/api/mod/limits?mod='+modType,function(ret2){
            var mod=JSON.parse(ret2.response)
            
            playModGame(mod)
        })
        
        
        
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


