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
			protectedSum+=9-originalTable[thisMoveCoords[2]][thisMoveCoords[3]][1]
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

function canMove(k, l, isWhite, moveTable, speedy, dontProt, hitSumm) {

	var what = moveTable[k][l][1]
	var possibleMoves = []
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

	hitSumm -= moveTable[k][l][1] / 100 //amit ut-amivel uti/10

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

		if(!(hitSummmm == undefined)) {
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

function getAllMoves(tableToMoveOn, whiteNext, hitItsOwn, allHitSum) {

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

		canMove(tableData[pieceNo][0], tableData[pieceNo][1], whiteNext, tableToMoveOn, true, true, hitSumPart) //true,true for speedy(sakkba is lep),dontProtect
			.forEach(function(stepItem) {
				thisArray.push([tableData[pieceNo][0], tableData[pieceNo][1], stepItem[0], stepItem[1]])
			})
		allHitSum += hitSumPart[0]
	}

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

	if(enPass) {
		hitValue = 0.99
	} else {
		hitValue = thistable[dletters.indexOf(moveString[2])][moveString[3] - 1][1] //normal hivalue
			- thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] / 100 //whathits
	}
	thistable[dletters.indexOf(moveString[2])][moveString[3] - 1] =
		thistable[dletters.indexOf(moveString[0])][moveString[1] - 1]
	thistable[dletters.indexOf(moveString[0])][moveString[1] - 1] = [0, 0] //, false, false, false]
	if(!(thistable[dletters.indexOf(moveString[2])][moveString[3] - 1][1] == 1)) {
		thistable[dletters.indexOf(moveString[2])][moveString[3] - 1][3] = false
	}

	return thistable
}

function protectTable(table, myCol) {
	return protectPieces(table, myCol)-protectPieces(table, !myCol)

}

function getTableData(origTable, isWhite) { //, rtnSimpleValue) {

	var tableValue = 0

	var rtnMyHitSum = [0] //this pointer will be passed to canmove 
	var rtnHisHitSum = [0]

	var rtnMyBestHit = 0
	var rtnHisBestHit = 0

	var rtnHisMoveCount = 0

	var origColor = 1
	if(isWhite) origColor = 2
	
	if(isWhite&&origTable[4][0][3]){	//we play with white and have not moved the king yet
		if(origTable[0][0][3]){
			tableValue+=.02	//unmoved rook worth more than moved
			
			if(origTable[3][0][3])tableValue-=.01
			if(origTable[2][0][3])tableValue-=.01
			if(origTable[1][0][3])tableValue-=.01
		}
			
		if(origTable[7][0][3]){
			tableValue+=.02
			
			if(origTable[6][0][3])tableValue-=.01
			if(origTable[5][0][3])tableValue-=.01
			
		}
			
		
		
		
	}
	
	if(!isWhite&&origTable[4][7][3]){	//we play with black and have not moved the king yet
		if(origTable[0][7][3]){
			tableValue+=.02	//unmoved rook worth more than moved
			
			if(origTable[3][7][3])tableValue-=.01
			if(origTable[2][7][3])tableValue-=.01
			if(origTable[1][7][3])tableValue-=.01
		}
			
		if(origTable[7][7][3]){
			tableValue+=.02
			
			if(origTable[6][7][3])tableValue-=.01
			if(origTable[5][7][3])tableValue-=.01
			
		}
			
		
		
		
	}
	for(var lookI = 0; lookI < 8; lookI++) { //
		for(var lookJ = 0; lookJ < 8; lookJ++) { //look through the table

			if(origTable[lookI][lookJ][0] == origColor) { //ha sajat babum

				//rtnMyHitSum = [0]

				canMove(lookI, lookJ, isWhite, origTable, true, true, rtnMyHitSum) //this can give back the moves, should use it

				//aiming for sum, so comment:
				//if(rtnMyHitSum[0] > rtnMyBestHit) rtnMyBestHit = rtnMyHitSum[0]

				tableValue += origTable[lookI][lookJ][1]

			} else {

				if(!(origTable[lookI][lookJ][0] == 0)) { //ha ellenfele

					//rtnHisHitSum = [0]

					//do i use this movecount anywhere?
					rtnHisMoveCount += (canMove(lookI, lookJ, !isWhite, origTable, true, true, rtnHisHitSum).length - 2) //   was /2 but 0 is the point
						//if(rtnHisHitSum[0] > rtnHisBestHit) rtnHisBestHit = rtnHisHitSum[0]

					//or this tblevalue:
					tableValue -= origTable[lookI][lookJ][1]

				}

			}
		}
	}

	return [tableValue, rtnMyHitSum[0], rtnHisHitSum[0], rtnHisMoveCount] //rtnData

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

function createAiTable(cfTable, cfColor, skipScnd) {

	var allTempTables = [
		[true, 0, new Date().getTime()] //array heading:true,0,timeStarted for timeItTook
	]
	var doScnd = !skipScnd

	//getAllMoves should be able to work fast or full (sanc, en pass, stb)
	var cfMoves = []
	var cfMoveCoords = []

	getAllMoves(cfTable, cfColor).forEach(function(thisMove) { //get all my moves in array of strings
		cfMoves.push(dletters[thisMove[0]] + (thisMove[1] + 1) + dletters[thisMove[2]] + (1 + thisMove[3]))
		cfMoveCoords.push(thisMove)
	})

	// es akkor nem kell ez:
	for(var i = cfMoves.length - 1; i >= 0; i--) { //sakkba nem lephetunk
		if(captured(moveIt(cfMoves[i], cfTable), cfColor)) { //sakkba lepnenk
			cfMoves.splice(i, 1)
			cfMoveCoords.splice(i, 1)
		}
	}

	//sakkbol sancolas, sakkon atugras is kene ide (new getallmoves  will help) //mindenkepp kell, vagy leleptetnek

	//
	var origProtect=protectTable(cfTable,cfColor)

	var origData = getTableData(cfTable, cfColor) //trick getTableScore(cfTable, !cfColor)

	var origTableValue = origData[0]
	var origMyHitValue = origData[1]
	var origHisHitValue = origData[2]

	
	var hisBestRtnMove
		
	cfMoves.forEach(function(stepMove, moveIndex) {

		var fHitValue = cfTable[cfMoveCoords[moveIndex][2]][cfMoveCoords[moveIndex][3]][1] //leutott babu erteke, vagy 0
		
		var fwdVal = 0
		if(!cfColor&&cfTable[cfMoveCoords[moveIndex][0]][cfMoveCoords[moveIndex][1]][1]==1) {	//ha fekete parejt tol
			fwdVal=(9-stepMove[3])*0.001			
		}
		if(cfColor&&cfTable[cfMoveCoords[moveIndex][0]][cfMoveCoords[moveIndex][1]][1]==1) {	//ha feher parejt tol
			fwdVal=(stepMove[3])*0.001			
		}
		var tempTable = moveIt(stepMove, cfTable) //, false, hitValue)
		protectTable(tempTable)

		

		var cfRetMoves = []
		var cfRetMoveCoords = []

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
		var loopValue = 0 //=(fHitValue-retHitValue)*10
		var hhit = 0 //(origHisHitValue-rtnHisHitValue)
		var mhit = 0 //(rtnMyHitValue-origMyHitValue)*10

		var rtnValue=0 //=loopValue+mhit+hhit

		if(cfRetMoves.length == 0) {

			if(captured(tempTable, !cfColor)) {
				rtnValue = 10000 //ott a matt
			} else {

				//pattot adna
				rtnValue= - 10000//ideiglenesen ne adjunk pattot sosem!!
			}

			retTable = cfTable //vmit vissza kell azert adni..., legyen az eredeti         <----- figyelj, who's next??  
		} else {

			//lesz valaszlepese

			var retData = []
			var tempRetValue = -9999990
			var retHitValue = 0
			var retProtect=0
			

			cfRetMoves.forEach(function(stepRetMove, retMoveIndex) {

				var tretHitValue = tempTable[cfRetMoveCoords[retMoveIndex][2]][cfRetMoveCoords[retMoveIndex][3]][1] //kivonni kesobb a leutott babu erteke, vagy 0

				var tempRetTable = moveIt(stepRetMove, tempTable) //, false, hitValue)
				
				var tretProtect= (protectTable(tempRetTable, cfColor) - origProtect)/10000 //majd kesobb

				var tempRetData = getTableData(tempRetTable, cfColor)

				var tretTableValue = tempRetData[0] //tablevalue-t nem is kene szamolni, megvan a retHitValue		//talan az sem kell
				var tretMyHitValue = tempRetData[1]
				var tretHisHitValue = tempRetData[2]

				if((origTableValue-tretTableValue) * 10 - tretMyHitValue * 10 + tretHisHitValue > tempRetValue) {

					tempRetValue = (origTableValue-tretTableValue) * 10 - tretMyHitValue * 10 + tretHisHitValue 
					
					retProtect = tretProtect
					retData = tempRetData
					retTable = tempRetTable
					hisBestRtnMove = stepRetMove
					retHitValue = tretHitValue
					//retTableValue=tempRetTable
				}

			})

			var rtnTableValue = retData[0]
			var rtnMyHitValue = retData[1]
			var rtnHisHitValue = retData[2]

			loopValue = (rtnTableValue - origTableValue) * 10
			hhit = (origHisHitValue - rtnHisHitValue)
			mhit = (rtnMyHitValue - origMyHitValue) * 10

			rtnValue = loopValue + mhit + hhit + retProtect//my hit matters most as i'm next
			if(cfColor){
				if(stepMove=='e1g1'||stepMove=='e1c1')rtnValue+=.1	//sancoljon ha tud
				
			}else{
				if(stepMove=='e8g8'||stepMove=='e8c8')rtnValue+=.1
			}
				
		}

		rtnValue += fwdVal

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
			
			// itt meg kene nezni, ha az osszes valasza vesztes, vagy csak a legjobbnak latszo
			
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
				
				if (ret2potMoves.length==0){
					//mattot tudok adni a legjobbnak tuno lepesere
					console.log('2 lepesbol mattolhatok')
					if(tTable2Value<.5)tTable2Value+=0.5	
					tTable2Value+=0.00001			//sakkba lephetne
				}
				
				////
			})
			
			//

		}
		var pushThisValue = tTable2Value + rtnValue + captureScore + fHitValue

		allTempTables.push([stepMove, pushThisValue, hisBestRtnMove, rtnValue, captureScore, tTable2Value])

	})

	allTempTables = allTempTables.sort(sortAiArray)

	allTempTables[0][2] = (new Date().getTime() - allTempTables[0][2]) //1st row has timeItTook

	return allTempTables
}

function ai(tablE, wn) {

	return createAiTable(tablE, wn)

}

function helpMe(wp) {
	console.log('MOVE SCORE    first    second')
	ai(table, wp).forEach(function(thisline) {
		console.log(thisline[0] + ' ' + thisline[1] + '  =  ' + thisline[2] + '  +  ' + thisline[3])
	})
}