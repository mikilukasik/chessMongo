///////classes/////////////////
var LearningStat=function(modStr,modConst,dbCb,idCb){
    
    this._id=-1     //idCb will receive _id
    
    var modType=modStr.slice(0,3)
    var modVal=Number(modStr.slice(9))
       
    if(!modConst)modConst=getMcFromMv(modVal)
    
    this.modStr=modStr
    
    this.finalResult={
        
    }
    
    this.wModGame={
        _id:-1,
        learnedOn:'',
        connectionID:'',
        result:{}
        
    }
    this.bModGame={
        _id:-1,
        learnedOn:'',
        connectionID:'',
        result:{}
        
    }
    
    this.modType=modType
    this.modVal=modVal
    this.modConst=modConst
    
    if(dbCb&&idCb){
        
        dbCb(this,idCb(this._id))
        
    }
    
}


////////////////////////global vars/////////////////////////////////


var serverGlobals={
    defaultMod:[],
    allMods:[],
    learningGames:[],
    gameToReport:-1,
    //reportedGame:{},
    learnerTable:new Dbtable('pre-init','pre-init','pre-init'),
    learningStats:[]
    
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
    markGamesInactive:{
        byConnectionID:function(id){
            
            var i=serverGlobals.learningGames.length
            while(i--){
                
                if(serverGlobals.learningGames[i].connectionID==id){
                    serverGlobals.learningGames.splice(i,1)
                }
                
                
            }
            
            
            
        }
    },
    add:function(game){
        
        var wModded=true
        var modStr=game.wName
        
        if(game.wName=='standard'){
            wModded=false
            modStr=game.bName
        }
        
        if (wModded){
            
            var newStat=new LearningStat(modStr,undefined,function(tempStat,idCb){
                
                dbFuncs.newLearningStat(tempStat,idCb)
                
                
                
            },function(err,res,data){
                
                console.log('@@@err,res,data',err,res,data)
                
                
            })
            
            newStat.wModGame._id=game._id
            newStat.wModGame.learnedOn=game.learningOn
            newStat.wModGame.connectionID=game.connectionID
            
            serverGlobals.learningStats.push(newStat)
            
            clients.publishView('admin.html','default','learningStats',serverGlobals.learningStats)
            
            
            
        }
        
        
        serverGlobals.learningGames.push({
            _id:game._id,
            reporting:false,
           
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
    
    
