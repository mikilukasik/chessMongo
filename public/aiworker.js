importScripts('brandNewAi.js')
importScripts('engine.js')

  ////////////////////worker func
        
// var workerI = 0;

// function timedCount() {
//     workerI++// = workerI + 1;
//     postMessage('a'+checkSpeed());
//     setTimeout("timedCount()",500);
// }

// timedCount();

onmessage = function (event) {
  
  var reqCommand=event.data.reqCommand
  var reqData=event.data.reqData;
  var reqMessage=event.data.reqMessage;
  
  var resData;
  var resCommand;
  var resMessage;
  
  
  switch (reqCommand){
    case undefined:
    
    break;
    
    case 'echo':
    
      resMessage='echoing'
      resData=reqData
      resCommand=undefined
    
    
    break;
    
    case 'speedTest':
    
      resMessage='echoing'
      reqData=reqData
      resData=checkSpeed()
      resCommand=undefined
    
    
    break;
    
    case 'bullShit':
    
      resMessage='dont bullshit'
      resData=undefined
      resCommand='bullshit'
    
    break;
    
  }
 
 
  postMessage({
         // command:undefined,
          'resMessage':resMessage,
          'resData':resData,
          'resCommand':resCommand
  });
      
 
};


 


 
        
        ////////////////////worker func end
        