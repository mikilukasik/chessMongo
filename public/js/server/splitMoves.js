var SplitMoves=function(){
    
    var store={
        
            q:[{id:2},{id:5},{id:4}],
           // activeIDs
            
        }
    
    
    var qIndex=function(splitMove){
        
        return store.q.findIndex(function(element,index){
            if(splitMove.id===element.id) {return true}else{return false}
        })
        
    }
    
    
    this.new=function(splitMove){
        
        splitMove.id=Math.random()*Math.random()
        
        store.q.push(splitMove)
        
        return splitMove
        
        
    }
    
    this.remove=function(splitMove){
        
        var res
        
        var index=qIndex(splitMove)
        
        if(index!==-1) return store.q.splice(index,1)[0]
        
    }
    
    this.qLength=function(){return store.q.length}
    
    
    
}