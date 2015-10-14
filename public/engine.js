var SmallMoveTask=function(moveCoord, index, dbTable){
	
	this.rnd=Math.random()
	//this.created = new Date().getTime()
	
	//this.dbTable=dbTable
	
	this.moveCoord=moveCoord
	this.moveStr=coordsToMoveString(moveCoord[0],moveCoord[1],moveCoord[2],moveCoord[3])
	
	this.index=index
	this.value=0
	
	this.retMoves=[]
	
	this.table=moveIt(this.moveStr,dbTable.table,true)	//dontprotect works?? !!!!
	
	this.value=getTableData(dbTable.table,dbTable.wNext)
	
	
	
	
}

var MoveTask =function(dbTable){
	
	this.rnd=Math.random()
	this.created = new Date().getTime()
	
	this.allTempTables = []
	
	
	
	
	
	var moveCoords=getAllMoves(dbTable.table,dbTable.wNext,false,0,true)
	
	
	
	this.origProtect=protectTable(dbTable.table,dbTable.wNext)
	this.origData = getTableData(dbTable.table, dbTable.wNext)
	
	this.dontLoop=false
	
	if (this.origData[0]>1){
		this.dontLoop=true
	}
	
	
	
	
	
	
	this.origTableValue = this.origData[0]
	this.origMyHitValue = this.origData[1]
	this.origHisHitValue = this.origData[2]
	this.origlSanc = this.origData[3]
	this.origrSanc = this.origData[4]
	this.origGetToMiddle=this.origData[5]
	this.origPushHimBack=this.origData[6]
	this.origMostMoved=this.origData[7]
	
	this.fHitValue=[0]

	var moves=[]
	// var movesToSend=[]
	
	//var cfMoves=[]
	
	moveCoords.forEach(function(moveCoord,index){
		moves.push(new SmallMoveTask(moveCoord, index, dbTable))
		//movesToSend.push(moves[moves.length-1])
		
		
	})
	
	this.movesToSend=moves.slice()		//copy it, these we vill sen out
	
	//var movesToSend=movesToSend
	this.coords
	this.moves=moves
	
	// this.movesLeftToSend=function(){
		
	// 	if(this.movesToSend.length=0){
	// 		return false
	// 	}else{
	// 		return true
	// 	}
		
	// }
	
	
	
	this.totalMoveCount=this.moves.length
	//var unsentMoveCount=totalMoveCount
	
	this.pendingMoveCount=this.totalMoveCount

	this.getSplitMoveTask=function(percent){
	
		//var numberOfTasks=movesToSend.length/100
		var numberToSend=Math.ceil(percent*this.movesToSend.length)
		//var aiTable=dbTable.aiTable
		
		var splitMoveTask = []
		
		for (var i=0; i<numberToSend; i++){
			splitMoveTask.push(this.movesToSend.pop())
		}
		
		return splitMoveTask
		
	}
		
	
	
	
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
var Dbtable = function(tableNum, wName, bName) { //class
	
	this.tableNum = tableNum,
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