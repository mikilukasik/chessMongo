var learnerGlobals={
    learnerCount:0,
    learnerWorkers:[]
}
var learnerFuncs={
    setLearnerCount:function(count){
        if(learnerGlobals.learnerCount>count){
            //stop some learners
            var stopCount=learnerGlobals.learnerCount-count
            
            while(stopCount--){
                console.log('stop a learner')
                
                var workerToStop=learnerGlobals.learnerWorkers.pop()
                
                workerToStop.terminate()
                
                //then
                learnerGlobals.learnerCount--
            }
            
            
            
            
            
        }else{
            //start some learners or do nothing it equal
            var startCount=count-learnerGlobals.learnerCount
            
            while(startCount--){
                
                console.log('start a learner')
                
                learnerGlobals.learnerWorkers.push(new Worker('js/worker/learnerWorker.js'))
                
                
                learnerGlobals.learnerCount++
            }
            
            
            
            
        }
    }
}