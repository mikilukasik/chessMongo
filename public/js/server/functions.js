
function makeAiMove(dbTableWithMoveTask) {
    
    
     var splitMove= splitMoves.add(dbTableWithMoveTask)
    
   
    var aiTable = new TempMoveTask(dbTableWithMoveTask) //temp!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
	
    // console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   start    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
    // console.log(splitMove)
    // console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   end    xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
    
    splitMove.pendingSolvedMoves = aiTable.moves.length
    dbTableWithMoveTask.pendingSolvedMoves = aiTable.moves.length //temp!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11set it here, it will be decreased as the moves come in




	dbTableWithMoveTask.returnedMoves = []//temp!!!!!!!!!!!!!!!!!!!!!
    splitMove.returnedMoves = []
    
    
    splitTaskQ.push(dbTableWithMoveTask)//temp!!!!!!!!!!!!!!!!!!!!!
	//pushSplitTask(dbTableWithMoveTask)         //just pushes it to
    
    /////////////////////////////////  new splitmove
    
    //var splitMove=new SplitMove(dbTableWithMoveTask,[],[])
    
    //splitMove=
    
    
    ///////////////////

	var sentTNum = dbTableWithMoveTask._id

	//splitMoves.clearSentMoves(sentTNum)

	//var index
    
    // var i2=0
		
	while (aiTable.movesToSend.length > 0) {

		var tempLength = aiTable.movesToSend.length

		var aa = clients.fastestThinker(true)
        
        
		// if (isNaN(aa)) {
		// 	//////    ////console.log('hacking',aa)
		// 	aa = 1 //quickfix!!!!!!!!!!!!!!!!!!!!!!//but doesn't work
		// }

		var sendThese = getSplitMoveTask(aiTable, aa)

		var sentCount = sendThese.length

		var sentTo = clients.sendTask(new Task('splitMove', sendThese, 'splitMove t' + sentTNum + ' sentCount: ' + sentCount)) //string
	

		splitMoves.registerSentMoves(sentTNum, sentTo, sentCount)
        
        //splitMoves.pushToArray(splitMove,'thinkers',{sentTo:sentTo})

			// i2++
	} 
    
	clients.publishView('board.html', sentTNum, 'busyThinkers', [])
	clients.publishAddedData()
    
    
    
    
    
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    
    
    
    
    

}
