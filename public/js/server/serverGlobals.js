var serverGlobals={
    defaultMod:[],
    allMods:[],
    learningGames:[],
    gameToReport:-1,
    //reportedGame:{},
    learnerTable:new Dbtable('pre-init','pre-init','pre-init')
    
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
        
        var wModded=true
        var modStr=game.wName
        
        if(game.wName=='standard'){
            wModded=false
            modStr=game.bName
        }
        
        
        serverGlobals.learningGames.push({
            _id:game._id,
            reporting:false,
            // wName:game.wName,
            // bName:game.bName
            modStr:modStr,
            wModded:wModded,
            
            learningOn:game.learningOn,
            connectionID:game.connectionID
        })
        clients.publishView('admin.html','default','learningGames',serverGlobals.learningGames)
    },
    
    setReporter:function(data){
        
        console.log('setreporter data',data)
        if(data){
        
        if(data.reporting){
            //set new reporter
            serverGlobals.gameToReport=data._id
            
            serverGlobals.learningGames.forEach(function(learningGame){
                
                if(learningGame._id==data._id){
                    
                    learningGame.reporting=true
                    
                    console.log('set to report:',learningGame)
                    
                    var connection=clients.fromStore({addedData:{connectionID:learningGame.connectionID}})
                    
                     clients.send(connection,'startReporting',learningGame._id)
                    //tell client to start reporting implement!!!!!!!
                    
                }else{
                    
                    if(learningGame.reporting){
                        learningGame.reporting=false
                        //tell client to stop reporting implement!!!!!!!
                        console.log('set to stop reporting:',learningGame)
                        
                        var connection=clients.fromStore({addedData:{connectionID:learningGame.connectionID}})
                        
                        clients.send(connection,'stopReporting',learningGame._id)
                        
                        
                    }
                
                    
                }
            
                   
            })
            
            
            
        }else{
            
            //just clear reporter
            
            var i=serverGlobals.learningGames.length
            while(i--){
                
                if(serverGlobals.learningGames[i]._id==data._id){
                    
                    serverGlobals.learningGames[i].reporting=false
                    
                    console.log('set to stop reporting:',serverGlobals.learningGames[i])
                        
                    var connection=clients.fromStore({addedData:{connectionID:serverGlobals.learningGames[i].connectionID}})
                    
                    clients.send(connection,'stopReporting',serverGlobals.learningGames[i]._id)
                    
                }
                
                
            }
            
            
            
            
            
        }
    }
        
        
    }
}
    
    
