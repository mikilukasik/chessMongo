/////////////////////////		Classes		/////////////////////////////////////////////////
//console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx classes loaded xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
var SmallDeepeningTask=function(table, wNext, depth, moveTree, desiredDepth, score, wPlayer, stopped, gameNum, mod, shouldIDraw){
	
        this.gameNum=gameNum
        
        this.wPlayer=wPlayer
	
		this.table= table

		this.wNext= wNext

		this.depth= depth
		
		this.moveTree=moveTree

		this.desiredDepth= desiredDepth

		this.score= score
        
        this.mod=mod
        
        this.shouldIDraw=shouldIDraw
        
        //if(shouldIDraw!=undefined)console.log(shouldIDraw)

}
var MoveToSend = function(moveCoord, index, dbTableWithMoveTask, splitMoveId) {

	var moveTask = dbTableWithMoveTask.moveTask
    
    this.shouldIDraw=moveTask.shouldIDraw
    
    this.mod=moveTask.mod

	this.moveIndex = index

	this.moveCoords = moveCoord //one move only

	this.sharedData = moveTask.sharedData

	this.sharedData.origTable = dbTableWithMoveTask.table

	this.sharedData.gameNum = dbTableWithMoveTask._id

	this.sharedData.desiredDepth = moveTask.sharedData.desiredDepth

	this.sharedData.splitMoveID = splitMoveId

	this.timer = {}

	this.history = []

}




var SplitMove = function(dbTableWithMoveTask) {
    
    //console.log(JSON.stringify(dbTableWithMoveTask.moveTask))
    
    this.shouldIDraw=dbTableWithMoveTask.moveTask.shouldIDraw

	this.started = new Date()

	this.splitMoveIndex = undefined

	this.splitMoveID = Math.random() * Math.random()

	var movesToSend = []

	dbTableWithMoveTask.moveTask.moveCoords.forEach(function(moveCoord, index) {

		movesToSend.push(new MoveToSend(moveCoord, index, dbTableWithMoveTask, this.splitMoveID))

	})

	this.movesToSend = movesToSend //this will get empty as we send the moves out for processing

	this.moves = movesToSend.slice() //this should stay full

	this.thinkers = [] //this will get filled with the clients working on this splitmove

	this.gameNum = dbTableWithMoveTask._id

	this.origTable = dbTableWithMoveTask.table

	this.origMoveTask = dbTableWithMoveTask.moveTask

	this.pendingMoveCount = dbTableWithMoveTask.moveTask.moveCoords.length

}
var DeepeningTask = function(smallMoveTask) { //keep this fast, designed for main thread and mainWorker ???not sure..     //smallMoveTask is a smallMoveTask, to be deepend further
    
    this.shouldIDraw = smallMoveTask.sharedData.shouldIDraw
    
    this.mod=smallMoveTask.mod
    
    this.gameNum=smallMoveTask.sharedData.gameNum
    
    this.progress=smallMoveTask.progress
    
	this.resolverArray=[]

    

	this.initialWNext = smallMoveTask.sharedData.origWNext
    
    
	this.moveStr = coordsToMoveString( smallMoveTask.moveCoords[0],
                                        smallMoveTask.moveCoords[1],
                                        smallMoveTask.moveCoords[2],
                                        smallMoveTask.moveCoords[3]
                                      )            //smallMoveTask.stepMove //all resulting tables relate to this movestring: deppeningtask is made of smallmovetask..

    
                                     
	this.initialTreeMoves = [this.moveStr] //to put in first smallmovetask

	this.startingTable = smallMoveTask.sharedData.origTable //this was calculated in advance when getting the first moves: that resulted in this.everything

    

	this.thisTaskTable = moveIt(this.moveStr, this.startingTable, true) //this is the first and should be only time calculating this!!!!!
		//takes time
	this.firstDepthValue= this.startingTable[smallMoveTask.moveCoords[2]][smallMoveTask.moveCoords[3]][1]              //smallMoveTask.firstDepthValue

	this.desiredDepth = smallMoveTask.sharedData.desiredDepth //we will deepen until depth reaches this number

	this.actualDepth = 1 //its 1 because we have 1st level resulting table fixed. 
		//increase this when generating deeper tables, loop while this is smaller than desiredDepth

	   //this task should be sent back to the server so lets ke
       

	this.tableTree = [] //fill multiDIM array with resulting tables during processing
	this.moveStrTree = [] //twin array with movesString


	this.tableTree[0] = [this.startingTable] // depth 0 table, startingTable: only one in an array

	this.tableTree[1] = [this.thisTaskTable] // depth 1 tables, we only have one in this task but there are more in total

	this.tableTree[2] = [] // depth 2 tables are empty at init, we will fill these in when processing this deepeningTask. after each depth we'll create the next empty array

	//there will be more levels here with a lot of tables

	//moveStings is one level deeper array, strings get longer each level to keep track of table!!!!!!

	this.moveStrTree[0] = [
			[]
		] //???					// depth 0 movestrings, meaning 'how did we get here?'	these are always unknown

	this.moveStrTree[1] = [
			[this.moveStr]
		] // depth 1 movestrings, meaning 'how did we get here?', we only have one in this task but there are more in total

	this.moveStrTree[2] = [
			[]
		] // depth 2 movestrings, meaning 'how did we get here?', we will fill these together with the tableTree, all indexes will match as move=>resulting table

	//there will be more levels here with a lot of moveStrings



	this.smallDeepeningTaskCounts = [0, 1] //this will be an array of the total created smalldeepeningtasks per depth, depth 0 has 0, depth 1 has one in this splitmove


	var initialSmallDeepeningTask = new SmallDeepeningTask(this.thisTaskTable, !this.initialWNext, this.actualDepth, this.initialTreeMoves, this.desiredDepth, this.firstDepthValue,smallMoveTask.cfColor, false, this.gameNum, this.mod, this.shouldIDraw)
	
	//this.value=initialSmallDeepeningTask.score

	this.smallDeepeningTasks = [initialSmallDeepeningTask] //to be sent out for multiplying when processing for level 2 (unless desireddepth is 1)

	//this.pendingSmallDeepeningTasks=[]				//here we will keep the pending smalltasks: sent out 

	this.solvedSmallDeepeningTasks = [] //here we will keep the results until stepping to next depth, ready for next level when this.length equals count


}





var SmallMoveTask = function(moveCoord, index, dbTable) { //deptObj has data to keep track of deepening

	
	
	this.firstDepthValue=dbTable.table[moveCoord[2]][moveCoord[3]][1]	//doesnt care about enPass!!     //--
	
	if(dbTable.desiredDepth>0){                                    //#
		this.desiredDepth = dbTable.desiredDepth
	}else{
		this.desiredDepth=3 //should be good, on 4th we check what he could hit but not generate any tables and this should match the old styles performance
	}
	

	this.oppKingPos = dbTable.oppKingPos //aTK will need this, should be the moved kings pos is moved!!!!  //#

	this._id = dbTable._id //server will need this when receiving solved moves //#

	this.cfMoveCoords = moveCoord //4 numbers      //##

	var stepMove = coordsToMoveString(moveCoord[0], moveCoord[1], moveCoord[2], moveCoord[3])      //-- do it on client
    
	this.stepMove = stepMove //4 char string       //--above

	this.moveStrings = []

	this.moveStrings.push(stepMove)


	this.retMoves = [] //ai will fill

	//this.table=moveIt(this.moveStr,dbTable.table,true)	//dontprotect works?? !!!!

	//this.value=dbTable.value

	this.allPast = dbTable.allPastTables //ai needs it to avoid loop  //#

	this.cfTable = dbTable.table //ai needs to know original table             //#
		//this.cfMoveCoords=moveCoord
	this.moveIndex = index //who needs this??!!!!!!!

	this.origProtect = dbTable.origProtect //this should go in origData!!!!

	this.cfColor = dbTable.wNext //this could too...

	//this.deepWNext=dbTable.wNext

	//this.stepMove=0

	this.origData = dbTable.origData // itt adom at ami kozos az osszes smalltaskban

	this.value = this.origData //ez meg minek is


	this.fHitValue = [0] //initial value, should happen masutt     //--



}

var ResolverItem=function(inscore,inmoveTree,wPlayer){
	this.value= inscore,
	this.moveTree= inmoveTree
    
    this.wPlayer=wPlayer

}

var TriggerItem=function(depth,moveTree,wPlayer){		//these will be put in main deepeningTaskArray to trigger calculation of totals for each level
	this.trItm=true
	
	
	this.depth=depth
	//this.parentMove=parentMoveStr			//4 char string
	this.moveTree=moveTree
    this.wPlayer=wPlayer
}



var TempMoveTask = function(dbTable) {

	//this.rnd=Math.random()
	// this.created = new Date()
	// 	.getTime()

	//this.allTempTables = []

	this.desiredDepth = dbTable.desiredDepth

	dbTable.oppKingPos = whereIsTheKing(dbTable.table, !dbTable.wNext)


	var moveCoords = getAllMoves(dbTable.table, dbTable.wNext, false, 0, true)



	dbTable.origProtect = protectTable(dbTable.table, dbTable.wNext)
	dbTable.origData = getTableData(dbTable.table, dbTable.wNext)
	
	dbTable.origDeepDatatt=getHitScores(dbTable.table,true,true)
	
	dbTable.origDeepDatatf=getHitScores(dbTable.table,true,false)
	
	dbTable.origDeepDataft=getHitScores(dbTable.table,false,true)
	
	dbTable.origDeepDataff=getHitScores(dbTable.table,false,false)
	


	this.dontLoop = false

	if (dbTable.origData[0] > 1) {
		this.dontLoop = true
	}




	var moves = []

	moveCoords.forEach(function(moveCoord, index) {
		moves.push(new SmallMoveTask(moveCoord, index, dbTable))
			//movesToSend.push(moves[moves.length-1])


	})

	this.movesToSend = moves.slice() //copy it, these we vill sen out


	this.moves = moves

	




}



var Task = function(command, data, message, taskNum) {

	var rnd = Math.random()
	this.rnd = rnd

	if (taskNum) {
		this.taskNum = taskNum
	}
	else {
		this.taskNum = rnd
	}



	this.command = command
	this.message = message
	this.data = data
	this.response = {}

	var fstTime = new Date()
		.getTime()

	this.created = fstTime
	this.called = fstTime




}

var Dbuser = function(name, pwd) {
		this.name = name
		this.pwd = pwd
		this.games = [] //his recent games 

	}
	////
var FakeDbTable = function(_id, wName, bName) { //used for speed testing only


	this.pendingMoveCount = 0

	this.returnedMoves = []

	this._id = _id,
		this.wName = wName,
		this.bName = bName,


		this.aiToMove = false //unused
	this.toBeChecked = true //unused
	this.gameIsOn = true
	this.whiteWon = false
	this.blackWon = false
	this.isDraw = false

	this.askWhiteDraw = false
	this.askBlackDraw = false

	this.whiteCanForceDraw = false
	this.blackCanForceDraw = false


	this.learner = false
	this.learnerIsBusy = false



	this.wNext = true,
		this.aiOn = false,
		this.chat = [],
		this.moves = [],
		this.pollNum = 1,
		this.allPastTables = []

	this.created = new Date()
		.getTime()
	this.moved = this.created

	this.table = new Array(8) //create 8x8 array
	for (var i = 0; i < 8; i++) {
		this.table[i] = new Array(8)
	}

	for (var j = 2; j < 6; j++) { //make the blanks blank
		for (i = 0; i < 8; i++) {
			this.table[i][j] = [0, 0, 0, false, false]
		}
	}

	for (var i = 0; i < 8; i++) { //row of white pawns

		this.table[i][1] = [0, 0, 0, false, false] //,pawnCanMove]
	}
	for (var i = 0; i < 8; i++) { //row of black pawns
		this.table[i][6] = [1, 1, 0, false, false] //,pawnCanMove]
	}

	this.table[0][0] = [0, 0, 0, true, false] //,rookCanMove]				//rooks		//0 stands for times it moved
	this.table[7][0] = [0, 0, 0, true, false] //,rookCanMove]
	this.table[0][7] = [0, 0, 0, true, false] //,rookCanMove]
	this.table[7][7] = [0, 0, 0, true, false] //,rookCanMove]

	this.table[1][0] = [2, 3, 0, true, false] //,horseCanMove]					//knights
	this.table[6][0] = [2, 3, 0, true, false] //,horseCanMove]
	this.table[1][7] = [1, 3, 0, true, false] //,horseCanMove]
	this.table[6][7] = [1, 3, 0, true, false] //,horseCanMove]

	this.table[2][0] = [0, 0, 0, true, false] //,bishopCanMove]				//bishops
	this.table[5][0] = [0, 0, 0, true, false] //,bishopCanMove]
	this.table[2][7] = [0, 0, 0, true, false] //,bishopCanMove]
	this.table[5][7] = [0, 0, 0, true, false] //,bishopCanMove]

	this.table[3][0] = [0, 0, 0, true, false] //,queenCanMove]				//w queen
	this.table[4][0] = [2, 9, 0, true, false] //,kingCanMove]				//w king

	this.table[3][7] = [0, 0, 0, true, false] //,queenCanMove]				//b q
	this.table[4][7] = [1, 9, 0, true, false] //,kingCanMove]				//b k

	this.table = addMovesToTable(this.table, true)
		//protectPieces(this.table,true)
		//protectPieces(this.table,false)
}

var Dbtable = function(_id, wName, bName) { //class

    this.moveCount=0

	this.pendingMoveCount = 0
	this.desiredDepth=0	//will set after creating, at each move step
	this.returnedMoves = []

	this._id = _id,
		this.wName = wName,
		this.bName = bName,


		this.aiToMove = false //unused
	this.toBeChecked = true //unused
	this.gameIsOn = true
	this.whiteWon = false
	this.blackWon = false
	this.isDraw = false

	this.askWhiteDraw = false
	this.askBlackDraw = false

	this.whiteCanForceDraw = false
	this.blackCanForceDraw = false


	this.learner = false
	this.learnerIsBusy = false



	this.wNext = true,
		this.aiOn = false,
		this.chat = [],
		this.moves = [],
		this.pollNum = 1,
		this.allPastTables = []

	this.created = new Date()
		.getTime()
	this.moved = this.created

	this.table = new Array(8) //create 8x8 array
	for (var i = 0; i < 8; i++) {
		this.table[i] = new Array(8)
	}

	for (var j = 2; j < 6; j++) { //make the blanks blank
		for (i = 0; i < 8; i++) {
			this.table[i][j] = [0, 0, 0, false, false]
		}
	}

	for (var i = 0; i < 8; i++) { //row of white pawns

		this.table[i][1] = [2, 1, 0, false, false] //,pawnCanMove]
	}
	for (var i = 0; i < 8; i++) { //row of black pawns
		this.table[i][6] = [1, 1, 0, false, false] //,pawnCanMove]
	}

	this.table[0][0] = [2, 4, 0, true, false] //,rookCanMove]				//rooks		//0 stands for times it moved
	this.table[7][0] = [2, 4, 0, true, false] //,rookCanMove]
	this.table[0][7] = [1, 4, 0, true, false] //,rookCanMove]
	this.table[7][7] = [1, 4, 0, true, false] //,rookCanMove]

	this.table[1][0] = [2, 3, 0, true, false] //,horseCanMove]					//knights
	this.table[6][0] = [2, 3, 0, true, false] //,horseCanMove]
	this.table[1][7] = [1, 3, 0, true, false] //,horseCanMove]
	this.table[6][7] = [1, 3, 0, true, false] //,horseCanMove]

	this.table[2][0] = [2, 2, 0, true, false] //,bishopCanMove]				//bishops
	this.table[5][0] = [2, 2, 0, true, false] //,bishopCanMove]
	this.table[2][7] = [1, 2, 0, true, false] //,bishopCanMove]
	this.table[5][7] = [1, 2, 0, true, false] //,bishopCanMove]

	this.table[3][0] = [2, 5, 0, true, false] //,queenCanMove]				//w queen
	this.table[4][0] = [2, 9, 0, true, false] //,kingCanMove]				//w king

	this.table[3][7] = [1, 5, 0, true, false] //,queenCanMove]				//b q
	this.table[4][7] = [1, 9, 0, true, false] //,kingCanMove]				//b k

	this.table = addMovesToTable(this.table, true)
		//protectPieces(this.table,true)
		//protectPieces(this.table,false)
}
