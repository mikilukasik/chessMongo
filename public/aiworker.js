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
  
  var sentCommand=event.data.sentCommand
  var sentData=event.data.sentData;
  var sentMessage=event.data.sentMessage;
  
  var retData;
  var retCommand;
  var retMessage;
  
  
  switch (sentCommand){
    case undefined:
    
    break;
    
    case 'echo':
    
      retMessage='echoing'
      retData=sentData
      retCommand=undefined
    
    
    break;
    
    case 'bullShit':
    
      retMessage='dont bullshit'
      retData=undefined
      retCommand='bullshit'
    
    break;
    
  }
 
 
  postMessage({
         // command:undefined,
          'retMessage':retMessage,
          'retData':retData,
          'retCommand':retCommand
  });
      
 
};


 


 
        
        ////////////////////worker func end
        