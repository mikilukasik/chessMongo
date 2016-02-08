var serverGlobals={
    defaultMod:[],
    allMods:[],
    
}

serverGlobals.findInAllMods=function(what){
    var counter=serverGlobals.allMods.length
    
    while(counter--){
        
        if(serverGlobals.allMods[counter].modName==what)return counter
        
    }
    
    return counter
    
}
    

    
