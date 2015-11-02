importScripts('brandNewAi.js')
importScripts('engine.js')

  ////////////////////worker func
        
var workerI = 0;

function timedCount() {
    workerI++// = workerI + 1;
    postMessage(checkSpeed());
    setTimeout("timedCount()",500);
}

timedCount();


 
        
        ////////////////////worker func end
        