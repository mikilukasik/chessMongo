// var LearningGame=function(_id, modType, modVal){
// 	this.state='startWhie'
// 	this.dbTable=new Dbtable(_id,)
	
// 	if(wModded) {
// 				$rootScope.start(modType + " mod: " + modVal, "standard", true, modType) //._id
// 					//initedTable = new Dbtable(firstFreeTable, "mod lpV:" + modVal, "standard")
// 			} else {
// 				$rootScope.start("standard", modType + " mod: " + modVal, false, modType) //._id
// 					//initedTable = new Dbtable(firstFreeTable, "standard", "mod lpV:" + modVal)
// 			}
	
	
// }

//

var SmallMoveTask=function(moveCoord, index, dbTable,depth){		//this is each move ai could do
	
	
	//no need: this.dbTable=dbTable
	if(depth==undefined)depth=1
	
	this.depth=depth
	
	this.oppKingPos=dbTable.oppKingPos		//aTK will need this, should be the moved kings pos is moved!!!!
	
	this._id=dbTable._id					//server will need this when receiving solved moves
	
	this.cfMoveCoords=moveCoord				//4 numbers
	
	var stepMove=coordsToMoveString(moveCoord[0],moveCoord[1],moveCoord[2],moveCoord[3])
	this.stepMove=stepMove		//4 char string
	
	this.moveStrings=[]
	
	this.moveStrings.push(stepMove)
	
	
	this.retMoves=[]			//ai will fill
	
	//this.table=moveIt(this.moveStr,dbTable.table,true)	//dontprotect works?? !!!!
	
	//this.value=dbTable.value
	
	this.allPast=dbTable.allPastTables		//ai needs it to avoid loop
	
	this.cfTable=dbTable.table				//ai needs to know original table 
	//this.cfMoveCoords=moveCoord
	this.moveIndex=index					//who needs this??!!!!!!!
	
	this.origProtect=dbTable.origProtect		//this should go in origData!!!!
	
	this.cfColor=dbTable.wNext					//this could too...
	
	//this.stepMove=0
	
	this.origData=dbTable.origData				// itt adom at ami kozos az osszes smalltaskban
	
	this.value=this.origData					//ez meg minek is
	
	
	this.fHitValue=[0]					//initial value, should happen masutt
	
	
	
}


var MoveTask =function(dbTable){
	
	//this.rnd=Math.random()
	this.created = new Date().getTime()
	
	this.allTempTables = []
	
	
	this.oppKingPos=whereIsTheKing(dbTable.table,!dbTable.wNext)
	
	
	var moveCoords=getAllMoves(dbTable.table,dbTable.wNext,false,0,true)
	
	
	
	dbTable.origProtect=protectTable(dbTable.table,dbTable.wNext)
	dbTable.origData = getTableData(dbTable.table, dbTable.wNext)
	
	this.dontLoop=false
	
	if (dbTable.origData[0]>1){
		this.dontLoop=true
	}
	
	
	
	
	
	
	
	var moves=[]
	
	moveCoords.forEach(function(moveCoord,index){
		moves.push(new SmallMoveTask(moveCoord, index, dbTable))
		//movesToSend.push(moves[moves.length-1])
		
		
	})
	
	this.movesToSend=moves.slice()		//copy it, these we vill sen out
	
	
	this.moves=moves
	
	// this.movesLeftToSend=function(){
		
	// 	if(this.movesToSend.length=0){
	// 		return false
	// 	}else{
	// 		return true
	// 	}
		
	// }
	
	
	
	//this.totalMoveCount=this.moves.length
	//var unsentMoveCount=totalMoveCount
	
	//this.pendingMoveCount=this.totalMoveCount

	
	
	
	
}


var Task = function(command,data,message,taskNum){
	
	var rnd=Math.random()
	this.rnd=rnd
	
	if (taskNum){
		this.taskNum=taskNum
	}else{
		this.taskNum=rnd
	}
	
	
	
	this.command=command
	this.message=message
	this.data=data
	this.response={}
	
	var fstTime=new Date().getTime()
	
	this.created=fstTime
	this.called=fstTime
	
	
	
	
}

var Dbuser = function(name,pwd){
	this.name=name
	this.pwd=pwd
	this.games=[]		//his recent games 
	
}
var Dbtable = function(_id, wName, bName) { //class


this.pendingMoveCount=0

this.returnedMoves=[]
	
	this._id = _id,
	this.wName = wName,
	this.bName = bName,

	
	this.aiToMove=false		//unused
	this.toBeChecked=true		//unused
	this.gameIsOn=true
	this.whiteWon=false
	this.blackWon=false
	this.isDraw=false
	
	this.askWhiteDraw=false
	this.askBlackDraw=false
	
	this.whiteCanForceDraw=false
	this.blackCanForceDraw=false
	
	
	this.learner=false
	this.learnerIsBusy=false
	
	
	
	this.wNext = true,
	this.aiOn = false,
	this.chat = [],
	this.moves = [],
	this.pollNum = 1,
	this.allPastTables = []

	this.created = new Date().getTime()
	this.moved = this.created

	this.table = new Array(8) //create 8x8 array
	for(var i = 0; i < 8; i++) {
		this.table[i] = new Array(8)
	}

	for(var j = 2; j < 6; j++) { //make the blanks blank
		for(i = 0; i < 8; i++) {
			this.table[i][j] = [0, 0, 0, false, false]
		}
	}

	for(var i = 0; i < 8; i++) { //row of white pawns

		this.table[i][1] = [2, 1, 0, false, false] //,pawnCanMove]
	}
	for(var i = 0; i < 8; i++) { //row of black pawns
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