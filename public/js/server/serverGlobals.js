///////classes/////////////////



////////////////////////global vars/////////////////////////////////


var serverGlobals={
    defaultMod:[],
    allMods:[],
    learningGames:[],
    gameToReport:-1,
    //reportedGame:{},
    learnerTable:new Dbtable('pre-init','pre-init','pre-init'),
    learningStats:[],
    
    
   
    
    LearningStat:function(modStr,modConst,initCb,dbCb,idCb){
        
        var modType=modStr.slice(0,3)
        var modVal=Number(modStr.slice(9))
        
        if(!modConst)modConst=getMcFromMv(modVal)
    
        this._id=-1     //idCb will receive and update _id
        
        this.modStr=modStr
        
        this.modType=modType
        this.modVal=modVal
        this.modConst=modConst
        
        this.finalResult={
            
        }
        
        this.wModGame={
            _id:-1,
            learnedOn:'',
            connectionID:'',
            result:{},
            status:'pending',
            moves:[],
            modStr:modStr
            
        }
        this.bModGame={
            _id:-1,
            learnedOn:'',
            connectionID:'',
            result:{},
            status:'pending',
            moves:[],
            modStr:modStr
            
        }
        
        
        
        if(initCb)initCb(this)
        
        if(dbCb&&idCb){
            
            dbCb(this,idCb)
            
        }
        
    },
    
}

serverGlobals.learnerResult=function(data){
    
            //console.log('serverGlobals.learnerResult called',data)
            
            
            var modStr=data.wName
            var wModded=true
                
            if(data.wName=='standard'){
                wModded=false
                modStr=data.bName
            }
            
            
            
        
            serverGlobals.learningStats.forEach(function(learningStat){
            
            if(learningStat.modStr==modStr){
                
                learningStat.result=data.result
                
                dbFuncs.saveLearnerResult(learningStat)
                
                //console.log('saving finished learnerGame',learningStat)
                
                dbFuncs.updateLearningStat(modStr,function(foundData){
                    
                    console.log('@@@serverGlobals.learnerResult foundData',foundData)
                    
                    if(wModded){
                        foundData.wModGame.result=data.result 
                    }else{
                        foundData.bModGame.result=data.result
                    }
                },function(learningStats){
                    
                    console.log('@@@serverGlobals.learnerResult savedData',learningStats)
                    clients.publishView('admin.html','default','learningStats',learningStats)
                    
                })
                
            }else{
                console.log('noGood:',learningStat.modStr,modStr)
            }
        })
        
    }

serverGlobals.learnerSmallReport=function(data){
    
    var modStr=data.wName
    var wModded=true
        
    if(data.wName=='standard'){
        wModded=false
        modStr=data.bName
    }
    
    // console.log('------------------',modStr)
    
   dbFuncs.updateLearningStat(modStr,function(foundDoc){
       
       
       
       if(foundDoc){
           
           if(wModded){
            
                foundDoc.wModGame.moves=data.moves
                
            }else{
                
                foundDoc.bModGame.moves=data.moves
            
          }
                
       }
       
            
                
                
        
    },function(savedDoc){

        serverGlobals.updateLearningStat(savedDoc,function(learningStats){
            
            clients.publishView('admin.html','default','learningStats',learningStats)
        
        })
        
        
    })
    
}

serverGlobals.updateLearningStat=function(savedDoc,cb){
    
     var i=serverGlobals.learningStats.length
     
     while(i--){
         
         if(serverGlobals.learningStats[i].modStr==savedDoc.modStr){
             
             
             
             serverGlobals.learningStats[i]=savedDoc
             
             
             if (cb)cb(serverGlobals.learningStats)
             
             
             break;
         }
         
         
     }
    
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
        
       
        var modStr=game.wName
        var wModded=true
          
        if(game.wName=='standard'){
            wModded=false
            modStr=game.bName
        }
        
        if (wModded){
            //wmodded started
            new serverGlobals.LearningStat(modStr,undefined,function(statBeforeSaving){
                
                statBeforeSaving.wModGame._id=game._id
                statBeforeSaving.wModGame.learnedOn=game.learningOn
                statBeforeSaving.wModGame.connectionID=game.connectionID
                statBeforeSaving.wModGame.status='in progress'
                
            },dbFuncs.newLearningStat,function(statWithId){

                serverGlobals.learningStats.push(statWithId)
                clients.publishView('admin.html','default','learningStats',serverGlobals.learningStats)
                //console.log(statWithId)
                
            })
             
        }else{
            //bmodded started
            dbFuncs.updateLearningStat(modStr,function(foundDoc){
                
                foundDoc.bModGame._id=game._id
                foundDoc.bModGame.learnedOn=game.learningOn
                foundDoc.bModGame.connectionID=game.connectionID
                foundDoc.bModGame.status='in progress'
                
                
            },function(savedDoc){

                serverGlobals.updateLearningStat(savedDoc,function(learningStats){
                    
                    clients.publishView('admin.html','default','learningStats',learningStats)
                
                })
                
                
            })
            
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
        
        //console.log('setreporter data',data)
        if(data){
        
        if(data.reporting){
            //set new reporter
            serverGlobals.gameToReport=data._id
            
            serverGlobals.learningGames.forEach(function(learningGame){
                
                if(learningGame._id==data._id){
                    
                    learningGame.reporting=true
                    
                    //console.log('set to report:',learningGame)
                    
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
                    
                    //console.log('set to stop reporting:',serverGlobals.learningGames[i])
                        
                    var connection=clients.fromStore({addedData:{connectionID:serverGlobals.learningGames[i].connectionID}})
                    
                    clients.send(connection,'stopReporting',serverGlobals.learningGames[i]._id)
                    
                }
                
                
            }
            
            
            
            
            
        }
    }
        
        
    }
}
    
    
