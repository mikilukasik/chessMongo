function getAllMoves(tableToMoveOn, whiteNext, hitItsOwn, allHitSum, removeCaptured) { //shouldn't always check hitsum
	var speedy = true
	if (removeCaptured) speedy = false

	var tableData = findMyPieces(tableToMoveOn, whiteNext)[1]
	var thisArray = []
		//thisStrArray = []

	if (hitItsOwn) {
		whiteNext = !whiteNext
	}
	//var allHitSum=0
	var hitSumPart = []
	hitSumPart[0] = 0

	for (var pieceNo = 0; pieceNo < tableData.length; pieceNo++) {

		canMove(tableData[pieceNo][0], tableData[pieceNo][1], whiteNext, tableToMoveOn, speedy, true, hitSumPart) //true,true for speedy(sakkba is lep),dontProtect
			.forEach(function(stepItem) {
				thisArray.push([tableData[pieceNo][0], tableData[pieceNo][1], stepItem[0], stepItem[1]])
			})
		allHitSum += hitSumPart[0]
	}

	// if(removeCaptured){

	// }


	return thisArray

}
