var SplitMove=function(dbTableWithMoveTask) {
    
    
     var movesToSend = []

	
     
     dbTableWithMoveTask.moveTask.moveCoords.forEach(function(moveCoord, index) {
		
        movesToSend.push(new MoveToSend(moveCoord, index, dbTableWithMoveTask))
			
	})
    
    
    
    
    
    
    
    
    
    
    
    
     
     
     
     
    
    this.splitMoveID=Math.random()*Math.random() 
    
    this.gameNum=dbTableWithMoveTask._id
    
    
    this.origTable=dbTableWithMoveTask.table
    
    this.origMoveTask = dbTableWithMoveTask.moveTask
    
    
   
    
    this.desiredDepth = dbTableWithMoveTask.desiredDepth
    
    this.origMoveTask = dbTableWithMoveTask.moveTask
    
    
    this.moves=[]
    
    this.thinkers=[]
   
    
    
    this.movesToSend=movesToSend

}

var SplitMoves=function(clients){
    
    var store={
        
            q:[],
            
          
                       
        }
     
    
    this.getNakedQ=function(){
        
        var res=[]
        
        store.q.forEach(function(splitMove){
            res.push({
                gameNo:splitMove.gameNum,
                thinkers:splitMove.thinkers,
                moves:splitMove.moves,
               
                
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
    
    this.add=function(dbTableWithMoveTask){
        
        var splitMove=new SplitMove(dbTableWithMoveTask)
        
        var index = store.q.push(splitMove) -1
        
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

            if (progress > store.q[qIndex].thinkers[mIndex].progress) {

                store.q[qIndex].thinkers[mIndex].progress = progress
                store.q[qIndex].thinkers[mIndex].beBackIn = beBackIn
                store.q[qIndex].thinkers[mIndex].mpm = mpm

            }

            //busyTablesPop(index)
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