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

// var createDepthObj=function(_id,table,wNext,allPastTables,origData,origProtect,oppKingPos){
//     return {
//         _id:_id,
//         table:table,
//         wNext:wNext,
//         allPastTables:allPastTables,
//         origData:origData,
//         origProtect:origProtect,
//         oppKingPos:oppKingPos
        
//     }
// }


              
var createSmallDeepeningTask=function(table,wNext,depth,treeMoves,desiredDepth,stopped){
    
	 //use it to create smallTasks
     //these small tasks will be multiplied as the deepening goes on
	 
	return {
		
		table:table,
	
		wNext:wNext,
		
		depth:depth,
		
		treeMoves:treeMoves,
		
		desiredDepth:desiredDepth,
		
		stopped:stopped
		
	} 
	 
}      






function solveSmallDeepeningTask(smallDeepeningTask,resCommand){
	
	var result=[]		//this will be the result
	
	
	
	if(smallDeepeningTask.depth < smallDeepeningTask.desiredDepth){								/// move is still to be deepened
			//console.log('meg melyebbre')																					// let's get all moves
		
		
		
	if(smallDeepeningTask.stopped){				//stopped is either 'bWon' or 'wWon' or undefined
	
		//////////////////////////////// a king is missing	//////////////////////////
		
		
		var newTreeMoves=smallDeepeningTask.treeMoves		//treemoves is an 1 dim array with the moves that lead here
				
			newTreeMoves.push(smallDeepeningTask.stopped)						//stopped is either 'bWon' or 'wWon' or undefined
		
		
		
		var newSmallTask=createSmallDeepeningTask(			smallDeepeningTask.table,			//last known table has a king missing
															smallDeepeningTask.wNext,			//remembering the winner in wnext
															smallDeepeningTask.depth+1,			//this we increase until the end, deepener will make one copy in each round
															newTreeMoves,						//move,move,move,wwon,wwon,wwon+
															smallDeepeningTask.desiredDepth,	
															smallDeepeningTask.stopped			//wwon or bwon
												)
														
		result.push(newSmallTask)		//1 returning task until reach desiredDepth
		
	}else{
		
	
		var possibleMoves=[]
		//below returns a copied table, should opt out for speed!!!!!!!
		addMovesToTable(smallDeepeningTask.table,smallDeepeningTask.wNext,true,possibleMoves)	//this puts moves in strings, should keep it fastest possible
																		//true to 				//it will not remove invalid moves to keep fast 
																		//keep illegal			//we will remove them later when backward processing the tree
		
		//here we have possiblemoves filled in with good, bad and illegal moves
																			
		possibleMoves.forEach(function(moveStr){												//create a new smalltask for each move
																								//check first if there are 2 kings on the board!!!!!!!!!
									
			
									
									
									
			var movedTable=moveIt(moveStr,smallDeepeningTask.table,true)
			
			var kingsCount=fastTableValue(movedTable)[0]
			
			var newSmallTask={}
			
			var newTreeMoves=smallDeepeningTask.treeMoves		//treemoves is an 1 dim array with the moves that lead here
				
				newTreeMoves.push(moveStr)						//so we keep track of how we got to this table
			
			if(kingsCount==3){			//both kings on table
																								
				
				
				
				newSmallTask=createSmallDeepeningTask(	movedTable,
															!smallDeepeningTask.wNext,
															smallDeepeningTask.depth+1,
															newTreeMoves,
															smallDeepeningTask.desiredDepth
															//,stopped is missing, game goes on
														)
														
				result.push(newSmallTask)
				
				resCommand='deepened'
			
			
			}else{
				//a king is missing (cannot be both??)
				
				if(kingsCount==2){			//i could just get this from wnext!!!!!!!
					resCommand='wWon'
				}else{
					resCommand='bWon'
				}
				
				newTreeMoves.push(resCommand)
				
				newSmallTask=createSmallDeepeningTask(		movedTable,							//last known table has a king missing
															smallDeepeningTask.wNext,			//remembering the winner in wnext
															smallDeepeningTask.depth+1,			//this we increase until the end, deepener will make one copy in each round
															newTreeMoves,						//last move added to it, illegal where king gets hit
															smallDeepeningTask.desiredDepth,
															resCommand							//smallDeepeningTask.stopped:	wwon or bwon
													)
														
				result.push(newSmallTask)
				
				
				
				
				
				
				
			}
												
		})				//end of for each move
		
		
	}
		
	}else{
		
		/// move reached desiredDepth, shoudld return done command
		
		/// will return empty array
		
		resCommand='depthReached'
		
		
		
		
	}
	//}
	
	return result
	
	
}        
          
				
var DeepeningTask=function(smallMoveTask){      //keep this fast, designed for main thread and mainWorker     //smallMoveTask is a smallMoveTask, to be deepend further
	
		this.smallMoveTask=smallMoveTask		//kell ez????!!!!!			//we have the original object, there are approx.40 of these per moveTask, we probably received a few of these only ((should have _id or rndID!!!!!!!!!)	
		
		this.initialWNext=smallMoveTask.cfColor
		
		this.moveStr=smallMoveTask.stepMove		//all resulting tables relate to this movestring: deppeningtask is made of smallmovetask..
		
		this.initialTreeMoves=[this.moveStr]	//to put in first smallmovetask
		
		this.startingTable=smallMoveTask.cfTable		//this was calculated in advance when getting the first moves: that resulted in this.everything
		
		this.thisTaskTable=moveIt(this.moveStr,smallMoveTask.cfTable,true)		//this is the first and should be only time calculating this!!!!!
		//takes time
		
		
		this.desiredDepth=smallMoveTask.desiredDepth	//we will deepen until depth reaches this number
		
		this.actualDepth=1								//its 1 because we have 1st level resulting table fixed. 
														//increase this when generating deeper tables, loop while this is smaller than desiredDepth
		
		this.depthsToClear=smallMoveTask.desiredDepth	//we will decrease this when throwing away resulting tables, until it is 1. the last set of tables gets thrown away on the server that finishes this task
														//this task should be sent back to the server so lets ke
		
		
		this.tableTree=[]								//fill multiDIM array with resulting tables during processing
		this.moveStrTree=[]								//twin array with movesString
		
		
		this.tableTree[0]=[this.startingTable]			// depth 0 table, startingTable: only one in an array
		
		this.tableTree[1]=[this.thisTaskTable]			// depth 1 tables, we only have one in this task but there are more in total
		
		this.tableTree[2]=[]							// depth 2 tables are empty at init, we will fill these in when processing this deepeningTask. after each depth we'll create the next empty array
		
		//there will be more levels here with a lot of tables
		
		//moveStings is one level deeper array, strings get longer each level to keep track of table!!!!!!
		
		this.moveStrTree[0]=[[]]	//???					// depth 0 movestrings, meaning 'how did we get here?'	these are always unknown
		
		this.moveStrTree[1]=[[this.moveStr]]				// depth 1 movestrings, meaning 'how did we get here?', we only have one in this task but there are more in total
		
		this.moveStrTree[2]=[[]]							// depth 2 movestrings, meaning 'how did we get here?', we will fill these together with the tableTree, all indexes will match as move=>resulting table
		
		//there will be more levels here with a lot of moveStrings
		
		
		
		this.smallDeepeningTaskCounts=[0,1]				//this will be an array of the total created smalldeepeningtasks per depth, depth 0 has 0, depth 1 has one in this splitmove
		
		
		var initialSmallDeepeningTask=createSmallDeepeningTask(this.thisTaskTable,this.initialWNext,this.actualDepth,this.initialTreeMoves,this.desiredDepth)
		
		this.unsentSmallDeepeningTasks=[initialSmallDeepeningTask]				//to be sent out for multiplying when processing for level 2 (unless desireddepth is 1)
		
		//this.pendingSmallDeepeningTasks=[]				//here we will keep the pending smalltasks: sent out 
		
		this.solvedSmallDeepeningTasks=[]				//here we will keep the results until stepping to next depth, ready for next level when this.length equals count
		
	
	} 
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	function solveDeepeningTask(deepeningTask){		//designed to solve the whole deepening task on one thread
													//will return number of smallTasks solved for testing??!!!!!!!!!!!!!!!
													
		
		
		//for(var i=0;i<deepeningTask.unsentSmallDeepeningTasks;i++){
		var solved=0
		
		while(deepeningTask.unsentSmallDeepeningTasks.length>0){
			
			//length is 1 at first, then just grows until all has reached the level. evetually there will be nothing to do and this loop exists
			
			
			//solved++
			
			var smallDeepeningTask= deepeningTask.unsentSmallDeepeningTasks.pop()
			
			var resCommand=''
			var resultingSDTs = solveSmallDeepeningTask(smallDeepeningTask,resCommand)
			
			if(resCommand!=''){
				//solver messaged us
				
			}
			
			if(resultingSDTs!=[]){
				//new tables were generated. when we reach desiredDepth there will be no new tables here
				//console.log(resultingSDTs)
				solved+=resultingSDTs.length
				
				while(resultingSDTs.length>0){
					deepeningTask.unsentSmallDeepeningTasks.push(resultingSDTs.pop())			//at the beginning the unsent array is just growing but then we run out
																								//designed to run on single threaded full deepening
				}
							
			}
			//resultingstds is now an empty array, unsent is probably full of tasks again
			
		//call it again if there are tasks
		}
		
		return solved
		
	}




var SmallMoveTask=function(moveCoord, index, dbTable,desiredDepth,depthObj){		//deptObj has data to keep track of deepening


	
	this.desiredDepth=desiredDepth
	
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
	
	//this.deepWNext=dbTable.wNext
	
	//this.stepMove=0
	
	this.origData=dbTable.origData				// itt adom at ami kozos az osszes smalltaskban
	
	this.value=this.origData					//ez meg minek is
	
	
	this.fHitValue=[0]					//initial value, should happen masutt
	
	
	
}

// if(depthObj==undefined){
		
	// 	depthObj=createDepthObj(dbTable._id,
    //                             dbTable.table,
    //                             dbTable.wNext,
    //                             dbTable.allPastTables,
    //                             dbTable.origData,
    //                             dbTable.origProtect,
    //                             dbTable.oppKingPos
    //         )
		
	// }
	
	// this.depthObj=depthObj
	
	
	
	
	
	//no need: this.dbTable=dbTable
	// if(depth==undefined){
	// 	depth=1
	// 	deepMoves=[moveCoord]
	// }
	// this.depth=depth
	
	// this.deepMoves=deepMoves

var MoveTask =function(dbTable,desiredDepth){
	
	//this.rnd=Math.random()
	this.created = new Date().getTime()
	
	this.allTempTables = []
	
	this.desiredDepth=desiredDepth
	
	dbTable.oppKingPos=whereIsTheKing(dbTable.table,!dbTable.wNext)
	
	
	var moveCoords=getAllMoves(dbTable.table,dbTable.wNext,false,0,true)
	
	
	
	dbTable.origProtect=protectTable(dbTable.table,dbTable.wNext)
	dbTable.origData = getTableData(dbTable.table, dbTable.wNext)
	
	this.dontLoop=false
	
	if (dbTable.origData[0]>1){
		this.dontLoop=true
	}
	
	
	
	
	
	
	
	var moves=[]
	
	moveCoords.forEach(function(moveCoord,index){
		moves.push(new SmallMoveTask(moveCoord, index, dbTable, desiredDepth))
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