////////////////http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object


function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

////////////////////http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object end




var MoveTaskN = function(dbTable) {
    
    
    this.sharedData = {
        
        origWNext:dbTable.wNext,
      
        
        desiredDepth: dbTable.desiredDepth,
        oppKingPos: whereIsTheKing(dbTable.table, !dbTable.wNext),
        origProtect: protectTable(dbTable.table, dbTable.wNext),
        origData: getTableData(dbTable.table, dbTable.wNext),
        origDeepDatatt: getHitScores(dbTable.table, true, true),
        origDeepDatatf: getHitScores(dbTable.table, true, false),
        origDeepDataft: getHitScores(dbTable.table, false, true),
        origDeepDataff: getHitScores(dbTable.table, false, false),
    }

	this.moveCoords = getAllMoves(dbTable.table, dbTable.wNext, false, 0, true)

	var dontLoop = false
	if (this.sharedData.origData[0] > 1) {
		dontLoop = true
	}
    
    this.sharedData.dontLoop=dontLoop

}









function toTypedTable(table){
	
	var result=new Array(8)
	if(table!=undefined){
		
		for(var i=0;i<8;i++){
			
			result[i]=new Array(8)
			if(table[i]!=undefined){
				for(var j=0;j<8;j++){
				
					result[i][j]=new Int8Array(table[i][j])
					
					
				}
			}
			
			
			
		}
	
	}

	return result
}


///////////////////////////// below the functions that run a million times ////////////////////////

function solveSmallDeepeningTask(smallDeepeningTask, resolverArray){
  
	//this is the function that runs a million times
	
	var sdtDepth=smallDeepeningTask.depth

	var sdtTable=smallDeepeningTask.table
	
	var sdtScore=new Int32Array(1)
	sdtScore[0]=smallDeepeningTask.score

	//gets one task, produces an array of more tasks
	//or empty array when done

	var result = []
	
	var newWNext = !smallDeepeningTask.wNext
	
	if(sdtDepth==2){								//on 2nd level remove invalids
		if(captured(sdtTable,newWNext)){
			//invalid move, sakkban maradt
			
			result=[new SmallDeepeningTask(sdtTable,newWNext,sdtDepth+1,smallDeepeningTask.moveTree,smallDeepeningTask.desiredDepth,100,smallDeepeningTask.wPlayer,false,smallDeepeningTask.gameNum)]
			
		}
		
	}
	

	//these new tasks go to a fifo array, we solve the tree bit by bit
	//keeping movestrings only, not eating memory with tables

	//get hitvalue for each move, keep bes ones only
	//end of tree check if we got it wrong and go back if treevalue gets less!!!!!!!!!!!!!!!!


	if (smallDeepeningTask.trItm) { //we solved all moves for a table, time to go backwards

		//do some work in resolverArray		
		//then clear that array
        
      //  counter[0]++
        //counter

		resolveDepth(sdtDepth, resolverArray)



	} else {
        
		if (sdtDepth > smallDeepeningTask.desiredDepth) { //depth +1
			
			resolverArray[sdtDepth].push(new ResolverItem(sdtScore[0], smallDeepeningTask.moveTree)) //this will fill in and then gets reduced to best movevalue only
			
			
		} else {
			
			
			var isNegative = (sdtDepth & 1)
			
			if(sdtDepth == smallDeepeningTask.desiredDepth){
				//////depth reached, eval table
				
				var newScore=new Int32Array(1)
				
				if(isNegative){
					
					newScore[0]=(sdtScore[0] << 16) - getHitScores(sdtTable,smallDeepeningTask.wNext,false,smallDeepeningTask.wPlayer)[0]
					
				}else{
				
					newScore[0]=(sdtScore[0] << 16) + getHitScores(sdtTable,smallDeepeningTask.wNext,true,smallDeepeningTask.wPlayer)[0]
				}
				
				
				result.push(new SmallDeepeningTask(
						[],			//no table
						newWNext,
						sdtDepth + 1,
						smallDeepeningTask.moveTree,
						smallDeepeningTask.desiredDepth,

						newScore[0], //sdtScore + thisValue

						
                        smallDeepeningTask.wPlayer,
                        
                        false,
                        
                        smallDeepeningTask.gameNum

					)

				)

				
			}else{
			
			//depth not solved, lets solve it further


			var possibleMoves = []

			//below returns a copied table, should opt out for speed!!!!!!!

			addMovesToTable(sdtTable, smallDeepeningTask.wNext, true, possibleMoves) //this puts moves in strings, should keep it fastest possible

			//true to 				//it will not remove invalid moves to keep fast 
			//keep illegal			//we will remove them later when backward processing the tree

			//here we have possiblemoves filled in with good, bad and illegal moves

			
			for (var i = possibleMoves.length - 1; i > -1; i--) {
				//was possibleMoves.forEach(function(moveStr) { //create a new smalltask for each move

				var moveStr = possibleMoves[i]

				var movedTable = []
	
				movedTable = fastMove(moveStr, sdtTable, true) //speed! put this if out of here, makeamove only false at the last run


				var whatGetsHit = sdtTable[dletters.indexOf(moveStr[2])][moveStr[3] - 1]

				var thisValue = whatGetsHit[1] //piece value, should ++ when en-pass

				
				var valueToSave

				if (isNegative) { //does this work???!!!!!!!!!!!
				
							valueToSave = sdtScore[0] - thisValue
				} else {

			
					
						valueToSave = sdtScore[0] + thisValue
				}

				var newMoveTree = smallDeepeningTask.moveTree.concat(moveStr,valueToSave)
                
                result.push(new SmallDeepeningTask(
						movedTable,
						newWNext,
						sdtDepth + 1,
						newMoveTree,
						smallDeepeningTask.desiredDepth,

						valueToSave ,//sdtScore + thisValue

						
                        smallDeepeningTask.wPlayer,
                        
                        false,
                        
                        smallDeepeningTask.gameNum


					)

				)

			} //  )    //end of for each move

	
			}
			
			result.push(new TriggerItem(sdtDepth + 1, smallDeepeningTask.moveTree))
				//this will trigger move calc when processing array (will be placed before each set of smalltasks)
			
	
		}

	}

	

	return result

}



function solveDeepeningTask(deepeningTask, someCommand) { //designed to solve the whole deepening task on one thread
	//will return number of smallTasks solved for testing??!!!!!!!!!!!!!!!
	//var taskValue = deepeningTask.

    //var counter=new Int32Array([0])
    
	//var ranCount = 0
    
    var retProgress=deepeningTask.progress
    
	var startedAt = new Date()
		.getTime()

	if (someCommand == 'sdt') {

		//we are in worker, received 2nd depth table already processed with oneDeeper()
		//this table is after his first return move
		//not filtered move, could be that we can hit the king now
		//if we can, then this is a wrong move, need to throw away the whole lot!!!!!!!!!!!!!!!!!

    //counter[0]=deepeningTask.counter

		var tempDeepeningTask = {
			desiredDepth: deepeningTask.desiredDepth,
			smallDeepeningTasks: [deepeningTask],
            wPlayer: deepeningTask.wPlayer
		}
		deepeningTask = tempDeepeningTask
	}

	//var solved = 
    

	//var averageVal = 0 //will add then divide

	//var totalVal=0

	var resolverArray = [] //multidim, for each depth the results, will be updated a million times

	for (var i = 0; i < deepeningTask.desiredDepth + 2; i++) {
		resolverArray[i] = []
	}




	while (deepeningTask.smallDeepeningTasks.length != 0) {


		//if (deepeningTask.smallDeepeningTasks.length <= 0)console.log(deepeningTask.smallDeepeningTasks,[],[]==deepeningTask.smallDeepeningTasks,typeof(deepeningTask.smallDeepeningTasks),typeof([]))


		//length is 1 at first, then just grows until all has reached the level. evetually there will be nothing to do and this loop exists


		//solved++

		var smallDeepeningTask = deepeningTask.smallDeepeningTasks.pop()
        
        // if(smallDeepeningTask.wPlayer!=undefined){
        //     console.log(smallDeepeningTask.wPlayer)
        // }else{
        //     console.log(smallDeepeningTask)
        // }
        

		
		smallDeepeningTask.table= toTypedTable(smallDeepeningTask.table)
		//var thisMoveValue = 0

		var resultingSDTs = solveSmallDeepeningTask(smallDeepeningTask, resolverArray)

		

		while (resultingSDTs.length > 0) {
			//ranCount++
			deepeningTask.smallDeepeningTasks.push(resultingSDTs.pop()) //at the beginning the unsent array is just growing but then we run out
				//designed to run on single threaded full deepening
		}

		//}
		//resultingstds is now an empty array, unsent is probably full of tasks again

		//call it again if there are tasks
	}

	////console.log(ranCount)

	//////////console.log(resolverArray)

	var timeItTook = new Date()
		.getTime() - startedAt



    //console.log('>>>>>>>>>>>>>>>>>>>counter:',counter)    
        
//console.log(resolverArray)

	var ret = {
		//solved: 20,		//temp hack!!!!!!!!!!!!!!!!!!!!!!
        gameNum:deepeningTask.gameNum,
        progress:retProgress,
		timeItTook: timeItTook,
		score: resolverArray[2][0].value,
		moveTree: resolverArray[2][0].moveTree.join(','), //
		//counter: counter
			//5//			//!!!!!!!!!!!!!!!!!!!!!!!!!
	}

	if (someCommand != 'sdt') {
		ret.score = resolverArray[1][0].value
			//moveTree= resolverArray[1][0].moveTree.join(',')

	}

	return ret
}




function deepMove(smallMoveTask) { //for 1 thread, smallmovetask has one of my possible 1st moves

	// var started = new Date()
	// 	.getTime()

	var solvedTableCount = 0

	// var value = 0

	var deepeningTask = new DeepeningTask(smallMoveTask) //deepeningtask to be able to create 2nd level set for workers

	//var tempCommand = ''

	//var thisMoveValue=0

	//var ranCount=
	var totals = solveDeepeningTask(deepeningTask, '') //single thread calc

	solvedTableCount += totals.solved


	return { //this goes to console chat window
		move: deepeningTask.moveStr,
		score: totals.score,
		moveTree: totals.moveTree,
		solved: totals.solved,
		_id: smallMoveTask._id,
		depth: deepeningTask.desiredDepth
	}


}




function mtProcessDeepSplitMoves(data, thinker, mt, modConst, looped) {
	var newData = []
	var ranCount = 0
	while (data.length > 0) {

		var toPush = deepMove(data.pop(), ranCount)
		toPush.thinker = thinker
		newData.push(toPush)

	}
	newData.solved = ranCount
	return newData
}




function oneDeeper(deepeningTask) { //only takes original first level deepeningtasks??


    
   

	var resolverArray = [] 
	var smallDeepeningTask = deepeningTask.smallDeepeningTasks.pop()
 

	var tempTasks = solveSmallDeepeningTask(smallDeepeningTask, smallDeepeningTask.resolverArray)//, counter)

	while (tempTasks.length > 0) {

		var tempTask = tempTasks.pop()

		
         
		deepeningTask.smallDeepeningTasks.push(tempTask)
			



	}

	deepeningTask.smallDeepeningTasksCopy = deepeningTask.smallDeepeningTasks.slice()

	
	deepeningTask.resolverArray = resolverArray
 
}



function singleThreadAi(tempDbTable,depth){
    
   
    var dbTable=clone(tempDbTable)
   
    //from index 
    dbTable.moveTask=new MoveTaskN(dbTable)
    
    dbTable.moveTask.sharedData.desiredDepth=depth
    
    //from server
    var tempMoves=new SplitMove(dbTable).movesToSend
    
    
    //////////from mainworker
    tempMoves.forEach(function(splitMove) {

        splitMove.progress = {

            moveCoords: splitMove.moveCoords,
            moveIndex: splitMove.moveIndex,

            done: false,
            result: {},

            expected: undefined,

        }
      
    })

    var res=[]
    
    tempMoves.forEach(function(smallMoveTask,index){
        var dTask=new DeepeningTask(smallMoveTask)
      
        var deepeningTask = new DeepeningTask(smallMoveTask)

        oneDeeper(deepeningTask) //this will make about 30 smalldeepeningtasks from the initial 1 and create deepeningtask.resolverarray
            //first item in deepeningtask.smalldeepeningtasks is trigger

        //!!!!!!!!!!!implement !!!!!!!!!!typedarray

      
            while (deepeningTask.smallDeepeningTasks.length > 1) {

                var smallDeepeningTask = deepeningTask.smallDeepeningTasks.pop()
                
////////////////from subworker              
                res.push(solveDeepeningTask(smallDeepeningTask,'sdt'))
                
            }

        
    })
    
    //return res
    res.sort(function(a,b){
        
        if(a.score<b.score){
            return 1
        }else{
            if(a.score==b.score){
                return 0
            }else{
                return -1
            }
        }
        
    })
    
    var result={
        array:res,
        winningMove:res[0],
        moveStr:res[0].moveTree.slice(0,4)
    }
    //res.winningMove=res[0]
    
    return result
    
}


function resolveDepth(depth, resolverArray){
	
    if (resolverArray[depth].length > 0) {
		if (depth & 1) {

			resolverArray[depth - 1].push(
				resolverArray[depth].reduce(
					function(previousValue, currentValue, index, array) {
						if (currentValue.value > previousValue.value) {
							return {
								value: currentValue.value,
								moveTree: currentValue.moveTree
							} //currentValue

						} else {
							return {
								value: previousValue.value,
								moveTree: previousValue.moveTree
							} //previousValue
						}


					}
				)
			)

		} else {
			resolverArray[depth - 1].push(
				resolverArray[depth].reduce(
					function(previousValue, currentValue, index, array) {
						if (currentValue.value < previousValue.value) {
							return {
								value: currentValue.value,
								moveTree: currentValue.moveTree
							}
						} else {
							return {
								value: previousValue.value,
								moveTree: previousValue.moveTree
							}
						}


					}
				)
			)
		}



	}
	resolverArray[depth] = []
}