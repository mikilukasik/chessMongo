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
  postMessage(event.data);
};

 
        
        ////////////////////worker func end
        