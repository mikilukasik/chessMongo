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
    
    
    router.route('/mod/stats').get(function(req,res){
        
        dbFuncs.getCollection('learningStats',function(learningStats){
            
            var toSend=''
            
            learningStats.forEach(function(stat){
                
               if(stat.finalResult.modType){
                    
                    var tempStr=stat.finalResult.modType + String.fromCharCode(9)+
                                stat.finalResult.modVal +String.fromCharCode(9)+
                                stat.finalResult.modConst +String.fromCharCode(9)+
                                stat.finalResult.winScore +String.fromCharCode(9)+
                                stat.finalResult.pieceScore +String.fromCharCode(9)+
                                stat.finalResult.moveCountScore +String.fromCharCode(13)
                    
                    toSend=toSend.concat(tempStr)
                    
               }
                
                
                
            })
            
            
            res.send(toSend)
            
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
                
                res.json({_id:dbTable._id})
                
                serverGlobals.learning.add(dbTable)
                
            })
          
        }else{
            
            //could update game here
            
            
        }
      
    })
    
}