var initRouter=function(router,app){
        
        
    router.use(function(req, res, next) {
       
        next(); // make sure we go to the next routes and don't stop here
    });



    router.get('/', function(req, res) {
        res.json({ message: 'hooray! welcome to our api!' });   
    });

    app.use('/api', router);


    

    router.route('/mod/type').get(function(req,res){
        
        var sendMod=clients.getMod(req.query.id)
        
        if(sendMod=='default'){
            res.json(serverGlobals.defaultMod)
        }else{
            res.json(sendMod)
        }
        
        
        
    })

    router.route('/mod/limits').get(function(req,res){
        
        var modLimits=serverGlobals.getModLimits(req.query.mod)
        
        
        
        res.json(modLimits)
        
        
    })
    
    router.route('/mod/pendingGame').get(function(req,res){
        
        
        dbFuncs.query('learningStats',{
            currentStatus:'inactive'
        },function(learningStats,saverFunc){
            
            var i=learningStats.length
           
            console.log(i,'inactive game(s) found')
            
            var sendGame=learningStats[0]
            if(sendGame){
                
                
                sendGame.currentStatus='active'
                
                var sendModGame=(sendGame.wModGame.status=='in progress')?sendGame.wModGame:sendGame.bModGame
            
                saverFunc([0],function(index){
                    res.json(sendModGame)
                })
                
            }else{
                    res.json({noPending:true})
            }
           
            
        })
        
        
        
        
    })
    
    
    router.route('/mod/stats').get(function(req,res){
        
        
            dbFuncs.query('learningStats',{},function(learningStats){
                
                var toSend=[]
                
                learningStats.forEach(function(stat){
                    
                    if(stat.finalResult.modType){
                        
                       toSend.push([//stat.finalResult.modType,
                                    stat.finalResult.modConst,
                                    //stat.finalResult.modConst,
                                    1500*stat.finalResult.winScore,
                                    50*stat.finalResult.pieceScore,
                                    stat.finalResult.moveCountScore,
                                    
                                    500*stat.finalResult.winScore+
                                    50*stat.finalResult.pieceScore+
                                    stat.finalResult.moveCountScore,
                                    
                                    
                                    //stat.finalResult.modConst
                                    
                        ])//,
                        
                        
                }
                    
                    
                
            })
            
            
            res.json(toSend)
            
        })
        
    
    })
    
    
    router.route('/mod/stats/:modType').get(function(req,res){
        
        var modType=req.params.modType
        
        dbFuncs.query('learningStats',{modType:modType},function(learningStats){
                
            var toSend=[]
                 
                        
            learningStats.forEach(function(stat){
                    
                if(stat.finalResult.modType){
                        
                        toSend.push([//stat.finalResult.modType,
                                    stat.finalResult.modConst,
                                    //stat.finalResult.modConst,
                                    1500*stat.finalResult.winScore,
                                    50*stat.finalResult.pieceScore,
                                    stat.finalResult.moveCountScore,
                                    
                                    500*stat.finalResult.winScore+
                                    50*stat.finalResult.pieceScore+
                                    stat.finalResult.moveCountScore,
                                    
                                    
                                    //stat.finalResult.modConst
                                    
                                    
                        ])//,
                                    //stat.finalResult.modType])
                        
                        
                }
                    
                    
                    
            })
            
            
            
            res.json(toSend)
            
        })
    
      
        
        
    })
    
    
    
    
    
    
    
        
    router.route('/modGame').post(function(req,res){
        
        var dbTable=req.body
        
        var learningOn=dbTable.learningOn
        var connectionID=dbTable.connectionID
        
        
        if(dbTable._id==-1){
            //new game
            
            startGame(dbTable.wName, dbTable.bName, {}, true,function(initedTable){
                
                dbTable=initedTable
                
                dbTable.learningOn=learningOn
                dbTable.connectionID=connectionID
                
                //console.log('@@@@',dbTable.bName)
                
                dbTable.wModGame=(dbTable.bName=='standard')?true:false
                
                res.json({_id:dbTable._id})
                
                serverGlobals.learning.add(dbTable,connectionID)
                
            })
          
        }else{
            
            //could update game here
            
            res.json({
                result:serverGlobals.learning.newLearnerForOldGame(dbTable,connectionID)
            })
            
        }
      
    })
    
}