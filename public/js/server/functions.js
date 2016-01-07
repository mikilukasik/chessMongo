
function makeAiMove(dbTableWithMoveTask) {
    
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	dbTableWithMoveTask.splitMoveStarted = new Date()

	
    var aiTable = new TempMoveTask(dbTableWithMoveTask) //this should happen on the calling client, not on the server

	
    var movesToSend= new SplitMoveTask(dbTableWithMoveTask)
    
    //dbTableWithMoveTask.aiTable = aiTable

	dbTableWithMoveTask.pendingSolvedMoves = aiTable.moves.length //set it here, it will be decreased as the moves come in

	dbTableWithMoveTask.returnedMoves = []

	pushSplitTask(dbTableWithMoveTask)
    
    /////////////////////////////////  new splitmove
    
    //var splitMove=new SplitMove(dbTableWithMoveTask,[],[])
    
    splitMove=splitMoves.add(dbTableWithMoveTask)
    
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
