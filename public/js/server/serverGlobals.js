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
    }
}
    
    
