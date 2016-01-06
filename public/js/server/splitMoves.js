var SplitMove=function(dbTable,thinkers,moves){
    
    this.dbTable=dbTable
    
    this.thinkers=thinkers
    
    this.moves=moves
    
    this.splitMoveID=undefined
 
}

var SplitMoves=function(){
    
    var store={
        
            q:[],
                       
        }
    
    this.getNakedQ=function(){
        
        var res=[]
        
        store.q.forEach(function(splitMove){
            res.push({
                gameNo:splitMove.dbTable._id,
                thinkers:splitMove.thinkers,
                moves:splitMove.moves
            })
        })
        
        return res
        
    }
    
    var qIndexBysplitMoveID=function(splitMove){
        
        return store.q.findIndex(function(element,index){
            if(splitMove.splitMoveID===element.splitMoveID) {return true}else{return false}
        })
        
    }
    
    var qIndexByGameID=function(splitMove){
        
        return store.q.findIndex(function(element,index){
            if(splitMove.dbTable._id===element.dbTable._id) {return true}else{return false}
        })
        
    }
    
    this.publishToAdmin=function(){
        //publish to admin view here
    }
    
    this.update=function(splitMove,propertyName,value){
        
        var forcePublish=false
        var index
        
        if(splitMove.splitMoveID){
            
            index=qIndexBysplitMoveID(splitMove)
            
        } else {
            
            splitMove.splitMoveID=Math.random()*Math.random()

            index = store.q.push(splitMove) -1

        }
        
        if(propertyName){
            
            eval('(store.q['+index+'].'+propertyName+'='+value+')')
            
            this.publishToAmin()
            
            
        }else{
            
            if (forcePublish){
                
               this.publishToAmin()
           
            }
            
        }
        
        
        return splitMove
       
        
    }
    
    this.remove=function(splitMove){
        
        var index=qIndexBysplitMoveID(splitMove)
        
        if(index!==-1) return store.q.splice(index,1)[0]
        
    }
    
    this.qLength=function(){return store.q.length}
    
    
    
    
    
}