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

function dbAi(dbTable) {

	var retMove = newAi(dbTable)

	var moveStr = ""
	if (retMove.length > 1) moveStr = retMove[1].move


	dbTable = moveInTable(moveStr, dbTable)


	return dbTable




}
//
function moveInTable(moveStr, dbTable, isLearner) {

	var toPush = getPushString(dbTable.table, moveStr) //piece

	+new String(new Date()
		.getTime())

	// if(!(toPush==$rootScope.moves[$rootScope.moves.length-1])){


	dbTable.moves.push(toPush)

	dbTable.table = moveIt(moveStr, dbTable.table) //	<----moves it

	//$rootScope.showTable($rootScope.table)

	dbTable.wNext = !dbTable.wNext

	dbTable.pollNum++

		//$rootScope.moved = new Date().getTime()

		dbTable.table = addMovesToTable(dbTable.table, dbTable.wNext) //true stands for pawn and king only: allpasttables only

	//remember this state for 3fold rule
	var sendThis = createState(dbTable.table)


	dbTable.allPastTables.push(sendThis)

	//$rootScope.whatToDo = 'idle'

	//$rootScope.sendMessage('move '+moveStr+' processed.')

	/////////////////////////


	//})
	if (!isLearner) evalGame(dbTable) //true should tell it was learnergame, not yet



	return dbTable



}

function getSimpleTableState(itable) {
	var tempString = ""

	for (var j = 0; j < 8; j++) {
		for (var i = 0; i < 8; i++) {

			switch (itable[i][j][1]) {
				case 0:
					//var letterToPush="s"
					if (isNaN(tempString[tempString.length - 1])) {
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

			if (itable[i][j][0] == 2) { //if white
				letterToPush = letterToPush.toUpperCase()

			}

			tempString = tempString.concat(letterToPush)

		}
		tempString = tempString.concat('/')
	}
	return tempString
}

function moveDbTable(moveStr, dbTable) {

	var toPush = getPushString(dbTable.table, moveStr) //piece

	+new String(new Date()
		.getTime())

	// if(!(toPush==$rootScope.moves[$rootScope.moves.length-1])){


	dbTable.moves.push(toPush)

	dbTable.table = moveIt(moveStr, dbTable.table) //	<----moves it

	//$rootScope.showTable($rootScope.table)

	dbTable.wNext = !dbTable.wNext

	dbTable.pollNum++

		//$rootScope.moved = new Date().getTime()

		dbTable.table = addMovesToTable(dbTable.table, dbTable.wNext) //true stands for pawn and king only: allpasttables only

	//remember this state for 3fold rule
	var sendThis = createState(dbTable.table)


	dbTable.allPastTables.push(sendThis)


}

function protectPieces(originalTable, whitePlayer) {

	//var flippedMoves=
	var myCol = 1;
	if (whitePlayer) myCol = 2 //myCol is 2 when white
	var protectedSum = 0
	getAllMoves(originalTable, whitePlayer, true)
		. //moves include to hit my own 
		//true stands for letMeHitMyOwn

	forEach(function(thisMoveCoords) {
		//we'll use the 2nd part of the moves [2][3]
		if (originalTable[thisMoveCoords[2]][thisMoveCoords[3]][0] == myCol) { //if i have sg there
			originalTable[thisMoveCoords[2]][thisMoveCoords[3]][6] = true //that must be protected

			if (originalTable[thisMoveCoords[0]][thisMoveCoords[1]][1] == 9) {
				protectedSum += (9 - originalTable[thisMoveCoords[2]][thisMoveCoords[3]][1]) * 2 //king protects double


			} else {

				protectedSum += 9 - originalTable[thisMoveCoords[2]][thisMoveCoords[3]][1]
			}


		}
	})

	return protectedSum

}

function addMovesToTable(originalTable, whiteNext, dontClearInvalid, returnMoveStrings) {

	//rewrite this to use getTableData to find my pieces, don't copy the array just change the original

	var myCol = 1;
	if (whiteNext) myCol++ //myCol is 2 when white

		var tableWithMoves = new Array(8)
	for (var i = 0; i < 8; i++) {
		tableWithMoves[i] = new Array(8)
		for (var j = 0; j < 8; j++) {
			tableWithMoves[i][j] = originalTable[i][j].slice() //[]
				// originalTable[i][j].forEach(function(value, feCount) {
				//     tableWithMoves[i][j][feCount] = value

			// })
			if (originalTable[i][j][0] == myCol) {
				var returnMoveCoords = []
				tableWithMoves[i][j][5] = canMove(i, j, whiteNext, originalTable, undefined, undefined, undefined, dontClearInvalid, returnMoveStrings) //:  canMove(k, l, isWhite, moveTable, speedy, dontProt, hitSumm, dontRemoveInvalid) { //, speedy) {
			} else {
				tableWithMoves[i][j][5] == []
			}
		}
	}

	return tableWithMoves

}

function whereIsTheKing(table, wn) {

	var myCol = 1;
	if (wn) myCol++ //myCol is 2 when white

		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 8; j++) {
				if (table[i][j][1] == 9 && table[i][j][0] == myCol) {
					//itt a kiraly
					return [i, j]
				}
			}
		}

}


function captured(table, color) {

	var tempMoves = []


	var myCol = 1;

	if (color) myCol++ //myCol is 2 when white


		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 8; j++) {

				if (table[i][j][1] == 9 && table[i][j][0] == myCol) {
					//itt a kiraly

					tempMoves = bishopCanMove(i, j, color, table)

					for (var tempMoveCount = 0; tempMoveCount < tempMoves.length; tempMoveCount++) {
						if (table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] == 5 ||
							table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] == 2) {
							return true;
						}

					}

					tempMoves = rookCanMove(i, j, color, table)

					for (var tempMoveCount = 0; tempMoveCount < tempMoves.length; tempMoveCount++) {
						if (table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] == 5 ||
							table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] == 4) {
							return true;
						}

					}

					tempMoves = horseCanMove(i, j, color, table)

					for (var tempMoveCount = 0; tempMoveCount < tempMoves.length; tempMoveCount++) {
						if (table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] == 3) {
							return true;
						}

					}

					tempMoves = pawnCanMove(i, j, color, table)

					for (var tempMoveCount = 0; tempMoveCount < tempMoves.length; tempMoveCount++) {
						if (table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] == 1) {
							return true;
						}

					}

					tempMoves = kingCanMove(i, j, color, table)

					for (var tempMoveCount = 0; tempMoveCount < tempMoves.length; tempMoveCount++) {
						if (table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] == 9) {
							return true;
						}

					}

				}
			}
		}
	return false
}

function canMove(k, l, isWhite, moveTable, speedy, dontProt, hitSumm, dontRemoveInvalid, returnMoveStrings) { //, speedy) {

	if (typeof(hitSumm) == 'undefined') var hitSumm = [0]
		//var speedy = !speedy

	//too slow
	//if (speedy) speedy = true

	var what = moveTable[k][l][1]
	var possibleMoves = []
	var scndHitSum = [0]
	switch (what) {
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

	if (returnMoveStrings != undefined) { //and not undefined..
		possibleMoves.forEach(function(move) {
			returnMoveStrings.push(coordsToMoveString(k, l, move[0], move[1]))
		})

	}

	// if (speedy) {

	//     switch (what) {
	//         // case 0:

	//         case 1:

	//             possibleMoves.forEach(function(stepPossibleMove) {

	//                 pawnCanMove(stepPossibleMove[0], stepPossibleMove[1], isWhite, moveTable, scndHitSum)


	//             })
	//             break;
	//         case 2:
	//             possibleMoves.forEach(function(stepPossibleMove) {

	//                 bishopCanMove(stepPossibleMove[0], stepPossibleMove[1], isWhite, moveTable, scndHitSum)


	//             })
	//             break;
	//         case 3:
	//             possibleMoves.forEach(function(stepPossibleMove) {

	//                 horseCanMove(stepPossibleMove[0], stepPossibleMove[1], isWhite, moveTable, scndHitSum)


	//             })
	//             break;
	//         case 4:
	//             possibleMoves.forEach(function(stepPossibleMove) {

	//                 rookCanMove(stepPossibleMove[0], stepPossibleMove[1], isWhite, moveTable, scndHitSum)


	//             })
	//             break;
	//         case 5:
	//             possibleMoves.forEach(function(stepPossibleMove) {

	//                 queenCanMove(stepPossibleMove[0], stepPossibleMove[1], isWhite, moveTable, scndHitSum)


	//             })
	//             break;
	//         case 9:
	//             possibleMoves.forEach(function(stepPossibleMove) {

	//                 kingCanMove(stepPossibleMove[0], stepPossibleMove[1], isWhite, moveTable, scndHitSum)


	//             })
	//             break;

	//     }

	//     hitSumm[0] += scndHitSum[0] / 10000 //masodik lepes is szamit egy kicsit


	// }

	//hitSumm[0] -= moveTable[k][l][1] / 100 //amit ut-amivel uti

	if (!speedy) { //     lefut.
		for (var i = possibleMoves.length - 1; i >= 0; i--) { //sakkba nem lephetunk
			if (captured(moveIt(coordsToMoveString(k, l, possibleMoves[i][0], possibleMoves[i][1]), moveTable, dontProt), isWhite)) { //sakkba lepnenk
				possibleMoves.splice(i, 1)

			}
		}

		if (what == 9 && moveTable[k][l][3]) { //lesznek sanc lepesek is a possibleMoves tombben: kiraly nem mozdult meg

			if (captured(moveTable, isWhite)) { // de sakkban allunk
				for (var spliceCount = possibleMoves.length - 1; spliceCount >= 0; spliceCount--) {
					if (possibleMoves[spliceCount][1] == l && (possibleMoves[spliceCount][0] == k - 2 || possibleMoves[spliceCount][0] == k + 2)) {
						possibleMoves.splice(spliceCount, 1) //remove
					}
				}

			}

			// remove the sakkot atugrani sem er sanc

			var removeKmin2 = true //alapbol leszedne
			var removeKplus2 = true

			for (var i = possibleMoves.length - 1; i >= 0; i--) { //
				if (possibleMoves[i][1] == l && possibleMoves[i][0] == k - 1) removeKmin2 = false //de ha van koztes lepes, ne szedd le
				if (possibleMoves[i][1] == l && possibleMoves[i][0] == k + 1) removeKplus2 = false
			}

			for (var i = possibleMoves.length - 1; i >= 0; i--) { //itt szedi le a sanclepeseket
				if (possibleMoves[i][1] == l &&
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
	if (colr = 1) {
		return 2
	} else {
		return 1
	}
}

function whatsThere(i, j, aiTable) {
	//var pieceThere = []

	if (i > -1 && j > -1 && i < 8 && j < 8) {

		return aiTable[i][j] //.slice(0,4)
	}

	return []
}

function pushAid(hitSummmm, canMoveTo, x, y, hanyadik, milegyen, fromTable, someboolean, whatHits) {

	if (whatsThere(x, y, fromTable)[hanyadik] == milegyen) {

		canMoveTo.push([x, y, whatsThere(x, y, fromTable)[1]])

		//////////////////////////
		var thisHit = 0

		if (fromTable[x][y][6]) { //alert('protectedHit')	//ha protectedre lep
			thisHit = fromTable[x][y][1] - //thisHitbol kivonja amivel lep
				whatHits //* whatHitsConst
			if (thisHit < 0) {
				thisHit = 0
			} //negaive is 0
		} else {
			thisHit = fromTable[x][y][1] //normal hivalue

		}

		if (!(hitSummmm == undefined)) { //aiming for the best only? why?
			if (hitSummmm[0] < thisHit) hitSummmm[0] = thisHit
		}

		return true

	};
	return false
}

function pawnCanMove(k, l, isWhite, moveTable, hitSummm) {
	var canMoveTo = []
		//var hitIt=false
	if ((!isWhite && moveTable[k][l][0] == 1) || (isWhite && moveTable[k][l][0] == 2)) {
		var c = 2
		var nc = 1
	} else {
		var c = 1
		var nc = 2
	}
	//if(aiCalled){

	if (moveTable[k][l][0] == 2) {

		if (pushAid(hitSummm, canMoveTo, k, l + 1, 0, 0, moveTable) && l == 1) {
			pushAid(hitSummm, canMoveTo, k, l + 2, 0, 0, moveTable)
		}
		pushAid(hitSummm, canMoveTo, k - 1, l + 1, 0, nc, moveTable, isWhite, 1)
		pushAid(hitSummm, canMoveTo, k + 1, l + 1, 0, nc, moveTable, isWhite, 1)

		//en pass
		if (whatsThere(k - 1, l, moveTable)[3]) {

			pushAid(hitSummm, canMoveTo, k - 1, l + 1, 0, 0, moveTable, isWhite)

		}
		if (whatsThere(k + 1, l, moveTable)[3]) {

			pushAid(hitSummm, canMoveTo, k + 1, l + 1, 0, 0, moveTable, isWhite)

		}

	} else {

		if (pushAid(hitSummm, canMoveTo, k, l - 1, 0, 0, moveTable) && l == 6) {
			pushAid(hitSummm, canMoveTo, k, l - 2, 0, 0, moveTable)
		}
		pushAid(hitSummm, canMoveTo, k - 1, l - 1, 0, c, moveTable, !isWhite, 1)
		pushAid(hitSummm, canMoveTo, k + 1, l - 1, 0, c, moveTable, !isWhite, 1)

		//en pass
		if (whatsThere(k - 1, l, moveTable)[3]) {

			pushAid(hitSummm, canMoveTo, k - 1, l - 1, 0, 0, moveTable, !isWhite)

		}
		if (whatsThere(k + 1, l, moveTable)[3]) {

			pushAid(hitSummm, canMoveTo, k + 1, l - 1, 0, 0, moveTable, !isWhite)

		}

	}

	return canMoveTo

}

function rookCanMove(k, l, isWhite, moveTable, hitSummm) {
	var canMoveTo = []
		// if(aiCalled){

	if (isWhite) {
		var c = 1
		var nc = 2
	} else {
		var c = 2
		var nc = 1
	}

	var goFurther = [true, true, true, true]
	for (var moveCount = 1; moveCount < 8; moveCount++) {
		if (goFurther[0]) {
			pushAid(hitSummm, canMoveTo, k + moveCount, l, 0, 0, moveTable)
			if (pushAid(hitSummm, canMoveTo, k + moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k + moveCount, l, moveTable)[0] == nc) {
				goFurther[0] = false
			}
		}
		if (goFurther[1]) {
			pushAid(hitSummm, canMoveTo, k - moveCount, l, 0, 0, moveTable)
			if (pushAid(hitSummm, canMoveTo, k - moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k - moveCount, l, moveTable)[0] == nc) {
				goFurther[1] = false
			}
		}
		if (goFurther[2]) {
			pushAid(hitSummm, canMoveTo, k, l + moveCount, 0, 0, moveTable)
			if (pushAid(hitSummm, canMoveTo, k, l + moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l + moveCount, moveTable)[0] == nc) {
				goFurther[2] = false
			}
		}
		if (goFurther[3]) {
			pushAid(hitSummm, canMoveTo, k, l - moveCount, 0, 0, moveTable)
			if (pushAid(hitSummm, canMoveTo, k, l - moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l - moveCount, moveTable)[0] == nc) {
				goFurther[3] = false
			}
		}
	}
	return canMoveTo
}

function bishopCanMove(k, l, isWhite, moveTable, hitSummm) {
	var canMoveTo = []
		//if(aiCalled){

	if (isWhite) {
		var c = 1
		var nc = 2
	} else {
		var c = 2
		var nc = 1
	}

	var goFurther = [true, true, true, true]
	for (var moveCount = 1; moveCount < 8; moveCount++) {
		if (goFurther[0]) {
			pushAid(hitSummm, canMoveTo, k + moveCount, l + moveCount, 0, 0, moveTable)
			if (pushAid(hitSummm, canMoveTo, k + moveCount, l + moveCount, 0, c, moveTable, true, 2) || whatsThere(k + moveCount, l + moveCount, moveTable)[0] == nc) {
				goFurther[0] = false
			}
		}
		if (goFurther[1]) {
			pushAid(hitSummm, canMoveTo, k - moveCount, l + moveCount, 0, 0, moveTable)
			if (pushAid(hitSummm, canMoveTo, k - moveCount, l + moveCount, 0, c, moveTable, true, 2) || whatsThere(k - moveCount, l + moveCount, moveTable)[0] == nc) {
				goFurther[1] = false
			}
		}
		if (goFurther[2]) {
			pushAid(hitSummm, canMoveTo, k + moveCount, l - moveCount, 0, 0, moveTable)
			if (pushAid(hitSummm, canMoveTo, k + moveCount, l - moveCount, 0, c, moveTable, true, 2) || whatsThere(k + moveCount, l - moveCount, moveTable)[0] == nc) {
				goFurther[2] = false
			}
		}
		if (goFurther[3]) {
			pushAid(hitSummm, canMoveTo, k - moveCount, l - moveCount, 0, 0, moveTable)
			if (pushAid(hitSummm, canMoveTo, k - moveCount, l - moveCount, 0, c, moveTable, true, 2) || whatsThere(k - moveCount, l - moveCount, moveTable)[0] == nc) {
				goFurther[3] = false
			}
		}
	}
	return canMoveTo
}

function queenCanMove(k, l, isWhite, moveTable, hitSummm) {
	var canMoveTo = []

	if (isWhite) {
		var c = 1
		var nc = 2
	} else {
		var c = 2
		var nc = 1
	}

	var goFurther = [true, true, true, true, true, true, true, true]
	for (var moveCount = 1; moveCount < 8; moveCount++) {
		if (goFurther[0]) {
			pushAid(hitSummm, canMoveTo, k + moveCount, l + moveCount, 0, 0, moveTable)
			if (pushAid(hitSummm, canMoveTo, k + moveCount, l + moveCount, 0, c, moveTable, true, 5) || whatsThere(k + moveCount, l + moveCount, moveTable)[0] == nc) {
				goFurther[0] = false
			}
		}
		if (goFurther[1]) {
			pushAid(hitSummm, canMoveTo, k - moveCount, l + moveCount, 0, 0, moveTable)
			if (pushAid(hitSummm, canMoveTo, k - moveCount, l + moveCount, 0, c, moveTable, true, 5) || whatsThere(k - moveCount, l + moveCount, moveTable)[0] == nc) {
				goFurther[1] = false
			}
		}
		if (goFurther[2]) {
			pushAid(hitSummm, canMoveTo, k + moveCount, l - moveCount, 0, 0, moveTable)
			if (pushAid(hitSummm, canMoveTo, k + moveCount, l - moveCount, 0, c, moveTable, true, 5) || whatsThere(k + moveCount, l - moveCount, moveTable)[0] == nc) {
				goFurther[2] = false
			}
		}
		if (goFurther[3]) {
			pushAid(hitSummm, canMoveTo, k - moveCount, l - moveCount, 0, 0, moveTable)
			if (pushAid(hitSummm, canMoveTo, k - moveCount, l - moveCount, 0, c, moveTable, true, 5) || whatsThere(k - moveCount, l - moveCount, moveTable)[0] == nc) {
				goFurther[3] = false
			}
		}

		if (goFurther[4]) {
			pushAid(hitSummm, canMoveTo, k + moveCount, l, 0, 0, moveTable)
			if (pushAid(hitSummm, canMoveTo, k + moveCount, l, 0, c, moveTable, true, 5) || whatsThere(k + moveCount, l, moveTable)[0] == nc) {
				goFurther[4] = false
			}
		}
		if (goFurther[5]) {
			pushAid(hitSummm, canMoveTo, k - moveCount, l, 0, 0, moveTable)
			if (pushAid(hitSummm, canMoveTo, k - moveCount, l, 0, c, moveTable, true, 5) || whatsThere(k - moveCount, l, moveTable)[0] == nc) {
				goFurther[5] = false
			}
		}
		if (goFurther[6]) {
			pushAid(hitSummm, canMoveTo, k, l + moveCount, 0, 0, moveTable)
			if (pushAid(hitSummm, canMoveTo, k, l + moveCount, 0, c, moveTable, true, 5) || whatsThere(k, l + moveCount, moveTable)[0] == nc) {
				goFurther[6] = false
			}
		}
		if (goFurther[7]) {
			pushAid(hitSummm, canMoveTo, k, l - moveCount, 0, 0, moveTable)
			if (pushAid(hitSummm, canMoveTo, k, l - moveCount, 0, c, moveTable, true, 5) || whatsThere(k, l - moveCount, moveTable)[0] == nc) {
				goFurther[7] = false
			}
		}
	}
	return canMoveTo
}

function kingCanMove(k, l, isWhite, moveTable, hitSummm) {

	var canMoveTo = []

	if (isWhite) {
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
	if (moveTable[k][l][3]) { //if the king hasnt moved yet, 

		// ha nincs sakkban, nem is ugrik at sakkot, minden ures kozotte

		if (moveTable[0][l][3] && // unmoved rook on [0][l]
			whatsThere(1, l, moveTable)[0] == 0 && whatsThere(2, l, moveTable)[0] == 0 && whatsThere(3, l, moveTable)[0] == 0) { //empty between

			pushAid(hitSummm, canMoveTo, 2, l, 0, 0, moveTable) //mark that cell if empty

		}
		if (moveTable[7][l][3] && whatsThere(5, l, moveTable)[0] == 0 && whatsThere(6, l, moveTable)[0] == 0) { // unmoved rook on [7][l] && empty between
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

	if (isWhite) {
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

function sortAiArray(a, b) {
	if (typeof(a[0]) == "boolean") {
		return -1 //put header on the top of array
	}
	if (a[1] > b[1]) {
		return -1
	} else {
		if (a[1] < b[1]) {
			return +1
		}
	}

	return 0
}

function getPushString(table, moveStr) {
	//////console.log('789 bai ',table,moveStr)
	var cWhatMoves = String(table[dletters.indexOf(moveStr[0])][moveStr[1] - 1][0]) //color of whats moving
	var pWhatMoves = String(table[dletters.indexOf(moveStr[0])][moveStr[1] - 1][1]) //piece


	var whatsHit = String(table[dletters.indexOf(moveStr[2])][moveStr[3] - 1][0]) + //color of whats hit
		table[dletters.indexOf(moveStr[2])][moveStr[3] - 1][1] //piece

	if (pWhatMoves == "1" && //paraszt
		moveStr[0] != moveStr[2] && //keresztbe
		whatsHit == '00' //uresre
	) { //akkor tuti enpass
		if (cWhatMoves == '1') { //fekete
			whatsHit = '21' //akkor feher parasztot ut
		} else {
			whatsHit = '11'
		}

	}

	return cWhatMoves + pWhatMoves + moveStr + whatsHit

}

function moveIt(moveString, intable, dontProtect, hitValue) {
	if (hitValue == undefined) var hitValue = [0]
	var thistable = []

	for (var i = 0; i < 8; i++) {
		thistable[i] = new Array(8)
		for (var j = 0; j < 8; j++) {

			thistable[i][j] = intable[i][j].slice(0, 4)

		}
	}

	//itt indil sanc bastyatolas
	if (thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] == 9 && thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][3]) {

		switch (moveString.substring(2)) {
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

	for (ij = 0; ij < 8; ij++) {

		thistable[ij][3][3] = false //can only be in row 3 or 4

		thistable[ij][4][3] = false

	}

	if (thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] == 1 && ((moveString[1] == 2 && moveString[3] == 4) || (moveString[1] == 7 && moveString[3] == 5))) { //ha paraszt kettot lep

		thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][3] = true //[3]true for enpass

	}
	//es itt a vege
	//indul en passt lepett
	var enPass = false
	if (thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] == 1 && //paraszt
		thistable[dletters.indexOf(moveString[2])][moveString[3] - 1][0] == 0 && //uresre
		!(moveString[0] == moveString[2])) { //keresztbe
		enPass = true
		thistable[dletters.indexOf(moveString[2])][moveString[3] - 1] = thistable[dletters.indexOf(moveString[2])][moveString[1] - 1]

		thistable[dletters.indexOf(moveString[2])][moveString[1] - 1] = [0, 0, false, false, false] //ures

	}

	if (thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] == 1 && ( //ha paraszt es

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
	thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][2]++ //times moved

		thistable[dletters.indexOf(moveString[2])][moveString[3] - 1] =
		thistable[dletters.indexOf(moveString[0])][moveString[1] - 1]
	thistable[dletters.indexOf(moveString[0])][moveString[1] - 1] = [0, 0, 0] //, false, false, false]
	if (!(thistable[dletters.indexOf(moveString[2])][moveString[3] - 1][1] == 1)) {
		thistable[dletters.indexOf(moveString[2])][moveString[3] - 1][3] = false
	}

	return thistable
}

function protectTable(table, myCol) {
	return protectPieces(table, myCol) - protectPieces(table, !myCol)

}

function evalGame(tableInDb, stop) {

	//if(!(tableInDb == null)) {

	//tableInDb.pollNum++

	if (!canIMove(tableInDb.table, tableInDb.wNext)) {
		tableInDb.gameIsOn = false
		stop = true


		if (captured(tableInDb.table, tableInDb.wNext)) {

			if (tableInDb.wNext) {

				tableInDb.blackWon = true
				tableInDb.isDraw = false
			} else {
				tableInDb.whiteWon = true
				tableInDb.isDraw = false
			}
		} else {
			tableInDb.isDraw = true
		}
	}

	if (stop) {
		tableInDb.finalData = {
			white: getTableData(tableInDb.table, true),
			black: getTableData(tableInDb.table, false)
		}
	}


	//tableInDb.toBeChecked = false

	// setIntDB3.collection("tables")
	// 	.save(tableInDb, function(err3, res) {})

	// }
	// setIntDB3.close()
}


function getTableData(origTable, isWhite, oppKingPos) { //, rtnSimpleValue) {

	var lSancVal = 0
	var rSancVal = 0

	var tableValue = 0

	var rtnMyHitSum = [0] //this pointer will be passed to canmove 
	var rtnHisHitSum = [0]

	var rtnMyBestHit = 0
	var rtnHisBestHit = 0

	var rtnHisMoveCount = 0

	var rtnPushHimBack = 0

	var rtnApproachTheKing = 0

	if (oppKingPos == undefined) oppKingPos = whereIsTheKing(origTable, !isWhite)

	var origColor = 1
	if (isWhite) origColor = 2



	if (isWhite && origTable[4][0][3]) { //we play with white and have not moved the king yet

		var sancolhat = false

		if (origTable[0][0][3]) {
			lSancVal += 3 //unmoved rook worth more than moved
			sancolhat = true

			if (origTable[3][0][0] == 0) lSancVal += 1 //trying to empty between
			if (origTable[2][0][0] == 0) lSancVal += 3
			if (origTable[1][0][0] == 0) lSancVal += 1


			if (origTable[2][1][0] == 2) { //trying to keep my pieces  there to cover
				lSancVal += 1
				if (origTable[2][1][1] == 1) lSancVal += 4
			}
			if (origTable[1][1][0] == 2) { //trying to keep my pieces  there to cover
				lSancVal += 1
				if (origTable[1][1][1] == 1) lSancVal += 4
			}
			if (origTable[0][1][0] == 2) { //trying to keep my pieces  there to cover
				lSancVal += 1
				if (origTable[0][1][1] == 1) lSancVal += 4
			}



		}

		if (origTable[7][0][3]) {
			sancolhat = true
			rSancVal += 3

			if (origTable[6][0][0] == 0) rSancVal += 1
			if (origTable[5][0][0] == 0) rSancVal += 3

			if (origTable[7][1][0] == 2) { //trying to keep my pieces  there to cover
				rSancVal += 1
				if (origTable[7][1][1] == 1) rSancVal += 4
			}
			if (origTable[6][1][0] == 2) { //trying to keep my pieces  there to cover
				rSancVal += 1
				if (origTable[6][1][1] == 1) rSancVal += 4
			}
			if (origTable[5][1][0] == 2) { //trying to keep my pieces  there to cover
				rSancVal += 1
				if (origTable[5][1][1] == 1) rSancVal += 4
			}

		}

		if (sancolhat) {
			if (origTable[3][1][1] == 1 && origTable[3][1][0] == 2) lSancVal -= 6 //try to move d2 or e2 first
			if (origTable[4][1][1] == 1 && origTable[4][1][0] == 2) rSancVal -= 6

			if (origTable[2][0][1] == 2 && origTable[2][0][0] == 2) lSancVal -= 6 //try to move out bishops
			if (origTable[5][0][1] == 2 && origTable[5][0][0] == 2) rSancVal -= 6
		}


	}

	if (!isWhite && origTable[4][7][3]) { //we play with black and have not moved the king yet
		var sancolhat = false

		if (origTable[0][7][3]) {
			sancolhat = true
			lSancVal += 3 //unmoved rook worth more than moved

			if (origTable[3][7][0] == 0) lSancVal += 1
			if (origTable[2][7][0] == 0) lSancVal += 3
			if (origTable[1][7][0] == 0) lSancVal += 1

			if (origTable[2][6][0] == 1) { //trying to keep my pieces  there to cover
				lSancVal += 1
				if (origTable[2][6][1] == 1) lSancVal += 4
			}
			if (origTable[1][6][0] == 1) { //trying to keep my pieces  there to cover
				lSancVal += 1
				if (origTable[1][6][1] == 1) lSancVal += 4
			}
			if (origTable[0][6][0] == 1) { //trying to keep my pieces  there to cover
				lSancVal += 1
				if (origTable[0][6][1] == 1) lSancVal += 4
			}
		}

		if (origTable[7][7][3]) {
			sancolhat = true
			rSancVal += 3

			if (origTable[6][7][0] == 0) rSancVal += 1
			if (origTable[5][7][0] == 0) rSancVal += 3

			if (origTable[7][6][0] == 1) { //trying to keep my pieces  there to cover
				rSancVal += 1
				if (origTable[7][6][1] == 1) rSancVal += 4
			}
			if (origTable[6][6][0] == 1) { //trying to keep my pieces  there to cover
				rSancVal += 1
				if (origTable[6][6][1] == 1) rSancVal += 4
			}
			if (origTable[5][6][0] == 1) { //trying to keep my pieces  there to cover
				rSancVal += 1
				if (origTable[5][6][1] == 1) rSancVal += 4
			}

		}
		//	
		if (sancolhat) {
			if (origTable[3][6][1] == 1 && origTable[3][6][0] == 1) lSancVal -= 4
			if (origTable[4][6][1] == 1 && origTable[4][6][0] == 1) rSancVal -= 4

			if (origTable[2][7][1] == 2 && origTable[2][7][0] == 1) lSancVal -= 4
			if (origTable[5][7][1] == 2 && origTable[5][7][0] == 1) rSancVal -= 4

			// if(){

			// }
		}


	}
	var myMostMoved = 0


	var getToMiddle = 0
	for (var lookI = 0; lookI < 8; lookI++) { //
		for (var lookJ = 0; lookJ < 8; lookJ++) { //look through the table

			if (origTable[lookI][lookJ][0] == origColor) { //ha sajat babum

				//rtnMyHitSum = [0]

				//below:	minnel nagyobb erteku babum minnel kozelebb az ellenfel kiralyahoz

				rtnApproachTheKing += ((7 - Math.abs(oppKingPos[0] - lookI)) + (7 - Math.abs(oppKingPos[1] - lookJ))) * origTable[lookI][lookJ][1]

				// if ((!(origTable[lookI][lookJ][1] == 1)) && lookI > 1 && lookJ > 1 && lookI < 6 && lookJ < 6) { //ha nem paraszt es kozepen van a babu
				//     getToMiddle++
				// }

				canMove(lookI, lookJ, isWhite, origTable, true, true, rtnMyHitSum) //this can give back the moves, should use it
				if (origTable[lookI][lookJ][2] > myMostMoved) myMostMoved = origTable[lookI][lookJ][2] //get the highest number any piece moved

				if (isWhite) {
					rtnPushHimBack += lookJ
				} else {
					rtnPushHimBack += 7 - lookJ
				}
				//aiming for sum, so comment:
				//if(rtnMyHitSum[0] > rtnMyBestHit) rtnMyBestHit = rtnMyHitSum[0]

				tableValue += origTable[lookI][lookJ][1]

			} else {

				if (!(origTable[lookI][lookJ][0] == 0)) { //ha ellenfele

					//rtnHisHitSum = [0]
					// if ((!(origTable[lookI][lookJ][1] == 1)) && lookI > 1 && lookJ > 1 && lookI < 6 && lookJ < 6) { //ha nem paraszt es kozepen van a babu
					//     getToMiddle -= .1 //our pieces matter more, that is +1
					// }
					//do i use this movecount anywhere?
					rtnHisMoveCount += (canMove(lookI, lookJ, !isWhite, origTable, true, true, rtnHisHitSum)
							.length - 2) //   was /2 but 0 is the point
						//if(rtnHisHitSum[0] > rtnHisBestHit) rtnHisBestHit = rtnHisHitSum[0]
					if (!isWhite) {
						rtnPushHimBack -= lookJ / 10
					} else {
						rtnPushHimBack -= (7 - lookJ) / 10
					}
					//or this tblevalue:
					tableValue -= origTable[lookI][lookJ][1]

				}

			}
		}
	}


	////console.log(rtnApproachTheKing)


	return [tableValue, rtnMyHitSum[0], rtnHisHitSum[0], // rtnHisMoveCount, 
			lSancVal, rSancVal, getToMiddle, rtnPushHimBack, myMostMoved, rtnApproachTheKing
		] //rtnData

}

function findMyPieces(origTable, isWhite) {

	var myTempPieces = []

	var origColor = 1
	if (isWhite) origColor = 2

	for (var lookI = 0; lookI < 8; lookI++) { //
		for (var lookJ = 0; lookJ < 8; lookJ++) { //look through the table

			if (origTable[lookI][lookJ][0] == origColor) { //ha sajat babum

				myTempPieces.push([lookI, lookJ, origTable[lookI][lookJ][1]]) //itt kene szamitott erteket is adni a babuknak 

			}

		}
	}

	return [0, myTempPieces] //, hisTempPieces, rtnMyHitSum[0], rtnHisHitSum[0], rtnMyMovesCount] //returnArray // elso elem az osszes babu ertekenek osszge, aztan babkuk

}

function canIMove(winTable, winColor) {
	var winRetMoves = []
		//var winRetMoveCoords = []

	getAllMoves(winTable, winColor)
		.forEach(function(thisMove) { //get all his moves in array of strings
			winRetMoves.push(dletters[thisMove[0]] + (thisMove[1] + 1) + dletters[thisMove[2]] + (1 + thisMove[3]))
				//winRetMoveCoords.push(thisMove)
				//
		})
		//var origLen = winRetMoves.length
		//var removeCount = 0
	for (var i = winRetMoves.length - 1; i >= 0; i--) { //sakkba 
		if (captured(moveIt(winRetMoves[i], winTable), winColor)) { //sakkba lepne valaszkent	//moveit retmove ittis ottis
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
	if (winRetMoves.length > 0) {
		return true
	} else {
		return false
	}
}

function createState(table) {
	// if(orTable){

	// }
	var stateToRemember = []

	for (var i = 0; i < 8; i++) {
		for (var j = 0; j < 8; j++) {

			var x = 10 * Number(table[i][j][0]) + Number(table[i][j][1]) + 55 //  B vagy nagyobb
			if (x < 65) x = 65 // ez egy nagy A




			stateToRemember[8 * i + j] = String.fromCharCode(x)



			if (table[i][j][5] && //mozdulhat
				(table[i][j][1] == 1 || table[i][j][1] == 9)) { //paraszt v kiraly

				table[i][j][5].forEach(function(canmov) {
					stateToRemember[8 * i + j] = stateToRemember[8 * i + j] + canmov[0] + canmov[1]
				})
			}




		}
	}
	return stateToRemember.join('')

}

function countInArray(inValue, inArray) {
	var occured = 0
	inArray.forEach(function(arrayItem) {
		if (arrayItem == inValue) occured++
	})
	return occured
}

// function createAiTable(cfTable, cfColor, skipScnd, allPast, modType, modVal) {
//     var looped = false
//         //var loopedValue=0
//     var modConst = 1
//     if (modType == "lpV") {
//         if (modVal <= 50) {
//             modConst = modVal / 50
//         } else {
//             modConst = 1 / ((100 - modVal) / 50)
//         }
//     }

//     var allTempTables = [
//         [true, 0, new Date().getTime()] //array heading:true,0,timeStarted for timeItTook
//     ]
//     var doScnd = !skipScnd

//     //getAllMoves should be able to work fast or full (sanc, en pass, stb)
//     var cfMoves = []
//     var cfMoveCoords = []

//     getAllMoves(cfTable, cfColor, false, 0, true).forEach(function(thisMove) { //get all my moves in array of strings
//         cfMoves.push(dletters[thisMove[0]] + (thisMove[1] + 1) + dletters[thisMove[2]] + (1 + thisMove[3]))
//         cfMoveCoords.push(thisMove)
//     })

//     // es akkor nem kell ez:
//     // for(var i = cfMoves.length - 1; i >= 0; i--) { //sakkba nem lephetunk
//     // 	if(captured(moveIt(cfMoves[i], cfTable), cfColor)) { //sakkba lepnenk
//     // 		cfMoves.splice(i, 1)
//     // 		cfMoveCoords.splice(i, 1)
//     // 	}
//     // }

//     //sakkbol sancolas, sakkon atugras is kene ide (new getallmoves  will help) //mindenkepp kell, vagy leleptetnek

//     //
//     var origProtect = protectTable(cfTable, cfColor)

//     var origData = getTableData(cfTable, cfColor) //trick getTableScore(cfTable, !cfColor)

//     var dontLoop = false

//     if (origData[0] > 1) {
//         dontLoop = true
//             ////console.log('nem loopolhatok')
//     }

//     var origTableValue = origData[0]
//     var origMyHitValue = origData[1]
//     var origHisHitValue = origData[2]
//     var origlSanc = origData[3]
//     var origrSanc = origData[4]
//     var origGetToMiddle = origData[5]
//     var origPushHimBack = origData[6]
//     var origMostMoved = origData[7]

//     var fHitValue = [0]


//     var hisBestRtnMove

//     cfMoves.forEach(function(stepMove, moveIndex) {

//         //process.stdout.write(".");

//         var smallValScore = (10 - cfTable[cfMoveCoords[moveIndex][0]][cfMoveCoords[moveIndex][1]][1]) / 1000

//         //vonjuk ki ha vedett
//         // if (cfTable[cfMoveCoords[moveIndex][2]][cfMoveCoords[moveIndex][3]][6]){			//ha vedett 
//         // 	fHitValue-=cfTable[cfMoveCoords[moveIndex][0]][cfMoveCoords[moveIndex][1]][1]/10000	//kivonja amivel lep
//         // }

//         var fwdVal = 0
//         if (!cfColor && cfTable[cfMoveCoords[moveIndex][0]][cfMoveCoords[moveIndex][1]][1] == 1) { //ha fekete parejt tol
//             fwdVal = (7 - stepMove[1]) * 0.01
//         }
//         if (cfColor && cfTable[cfMoveCoords[moveIndex][0]][cfMoveCoords[moveIndex][1]][1] == 1) { //ha feher parejt tol
//             fwdVal = (stepMove[1] - 2) * 0.01
//         }

//         //fHitValue = cfTable[cfMoveCoords[moveIndex][2]][cfMoveCoords[moveIndex][3]][1] //leutott babu erteke, vagy 0

//         var tempTable = moveIt(stepMove, cfTable, true, fHitValue) //, false, hitValue)
//         protectTable(tempTable)


//         var loopValue = 0 //=(fHitValue-retHitValue)*10
//         var loopedValue = 0 //=(fHitValue-retHitValue)*10

//         var forceLoopValue = 0
//             ////
//             //indul a noloop

//         tempTable = addMovesToTable(tempTable, !cfColor)

//         var thisTState = createState(tempTable)
//         var counted = countInArray(thisTState, allPast)
//         //console.log(counted)
//         if (counted > 1) {
//             //3szorra lepnenk ugyanabba a statuszba
//             //ideiglenesen ne
//             ////// ////console.log ('i could 3fold '+counted)

//             ////console.log('counted >1')

//             if (dontLoop) {

//                 loopedValue -= 2000

//                 ////console.log('dontloop: -2000')

//             }



//             if (counted > 3) {
//                 //surely looped

//                 //console.log(counted > 3, counted)

//                 looped = true

//             }

//         } else {
//             // //// ////console.log (counted)
//             // //// ////console.log(thisTState)
//         }




//         ////

//         var cfRetMoves = []
//         var cfRetMoveCoords = []
//             //ide is full getallmoves kene, de vhogy tudnunk kell hany lepest szedett le sakk miatt, es azt is ebbol hanyszor lep a kirallyal..
//         getAllMoves(tempTable, !cfColor).forEach(function(thisMove) { //get all his moves in array of strings
//             cfRetMoves.push(dletters[thisMove[0]] + (thisMove[1] + 1) + dletters[thisMove[2]] + (1 + thisMove[3]))
//             cfRetMoveCoords.push(thisMove)

//         })
//         var origLen = cfRetMoves.length
//         var removeCount = 0
//         for (var i = cfRetMoves.length - 1; i >= 0; i--) { //sakkba nem lephet o sem
//             if (captured(moveIt(cfRetMoves[i], tempTable), !cfColor)) { //sakkba lepne valaszkent	//moveit retmove ittis ottis
//                 if (tempTable[cfRetMoveCoords[i][0]][cfRetMoveCoords[i][1]][1] == 9) {
//                     removeCount++ //fogja a kiraly koruli mezoket
//                 } else {
//                     removeCount += 3 //ollo ha sakkba lepne de nem kirallyal lepett
//                 }
//                 cfRetMoves.splice(i, 1)
//                 cfRetMoveCoords.splice(i, 1)

//                 // if(!(tempTable[cfRetMoveCoords[i][0]][cfRetMoveCoords[i][1]][1]==9)){

//                 // }
//             }
//         }
//         var captureScore = 0
//         if (origLen == 0) { //not do devide by zero also mark won?
//             //pattot adne?
//         } else {
//             captureScore = parseInt(removeCount * 100 / origLen) / 10000
//         }

//         var retTable = []

//         var hhit = 0 //(origHisHitValue-rtnHisHitValue)
//         var mhit = 0 //(rtnMyHitValue-origMyHitValue)*10
//         var dontGetHit = 0
//         var lsancValue = 0
//         var rsancValue = 0
//         var sancValue = 0
//         var getToMiddle = 0
//         var pushHimBack = 0
//         var mostMoved = 0


//         var rtnValue = 0 //=loopValue+mhit+hhit

//         if (cfRetMoves.length == 0) {

//             if (captured(tempTable, !cfColor)) {
//                 loopValue += 10000 //ott a matt
//             } else {

//                 //pattot adna
//                 loopValue -= 10000 //ideiglenesen ne adjunk pattot sosem!!
//             }

//             //retTable = cfTable //vmit vissza kell azert adni..., legyen az eredeti         
//             retProtect = origProtect
//             retData = origData
//             retTable = cfTable
//             hisBestRtnMove = "stuck."
//             var retHitValue = [0]

//         } else {

//             //lesz valaszlepese

//             var retData = []
//             var tempRetValue = -9999990
//             var retHitValue //= //[0]
//             var retProtect = 0


//             cfRetMoves.forEach(function(stepRetMove, retMoveIndex) {

//                 var tretHitValue = [0] //tempTable[cfRetMoveCoords[retMoveIndex][2]][cfRetMoveCoords[retMoveIndex][3]][1] 
//                 var eztVondKi = 0


//                 //kesobb vonjuk ki ha vedett
//                 if (tempTable[cfRetMoveCoords[retMoveIndex][2]][cfRetMoveCoords[retMoveIndex][3]][6]) { //ha vedett 
//                     eztVondKi = tempTable[cfRetMoveCoords[retMoveIndex][0]][cfRetMoveCoords[retMoveIndex][1]][1] //kivonja amivel lep
//                 }

//                 //how abot en pass????//kivonni kesobb a leutott babu erteke, vagy 0

//                 var tempRetTable = moveIt(stepRetMove, tempTable, true, tretHitValue) //, false, hitValue)

//                 ////
//                 //indul a noloop

//                 tempRetTable = addMovesToTable(tempRetTable, cfColor)

//                 if (countInArray(createState(tempRetTable), allPast) > 1) {
//                     //3szorra lephetne ugyanabba a statuszba

//                     if (dontLoop) {
//                         loopedValue -= 11000
//                             ////console.log('temprettable:   loopedValue-=11000')
//                     } else {
//                         forceLoopValue += 0.5

//                         ////console.log('temprettable:   forceLoopValue+=0.5')	
//                     }

//                     looped = true
//                         ////// ////console.log('he could 3fold')
//                 }




//                 ////




//                 //vonjuk ki ha vedett
//                 //if(eztVondKi>0){			minek ez??
//                 tretHitValue[0] -= eztVondKi

//                 //}
//                 var tretProtect = (protectTable(tempRetTable, cfColor) - origProtect) / 1000 //majd kesobb

//                 if (captured(tempRetTable, cfColor)) { //captured kiszamolja osszes valaszlepest, kivonja sakkokat, tudna szamolni utest is, mindent!!!
//                     dontGetHit -= .001 //MERHETNEM KULON
//                         //var myTempMoves=getAllMoves(tempRetTable,cfColor,false,0)
//                     if (!canIMove(tempRetTable, cfColor)) { //lassit mit a szemet, kell ez? kesobb is kiszamoljuk tan...
//                         dontGetHit = -10000 //ha mattot tudna adni erre a lepesre, akkor meg ne lepjuk!
//                     }
//                 }

//                 var tempRetData = getTableData(tempRetTable, cfColor)

//                 //var tretTableValue = tempRetData[0] //tablevalue-t nem is kene szamolni, megvan a retHitValue		//talan az sem kell
//                 var tretMyHitValue = tempRetData[1]
//                 var tretHisHitValue = tempRetData[2]
//                     // var tretlSanc = tempRetData[3]
//                     // var tretrSanc = tempRetData[4]


//                 if ((tretHitValue[0]) * 10 - tretMyHitValue * 10 + tretHisHitValue > tempRetValue) {

//                     tempRetValue = (tretHitValue[0]) * 10 - tretMyHitValue * 10 + tretHisHitValue

//                     retProtect = tretProtect
//                     retData = tempRetData
//                     retTable = tempRetTable
//                     hisBestRtnMove = stepRetMove
//                     retHitValue = tretHitValue
//                         //retTableValue=tempRetTable
//                 } else {
//                     // if((fHitValue[0]-tretHitValue[0]) * 10 - tretMyHitValue * 10 + tretHisHitValue == tempRetValue){
//                     // 	hisBestRtnMove = hisBestRtnMove+'.'//+stepRetMove//"many"
//                     // }						//jo is, kell is, kivettuk, mer lassit
//                 }

//             })

//             var rtnTableValue = retData[0]
//             var rtnMyHitValue = retData[1]
//             var rtnHisHitValue = retData[2]
//             var rtnlSanc = retData[3]
//             var rtnrSanc = retData[4]
//             var rtnGetToMiddle = retData[5]
//             var rtnPushHimBack = retData[6]
//             var rtnMostMoved = retData[7]



//             loopValue += (fHitValue[0] - retHitValue[0]) * 10 //(rtnTableValue - origTableValue) * 10
//             hhit = (origHisHitValue - rtnHisHitValue)
//             mhit = (rtnMyHitValue - origMyHitValue) * 10
//             lsancValue = (rtnlSanc - origlSanc) / 100
//             rsancValue = (rtnrSanc - origrSanc) / 100
//             getToMiddle = (rtnGetToMiddle - origGetToMiddle) / 1000
//             pushHimBack = (rtnPushHimBack - origPushHimBack) / 1000 //this could be somevhere between 100&1000

//             mostMoved = (origMostMoved - rtnMostMoved) / 2 //temp high, we should lover this as the game goes on //will be -.5 or 0 always
//             if (mostMoved > 0) mostMoved = 0 //it is positive when our most moved piece goes off

//             //rtnPushHimBack-


//             //rtnValue = loopValue + mhit + hhit + retProtect//my hit matters most as i'm next

//             if (cfColor) {
//                 if ((stepMove == 'e1g1' && cfTable[5][1][0] == 2 && cfTable[6][1][0] == 2 && cfTable[7][1][0] == 2) //vegig covered
//                     ||
//                     (stepMove == 'e1c1' && cfTable[0][1][0] == 2 && cfTable[1][1][0] == 2 && cfTable[2][1][0] == 2)) sancValue += .35 //sancoljon ha jol esik

//             } else {
//                 if ((stepMove == 'e8g8' && cfTable[5][6][0] == 1 && cfTable[6][6][0] == 1 && cfTable[7][6][0] == 1) ||
//                     (stepMove == 'e8c8' && cfTable[0][6][0] == 1 && cfTable[1][6][0] == 1 && cfTable[2][6][0] == 1)) sancValue += .35 //sancoljon ha jol esik

//             }

//         }

//         //rtnValue += fwdVal

//         //	

//         var tTable2Value = 0

//         if (doScnd) {
//             //

//             var cf2Moves = []
//             var cf2MoveCoords = []

//             getAllMoves(retTable, cfColor).forEach(function(thisMove) { //get all my moves in array of strings
//                 cf2Moves.push(dletters[thisMove[0]] + (thisMove[1] + 1) + dletters[thisMove[2]] + (1 + thisMove[3]))
//                 cf2MoveCoords.push(thisMove)
//             })

//             // es akkor nem kell ez:
//             for (var i = cf2Moves.length - 1; i >= 0; i--) { //sakkba nem lephetunk			
//                 if (captured(moveIt(cf2Moves[i], retTable), cfColor)) { //sakkba lepnenk					<---  merge this
//                     cf2Moves.splice(i, 1)
//                     cf2MoveCoords.splice(i, 1) //ez is lehetne count:ranking, minus!!
//                     tTable2Value -= 0.0001
//                 }
//             }

//             //check there's a win:
//             var potentMoves = [] //will make an array of potential winning moves
//             var potentTables = [] //and resulting tables
//                 //							
//             for (var i = cf2Moves.length - 1; i >= 0; i--) {

//                 var potentTable = moveIt(cf2Moves[i], retTable)

//                 if (captured(potentTable, !cfColor)) { //az lehet potent, ahol sakkot adok

//                     //make a ranker here
//                     //							<---	with this

//                     tTable2Value += 0.00001 //ket lepesben sakkot ad(hat)ok
//                     potentMoves.push(cf2Moves[i])
//                     potentTables.push(potentTable)
//                         //cfMoveCoords.splice(i, 1)					//ez is lehetne count:ranking
//                 }
//             }


//             //check if capturing moves are winners:

//             var twoStepWinners = []

//             potentMoves.forEach(function(potentMove, potentMoveCount) {
//                 var potentTable = potentTables[potentMoveCount] //potent tablan mindenkepp sakkban all remember
//                     ////

//                 var ret2potMoves = []
//                     //var ret2potMoveCoords = []

//                 getAllMoves(potentTable, !cfColor).forEach(function(thisMove) { //get all his moves in array of strings
//                         ret2potMoves.push(dletters[thisMove[0]] + (thisMove[1] + 1) + dletters[thisMove[2]] + (1 + thisMove[3]))
//                             //ret2potMoveCoords.push(thisMove)

//                     })
//                     //var origLen = ret2potMoves.length
//                     //var removeCount = 0
//                 for (var i = ret2potMoves.length - 1; i >= 0; i--) { //sakkba nem lephet o sem
//                     if (captured(moveIt(ret2potMoves[i], potentTable), !cfColor)) { //sakkba lepne valaszkent	//moveit retmove ittis ottis
//                         ret2potMoves.splice(i, 1)
//                             //ret2potMoveCoords.splice(i, 1)
//                             //removeCount++
//                         tTable2Value += 0.000001 //sakkba lephetne

//                     }
//                 }
//                 //
//                 if (ret2potMoves.length == 0) {
//                     //mattot tudok adni a legjobbnak tuno lepesere
//                     //process.stdout.write("!");
//                     ////// ////console.log('2 lepesbol mattolhatok')
//                     if (tTable2Value < 5) tTable2Value += 5

//                     //meg kene nezni ki tud-e lepni belole


//                     tTable2Value += 0.00001 //sakkba lephetne
//                 }

//                 ////
//             })

//             ///

//         }
//         // lsancValue*=10
//         // rsancValue*=10

//         ///modType 'l' is loopval *=-1

//         //if(modType=="lpV")loopValue*= modConst

//         ////// ////console.log(modType)
//         switch (modType) {
//             case undefined:

//                 break;

//             case "lpV":

//                 loopValue *= modConst

//                 break;

//             case "cpt":

//                 captureScore *= modConst

//                 break;

//             case "tt2":

//                 tTable2Value *= modConst

//                 break;

//             case "sVS":

//                 smallValScore *= modConst

//                 break;


//             case "dGH":

//                 dontGetHit *= modConst

//                 break;


//             case "rPr":

//                 retProtect *= modConst

//                 break;


//             case "mHt":

//                 mhit *= modConst

//                 break;


//             case "hHt":

//                 hhit *= modConst

//                 break;

//             case "mMv":

//                 mostMoved *= modConst

//                 break;

//             case "pHB":

//                 pushHimBack *= modConst

//                 break;

//             case "gTM":

//                 getToMiddle *= modConst

//                 break;

//             case "fwV":

//                 fwdVal *= modConst

//                 break;

//             case "scV":

//                 lsancValue *= modConst
//                 rsancValue *= modConst
//                 sancValue *= modConst

//                 break;




//         }



//         var pushThisValue =

//             tTable2Value +
//             loopValue +
//             captureScore + //fHitValue +
//             smallValScore +
//             dontGetHit +
//             retProtect +
//             mhit +
//             hhit +
//             fwdVal +
//             lsancValue +
//             rsancValue +
//             sancValue +
//             getToMiddle +
//             pushHimBack +
//             mostMoved +
//             loopedValue +
//             forceLoopValue

//         allTempTables.push([stepMove, pushThisValue]) //, hisBestRtnMove, loopValue, captureScore, smallValScore,
//             // dontGetHit,tTable2Value, retProtect, mhit, hhit, fwdVal,lsancValue,rsancValue,
//             //  sancValue,getToMiddle,pushHimBack,mostMoved])

//     })

//     allTempTables = allTempTables.sort(sortAiArray)

//     allTempTables[0][2] = (new Date().getTime() - allTempTables[0][2]) //1st row has timeItTook
//     if (looped) allTempTables[0][6] = true //looped

//     return allTempTables
// }

// function ai(tablE, wn, allPast, modType, modVal) {
//     ////console.log('old ai func called!!!!!')
//     return createAiTable(tablE, wn, false, allPast, modType, modVal)

// }


var newAi = function(dbTable, modType, modConst, thinker) {
	// var modConst=1

	// if(modVal<=50){
	// 		modConst=modVal/50
	// 	}else{
	// 		modConst=1/((100-modVal)/50)
	// 	}
	var looped = false
	var started = new Date()
		.getTime()

	var aiTable = new MoveTask(dbTable)
	var solvedMoves = processDeepSplitMoves(aiTable.movesToSend, thinker, modType, modConst, looped) //processSplitMoves(aiTable.movesToSend, thinker, modType, modConst, looped)

	//////console.log(solvedMoves)

	solvedMoves.sort(moveSorter)



	solvedMoves.unshift([true, true, new Date()
		.getTime() - started
	])

	if (looped) solvedMoves[0][6] = true //looped

	return solvedMoves

}

function getMcFromMv(modVal) {
	//var modConst=getMcFromMv(modVal)  

	var modConst = 1

	if (modVal <= 50) {
		modConst = modVal / 50
	} else {
		modConst = 1 / ((100 - modVal) / 50)
	}
	modConst = modConst * modConst * modConst

	return modConst
}

function moveSorter(a, b) {
	if (Number(b.score) > Number(a.score)) {
		return 1
	} else {
		if (Number(b.score) == Number(a.score)) {
			return 0
		}

		return -1
	}
}

function helpMe(wp) {
	//// ////console.log('MOVE SCORE    first    second')
	ai(table, wp)
		.forEach(function(thisline) {
			//// ////console.log(thisline[0] + ' ' + thisline[1] + '  =  ' + thisline[2] + '  +  ' + thisline[3])
		})
}




////////////////////////////////////////////////////////////////////////////////////////////////////////////
//					new ai functions	
////////////////////////////////////////////////////////////////////////////////////////////////////////////



function processSplitMoves(data, thinker, mt, modConst, looped) {

	//var result=[]
	var newData = []
		//  var modConst=1


	while (data.length > 0) {

		// if(mt[0]=='w'){     //winning mod
		//     modConst=
		// }else{
		//     modConst=modConst2
		// }


		var toPush = processMove(data.pop(), mt, modConst, looped)


		toPush.thinker = thinker

		newData.push(toPush)
	}


	return newData
}




function processMove(move, modType, modConst2, looped) {
	//var looped=false
	//var result=[]
	//var modType=""
	//var modVal=1




	///////////////////////////////////////
	var cfTable = move.cfTable
	var cfMoveCoords = move.cfMoveCoords
	var moveIndex = move.moveIndex

	var cfColor = move.cfColor

	var cfOppKingPos = move.oppKingPos

	var stepMove = move.stepMove

	var fHitValue = move.fHitValue
	var allPast = move.allPast

	var origData = move.origData

	var origTableValue = origData[0]
	var origMyHitValue = origData[1]
	var origHisHitValue = origData[2]
	var origlSanc = origData[3]
	var origrSanc = origData[4]
	var origGetToMiddle = origData[5]
	var origPushHimBack = origData[6]
	var origMostMoved = origData[7]

	var origApproachTheKing = origData[8]

	var modConst = 1

	if (modType) {
		if (modType[0] == 'w') { //winning mod
			if (origTableValue > 0) { //and we are winning    //otherwise pow(0,0)error

				// var c4=origTableValue/31
				// var f2=modConst2
				modConst = Math.pow(origTableValue / 31, modConst2)

				// modConst=

			} else {
				modConst = 0
			}


		} else {
			modConst = modConst2
		}

		modType = modType.substring(1, 4)
	}

	//var origDistanceFromKing=origData[10]

	var origProtect = move.origProtect

	var dontLoop = false

	if (origData[0] > 0) {
		dontLoop = true
			////console.log('nem loopolhatok')
	}



	//var d


	//////console.log(cfMoveCoords,cfTable)


	//cfMoves.forEach(function(stepMove, moveIndex) {

	//process.stdout.write(".");

	var smallValScore = (10 - cfTable[cfMoveCoords[0]][cfMoveCoords[1]][1]) ///1000

	//vonjuk ki ha vedett
	// if (cfTable[cfMoveCoords[2]][cfMoveCoords[3]][6]){			//ha vedett 
	// 	fHitValue-=cfTable[cfMoveCoords[0]][cfMoveCoords[1]][1]/10000	//kivonja amivel lep
	// }

	var fwdVal = 0
	if (!cfColor && cfTable[cfMoveCoords[0]][cfMoveCoords[1]][1] == 1) { //ha fekete parejt tol
		fwdVal = (7 - stepMove[1]) * 0.01
	}
	if (cfColor && cfTable[cfMoveCoords[0]][cfMoveCoords[1]][1] == 1) { //ha feher parejt tol
		fwdVal = (stepMove[1] - 2) * 0.01
	}

	//fHitValue = cfTable[cfMoveCoords[2]][cfMoveCoords[3]][1] //leutott babu erteke, vagy 0

	var tempTable = moveIt(stepMove, cfTable, true, fHitValue) //, false, hitValue)
	protectTable(tempTable)


	var loopValue = 0 //=(fHitValue-retHitValue)*10
	var loopedValue = 0 //=(fHitValue-retHitValue)*10

	var forceLoopValue = 0
		////
		//indul a noloop

	tempTable = addMovesToTable(tempTable, !cfColor)

	var thisTState = createState(tempTable)
	var counted = countInArray(thisTState, allPast)
	if (counted > 1) {
		//3szorra lepnenk ugyanabba a statuszba

		//////console.log ('i could 3fold '+counted)



		if (dontLoop) {
			loopedValue -= 1000

			////console.log(' loopedValue-=1000')
		}



		if (counted > 3) {
			//surely looped
			looped = true

		}

	} else {
		// ////console.log (counted)
		// ////console.log(thisTState)
	}




	////

	var cfRetMoves = []
	var cfRetMoveCoords = []
		//ide is full getallmoves kene, de vhogy tudnunk kell hany lepest szedett le sakk miatt, es azt is ebbol hanyszor lep a kirallyal..
	getAllMoves(tempTable, !cfColor)
		.forEach(function(thisMove) { //get all his moves in array of strings
			cfRetMoves.push(dletters[thisMove[0]] + (thisMove[1] + 1) + dletters[thisMove[2]] + (1 + thisMove[3]))
			cfRetMoveCoords.push(thisMove)

		})
	var origLen = cfRetMoves.length
	var removeCount = 0
	for (var i = cfRetMoves.length - 1; i >= 0; i--) { //sakkba nem lephet o sem
		if (captured(moveIt(cfRetMoves[i], tempTable), !cfColor)) { //sakkba lepne valaszkent	//moveit retmove ittis ottis
			if (tempTable[cfRetMoveCoords[i][0]][cfRetMoveCoords[i][1]][1] == 9) {
				removeCount++ //fogja a kiraly koruli mezoket
			} else {
				removeCount += 3 //ollo ha sakkba lepne de nem kirallyal lepett
			}
			cfRetMoves.splice(i, 1)
			cfRetMoveCoords.splice(i, 1)

			// if(!(tempTable[cfRetMoveCoords[i][0]][cfRetMoveCoords[i][1]][1]==9)){

			// }
		}
	}
	var captureScore = 0
	if (origLen == 0) { //not do devide by zero also mark won?
		//pattot adne?
	} else {
		captureScore = parseInt(removeCount * 100 / origLen) / 10000
	}

	var retTable = []

	var hhit = 0 //(origHisHitValue-rtnHisHitValue)
	var mhit = 0 //(rtnMyHitValue-origMyHitValue)*10
	var dontGetHit = 0
	var lsancValue = 0
	var rsancValue = 0
	var sancValue = 0
	var getToMiddle = 0
	var pushHimBack = 0
	var mostMoved = 0

	var approachTheKing = 0


	var rtnValue = 0 //=loopValue+mhit+hhit

	if (cfRetMoves.length == 0) {

		if (captured(tempTable, !cfColor)) {
			loopValue += 10000 //ott a matt
		} else {

			//pattot adna
			if (dontLoop) {
				loopValue -= 10000 //jo?
			} else {
				loopValue += 100 //jo?
			}
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
		var retProtect = 0


		cfRetMoves.forEach(function(stepRetMove, retMoveIndex) {

			var tretHitValue = [0] //tempTable[cfRetMoveCoords[retMoveIndex][2]][cfRetMoveCoords[retMoveIndex][3]][1] 
			var eztVondKi = 0


			//kesobb vonjuk ki ha vedett
			if (tempTable[cfRetMoveCoords[retMoveIndex][2]][cfRetMoveCoords[retMoveIndex][3]][6]) { //ha vedett 
				eztVondKi = tempTable[cfRetMoveCoords[retMoveIndex][0]][cfRetMoveCoords[retMoveIndex][1]][1] //kivonja amivel lep
			}

			//how abot en pass????//kivonni kesobb a leutott babu erteke, vagy 0

			var tempRetTable = moveIt(stepRetMove, tempTable, true, tretHitValue) //, false, hitValue)

			////
			//indul a noloop

			tempRetTable = addMovesToTable(tempRetTable, cfColor)

			if (countInArray(createState(tempRetTable), allPast) > 1) {
				//3szorra lephetne ugyanabba a statuszba
				//ideiglenesen ne
				if (dontLoop) {
					loopedValue -= 100
				} else {
					forceLoopValue += 0.5
				}

				looped = true
					//////console.log('he could 3fold')
			}




			////




			//vonjuk ki ha vedett
			if (eztVondKi > 0) {
				tretHitValue[0] -= eztVondKi

			}
			var tretProtect = (protectTable(tempRetTable, cfColor) - origProtect) ///1000 //majd kesobb

			if (captured(tempRetTable, cfColor)) {
				dontGetHit -= .001
					//var myTempMoves=getAllMoves(tempRetTable,cfColor,false,0)
				if (!canIMove(tempRetTable, cfColor)) {
					dontGetHit = -10000 //ha mattot tudna adni erre a lepesre, akkor meg ne lepjuk!
				}
			}

			var tempRetData = getTableData(tempRetTable, cfColor, cfOppKingPos)

			//var tretTableValue = tempRetData[0] //tablevalue-t nem is kene szamolni, megvan a retHitValue		//talan az sem kell
			//var tretMyHitValue = tempRetData[1]
			//var tretHisHitValue = tempRetData[2]
			// var tretlSanc = tempRetData[3]
			// var tretrSanc = tempRetData[4]


			if ((tretHitValue[0]) * 10 - tempRetData[1] * 10 + tempRetData[2] > tempRetValue) { //this is very inaccurate

				tempRetValue = (tretHitValue[0]) * 10 - tempRetData[1] * 10 + tempRetData[2]

				retProtect = tretProtect
				retData = tempRetData
				retTable = tempRetTable
					//hisBestRtnMove = stepRetMove
				retHitValue = tretHitValue
					//retTableValue=tempRetTable
			} // else {
			// if((fHitValue[0]-tretHitValue[0]) * 10 - tretMyHitValue * 10 + tretHisHitValue == tempRetValue){
			// 	hisBestRtnMove = hisBestRtnMove+'.'//+stepRetMove//"many"
			// }
			// }

		})

		var rtnTableValue = retData[0]
		var rtnMyHitValue = retData[1]
		var rtnHisHitValue = retData[2]
		var rtnlSanc = retData[3]
		var rtnrSanc = retData[4]
		var rtnGetToMiddle = retData[5]
		var rtnPushHimBack = retData[6]
		var rtnMostMoved = retData[7]

		var rtnApproachTheKing = retData[8]

		loopValue += (fHitValue[0] - retHitValue[0]) //*10 			//(rtnTableValue - origTableValue) * 10
		hhit = (origHisHitValue - rtnHisHitValue)
		mhit = (rtnMyHitValue - origMyHitValue) // * 10
		lsancValue = (rtnlSanc - origlSanc)
		rsancValue = (rtnrSanc - origrSanc)
		getToMiddle = (rtnGetToMiddle - origGetToMiddle) ///1000
		pushHimBack = (rtnPushHimBack - origPushHimBack) ///1000		//this could be somevhere between 100&1000
		approachTheKing = (origApproachTheKing - rtnApproachTheKing) ///10000	//lets see

		mostMoved = (origMostMoved - rtnMostMoved) //temp high, we should lover this as the game goes on //will be -.5 or 0 always
		if (mostMoved > 0) mostMoved = 0 //it is positive when our most moved piece goes off

		//rtnPushHimBack-


		//rtnValue = loopValue + mhit + hhit + retProtect//my hit matters most as i'm next

		if (cfColor) {
			if ((stepMove == 'e1g1' && cfTable[5][1][0] == 2 && cfTable[6][1][0] == 2 && cfTable[7][1][0] == 2) //vegig covered
				||
				(stepMove == 'e1c1' && cfTable[0][1][0] == 2 && cfTable[1][1][0] == 2 && cfTable[2][1][0] == 2)) sancValue += .35 //sancoljon ha jol esik

		} else {
			if ((stepMove == 'e8g8' && cfTable[5][6][0] == 1 && cfTable[6][6][0] == 1 && cfTable[7][6][0] == 1) ||
				(stepMove == 'e8c8' && cfTable[0][6][0] == 1 && cfTable[1][6][0] == 1 && cfTable[2][6][0] == 1)) sancValue += .35 //sancoljon ha jol esik

		}

	}

	//rtnValue += fwdVal

	//	

	var tTable2Value = 0 //kivettuk


	switch (modType) {

		case undefined:
			////console.log('modType == undefined')
			break;

		case "lpV":

			loopValue *= modConst
				////console.log('lpV modded: '+modConst)
			break;

		case "cpS":

			captureScore *= modConst
				////console.log('cpS modded: '+modConst)
			break;

		case "tt2":

			tTable2Value *= modConst
				////console.log('tt2 modded: '+modConst)
			break;

		case "sVS":

			smallValScore *= modConst
				////console.log('sVS modded: '+modConst)
			break;


		case "dGH":

			dontGetHit *= modConst
				////console.log('dGH modded: '+modConst)
			break;


		case "rPr":

			retProtect *= modConst
				////console.log('rPr modded: '+modConst)
			break;


		case "mHt":

			mhit *= modConst
				////console.log('mHt modded: '+modConst)
			break;


		case "hHt":

			hhit *= modConst
				////console.log('hHt modded: '+modConst)
			break;

		case "mMv":

			mostMoved *= modConst
				////console.log('mMv modded: '+modConst)
			break;

		case "pHB":

			pushHimBack *= modConst
				////console.log('pHB modded: '+modConst)
			break;

		case "gTM":

			getToMiddle *= modConst
				////console.log('gTM modded: '+modConst)
			break;

		case "fwV":

			fwdVal *= modConst
				////console.log('fwV modded: '+modConst)
			break;

		case "scV":

			lsancValue *= modConst
			rsancValue *= modConst
			sancValue *= modConst
				////console.log('scV modded: '+modConst)
			break;

		case "aTK":

			approachTheKing *= modConst

			break;




	}



	var pushThisValue =

		tTable2Value +

		(mhit + loopValue) * 50 + //?
		captureScore * 1.94164388 + //16
		smallValScore * 0.0003 + //15
		dontGetHit * 55 + //4
		retProtect * 0.001532064 + //from stats12

		hhit * 4 + //from stats1
		fwdVal * 2 + //3
		lsancValue / 100 + //mashonnan
		rsancValue / 100 + //mashonnan
		sancValue +
		getToMiddle * 0.000296 + //6
		pushHimBack * 0.004676 + //5
		mostMoved * 0.052577 + //9
		loopedValue +
		forceLoopValue +
		approachTheKing * 0.0001 //14



	return {
		move: move.stepMove,
		score: pushThisValue,
		_id: move._id,
		// thinker: $rootScope.sendID
	} //, hisBestRtnMove, loopValue, captureScore, smallValScore,
	// dontGetHit,tTable2Value, retProtect, mhit, hhit, fwdVal,lsancValue,rsancValue,
	//  sancValue,getToMiddle,pushHimBack,mostMoved])

	//})		original foreach




	///////////////////////////////////////




}



var checkSpeed = function() {
	return 20000 / newAi(new Dbtable(1, 'a', 'b'))[0][2] //how many splitmoves / second
}




// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 



/////////////////////////////////deepening functions/////////////////////////////


///////////////////////////// below the functions that run a million times ////////////////////////

function resolveDepth(depth, resolverArray) {
	if (resolverArray[depth].length > 0) {
		if (depth / 2 == Math.floor(depth / 2)) {

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

function solveSmallDeepeningTask(smallDeepeningTask, resolverArray) {
	//this is the function that runs a million times

	//gets one task, produces an array of more tasks
	//or empty array when done

	var result = [] 																		//these new tasks go to a fifo array, we solve the tree bit by bit
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
					
					newMoveTree.push(moveStr)

					if(makeMove)	movedTable = moveIt(moveStr, smallDeepeningTask.table, true)

					//

					//var fastValue = [0,0] //nem kell, a movestringbol vesszuk fastTableValue(movedTable) //this gets the value of the table (black winning < 0 < white winnning) and the total value of kings (1,2 or 3)

					//var thisMoveCoords=stringToMoveCoords(moveStr)
					var whatGetsHit = smallDeepeningTask.table[dletters.indexOf(moveStr[2])][moveStr[3] - 1]

					var thisValue = whatGetsHit[1] //piece value, should ++ when en-pass

					//if(thisValue>bestValue)thisValue=bestValue

					var noKingHit = true

					if (thisValue == 9) noKingHit = false



					if (smallDeepeningTask.depth / 2 != Math.floor(smallDeepeningTask.depth)) thisValue *= -1 //every second level has negative values: opponent moved



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




					}

				} //  )    //end of for each move

				result.push(new TriggerItem(smallDeepeningTask.depth + 1, smallDeepeningTask.moveTree))
					//this will trigger move calc when processing array (will be placed before each set of smalltasks)

			}

			} else { //depth +1

				resolverArray[smallDeepeningTask.depth].push(new ResolverItem(smallDeepeningTask.score,smallDeepeningTask.moveTree)) //this will fill in and then gets reduced to best movevalue only




			}
		//}

	}

	var resultValue = 0

	result.push(resultValue) //!!!!!!!!!!!!!!!!!!!!!!here we put in some extra data to be caught by the caller

	return result

}

function solveDeepeningTask(deepeningTask, tempCommand, aaa) { //designed to solve the whole deepening task on one thread
	//will return number of smallTasks solved for testing??!!!!!!!!!!!!!!!
	//var taskValue = deepeningTask.

	var startedAt = new Date()
		.getTime()


	var solved = 0


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


		var thisMoveValue = 0

		var resultingSDTs = solveSmallDeepeningTask(smallDeepeningTask, resolverArray)

		taskValue += resultingSDTs.pop() //!!!!!!!!!!!!!!!!!!!!!!!!!



		////console.log('bai 2879',taskValue)

		//averageVal+=thisMoveValue

		if (resCommand != '') {
			//solver messaged us

		}

		if (resultingSDTs != []) {
			//new tables were generated. when we reach desiredDepth there will be no new tables here
			////console.log(resultingSDTs)
			solved += resultingSDTs.length

			while (resultingSDTs.length > 0) {
				deepeningTask.smallDeepeningTasks.push(resultingSDTs.pop()) //at the beginning the unsent array is just growing but then we run out
					//designed to run on single threaded full deepening
			}

		}
		//resultingstds is now an empty array, unsent is probably full of tasks again

		//call it again if there are tasks
	}
	var timeItTook = new Date()
		.getTime() - startedAt
	return {
		solved: solved,
		timeItTook: timeItTook,
		value: resolverArray[1].value
	} //,(solved + ' tables generated in ' + timeItTook + 'ms. Tables/second: ' + solved * 1000 / timeItTook)]

}

////////////////////////////temp speedtest///////////////////////
function speedTest(depth, passToWorkers) {
	//console.log(1,depth)
	var started = new Date()
		.getTime()

	var solvedTableCount = 0

	var values = []
	var dbTable = new Dbtable(1, 2, 3)

	dbTable.desiredDepth = depth
		//console.log(2,dbTable.desiredDepth)
	var aiTable = new MoveTask(dbTable); //level 3 deepening on new table
	//console.log(3,aiTable.desiredDepth)
	var tds = [];
	var tds2 = [];
	aiTable.movesToSend.forEach(function(step) {
		tds.push(step)
	});
	tds.forEach(function(a) {
		tds2.push(new DeepeningTask(a))
	});
	var tempCommand = 'a'
	tds2.forEach(function(a) {
		////console.log(a)
		var thisMoveValue = 0
		var totals = solveDeepeningTask(a, tempCommand, thisMoveValue)
		solvedTableCount += totals.solved

		values.push({
			move: a.moveStr,
			loopValue: thisMoveValue
		})
	});

	values.sort(function(a, b) {
		if (a.loopValue > b.loopValue) {
			return 1
		} else {
			return -1
		}
	})

	return {
		timeItTook: new Date().getTime() - started, //timeItTook
		solved: solvedTableCount,
		values: values,
		winningMove: values[0].move,
		winningValue: values[0].loopValue
	}
	////////////////////////////temp speedtest end///////////////////////
}

function processDeepSplitMoves(data, thinker, mt, modConst, looped) {

	//var result=[]
	var newData = []
		//  var modConst=1


	while (data.length > 0) {

		// if(mt[0]=='w'){     //winning mod
		//     modConst=
		// }else{
		//     modConst=modConst2
		// }


		//var dTask=new DeepeningTask(data.pop())


		var toPush = deepMove(data.pop())


		toPush.thinker = thinker

		newData.push(toPush)
	}


	return newData
}




function deepMove(smallMoveTask) { //for 1 thread, smallmovetask has one of my possible 1st moves

	var started = new Date()
		.getTime()

	var solvedTableCount = 0

	var value = 0

	var deepeningTask = new DeepeningTask(smallMoveTask)

	var tempCommand = ''

	//var thisMoveValue=0
	var totals = solveDeepeningTask(deepeningTask, tempCommand, value) //single thread calc

	solvedTableCount += totals.solved


	return { //this goes to console chat window
		move: deepeningTask.moveStr,
		score: totals.value, //totals.solved,//	should give average score
		// total:	totals.value,
		solved: totals.solved,
		_id: smallMoveTask._id,
		depth: deepeningTask.desiredDepth


	}


}




function fastTableValue(table) {

	var kingsOnTable = 0
	var value = 0
		//var kingsOnTable=0

	for (var i = 0; i < 8; i++) {
		for (var j = 0; j < 8; j++) {

			if (table[i][j][1] == 9) kingsOnTable += table[i][j][0] //total will be 0 for no king, 1 for black only, 2 for white only, 3 for both present

		}
	}

	//if(kingsOnTable==3)

	return [kingsOnTable, 0]

}




// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 



// var DeepeningTask=function(smallMoveTask){      //keep this fast, designed for main thread and mainWorker     //smallMoveTask is a smallMoveTask, to be deepend further

// 	this.smallMoveTask=smallMoveTask		//kell ez????!!!!!			//we have the original object, there are approx.40 of these per moveTask, we probably received a few of these only ((should have _id or rndID!!!!!!!!!)	


// 	this.moveStr=smallMoveTask.stepMove		//all resulting tables relate to this movestring: deppeningtask is made of smallmovetask..

// 	this.startingTable=smallMoveTask.cfTable		//this was calculated in advance when getting the first moves: that resulted in this.everything

// 	this.thisTaskTable=moveIt(this.moveStr,smallMoveTask.cfTable,true)		//this is the first and should be only time calculating this!!!!!
// 	//takes time


// 	this.desiredDepth=smallMoveTask.desiredDepth	//we will deepen until depth reaches this number

// 	this.actualDepth=1								//its 1 because we have 1st level resulting table fixed. 
// 													//increase this when generating deeper tables, loop while this is smaller than desiredDepth

// 	this.depthsToClear=smallMoveTask.desiredDepth	//we will decrease this when throwing away resulting tables, until it is 1. the last set of tables gets thrown away on the server that finishes this task
// 													//this task should be sent back to the server so lets ke


// 	this.tableTree=[]								//fill multiDIM array with resulting tables during processing
// 	this.moveStrTree=[]								//twin array with movesString


// 	this.tableTree[0]=[this.startingTable]			// depth 0 table, startingTable: only one in an array

// 	this.tableTree[1]=[this.thisTaskTable]			// depth 1 tables, we only have one in this task but there are more in total

// 	this.tableTree[2]=[]							// depth 2 tables are empty at init, we will fill these in when processing this deepeningTask. after each depth we'll create the next empty array

// 	//there will be more levels here with a lot of tables

// 	//moveStings is one level deeper array, strings get longer each level to keep track of table!!!!!!

// 	this.moveStrTree[0]=[[]]	//???					// depth 0 movestrings, meaning 'how did we get here?'	these are always unknown

// 	this.moveStrTree[1]=[[this.moveStr]]				// depth 1 movestrings, meaning 'how did we get here?', we only have one in this task but there are more in total

// 	this.moveStrTree[2]=[[]]							// depth 2 movestrings, meaning 'how did we get here?', we will fill these together with the tableTree, all indexes will match as move=>resulting table

// 	//there will be more levels here with a lot of moveStrings



// 	this.smallDeepeningTaskCounts[0]				//this will be an array of the total created smalldeepeningtasks per depth, depth 0 has 0

// 	this.pendingSmallDeepeningTasks=[]				//here we will keep the pending smalltasks

// 	this.solvedSmallDeepeningTasks=[]				//here we will keep the results until stepping to next depth, ready for next level when this.length equals count


// } 



// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //