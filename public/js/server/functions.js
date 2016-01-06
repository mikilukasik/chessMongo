
function makeAiMove(dbTable) {
    
    var splitMove=new SplitMove(dbTable,[],[])
    
    splitMove.started=new Date()
    
    splitMove.aiTable=dbTable.aiTable
    //dbTable.aiTable=undefined
    
    
    
    
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	dbTable.splitMoveStarted = new Date()

	// var aiTable = new MoveTask(dbTable) //this should happen on the calling client, not on the server

	// dbTable.aiTable = aiTable

    var aiTable = new MoveTask(dbTable) //this should happen on the calling client, not on the server

	dbTable.aiTable = aiTable

	dbTable.pendingSolvedMoves = aiTable.moves.length //set it here, it will be decreased as the moves come in

	dbTable.returnedMoves = []

	pushSplitTask(dbTable)

	var sentTNum = dbTable._id

	clearSentMoves(sentTNum)

	var index
		
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
	

		index = registerSentMoves(sentTNum, sentTo, sentCount)
			
	} 
    
	clients.publishView('board.html', sentTNum, 'busyThinkers', busyTables.splitMoves[index])
	clients.publishAddedData()

}
