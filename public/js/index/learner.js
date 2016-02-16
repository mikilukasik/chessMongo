var learnerGlobals={
    learnerCount:0,
    learnerWorkers:[]
}
var learnerFuncs={
    setLearnerCount:function(count,myLastUser){
        
        if(myLastUser=='Computer'){
            
            indexGlobals.pendingLearners=count
            
            
        }else{
            
            
            if(learnerGlobals.learnerCount>count){
                //stop some learners
                var stopCount=learnerGlobals.learnerCount-count
                
                while(stopCount--){
                    console.log('stop a learner')
                    
                    var workerToStop=learnerGlobals.learnerWorkers.pop()//[stopCount]
                    
                    workerToStop.postMessage({
                        command:'stop',
                        
                    })
                    
                }
                
                
                
                
                
            }else{
                //start some learners or do nothing it equal
                var startCount=count-learnerGlobals.learnerCount
                
                while(startCount--){
                    
                    console.log('start a learner')
                    
                    var workerToPush=new Worker('js/worker/learnerWorker.js')
                    
                    //set onmessage
                    
                    
                    workerToPush.onmessage=function(event){
                        console.log('learner message received',event.data.command)
                         
                        switch(event.data.command){
                            
                               
                            case 'toServer':
                            
                                //console.log('toserver in learner.js')
                                
                                socketSend(event.data.data.command,event.data.data.data,event.data.data.message)
                            
                            break;
                            
                            case 'terminateMe':
                            
                                
                                learnerGlobals.learnerCount--
                                
                                workerToPush.terminate()
                                
                                
                                console.log('learnerGlobals.learnerCount',learnerGlobals.learnerCount)
                            
                            break;
                            
                            
                            
                        }
                        
                    }
                    
                    workerToPush.postMessage({
                        command:'start',
                        //host:document.location.host,
                        myID:sendID,
                        lastUser:myLastUser
                    }) 
                    
                    
                    
                    
                    learnerGlobals.learnerWorkers.push(workerToPush)
                    
                    
                    learnerGlobals.learnerCount++
                    console.log('learnerGlobals.learnerCount',learnerGlobals.learnerCount)
                    
                }
                
                
                
                
            }
            
        }
        
      
    }
}