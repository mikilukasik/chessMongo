var SplitMove=function(dbTable){
    
    this.dbTable=dbTable
    
    //this._id=dbTable._id
    
    this.thinkers=[]
    
    this.moves=[]
    
    this.splitMoveID=undefined
    
    this.pollnum=-1
 
}

var SplitMoves=function(clients){
    
    var store={
        
            q:[],
            
          
                       
        }
     
    
    this.getNakedQ=function(){
        
        var res=[]
        
        store.q.forEach(function(splitMove){
            res.push({
                gameNo:splitMove.dbTable._id,
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
            
            if(gameID==store.q[i].dbTable._id)return i
            
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
    
    this.add=function(dbTable){
        
        var splitMove=new SplitMove(dbTable)
        
        var index
        
         if(splitMove.splitMoveID){
            
            console.log('This is not new!!')
            
        } else {
            
             
            splitMove.splitMoveID=Math.random()*Math.random()

            index = store.q.push(splitMove) -1
            
            this.publishToAdmin()
            
           // forcePublish=true

        }
        
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
        
        if(data.final){
            data.progress=100
            data.beBackIn=0
            
            clients.storeVal(connection,'lastMpm',{
                depth:data.depth,
                mpm:data.mpm
                })
        }
        
        var progress=data.progress
        
        var beBackIn=data.beBackIn 
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