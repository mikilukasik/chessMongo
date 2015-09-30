//var hitSum = 0
var escConst = 1
var fadeConst = 1
var level = 1
var whatHitsConst = 1
var hitValueConst = 0.5
	//var t1const = 1
var t2const = 0.0025
var dontHitConst = 0.8
var dletters = ["a", "b", "c", "d", "e", "f", "g", "h"]

function getSimpleTableState(itable) {
	var tempString = ""

	for(var j = 0; j < 8; j++) {
		for(var i = 0; i < 8; i++) {

			switch(itable[i][j][1]) {
				case 0:
					//var letterToPush="s"
					if(isNaN(tempString[tempString.length - 1])) {
						var letterToPush = "1"
					} else {
						// tempString[tempString.length-1]=tempString[tempString.length-1]+1  

						var lastNum = tempString.substring(tempString.length - 1)
						tempString = tempString.substring(0, tempString.length - 1)
						lastNum++

						var letterToPush = lastNum
					}

					break;
				case 1:

					var letterToPush = "p"

					break;
				case 2:
					var letterToPush = "b"
					break;
				case 3:
					var letterToPush = "n"

					break;
				case 4:
					var letterToPush = "r"

					break;
				case 5:
					var letterToPush = "q"

					break;
				case 9:
					var letterToPush = "k"

					break;

			} //end of switch

			if(itable[i][j][0] == 2) { //if white
				letterToPush = letterToPush.toUpperCase()

			}

			tempString = tempString.concat(letterToPush)

		}
		tempString = tempString.concat('/')
	}
	return tempString
}

function protectPieces(originalTable, whitePlayer) {

	//var flippedMoves=
	var myCol = 1;
	if(whitePlayer) myCol = 2 //myCol is 2 when white
	var protectedSum = 0
	getAllMoves(originalTable, whitePlayer, true). //moves include to hit my own 
		//true stands for letMeHitMyOwn
	
	forEach(function(thisMoveCoords) {
		//we'll use the 2nd part of the moves [2][3]
		if(originalTable[thisMoveCoords[2]][thisMoveCoords[3]][0] == myCol) { //if i have sg there
			originalTable[thisMoveCoords[2]][thisMoveCoords[3]][6] = true //that must be protected
			
			if(originalTable[thisMoveCoords[0]][thisMoveCoords[1]][1]==9){
				protectedSum+=(9-originalTable[thisMoveCoords[2]][thisMoveCoords[3]][1])*2	//king protects double
			
				
			}else{
				
				protectedSum+=9-originalTable[thisMoveCoords[2]][thisMoveCoords[3]][1]
			}
		
		
		}
	})
	
	return protectedSum

}

function addMovesToTable(originalTable, whiteNext) {

	//rewrite this to use getTableData to find my pieces, don't copy the array just change the original

	var myCol = 1;
	if(whiteNext) myCol++ //myCol is 2 when white

		var tableWithMoves = new Array(8)
	for(var i = 0; i < 8; i++) {
		tableWithMoves[i] = new Array(8)
		for(var j = 0; j < 8; j++) {
			tableWithMoves[i][j] = []
			originalTable[i][j].forEach(function(value, feCount) {
				tableWithMoves[i][j][feCount] = value

			})
			if(originalTable[i][j][0] == myCol) {
				tableWithMoves[i][j][5] = canMove(i, j, whiteNext, originalTable)
			} else {
				tableWithMoves[i][j][5] == []
			}
		}
	}

	return tableWithMoves

}

function captured(table, color) {
	var myCol = 1;

	var tempMoves = []
	if(color) myCol++ //myCol is 2 when white
		for(var i = 0; i < 8; i++) {
			for(var j = 0; j < 8; j++) {

				if(table[i][j][1] == 9 && table[i][j][0] == myCol) {
					//itt a kiraly

					tempMoves = bishopCanMove(i, j, color, table)

					for(var tempMoveCount = 0; tempMoveCount < tempMoves.length; tempMoveCount++) {
						if(table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] == 5 ||
							table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] == 2) {
							return true;
						}

					}

					tempMoves = rookCanMove(i, j, color, table)

					for(var tempMoveCount = 0; tempMoveCount < tempMoves.length; tempMoveCount++) {
						if(table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] == 5 ||
							table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] == 4) {
							return true;
						}

					}

					tempMoves = horseCanMove(i, j, color, table)

					for(var tempMoveCount = 0; tempMoveCount < tempMoves.length; tempMoveCount++) {
						if(table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] == 3) {
							return true;
						}

					}

					tempMoves = pawnCanMove(i, j, color, table)

					for(var tempMoveCount = 0; tempMoveCount < tempMoves.length; tempMoveCount++) {
						if(table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] == 1) {
							return true;
						}

					}

					tempMoves = kingCanMove(i, j, color, table)

					for(var tempMoveCount = 0; tempMoveCount < tempMoves.length; tempMoveCount++) {
						if(table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] == 9) {
							return true;
						}

					}

				}
			}
		}
	return false
}

function canMove(k, l, isWhite, moveTable, speedy, dontProt, hitSumm){//, try2steps) {
	
	if(typeof(hitSumm)=='undefined')var hitSumm=[0]
	var try2steps=false
	if(speedy)try2steps=true
	
	var what = moveTable[k][l][1]
	var possibleMoves = []
	var scndHitSum=[0]
	switch(what) {
		// case 0:

		case 1:

			possibleMoves = pawnCanMove(k, l, isWhite, moveTable, hitSumm)

			break;
		case 2:
			possibleMoves = bishopCanMove(k, l, isWhite, moveTable, hitSumm)

			break;
		case 3:
			possibleMoves = horseCanMove(k, l, isWhite, moveTable, hitSumm)

			break;
		case 4:
			possibleMoves = rookCanMove(k, l, isWhite, moveTable, hitSumm)

			break;
		case 5:
			possibleMoves = queenCanMove(k, l, isWhite, moveTable, hitSumm)

			break;
		case 9:
			possibleMoves = kingCanMove(k, l, isWhite, moveTable, hitSumm)

			break;

	}
	
	if(try2steps){
		
		switch(what) {
			// case 0:
	
			case 1:
	
				possibleMoves.forEach(function(stepPossibleMove){
					
					pawnCanMove(stepPossibleMove[0], stepPossibleMove[1], isWhite, moveTable, scndHitSum)
	
					
				}) 
				break;
			case 2:
				possibleMoves.forEach(function(stepPossibleMove){
					
					bishopCanMove(stepPossibleMove[0], stepPossibleMove[1], isWhite, moveTable, scndHitSum)
	
					
				}) 
				break;
			case 3:
				possibleMoves.forEach(function(stepPossibleMove){
					
					horseCanMove(stepPossibleMove[0], stepPossibleMove[1], isWhite, moveTable, scndHitSum)
	
					
				}) 
				break;
			case 4:
				possibleMoves.forEach(function(stepPossibleMove){
					
					rookCanMove(stepPossibleMove[0], stepPossibleMove[1], isWhite, moveTable, scndHitSum)
	
					
				}) 
				break;
			case 5:
				possibleMoves.forEach(function(stepPossibleMove){
					
					queenCanMove(stepPossibleMove[0], stepPossibleMove[1], isWhite, moveTable, scndHitSum)
	
					
				}) 
				break;
			case 9:
				possibleMoves.forEach(function(stepPossibleMove){
					
					kingCanMove(stepPossibleMove[0], stepPossibleMove[1], isWhite, moveTable, scndHitSum)
	
					
				}) 
				break;
	
		}
		
		
	}
	hitSumm[0] += scndHitSum[0]/10000 //masodik lepes is szamit egy kicsit
	//hitSumm[0] -= moveTable[k][l][1] / 100 //amit ut-amivel uti

	if(!speedy) {
		for(var i = possibleMoves.length - 1; i >= 0; i--) { //sakkba nem lephetunk
			if(captured(moveIt(coordsToMoveString(k, l, possibleMoves[i][0], possibleMoves[i][1]), moveTable, dontProt), isWhite)) { //sakkba lepnenk
				possibleMoves.splice(i, 1)

			}
		}

		if(what == 9 && moveTable[k][l][3]) { //lesznek sanc lepesek is a possibleMoves tombben: kiraly nem mozdult meg

			if(captured(moveTable, isWhite)) { // de sakkban allunk
				for(var spliceCount = possibleMoves.length - 1; spliceCount >= 0; spliceCount--) {
					if(possibleMoves[spliceCount][1] == l && (possibleMoves[spliceCount][0] == k - 2 || possibleMoves[spliceCount][0] == k + 2)) {
						possibleMoves.splice(spliceCount, 1) //remove
					}
				}

			}

			// remove the sakkot atugrani sem er sanc

			var removeKmin2 = true //alapbol leszedne
			var removeKplus2 = true

			for(var i = possibleMoves.length - 1; i >= 0; i--) { //
				if(possibleMoves[i][1] == l && possibleMoves[i][0] == k - 1) removeKmin2 = false //de ha van koztes lepes, ne szedd le
				if(possibleMoves[i][1] == l && possibleMoves[i][0] == k + 1) removeKplus2 = false
			}

			for(var i = possibleMoves.length - 1; i >= 0; i--) { //itt szedi le a sanclepeseket
				if(possibleMoves[i][1] == l &&
					((possibleMoves[i][0] == k - 2 && removeKmin2) ||
						(possibleMoves[i][0] == k + 2 && removeKplus2))) {

					possibleMoves.splice(i, 1)

				}

			}
		}
	}

	return possibleMoves

}

function coordsToMoveString(a, b, c, d) {

	return dletters[a] + (b + 1) + dletters[c] + (d + 1)
}

function noc(colr) {
	if(colr = 1) {
		return 2
	} else {
		return 1
	}
}

function whatsThere(i, j, aiTable) {
	//var pieceThere = []

	if(i > -1 && j > -1 && i < 8 && j < 8) {

		return aiTable[i][j] //.slice(0,4)
	}

	return []
}

function pushAid(hitSummmm, canMoveTo, x, y, hanyadik, milegyen, fromTable, someboolean, whatHits) {

	if(whatsThere(x, y, fromTable)[hanyadik] == milegyen) {

		canMoveTo.push([x, y, whatsThere(x, y, fromTable)[1]])

		//////////////////////////
		var thisHit = 0

		if(fromTable[x][y][6]) { //alert('protectedHit')	//ha protectedre lep
			thisHit = fromTable[x][y][1] - //thisHitbol kivonja amivel lep
				whatHits //* whatHitsConst
			if(thisHit < 0) {
				thisHit = 0
			} //negaive is 0
		} else {
			thisHit = fromTable[x][y][1] //normal hivalue

		}

		if(!(hitSummmm == undefined)) {									//aiming for the best only? why?
			if(hitSummmm[0] < thisHit) hitSummmm[0] = thisHit
		}

		return true

	};
	return false
}

function pawnCanMove(k, l, isWhite, moveTable, hitSummm) {
	var canMoveTo = []
		//var hitIt=false
	if((!isWhite && moveTable[k][l][0] == 1) || (isWhite && moveTable[k][l][0] == 2)) {
		var c = 2
		var nc = 1
	} else {
		var c = 1
		var nc = 2
	}
	//if(aiCalled){

	if(moveTable[k][l][0] == 2) {

		if(pushAid(hitSummm, canMoveTo, k, l + 1, 0, 0, moveTable) && l == 1) {
			pushAid(hitSummm, canMoveTo, k, l + 2, 0, 0, moveTable)
		}
		pushAid(hitSummm, canMoveTo, k - 1, l + 1, 0, nc, moveTable, isWhite, 1)
		pushAid(hitSummm, canMoveTo, k + 1, l + 1, 0, nc, moveTable, isWhite, 1)

		//en pass
		if(whatsThere(k - 1, l, moveTable)[3]) {

			pushAid(hitSummm, canMoveTo, k - 1, l + 1, 0, 0, moveTable, isWhite)

		}
		if(whatsThere(k + 1, l, moveTable)[3]) {

			pushAid(hitSummm, canMoveTo, k + 1, l + 1, 0, 0, moveTable, isWhite)

		}

	} else {

		if(pushAid(hitSummm, canMoveTo, k, l - 1, 0, 0, moveTable) && l == 6) {
			pushAid(hitSummm, canMoveTo, k, l - 2, 0, 0, moveTable)
		}
		pushAid(hitSummm, canMoveTo, k - 1, l - 1, 0, c, moveTable, !isWhite, 1)
		pushAid(hitSummm, canMoveTo, k + 1, l - 1, 0, c, moveTable, !isWhite, 1)

		//en pass
		if(whatsThere(k - 1, l, moveTable)[3]) {

			pushAid(hitSummm, canMoveTo, k - 1, l - 1, 0, 0, moveTable, !isWhite)

		}
		if(whatsThere(k + 1, l, moveTable)[3]) {

			pushAid(hitSummm, canMoveTo, k + 1, l - 1, 0, 0, moveTable, !isWhite)

		}

	}

	return canMoveTo

}

function rookCanMove(k, l, isWhite, moveTable, hitSummm) {
	var canMoveTo = []
		// if(aiCalled){

	if(isWhite) {
		var c = 1
		var nc = 2
	} else {
		var c = 2
		var nc = 1
	}

	var goFurther = [true, true, true, true]
	for(var moveCount = 1; moveCount < 8; moveCount++) {
		if(goFurther[0]) {
			pushAid(hitSummm, canMoveTo, k + moveCount, l, 0, 0, moveTable)
			if(pushAid(hitSummm, canMoveTo, k + moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k + moveCount, l, moveTable)[0] == nc) {
				goFurther[0] = false
			}
		}
		if(goFurther[1]) {
			pushAid(hitSummm, canMoveTo, k - moveCount, l, 0, 0, moveTable)
			if(pushAid(hitSummm, canMoveTo, k - moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k - moveCount, l, moveTable)[0] == nc) {
				goFurther[1] = false
			}
		}
		if(goFurther[2]) {
			pushAid(hitSummm, canMoveTo, k, l + moveCount, 0, 0, moveTable)
			if(pushAid(hitSummm, canMoveTo, k, l + moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l + moveCount, moveTable)[0] == nc) {
				goFurther[2] = false
			}
		}
		if(goFurther[3]) {
			pushAid(hitSummm, canMoveTo, k, l - moveCount, 0, 0, moveTable)
			if(pushAid(hitSummm, canMoveTo, k, l - moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l - moveCount, moveTable)[0] == nc) {
				goFurther[3] = false
			}
		}
	}
	return canMoveTo
}

function bishopCanMove(k, l, isWhite, moveTable, hitSummm) {
	var canMoveTo = []
		//if(aiCalled){

	if(isWhite) {
		var c = 1
		var nc = 2
	} else {
		var c = 2
		var nc = 1
	}

	var goFurther = [true, true, true, true]
	for(var moveCount = 1; moveCount < 8; moveCount++) {
		if(goFurther[0]) {
			pushAid(hitSummm, canMoveTo, k + moveCount, l + moveCount, 0, 0, moveTable)
			if(pushAid(hitSummm, canMoveTo, k + moveCount, l + moveCount, 0, c, moveTable, true, 2) || whatsThere(k + moveCount, l + moveCount, moveTable)[0] == nc) {
				goFurther[0] = false
			}
		}
		if(goFurther[1]) {
			pushAid(hitSummm, canMoveTo, k - moveCount, l + moveCount, 0, 0, moveTable)
			if(pushAid(hitSummm, canMoveTo, k - moveCount, l + moveCount, 0, c, moveTable, true, 2) || whatsThere(k - moveCount, l + moveCount, moveTable)[0] == nc) {
				goFurther[1] = false
			}
		}
		if(goFurther[2]) {
			pushAid(hitSummm, canMoveTo, k + moveCount, l - moveCount, 0, 0, moveTable)
			if(pushAid(hitSummm, canMoveTo, k + moveCount, l - moveCount, 0, c, moveTable, true, 2) || whatsThere(k + moveCount, l - moveCount, moveTable)[0] == nc) {
				goFurther[2] = false
			}
		}
		if(goFurther[3]) {
			pushAid(hitSummm, canMoveTo, k - moveCount, l - moveCount, 0, 0, moveTable)
			if(pushAid(hitSummm, canMoveTo, k - moveCount, l - moveCount, 0, c, moveTable, true, 2) || whatsThere(k - moveCount, l - moveCount, moveTable)[0] == nc) {
				goFurther[3] = false
			}
		}
	}
	return canMoveTo
}

function queenCanMove(k, l, isWhite, moveTable, hitSummm) {
	var canMoveTo = []

	if(isWhite) {
		var c = 1
		var nc = 2
	} else {
		var c = 2
		var nc = 1
	}

	var goFurther = [true, true, true, true, true, true, true, true]
	for(var moveCount = 1; moveCount < 8; moveCount++) {
		if(goFurther[0]) {
			pushAid(hitSummm, canMoveTo, k + moveCount, l + moveCount, 0, 0, moveTable)
			if(pushAid(hitSummm, canMoveTo, k + moveCount, l + moveCount, 0, c, moveTable, true, 5) || whatsThere(k + moveCount, l + moveCount, moveTable)[0] == nc) {
				goFurther[0] = false
			}
		}
		if(goFurther[1]) {
			pushAid(hitSummm, canMoveTo, k - moveCount, l + moveCount, 0, 0, moveTable)
			if(pushAid(hitSummm, canMoveTo, k - moveCount, l + moveCount, 0, c, moveTable, true, 5) || whatsThere(k - moveCount, l + moveCount, moveTable)[0] == nc) {
				goFurther[1] = false
			}
		}
		if(goFurther[2]) {
			pushAid(hitSummm, canMoveTo, k + moveCount, l - moveCount, 0, 0, moveTable)
			if(pushAid(hitSummm, canMoveTo, k + moveCount, l - moveCount, 0, c, moveTable, true, 5) || whatsThere(k + moveCount, l - moveCount, moveTable)[0] == nc) {
				goFurther[2] = false
			}
		}
		if(goFurther[3]) {
			pushAid(hitSummm, canMoveTo, k - moveCount, l - moveCount, 0, 0, moveTable)
			if(pushAid(hitSummm, canMoveTo, k - moveCount, l - moveCount, 0, c, moveTable, true, 5) || whatsThere(k - moveCount, l - moveCount, moveTable)[0] == nc) {
				goFurther[3] = false
			}
		}

		if(goFurther[4]) {
			pushAid(hitSummm, canMoveTo, k + moveCount, l, 0, 0, moveTable)
			if(pushAid(hitSummm, canMoveTo, k + moveCount, l, 0, c, moveTable, true, 5) || whatsThere(k + moveCount, l, moveTable)[0] == nc) {
				goFurther[4] = false
			}
		}
		if(goFurther[5]) {
			pushAid(hitSummm, canMoveTo, k - moveCount, l, 0, 0, moveTable)
			if(pushAid(hitSummm, canMoveTo, k - moveCount, l, 0, c, moveTable, true, 5) || whatsThere(k - moveCount, l, moveTable)[0] == nc) {
				goFurther[5] = false
			}
		}
		if(goFurther[6]) {
			pushAid(hitSummm, canMoveTo, k, l + moveCount, 0, 0, moveTable)
			if(pushAid(hitSummm, canMoveTo, k, l + moveCount, 0, c, moveTable, true, 5) || whatsThere(k, l + moveCount, moveTable)[0] == nc) {
				goFurther[6] = false
			}
		}
		if(goFurther[7]) {
			pushAid(hitSummm, canMoveTo, k, l - moveCount, 0, 0, moveTable)
			if(pushAid(hitSummm, canMoveTo, k, l - moveCount, 0, c, moveTable, true, 5) || whatsThere(k, l - moveCount, moveTable)[0] == nc) {
				goFurther[7] = false
			}
		}
	}
	return canMoveTo
}

function kingCanMove(k, l, isWhite, moveTable, hitSummm) {

	var canMoveTo = []

	if(isWhite) {
		var c = 1
		var nc = 2
	} else {
		var c = 2
		var nc = 1
	}

	moveCount = 1
	pushAid(hitSummm, canMoveTo, k + moveCount, l + moveCount, 0, 0, moveTable)
	pushAid(hitSummm, canMoveTo, k - moveCount, l + moveCount, 0, 0, moveTable)
	pushAid(hitSummm, canMoveTo, k + moveCount, l - moveCount, 0, 0, moveTable)
	pushAid(hitSummm, canMoveTo, k - moveCount, l - moveCount, 0, 0, moveTable)
	pushAid(hitSummm, canMoveTo, k + moveCount, l, 0, 0, moveTable)
	pushAid(hitSummm, canMoveTo, k - moveCount, l, 0, 0, moveTable)
	pushAid(hitSummm, canMoveTo, k, l + moveCount, 0, 0, moveTable)
	pushAid(hitSummm, canMoveTo, k, l - moveCount, 0, 0, moveTable)

	pushAid(hitSummm, canMoveTo, k + moveCount, l + moveCount, 0, c, moveTable, true, 9)
	pushAid(hitSummm, canMoveTo, k - moveCount, l + moveCount, 0, c, moveTable, true, 9)
	pushAid(hitSummm, canMoveTo, k + moveCount, l - moveCount, 0, c, moveTable, true, 9)
	pushAid(hitSummm, canMoveTo, k - moveCount, l - moveCount, 0, c, moveTable, true, 9)
	pushAid(hitSummm, canMoveTo, k + moveCount, l, 0, c, moveTable, true, 9)
	pushAid(hitSummm, canMoveTo, k - moveCount, l, 0, c, moveTable, true, 9)
	pushAid(hitSummm, canMoveTo, k, l + moveCount, 0, c, moveTable, true, 9)
	pushAid(hitSummm, canMoveTo, k, l - moveCount, 0, c, moveTable, true, 9)

	//sanc
	if(moveTable[k][l][3]) { //if the king hasnt moved yet, 

		// ha nincs sakkban, nem is ugrik at sakkot, minden ures kozotte

		if(moveTable[0][l][3] && // unmoved rook on [0][l]
			whatsThere(1, l, moveTable)[0] == 0 && whatsThere(2, l, moveTable)[0] == 0 && whatsThere(3, l, moveTable)[0] == 0) { //empty between

			pushAid(hitSummm, canMoveTo, 2, l, 0, 0, moveTable) //mark that cell if empty

		}
		if(moveTable[7][l][3] && whatsThere(5, l, moveTable)[0] == 0 && whatsThere(6, l, moveTable)[0] == 0) { // unmoved rook on [7][l] && empty between
			pushAid(hitSummm, canMoveTo, 6, l, 0, 0, moveTable) //mark that cell if empty

		}

	}

	return canMoveTo
}

function horseCanMove(k, l, isWhite, moveTable, hitSummm) {

	var canMoveTo = []
	pushAid(hitSummm, canMoveTo, k + 1, l + 2, 0, 0, moveTable)
	pushAid(hitSummm, canMoveTo, k + 1, l - 2, 0, 0, moveTable)
	pushAid(hitSummm, canMoveTo, k - 1, l + 2, 0, 0, moveTable)
	pushAid(hitSummm, canMoveTo, k - 1, l - 2, 0, 0, moveTable)

	pushAid(hitSummm, canMoveTo, k + 2, l + 1, 0, 0, moveTable)
	pushAid(hitSummm, canMoveTo, k + 2, l - 1, 0, 0, moveTable)
	pushAid(hitSummm, canMoveTo, k - 2, l + 1, 0, 0, moveTable)
	pushAid(hitSummm, canMoveTo, k - 2, l - 1, 0, 0, moveTable)

	if(isWhite) {
		var c = 1
		var nc = 2
	} else {
		var c = 2
		var nc = 1
	}

	pushAid(hitSummm, canMoveTo, k + 1, l + 2, 0, c, moveTable, true, 3)
	pushAid(hitSummm, canMoveTo, k + 1, l - 2, 0, c, moveTable, true, 3)
	pushAid(hitSummm, canMoveTo, k - 1, l + 2, 0, c, moveTable, true, 3)
	pushAid(hitSummm, canMoveTo, k - 1, l - 2, 0, c, moveTable, true, 3)

	pushAid(hitSummm, canMoveTo, k + 2, l + 1, 0, c, moveTable, true, 3)
	pushAid(hitSummm, canMoveTo, k + 2, l - 1, 0, c, moveTable, true, 3)
	pushAid(hitSummm, canMoveTo, k - 2, l + 1, 0, c, moveTable, true, 3)
	pushAid(hitSummm, canMoveTo, k - 2, l - 1, 0, c, moveTable, true, 3)

	return canMoveTo

}

function moveArrayToStrings(moveArray, ftable, fwNext) {
	var strArray = []
	moveArray.forEach(function(thisMove) {
		strArray.push(dletters[thisMove[0]] + (thisMove[1] + 1) + dletters[thisMove[2]] + (1 + thisMove[3]))

	})

	return strArray

}

function getAllMoves(tableToMoveOn, whiteNext, hitItsOwn, allHitSum, removeCaptured) {
	var speedy=true
	if(removeCaptured)speedy=false
	
	var tableData = findMyPieces(tableToMoveOn, whiteNext)[1]
	var thisArray = []
		//thisStrArray = []

	if(hitItsOwn) {
		whiteNext = !whiteNext
	}
	//var allHitSum=0
	var hitSumPart = []
	hitSumPart[0] = 0

	for(var pieceNo = 0; pieceNo < tableData.length; pieceNo++) {

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

function sortAiArray(a, b) {
	if(typeof(a[0]) == "boolean") {
		return -1			//put header on the top of array
	}
	if(a[1] > b[1]) {
		return -1
	} else {
		if(a[1] < b[1]) {
			return +1
		}
	}

	return 0
}

function moveIt(moveString, intable, dontProtect, hitValue) {
	if(hitValue==undefined)var hitValue=[0]
	var thistable = []

	for(var i = 0; i < 8; i++) {
		thistable[i] = new Array(8)
		for(var j = 0; j < 8; j++) {

			thistable[i][j] = intable[i][j].slice(0, 4)

		}
	}

	//itt indil sanc bastyatolas
	if(thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] == 9 && thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][3]) {

		switch(moveString.substring(2)) {
			case "c1":
				thistable = moveIt("a1d1", thistable)
				break;

			case "g1":
				thistable = moveIt("h1f1", thistable)
				break;

			case "c8":
				thistable = moveIt("a8d8", thistable)
				break;

			case "g8":
				thistable = moveIt("h8f8", thistable)
				break;

		}
	}
	//es itt a vege

	//itt indul en passant mark the pawn to be hit

	//unmark all first

	for(ij = 0; ij < 8; ij++) {

		thistable[ij][3][3] = false		//can only be in row 3 or 4

		thistable[ij][4][3] = false

	}

	if(thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] == 1 && ((moveString[1] == 2 && moveString[3] == 4) || (moveString[1] == 7 && moveString[3] == 5))) { //ha paraszt kettot lep

		thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][3] = true		//[3]true for enpass

	}
	//es itt a vege
	//indul en passt lepett
	var enPass = false
	if(thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] == 1 && //paraszt
		thistable[dletters.indexOf(moveString[2])][moveString[3] - 1][0] == 0 && //uresre
		!(moveString[0] == moveString[2])) { //keresztbe
		enPass = true
		thistable[dletters.indexOf(moveString[2])][moveString[3] - 1] = thistable[dletters.indexOf(moveString[2])][moveString[1] - 1]

		thistable[dletters.indexOf(moveString[2])][moveString[1] - 1] = [0, 0, false, false, false] //ures

	}

	if(thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] == 1 && ( //ha paraszt es

			(thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][0] == 2 && //es feher
				moveString[3] == 8) || //es 8asra lep vagy
			(thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][0] == 1 && //vagy fekete
				moveString[3] == 1)) //1re
	) {
		//AKKOR
		thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] = 5 //kiralyno lett

	}

	// if(enPass) {
	// 	hitValue = 0.99
	// } else {
	hitValue[0] = thistable[dletters.indexOf(moveString[2])][moveString[3] - 1][1] //normal hivalue
			//- thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] / 100 //whathits
	//}
	thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][2]++		//times moved
	
	thistable[dletters.indexOf(moveString[2])][moveString[3] - 1] =
		thistable[dletters.indexOf(moveString[0])][moveString[1] - 1]
	thistable[dletters.indexOf(moveString[0])][moveString[1] - 1] = [0, 0, 0] //, false, false, false]
	if(!(thistable[dletters.indexOf(moveString[2])][moveString[3] - 1][1] == 1)) {
		thistable[dletters.indexOf(moveString[2])][moveString[3] - 1][3] = false
	}

	return thistable
}

function protectTable(table, myCol) {
	return protectPieces(table, myCol)-protectPieces(table, !myCol)

}

function getTableData(origTable, isWhite) { //, rtnSimpleValue) {
	
	var lSancVal=0
	var rSancVal=0
	
	var tableValue = 0

	var rtnMyHitSum = [0] //this pointer will be passed to canmove 
	var rtnHisHitSum = [0]

	var rtnMyBestHit = 0
	var rtnHisBestHit = 0

	var rtnHisMoveCount = 0
	
	var rtnPushHimBack=0

	var origColor = 1
	if(isWhite) origColor = 2
	
	
	
	if(isWhite&&origTable[4][0][3]){	//we play with white and have not moved the king yet
		
		var sancolhat=false
		
		if(origTable[0][0][3]){
			lSancVal+=3	//unmoved rook worth more than moved
			sancolhat=true
			
			if(origTable[3][0][0]==0)lSancVal+=1	//trying to empty between
			if(origTable[2][0][0]==0)lSancVal+=3
			if(origTable[1][0][0]==0)lSancVal+=1
			
			
			if(origTable[2][1][0]==2){//trying to keep my pieces  there to cover
				lSancVal+=1	
				if(origTable[2][1][1]==1)lSancVal+=4
			}
			if(origTable[1][1][0]==2){//trying to keep my pieces  there to cover
				lSancVal+=1	
				if(origTable[1][1][1]==1)lSancVal+=4
			}if(origTable[0][1][0]==2){//trying to keep my pieces  there to cover
				lSancVal+=1	
				if(origTable[0][1][1]==1)lSancVal+=4
			}
			
			
			
		}
			
		if(origTable[7][0][3]){
			sancolhat=true
			rSancVal+=3
			
			if(origTable[6][0][0]==0)rSancVal+=1
			if(origTable[5][0][0]==0)rSancVal+=3
			
			if(origTable[7][1][0]==2){//trying to keep my pieces  there to cover
				rSancVal+=1	
				if(origTable[7][1][1]==1)rSancVal+=4
			}
			if(origTable[6][1][0]==2){//trying to keep my pieces  there to cover
				rSancVal+=1	
				if(origTable[6][1][1]==1)rSancVal+=4
			}if(origTable[5][1][0]==2){//trying to keep my pieces  there to cover
				rSancVal+=1	
				if(origTable[5][1][1]==1)rSancVal+=4
			}
			
		}
			
		if(sancolhat){
			if(origTable[3][1][1]==1&&origTable[3][1][0]==2)lSancVal-=6	//try to move d2 or e2 first
			if(origTable[4][1][1]==1&&origTable[4][1][0]==2)rSancVal-=6
			
			if(origTable[2][0][1]==2&&origTable[2][0][0]==2)lSancVal-=6	//try to move out bishops
			if(origTable[5][0][1]==2&&origTable[5][0][0]==2)rSancVal-=6
		}
		
		
	}
	
	if(!isWhite&&origTable[4][7][3]){	//we play with black and have not moved the king yet
		var sancolhat=false
		
		if(origTable[0][7][3]){
			sancolhat=true
			lSancVal+=3	//unmoved rook worth more than moved
			
			if(origTable[3][7][0]==0)lSancVal+=1
			if(origTable[2][7][0]==0)lSancVal+=3
			if(origTable[1][7][0]==0)lSancVal+=1
			
			if(origTable[2][6][0]==1){//trying to keep my pieces  there to cover
				lSancVal+=1	
				if(origTable[2][6][1]==1)lSancVal+=4
			}
			if(origTable[1][6][0]==1){//trying to keep my pieces  there to cover
				lSancVal+=1	
				if(origTable[1][6][1]==1)lSancVal+=4
			}
			if(origTable[0][6][0]==1){//trying to keep my pieces  there to cover
				lSancVal+=1	
				if(origTable[0][6][1]==1)lSancVal+=4
			}
		}
			
		if(origTable[7][7][3]){
			sancolhat=true
			rSancVal+=3
			
			if(origTable[6][7][0]==0)rSancVal+=1
			if(origTable[5][7][0]==0)rSancVal+=3
			
			if(origTable[7][6][0]==1){//trying to keep my pieces  there to cover
				rSancVal+=1	
				if(origTable[7][6][1]==1)rSancVal+=4
			}
			if(origTable[6][6][0]==1){//trying to keep my pieces  there to cover
				rSancVal+=1	
				if(origTable[6][6][1]==1)rSancVal+=4
			}
			if(origTable[5][6][0]==1){//trying to keep my pieces  there to cover
				rSancVal+=1	
				if(origTable[5][6][1]==1)rSancVal+=4
			}
			
		}
		//	
		if(sancolhat){
			if(origTable[3][6][1]==1&&origTable[3][6][0]==1)lSancVal-=4
			if(origTable[4][6][1]==1&&origTable[4][6][0]==1)rSancVal-=4
			
			if(origTable[2][7][1]==2&&origTable[2][7][0]==1)lSancVal-=4
			if(origTable[5][7][1]==2&&origTable[5][7][0]==1)rSancVal-=4
			
			// if(){
				
			// }
		}
		
		
	}
	var myMostMoved=0
	
	
	var getToMiddle=0
	for(var lookI = 0; lookI < 8; lookI++) { //
		for(var lookJ = 0; lookJ < 8; lookJ++) { //look through the table

			if(origTable[lookI][lookJ][0] == origColor) { //ha sajat babum

				//rtnMyHitSum = [0]
				
				if((!(origTable[lookI][lookJ][1] == 1))&&lookI>1&&lookJ>1&&lookI<6&&lookJ<6){	//ha nem paraszt es kozepen van a babu
					getToMiddle++
				}

				canMove(lookI, lookJ, isWhite, origTable, true, true, rtnMyHitSum) //this can give back the moves, should use it
				if(origTable[lookI][lookJ][2]>myMostMoved)myMostMoved=origTable[lookI][lookJ][2]		//get the highest number any piece moved
				
				if(isWhite){
					rtnPushHimBack+=lookJ
				}else{
					rtnPushHimBack+=7-lookJ
				}
				//aiming for sum, so comment:
				//if(rtnMyHitSum[0] > rtnMyBestHit) rtnMyBestHit = rtnMyHitSum[0]

				tableValue += origTable[lookI][lookJ][1]

			} else {

				if(!(origTable[lookI][lookJ][0] == 0)) { //ha ellenfele

					//rtnHisHitSum = [0]
					if((!(origTable[lookI][lookJ][1] == 1))&&lookI>1&&lookJ>1&&lookI<6&&lookJ<6){	//ha nem paraszt es kozepen van a babu
						getToMiddle-=.1		//our pieces matter more, that is +1
					}
					//do i use this movecount anywhere?
					rtnHisMoveCount += (canMove(lookI, lookJ, !isWhite, origTable, true, true, rtnHisHitSum).length - 2) //   was /2 but 0 is the point
						//if(rtnHisHitSum[0] > rtnHisBestHit) rtnHisBestHit = rtnHisHitSum[0]
					if(!isWhite){
						rtnPushHimBack-=lookJ/10
					}else{
						rtnPushHimBack-=(7-lookJ)/10
					}
					//or this tblevalue:
					tableValue -= origTable[lookI][lookJ][1]

				}

			}
		}
	}

	return [tableValue, rtnMyHitSum[0], rtnHisHitSum[0],// rtnHisMoveCount, 
		lSancVal,rSancVal,getToMiddle,rtnPushHimBack,myMostMoved] //rtnData

}

function findMyPieces(origTable, isWhite) {

	var myTempPieces = []

	var origColor = 1
	if(isWhite) origColor = 2

	for(var lookI = 0; lookI < 8; lookI++) { //
		for(var lookJ = 0; lookJ < 8; lookJ++) { //look through the table

			if(origTable[lookI][lookJ][0] == origColor) { //ha sajat babum

				myTempPieces.push([lookI, lookJ, origTable[lookI][lookJ][1]]) //itt kene szamitott erteket is adni a babuknak 

			}

		}
	}

	return [0, myTempPieces] //, hisTempPieces, rtnMyHitSum[0], rtnHisHitSum[0], rtnMyMovesCount] //returnArray // elso elem az osszes babu ertekenek osszge, aztan babkuk

}

function canIMove(winTable,winColor){
	var winRetMoves = []
	//var winRetMoveCoords = []

	getAllMoves(winTable, winColor).forEach(function(thisMove) { //get all his moves in array of strings
		winRetMoves.push(dletters[thisMove[0]] + (thisMove[1] + 1) + dletters[thisMove[2]] + (1 + thisMove[3]))
		//winRetMoveCoords.push(thisMove)
//
	})
	//var origLen = winRetMoves.length
	//var removeCount = 0
	for(var i = winRetMoves.length - 1; i >= 0; i--) { //sakkba 
		if(captured(moveIt(winRetMoves[i], winTable), winColor)) { //sakkba lepne valaszkent	//moveit retmove ittis ottis
			// if(winTable[winRetMoveCoords[i][0]][winRetMoveCoords[i][1]][1]==9){
			// 	removeCount++			//fogja a kiraly koruli mezoket
			// }else{
			// 	removeCount+=3			//ollo ha sakkba lepne de nem kirallyal lepett
			// }
			winRetMoves.splice(i, 1)
			//winRetMoveCoords.splice(i, 1)
			
			// if(!(tempTable[winRetMoveCoords[i][0]][winRetMoveCoords[i][1]][1]==9)){
				
			// }
		}
	}
	if(winRetMoves.length>0){
		return true
	}else{
		return false
	}
}

function createState(table){
	// if(orTable){
		
	// }
	var stateToRemember=[]
					
					for(var i=0;i<8;i++){
						for(var j=0;j<8;j++){
							stateToRemember[8*i+j]=
								String.fromCharCode(65+table[i][j][0])+
								String.fromCharCode(65+table[i][j][1])
								if(table[i][j][5]){
								table[i][j][5].forEach(function(canmov){
									stateToRemember[8*i+j]=stateToRemember[8*i+j].concat(String.fromCharCode(85+canmov[0])+String.fromCharCode(75+canmov[1]))
								})
								}
								
						}	
					}
	return stateToRemember.join()
	
}

function countInArray(inValue,inArray){
	var occured = 0
	inArray.forEach(function(arrayItem){
		if(arrayItem==inValue)occured++	
	})	
	return occured
}

function createAiTable(cfTable, cfColor, skipScnd, allPast) {

	var allTempTables = [
		[true, 0, new Date().getTime()] //array heading:true,0,timeStarted for timeItTook
	]
	var doScnd = !skipScnd

	//getAllMoves should be able to work fast or full (sanc, en pass, stb)
	var cfMoves = []
	var cfMoveCoords = []

	getAllMoves(cfTable, cfColor,false,0,true).forEach(function(thisMove) { //get all my moves in array of strings
		cfMoves.push(dletters[thisMove[0]] + (thisMove[1] + 1) + dletters[thisMove[2]] + (1 + thisMove[3]))
		cfMoveCoords.push(thisMove)
	})

	// es akkor nem kell ez:
	// for(var i = cfMoves.length - 1; i >= 0; i--) { //sakkba nem lephetunk
	// 	if(captured(moveIt(cfMoves[i], cfTable), cfColor)) { //sakkba lepnenk
	// 		cfMoves.splice(i, 1)
	// 		cfMoveCoords.splice(i, 1)
	// 	}
	// }

	//sakkbol sancolas, sakkon atugras is kene ide (new getallmoves  will help) //mindenkepp kell, vagy leleptetnek

	//
	var origProtect=protectTable(cfTable,cfColor)

	var origData = getTableData(cfTable, cfColor) //trick getTableScore(cfTable, !cfColor)

	var origTableValue = origData[0]
	var origMyHitValue = origData[1]
	var origHisHitValue = origData[2]
	var origlSanc = origData[3]
	var origrSanc = origData[4]
	var origGetToMiddle=origData[5]
	var origPushHimBack=origData[6]
	var origMostMoved=origData[7]
	
	var fHitValue=[0]

	
	var hisBestRtnMove
		
	cfMoves.forEach(function(stepMove, moveIndex) {
		
		var smallValScore=(10-cfTable[cfMoveCoords[moveIndex][0]][cfMoveCoords[moveIndex][1]][1])/1000

		//vonjuk ki ha vedett
		// if (cfTable[cfMoveCoords[moveIndex][2]][cfMoveCoords[moveIndex][3]][6]){			//ha vedett 
		// 	fHitValue-=cfTable[cfMoveCoords[moveIndex][0]][cfMoveCoords[moveIndex][1]][1]/10000	//kivonja amivel lep
		// }
		
		var fwdVal = 0
		if(!cfColor&&cfTable[cfMoveCoords[moveIndex][0]][cfMoveCoords[moveIndex][1]][1]==1) {	//ha fekete parejt tol
			fwdVal=(7-stepMove[1])*0.01			
		}
		if(cfColor&&cfTable[cfMoveCoords[moveIndex][0]][cfMoveCoords[moveIndex][1]][1]==1) {	//ha feher parejt tol
			fwdVal=(stepMove[1]-2)*0.01			
		}
		
		//fHitValue = cfTable[cfMoveCoords[moveIndex][2]][cfMoveCoords[moveIndex][3]][1] //leutott babu erteke, vagy 0
		
		var tempTable = moveIt(stepMove, cfTable, true, fHitValue) //, false, hitValue)
		protectTable(tempTable)
		
		
		var loopValue = 0 //=(fHitValue-retHitValue)*10
		////
		//indul a noloop
		
		tempTable= addMovesToTable(tempTable,!cfColor)
		
		var thisTState= createState(tempTable)
		var counted=countInArray(thisTState ,allPast)
		if(counted >1){
			//3szorra lepnenk ugyanabba a statuszba
			//ideiglenesen ne
			console.log ('i could 3fold '+counted)
			loopValue-=1000
		}else{
			console.log (counted)
			console.log(thisTState)
		}
						




		
		////
		
		var cfRetMoves = []
		var cfRetMoveCoords = []
		//ide is full getallmoves kene, de vhogy tudnunk kell hany lepest szedett le sakk miatt, es azt is ebbol hanyszor lep a kirallyal..
		getAllMoves(tempTable, !cfColor).forEach(function(thisMove) { //get all his moves in array of strings
			cfRetMoves.push(dletters[thisMove[0]] + (thisMove[1] + 1) + dletters[thisMove[2]] + (1 + thisMove[3]))
			cfRetMoveCoords.push(thisMove)

		})
		var origLen = cfRetMoves.length
		var removeCount = 0
		for(var i = cfRetMoves.length - 1; i >= 0; i--) { //sakkba nem lephet o sem
			if(captured(moveIt(cfRetMoves[i], tempTable), !cfColor)) { //sakkba lepne valaszkent	//moveit retmove ittis ottis
				if(tempTable[cfRetMoveCoords[i][0]][cfRetMoveCoords[i][1]][1]==9){
					removeCount++			//fogja a kiraly koruli mezoket
				}else{
					removeCount+=3			//ollo ha sakkba lepne de nem kirallyal lepett
				}
				cfRetMoves.splice(i, 1)
				cfRetMoveCoords.splice(i, 1)
				
				// if(!(tempTable[cfRetMoveCoords[i][0]][cfRetMoveCoords[i][1]][1]==9)){
					
				// }
			}
		}
		var captureScore = 0
		if(origLen == 0) { //not do devide by zero also mark won?
			//pattot adne?
		} else {
			captureScore = parseInt(removeCount * 100 / origLen) / 10000
		}

		var retTable = []
		
		var hhit = 0 //(origHisHitValue-rtnHisHitValue)
		var mhit = 0 //(rtnMyHitValue-origMyHitValue)*10
		var dontGetHit=0
		var lsancValue=0
		var rsancValue=0
		var sancValue=0
		var getToMiddle=0
		var pushHimBack=0
		var mostMoved=0
		

		var rtnValue=0 //=loopValue+mhit+hhit

		if(cfRetMoves.length == 0) {

			if(captured(tempTable, !cfColor)) {
				loopValue += 10000 //ott a matt
			} else {

				//pattot adna
				loopValue -= 10000//ideiglenesen ne adjunk pattot sosem!!
			}

			//retTable = cfTable //vmit vissza kell azert adni..., legyen az eredeti         
			retProtect = origProtect
			retData = origData
			retTable = cfTable
			hisBestRtnMove = "stuck."
			var retHitValue = [0]

		} else {

			//lesz valaszlepese

			var retData = []
			var tempRetValue = -9999990
			var retHitValue //= //[0]
			var retProtect=0
			

			cfRetMoves.forEach(function(stepRetMove, retMoveIndex) {
				
				var tretHitValue = [0]//tempTable[cfRetMoveCoords[retMoveIndex][2]][cfRetMoveCoords[retMoveIndex][3]][1] 
				var eztVondKi=0
				
						
				//kesobb vonjuk ki ha vedett
				if (tempTable[cfRetMoveCoords[retMoveIndex][2]][cfRetMoveCoords[retMoveIndex][3]][6]){			//ha vedett 
					eztVondKi=tempTable[cfRetMoveCoords[retMoveIndex][0]][cfRetMoveCoords[retMoveIndex][1]][1] 	//kivonja amivel lep
				}
				
				//how abot en pass????//kivonni kesobb a leutott babu erteke, vagy 0

				var tempRetTable = moveIt(stepRetMove, tempTable, true ,tretHitValue) //, false, hitValue)
				
				////
				//indul a noloop
				
				tempRetTable= addMovesToTable(tempRetTable,cfColor)
				
				if(countInArray(createState(tempRetTable) ,allPast) >1){
					//3szorra lephetne ugyanabba a statuszba
					//ideiglenesen ne
					loopValue-=1000
					console.log('he could 3fold')
				}
								
		
		
		
		
				
				////
			
				
				
				
				//vonjuk ki ha vedett
				if(eztVondKi>0){
					tretHitValue[0]-=eztVondKi
					
				}
				var tretProtect= (protectTable(tempRetTable, cfColor) - origProtect)/1000 //majd kesobb
				
				if(captured(tempRetTable,cfColor)){
					dontGetHit-=.001
					//var myTempMoves=getAllMoves(tempRetTable,cfColor,false,0)
					if(!canIMove(tempRetTable,cfColor)){
						dontGetHit=-10000					//ha mattot tudna adni erre a lepesre, akkor meg ne lepjuk!
					}
				}
				
				var tempRetData = getTableData(tempRetTable, cfColor)

				//var tretTableValue = tempRetData[0] //tablevalue-t nem is kene szamolni, megvan a retHitValue		//talan az sem kell
				var tretMyHitValue = tempRetData[1]
				var tretHisHitValue = tempRetData[2]
				// var tretlSanc = tempRetData[3]
				// var tretrSanc = tempRetData[4]
				

				if((tretHitValue[0]) * 10 - tretMyHitValue * 10 + tretHisHitValue > tempRetValue) {

					tempRetValue = (tretHitValue[0]) * 10 - tretMyHitValue * 10 + tretHisHitValue 
					
					retProtect = tretProtect
					retData = tempRetData
					retTable = tempRetTable
					hisBestRtnMove = stepRetMove
					retHitValue = tretHitValue
					//retTableValue=tempRetTable
				}else{
					if((fHitValue[0]-tretHitValue[0]) * 10 - tretMyHitValue * 10 + tretHisHitValue == tempRetValue){
						hisBestRtnMove = hisBestRtnMove+'.'//+stepRetMove//"many"
					}
				}

			})

			var rtnTableValue = retData[0]
			var rtnMyHitValue = retData[1]
			var rtnHisHitValue = retData[2]
			var rtnlSanc= retData[3]
			var rtnrSanc= retData[4]
			var rtnGetToMiddle=retData[5]
			var rtnPushHimBack=retData[6]
			var rtnMostMoved=retData[7]
			
			

			loopValue += (fHitValue[0]-retHitValue[0])*10 			//(rtnTableValue - origTableValue) * 10
			hhit = (origHisHitValue - rtnHisHitValue)
			mhit = (rtnMyHitValue - origMyHitValue) * 10
			lsancValue=(rtnlSanc- origlSanc)/100
			rsancValue=(rtnrSanc- origrSanc)/100
			getToMiddle=(rtnGetToMiddle-origGetToMiddle)/1000
			pushHimBack=(rtnPushHimBack-origPushHimBack)/1000		//this could be somevhere between 100&1000
			
			mostMoved=(origMostMoved-rtnMostMoved)/2			//temp high, we should lover this as the game goes on //will be -.5 or 0 always
			if(mostMoved>0)mostMoved=0		//it is positive when our most moved piece goes off
			
					//rtnPushHimBack-
			

			//rtnValue = loopValue + mhit + hhit + retProtect//my hit matters most as i'm next
			
			if(cfColor){
				if((stepMove=='e1g1'&&cfTable[5][1][0]==2&&cfTable[6][1][0]==2&&cfTable[7][1][0]==2)	//vegig covered
					||
					(stepMove=='e1c1'&&cfTable[0][1][0]==2&&cfTable[1][1][0]==2&&cfTable[2][1][0]==2))sancValue+=.35	//sancoljon ha jol esik
				
			}else{
				if((stepMove=='e8g8'&&cfTable[5][6][0]==1&&cfTable[6][6][0]==1&&cfTable[7][6][0]==1)
					||
					(stepMove=='e8c8'&&cfTable[0][6][0]==1&&cfTable[1][6][0]==1&&cfTable[2][6][0]==1))sancValue+=.35	//sancoljon ha jol esik
				
			}
				
		}

		//rtnValue += fwdVal

		//	

		var tTable2Value = 0

		if(doScnd) {
			//
			
			var cf2Moves = []
			var cf2MoveCoords = []
		
			getAllMoves(retTable, cfColor).forEach(function(thisMove) { //get all my moves in array of strings
				cf2Moves.push(dletters[thisMove[0]] + (thisMove[1] + 1) + dletters[thisMove[2]] + (1 + thisMove[3]))
				cf2MoveCoords.push(thisMove)
			})
		
			// es akkor nem kell ez:
			for(var i = cf2Moves.length - 1; i >= 0; i--) { //sakkba nem lephetunk			
				if(captured(moveIt(cf2Moves[i], retTable), cfColor)) { //sakkba lepnenk					<---  merge this
					cf2Moves.splice(i, 1)
					cf2MoveCoords.splice(i, 1)					//ez is lehetne count:ranking, minus!!
					tTable2Value-=0.0001
				}
			}
			
			//check there's a win:
			var potentMoves=[]	//will make an array of potential winning moves
			var potentTables=[]	//and resulting tables
														//							
			for(var i = cf2Moves.length - 1; i >= 0; i--) {	
				
				var potentTable=moveIt(cf2Moves[i], retTable)
				
				if(captured(potentTable, !cfColor)) { 				//az lehet potent, ahol sakkot adok
					
					//make a ranker here
																			//							<---	with this
			
					tTable2Value+=0.00001			//ket lepesben sakkot ad(hat)ok
					potentMoves.push(cf2Moves[i])
					potentTables.push(potentTable)
					//cfMoveCoords.splice(i, 1)					//ez is lehetne count:ranking
				}
			}
			
			
			//check if capturing moves are winners:
			
			var twoStepWinners=[]
			
			potentMoves.forEach(function(potentMove,potentMoveCount){
				var potentTable=potentTables[potentMoveCount]			//potent tablan mindenkepp sakkban all remember
				////
				
				var ret2potMoves = []
				//var ret2potMoveCoords = []
		
				getAllMoves(potentTable, !cfColor).forEach(function(thisMove) { //get all his moves in array of strings
					ret2potMoves.push(dletters[thisMove[0]] + (thisMove[1] + 1) + dletters[thisMove[2]] + (1 + thisMove[3]))
					//ret2potMoveCoords.push(thisMove)
		
				})
				//var origLen = ret2potMoves.length
				//var removeCount = 0
				for(var i = ret2potMoves.length - 1; i >= 0; i--) { //sakkba nem lephet o sem
					if(captured(moveIt(ret2potMoves[i], potentTable), !cfColor)) { //sakkba lepne valaszkent	//moveit retmove ittis ottis
						ret2potMoves.splice(i, 1)
						//ret2potMoveCoords.splice(i, 1)
						//removeCount++
						tTable2Value+=0.000001			//sakkba lephetne
						
					}
				}
				//
				if (ret2potMoves.length==0){
					//mattot tudok adni a legjobbnak tuno lepesere
					console.log('2 lepesbol mattolhatok')
					if(tTable2Value<5)tTable2Value+=5
					
						//meg kene nezni ki tud-e lepni belole
						
						
					tTable2Value+=0.00001			//sakkba lephetne
				}
				
				////
			})
			
			///

		}
		// lsancValue*=10
		// rsancValue*=10
		
		var pushThisValue = tTable2Value + loopValue + captureScore + //fHitValue +
							smallValScore+dontGetHit+
							retProtect+mhit+hhit+fwdVal+lsancValue+rsancValue+sancValue+getToMiddle+pushHimBack+mostMoved

		allTempTables.push([stepMove, pushThisValue, hisBestRtnMove, loopValue, captureScore, smallValScore,
			 				dontGetHit,tTable2Value, retProtect, mhit, hhit, fwdVal,lsancValue,rsancValue,
							 sancValue,getToMiddle,pushHimBack,mostMoved])

	})

	allTempTables = allTempTables.sort(sortAiArray)

	allTempTables[0][2] = (new Date().getTime() - allTempTables[0][2]) //1st row has timeItTook

	return allTempTables
}

function ai(tablE, wn, allPast) {

	return createAiTable(tablE, wn, false, allPast)

}

function helpMe(wp) {
	console.log('MOVE SCORE    first    second')
	ai(table, wp).forEach(function(thisline) {
		console.log(thisline[0] + ' ' + thisline[1] + '  =  ' + thisline[2] + '  +  ' + thisline[3])
	})
}