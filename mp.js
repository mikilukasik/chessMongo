function solveSmallDeepeningTask(smallDeepeningTask, resolverArray) {

	//this is the function that runs a million times
	
	var sdtDepth=smallDeepeningTask.depth

	var sdtTable=smallDeepeningTask.table
	
	var sdtScore=smallDeepeningTask.score

	//gets one task, produces an array of more tasks
	//or empty array when done

	var result// = []
	
	var newWNext = !smallDeepeningTask.wNext

	//these new tasks go to a fifo array, we solve the tree bit by bit
	//keeping movestrings only, not eating memory with tables

	//get hitvalue for each move, keep bes ones only
	//end of tree check if we got it wrong and go back if treevalue gets less!!!!!!!!!!!!!!!!


	if (smallDeepeningTask.trItm) { //we solved all moves for a table, time to go backwards

		//do some work in resolverArray		
		//then clear that array


		resolveDepth(sdtDepth, resolverArray)



	} else {

		if (sdtDepth > smallDeepeningTask.desiredDepth) { //depth +1
			////console.log(sdtDepth)
			// if(resolverArray[sdtDepth]==undefined){
			// 	//console.log('smalldeepeningtask  depth problem:',smallDeepeningTask)
			// }  else {
			// 	////console.log('smalldeepeningtask  depth ok:',smallDeepeningTask)
			// }
			resolverArray[sdtDepth].push(new ResolverItem(sdtScore, smallDeepeningTask.moveTree)) //this will fill in and then gets reduced to best movevalue only




		} else {
			
			result = []
			
			var noNegative = (sdtDepth / 2 == Math.floor(sdtDepth / 2))
			
			if(sdtDepth == smallDeepeningTask.desiredDepth){
				//////depth reached, eval table
				var newScore
				if(noNegative){
					newScore=sdtScore + getHitScores(sdtTable,smallDeepeningTask.wNext)
				}else{
					newScore=sdtScore - getHitScores(sdtTable,smallDeepeningTask.wNext)
				}
				
				
				result.push(new SmallDeepeningTask(
						[],			//no table
						newWNext,
						sdtDepth + 1,
						smallDeepeningTask.moveTree,
						smallDeepeningTask.desiredDepth,

						newScore) //sdtScore + thisValue

						//,stopped is missing, game goes on


					)

				//)

				
				
				
				
				
				
			}else{
				//depth not reached
				
						
			
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

				//var noKingHit = true

				//if (thisValue == 9) noKingHit = false

				var valueToSave

				if (noNegative) { //does this work???!!!!!!!!!!!

					valueToSave = sdtScore + thisValue// - thisValue2 //every second level has negative values: opponent moved
					 
				} else {

					valueToSave = sdtScore - thisValue// + thisValue2//every second level has negative values: opponent moved

				}

				var newMoveTree = smallDeepeningTask.moveTree.concat(moveStr)


				result.push(new SmallDeepeningTask(
						movedTable,
						newWNext,
						sdtDepth + 1,
						newMoveTree,
						smallDeepeningTask.desiredDepth,

						valueToSave //sdtScore + thisValue

						//,stopped is missing, game goes on


					)

				)

			} //  )    //end of for each move

			

				
				
				
				
			}
			
			result.push(new TriggerItem(sdtDepth + 1, smallDeepeningTask.moveTree))
				//this will trigger move calc when processing array (will be placed before each set of smalltasks)
			
	
		}




		//}

	}

	// var resultValue = 0

	// result.push(resultValue) //!!!!!!!!!!!!!!!!!!!!!!here we put in some extra data to be caught by the caller

	return result

}

