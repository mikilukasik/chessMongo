///////////////////////////// below the functions that run a million times ////////////////////////



function solveSmallDeepeningTask(smallDeepeningTask, resolverArray) {
	
	//this is the function that runs a million times

	//gets one task, produces an array of more tasks
	//or empty array when done

	var result = [] 																		
	
	//these new tasks go to a fifo array, we solve the tree bit by bit
	//keeping movestrings only, not eating memory with tables

	//get hitvalue for each move, keep bes ones only
	//end of tree check if we got it wrong and go back if treevalue gets less!!!!!!!!!!!!!!!!


	if (TriggerItem.prototype.isPrototypeOf(smallDeepeningTask)) { //we solved all moves for a table, time to go backwards

		//do some work in resolverArray		
		//then clear that array
		
		
		resolveDepth(smallDeepeningTask.depth, resolverArray)
		
		

	} else {

			if (smallDeepeningTask.depth <= smallDeepeningTask.desiredDepth) {
				//depth not solved, lets solve it further
				
				
				
		if (smallDeepeningTask.stopped) { //stopped is either 'bWon' or 'wWon' or undefined

			//////////////////////////////// a king is missing	//////////////////////////


			var newTreeMoves = smallDeepeningTask.treeMoves //treemoves is an 1 dim array with the moves that lead here

			//newTreeMoves.push(smallDeepeningTask.stopped) //stopped is either 'bWon' or 'wWon' or undefined



			var newSmallTask = new SmallDeepeningTask(smallDeepeningTask.table, //last known table has a king missing
				smallDeepeningTask.wNext, //remembering the winner in wnext
				smallDeepeningTask.depth + 1, //this we increase until the end, deepener will make one copy in each round
				newTreeMoves, //move,move,move,wwon,wwon,wwon+
				smallDeepeningTask.desiredDepth,
				smallDeepeningTask.score,
				//true//
				smallDeepeningTask.stopped //wwon or bwon

			)

			result.push(newSmallTask) //1 returning task until reach desiredDepth
				
		}else{	
				

				var possibleMoves = []
				
					//below returns a copied table, should opt out for speed!!!!!!!
				addMovesToTable(smallDeepeningTask.table, smallDeepeningTask.wNext, true, possibleMoves) //this puts moves in strings, should keep it fastest possible
					//true to 				//it will not remove invalid moves to keep fast 
					//keep illegal			//we will remove them later when backward processing the tree

					//here we have possiblemoves filled in with good, bad and illegal moves


				var newWNext = !smallDeepeningTask.wNext
				
				var makeMove=false
				
				
				
				if (smallDeepeningTask.depth < smallDeepeningTask.desiredDepth) {

						makeMove=true

					}
					
				var oldMoveTree=smallDeepeningTask.moveTree
				//var oldScore=smallDeepeningTask.score

				for (var i = 0; i < possibleMoves.length; i++) {
					//was possibleMoves.forEach(function(moveStr) { //create a new smalltask for each move

					var moveStr = possibleMoves[i]


					var movedTable = []

					//if (smallDeepeningTask.depth < smallDeepeningTask.desiredDepth) {
						
					var newMoveTree=oldMoveTree.slice()
					
					

					if(makeMove)	movedTable = fastMove(moveStr, smallDeepeningTask.table, true)

					//

					//var fastValue = [0,0] //nem kell, a movestringbol vesszuk fastTableValue(movedTable) //this gets the value of the table (black winning < 0 < white winnning) and the total value of kings (1,2 or 3)

					//var thisMoveCoords=stringToMoveCoords(moveStr)
					var whatGetsHit = smallDeepeningTask.table[dletters.indexOf(moveStr[2])][moveStr[3] - 1]

					var thisValue = whatGetsHit[1] //piece value, should ++ when en-pass

					var noKingHit = true

					if (thisValue == 9) noKingHit = false



					if (smallDeepeningTask.depth / 2 != Math.floor(smallDeepeningTask.depth/2)){		//does this work???!!!!!!!!!!!

						 thisValue=thisValue*-1 //every second level has negative values: opponent moved
						////////////console.log('negative: '+thisValue)					 
					}

					newMoveTree.push(moveStr+': '+thisValue)

					var newSmallTask = {}

					//var newParentMove = smallDeepeningTask.treeMoves //treemoves is an 1 dim array with the moves that lead here

					//newTreeMoves.push(moveStr) //so we keep track of how we got to this table



					if (noKingHit) { //not hitting king




						newSmallTask = new SmallDeepeningTask(
							movedTable,
							newWNext,
							smallDeepeningTask.depth + 1,
							newMoveTree,
							smallDeepeningTask.desiredDepth,
							smallDeepeningTask.score + thisValue
							
							//,stopped is missing, game goes on


						)

						result.push(newSmallTask)

						resCommand = 'deepened'


					} else {
						//a king got hit

						if (smallDeepeningTask.wNext) {
							resCommand = 'wWon'
						} else {
							resCommand = 'bWon'
						}

						//newTreeMoves.push(resCommand)

						newSmallTask = new SmallDeepeningTask(movedTable, //last known table has a king missing
							smallDeepeningTask.wNext, //remembering the winner in wnext
							smallDeepeningTask.depth + 1, //this we increase until the end, deepener will make one copy in each round
							resCommand, //last move added to it, illegal where king gets hit
							smallDeepeningTask.desiredDepth,
							smallDeepeningTask.score + thisValue * (smallDeepeningTask.desiredDepth - smallDeepeningTask.depth), //value can stay the same
							true //resCommand //smallDeepeningTask.stopped:	wwon or bwon

						)

						result.push(newSmallTask)
//



					}

				} //  )    //end of for each move

				result.push(new TriggerItem(smallDeepeningTask.depth + 1, smallDeepeningTask.moveTree))
					//this will trigger move calc when processing array (will be placed before each set of smalltasks)

			}

			} else { //depth +1
				////console.log(smallDeepeningTask.depth)
				// if(resolverArray[smallDeepeningTask.depth]==undefined){
				// 	//console.log('smalldeepeningtask  depth problem:',smallDeepeningTask)
				// }  else {
				// 	////console.log('smalldeepeningtask  depth ok:',smallDeepeningTask)
				// }
				resolverArray[smallDeepeningTask.depth].push(new ResolverItem(smallDeepeningTask.score,smallDeepeningTask.moveTree)) //this will fill in and then gets reduced to best movevalue only




			}
		//}

	}

	// var resultValue = 0

	// result.push(resultValue) //!!!!!!!!!!!!!!!!!!!!!!here we put in some extra data to be caught by the caller

	return result

}







function solveDeepeningTask(deepeningTask, someCommand) { //designed to solve the whole deepening task on one thread
	//will return number of smallTasks solved for testing??!!!!!!!!!!!!!!!
	//var taskValue = deepeningTask.


	var ranCount=0

	var startedAt = new Date()
		.getTime()

	if(someCommand=='sdt'){
		var tempDeepeningTask={
			desiredDepth:deepeningTask.desiredDepth,
			smallDeepeningTasks:[deepeningTask]
		}
		deepeningTask=tempDeepeningTask
	}

	//var solved = 


	var averageVal = 0 //will add then divide

	//var totalVal=0

	var resolverArray = [] //multidim, for each depth the results, will be updated a million times

	for (var i = 0; i < deepeningTask.desiredDepth + 2; i++) {
		resolverArray[i] = []
	}




	while (deepeningTask.smallDeepeningTasks.length > 0) {

		//length is 1 at first, then just grows until all has reached the level. evetually there will be nothing to do and this loop exists

		
		//solved++

		var smallDeepeningTask = deepeningTask.smallDeepeningTasks.pop()


		//var thisMoveValue = 0

		var resultingSDTs = solveSmallDeepeningTask(smallDeepeningTask, resolverArray)

		// resultingSDTs.pop() //!!!!!!!!!!!!!!!!!!!!!!!!!

		//ranCount+=resultingSDTs.length

		//////////////console.log('bai 2879',taskValue)

		//averageVal+=thisMoveValue

		if (resCommand != '') {
			//solver messaged us

		}

		if (resultingSDTs != []) {
			//new tables were generated. when we reach desiredDepth there will be no new tables here
			//////////////console.log(resultingSDTs)
			//solved += resultingSDTs.length

			while (resultingSDTs.length > 0) {
				ranCount++
				deepeningTask.smallDeepeningTasks.push(resultingSDTs.pop()) //at the beginning the unsent array is just growing but then we run out
					//designed to run on single threaded full deepening
			}

		}
		//resultingstds is now an empty array, unsent is probably full of tasks again

		//call it again if there are tasks
	}
	
	////console.log(ranCount)
	
	//////////console.log(resolverArray)
	
	var timeItTook = new Date()
		.getTime() - startedAt
		
	
		
	var ret={
		//solved: 20,		//temp hack!!!!!!!!!!!!!!!!!!!!!!
		timeItTook: timeItTook,
		score: resolverArray[2][0].value,
		moveTree: resolverArray[2][0].moveTree.join(','), //
		ranCount:ranCount
		//5//			//!!!!!!!!!!!!!!!!!!!!!!!!!
	} 
	
	if(someCommand!='sdt'){
		ret.score=resolverArray[1][0].value
		//moveTree= resolverArray[1][0].moveTree.join(',')
		
	}
		
	return ret
}






function deepMove(smallMoveTask,ranCount) { //for 1 thread, smallmovetask has one of my possible 1st moves

	var started = new Date()
		.getTime()

	var solvedTableCount = 0

	var value = 0

	var deepeningTask = new DeepeningTask(smallMoveTask)		//deepeningtask to be able to create 2nd level set for workers

	var tempCommand = ''

	//var thisMoveValue=0
	
	//var ranCount=
	var totals = solveDeepeningTask(deepeningTask, tempCommand, ranCount) //single thread calc

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
	var ranCount=0
	while (data.length > 0) {

		var toPush = deepMove(data.pop(),ranCount)
		toPush.thinker = thinker
		newData.push(toPush)
	
	}
	newData.solved=ranCount
	return newData
}






function oneDeeper(deepeningTask){		//only takes original first level deepeningtasks??
	
	var newTasks=[]
	
	var resolverArray = []//deepeningTask.resolverArray //multidim, for each depth the results, will be updated a million times
	
	var smallDeepeningTask = deepeningTask.smallDeepeningTasks.pop()

	
	var tempTasks = solveSmallDeepeningTask(smallDeepeningTask, smallDeepeningTask.resolverArray)
	
	while (tempTasks.length>0) deepeningTask.smallDeepeningTasks.push(tempTasks.pop())
	
	deepeningTask.smallDeepeningTasksCopy=deepeningTask.smallDeepeningTasks.slice()
	
	////console.log(deepeningTask.smallDeepeningTasks.length)
	
	deepeningTask.resolverArray=resolverArray

}


function resolveDepth(depth, resolverArray) {
	if (resolverArray[depth].length > 0) {
		if (depth / 2 != Math.floor(depth / 2)) {

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