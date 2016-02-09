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
        
    router.route('/modGame').post(function(req,res){
        
        console.log('modGame post in router:',req.body._id)
        
        var dbTable=req.body
        
        if(dbTable._id==-1){
            //new game
            
            startGame(dbTable.wName, dbTable.bName, {}, true,function(initedTable){
                dbTable=initedTable
                res.json({_id:dbTable._id})
                serverGlobals.learning.add(dbTable)
            })
            
            
            
            
            
            
        }
        
        
        
        
        
    })
    
}