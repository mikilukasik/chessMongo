
function makeAiMove(dbTable) {
    
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	dbTable.splitMoveStarted = new Date()

	// var aiTable = new MoveTask(dbTable) //this should happen on the calling client, not on the server

	// dbTable.aiTable = aiTable

    var aiTable = new MoveTask(dbTable) //this should happen on the calling client, not on the server

	dbTable.aiTable = aiTable

	dbTable.pendingSolvedMoves = aiTable.moves.length //set it here, it will be decreased as the moves come in

	dbTable.returnedMoves = []

	pushSplitTask(dbTable)
    
    /////////////////////////////////  new splitmove
    
    //var splitMove=new SplitMove(dbTable,[],[])
    
    splitMove=splitMoves.add(dbTable)
    
    ///////////////////

	var sentTNum = dbTable._id

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
