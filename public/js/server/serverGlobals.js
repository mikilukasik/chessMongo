var serverGlobals={
    defaultMod:[],
    allMods:[],
    learningGames:[]
    
}

serverGlobals.findInAllMods=function(what){
    
    var counter=serverGlobals.allMods.length
    
    while(counter--){
        
        if(serverGlobals.allMods[counter].modType==what)return counter
        
    }
    
    return counter
    
}
    
serverGlobals.getModLimits=function(modType){
    
    var index=serverGlobals.findInAllMods(modType)
    
    if(index<0){
        return {
            modType:modType,
            min:0,
            max:100
        }
    }
    
    return(serverGlobals.allMods[index])
    
}

serverGlobals.learning={
    add:function(game){
        serverGlobals.learningGames.push({
            _id:game._id,
            reporting:false
        })
        clients.publishView('admin.html','default','learningGames',serverGlobals.learningGames)
    },
    
    setReporter:function(data){
        
        if(data.reporting){
            //set new reporter
            
            serverGlobals.learningGames.forEach(function(learningGame){
                
                if(learningGame._id==data._id){
                    
                    learningGame.reporting=true
                    
                }else{
                    
                    if(learningGame.reporting){
                        learningGame.reporting=false
                        //tell client to stop reporting implement!!!!!!!
                        
                    }
                
                    
                }
            
                   
            })
            
            
            
        }else{
            
            //just clear reporter
            
            var i=serverGlobals.learningGames.length
            while(i--){
                
                if(serverGlobals.learningGames[i]._id==data._id){
                    
                    serverGlobals.learningGames[i].reporting=false
                    
                }
                
                
            }
            
            
            
            
            
        }
        
        
        
    }
}
    
    
