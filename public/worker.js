
   
    var workerI = 0;

function timedCount() {
    workerI++// = workerI + 1;
    postMessage(workerI);
    setTimeout("timedCount()",500);
}

timedCount();


 
        
        ////////////////////worker func end
        