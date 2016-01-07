var SplitMove=function(dbTableWithMoveTask) {
    
    this.splitMoveIndex=undefined
    
    this.splitMoveID=Math.random()*Math.random() 
    
     var movesToSend = []
 
     dbTableWithMoveTask.moveTask.moveCoords.forEach(function(moveCoord, index) {
		
        movesToSend.push(new MoveToSend(moveCoord, index, dbTableWithMoveTask, this.splitMoveID))
			
	})
    
    this.movesToSend=movesToSend    //this will get empty as we send the moves out for processing
    
    this.moves=movesToSend.slice()      //this should stay full
    
    this.thinkers=[]                //this will get filled with the clients working on this splitmove
    
    
    this.gameNum=dbTableWithMoveTask._id
    
    
    this.origTable=dbTableWithMoveTask.table
    
    this.origMoveTask = dbTableWithMoveTask.moveTask
     
    this.origMoveTask = dbTableWithMoveTask.moveTask
    
    this.pendingMoveCount = dbTableWithMoveTask.moveTask.moveCoords.length
    
   
}

var SplitMoves=function(clients){
    
    var store={
        
            q:[],
            
          
                       
        }
     
    
    this.getNakedQ=function(){
        
        var res=[]
        
        store.q.forEach(function(splitMove){
            res.push({
                gameNum:splitMove.gameNum,
                thinkers:splitMove.thinkers,
                moves:splitMove.moves,
                a:splitMove.movesToSend
                
               
                
            })
        })
        
        return res
        
    }
    
    var qIndexBysplitMoveID=function(splitMove){
        
        for (var i=store.q.length-1;i>=0;i--){
            
            if(splitMove.splitMoveID===store.q[i].splitMoveID)return i
            
        }
        
        //return -1
        
        
        // return store.q.findIndex(function(element,index){
        //     if(splitMove.splitMoveID===element.splitMoveID) {return true}else{return false}
        // })
        
    }
    
    var qIndexByGameID=function(gameID){
        
        
        for (var i=store.q.length-1;i>=0;i--){
            
            if(gameID==store.q[i].gameNum)return i
            
        }
        
        //return 
        
        // return store.q.findIndex(function(element,index){
              
        //     if(gameID==element.dbTable._id) {return true}else{return false}
        // })
        
    }
    
    this.publishToAdmin=function(){
        
        clients.publishView('admin.html', 'default', 'splitMoves', this.getNakedQ())//[[1,2,3],[4,5,6]])//this.getNakedQ())

     
        //publishSplitMoves(this.getNakedQ())
        //publish to admin view here
    }
    
    var getSplitMoveTask = function(splitMove, percent) {

        var numberToSend = Math.ceil(percent * splitMove.movesToSend.length)
           
        var splitMoveTasks = []

        for (var i = 0; i < numberToSend; i++) {
            splitMoveTasks.push(splitMove.movesToSend.pop())
        }

        return splitMoveTasks

    }

    
    this.add=function(dbTableWithMoveTask){
        
        var splitMove=new SplitMove(dbTableWithMoveTask)
        
        var splitMoveIndex=store.q.push(splitMove)-1
        
        splitMove.splitMoveIndex=splitMoveIndex
        
        

        while (splitMove.movesToSend.length > 0) {

            var itsSpeed=1
            
            var thinker = clients.fastestThinker(itsSpeed)
            
            var sendThese = getSplitMoveTask(splitMove, itsSpeed)
            
            
            var sentCount = sendThese.length

            var sentTo = clients.sendTask(new Task('splitMove', sendThese, 'splitMove t' + dbTableWithMoveTask._id + ' sentCount: ' + sentCount),thinker) //string
        
            this.registerSentMoves(dbTableWithMoveTask._id, sentTo, sentCount)
            
        } 
            
        this.publishToAdmin()
    
        
        return splitMove   
        
        
    }
    
    var getThinkerIndex=function(qIndex,thinker) {

       
        if(store.q[qIndex])for (var i = store.q[qIndex].thinkers.length - 1; i >= 0; i--) {


            if (store.q[qIndex].thinkers[i].thinker == thinker.toString()) {
                return i
            }
        }



        return -1

    }
    
    this.registerSentMoves=function(gameID, thinker, sentCount){
        
        var qIndex = qIndexByGameID(gameID)
        
        return store.q[qIndex].thinkers.push({
            
            
            thinker: thinker,
            sentCount: sentCount,
            done: false,
            progress: 0

        }) -1
  
        
    }
    
    this.updateSplitMoveProgress = function(gameID, thinker, data, connection) {
        
        var progress
        var beBackIn
        
        if(data.final){
            
            progress=100
            beBackIn=0
            
            clients.updateSpeedStats(connection,data.depth,data.mpm)
        
        }else{
             
            progress=data.progress
            beBackIn=data.beBackIn 
        }
        
       
       
        var mpm=data.mpm 
 
        var qIndex = qIndexByGameID(gameID)

        var mIndex = getThinkerIndex(qIndex, thinker)

        if (store.q[qIndex]&&store.q[qIndex].thinkers[mIndex]) {
            
            
             if(data.results){
            
                data.results.forEach(function(res){
                    
                    store.q[qIndex].moves[res.moveIndex].done=true
                    store.q[qIndex].moves[res.moveIndex].result=res
                   
                    store.q[qIndex].pendingMoveCount--
                    
                    if(store.q[qIndex].pendingMoveCount==0){
                        
                        console.log('@@@@@@@@@@@@@@@@@@@@@@@@@  all solved.')
                        
                    }
                    
                })
                
                
            }
                
                
            //
            
            
            
            

            if (progress > store.q[qIndex].thinkers[mIndex].progress) {

                store.q[qIndex].thinkers[mIndex].progress = progress
                store.q[qIndex].thinkers[mIndex].beBackIn = beBackIn
                store.q[qIndex].thinkers[mIndex].mpm = mpm

            }

           
            clients.publishView('board.html', gameID, 'busyThinkers', store.q[qIndex].thinkers)

        }

    }
    
    this.markSplitMoveDone=function(gameID, thinker) {

        var qIndex = qIndexByGameID(gameID)

        var mIndex = getThinkerIndex(qIndex, thinker)

       store.q[qIndex].thinkers[mIndex].done = true

       store.q[qIndex].thinkers[mIndex].progress = 100

        //busyTablesPop(tIndex)
        clients.publishView('board.html', gameID, 'busyThinkers', store.q[qIndex].thinkers)
        clients.publishAddedData()

    }
        
    this.update=function(splitMove,propertyName,value){
        
      
      //  var forcePublish=false
        var index
        
        if(splitMove.splitMoveID){
            
            index=qIndexBysplitMoveID(splitMove)
            
        } else {
            
           console.log('no id')

        }
        
        if(propertyName){
            
            eval('(store.q[index].'+propertyName+'=value)')
            
            this.publishToAdmin()
            
            
        }else{
            
            // if (forcePublish){
                
            //    this.publishToAdmin()
           
            // }
            
        }
        
        
        return splitMove
       
        
    }
    
    this.pushToArray=function(splitMove,arrayName,value){
        
      
        var forcePublish=false
        var index
        
        if(splitMove.splitMoveID){
            
            index=qIndexBysplitMoveID(splitMove)
            
        } else {
            
             
            splitMove.splitMoveID=Math.random()*Math.random()

            index = store.q.push(splitMove) -1
            
            forcePublish=true

        }
        
        if(arrayName){
            
            
            
            eval(
                'if(store.q[index].'+arrayName+'){(store.q[index].'+arrayName+'.push(value))}else{store.q[index].'+arrayName+'=[value]}'
                )
            
            this.publishToAdmin()
            
            
        }else{
            
            if (forcePublish){
                
               this.publishToAdmin()
           
            }
            
        }
        
        
        return splitMove
       
        
    }
    
    this.remove=function(gameID){
        
        var res
           
        // console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
        var index=qIndexByGameID(gameID)
        
        if(index!==-1) {
            
            res=store.q.splice(index,1)[0]
        
            this.publishToAdmin()
            
        }
        
        return res
        
    }
    
    this.qLength=function(){return store.q.length}
    
    
    
    
    
}