importScripts('../all/classes.js')
importScripts('../all/engine.js')
importScripts('../all/brandNewAi.js')
importScripts('../worker/deepening.js')
importScripts('../index/httpreq.js')

var getModData=function(){
    simpleGet('/modData',function(ret){
        console.log('ret:',ret)
    })
}

onmessage = function(event){
    
  

	switch (event.data.command) {
		case undefined:
        
            
        
        break;
        
        case 'start':
            
            console.log('starting learner')
            
            getModData()
            
            //sockets(event.data.host)
        
        break;
        
    }

    
    
    
    
}


