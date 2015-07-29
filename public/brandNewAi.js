var bestHit = 0

var escConst = 1.3
var fadeConst = 1
var level = 1
var whatHitsConst = 1
var hitValueConst = 0.5
var t1const = 20
var t2const = 1
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
	if(whitePlayer) myCol++ //myCol is 2 when white

		getAllMoves(getTableData(originalTable, whitePlayer), originalTable, whitePlayer, true). //moves include to hit my own 
		//true stands for letMeHitMyOwn

	forEach(function(thisMoveCoords) {
		//we'll use the 2nd part of the moves [2][3]
		if(originalTable[thisMoveCoords[2]][thisMoveCoords[3]][0] == myCol) { //if i have sg there
			originalTable[thisMoveCoords[2]][thisMoveCoords[3]][6] = true //that must be protected
		}
	})

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

function canMove(k, l, isWhite, moveTable, speedy, dontProt) {

	var what = moveTable[k][l][1]
	var possibleMoves = []
	switch(what) {
		// case 0:

		case 1:

			possibleMoves = pawnCanMove(k, l, isWhite, moveTable)

			break;
		case 2:
			possibleMoves = bishopCanMove(k, l, isWhite, moveTable)

			break;
		case 3:
			possibleMoves = horseCanMove(k, l, isWhite, moveTable)

			break;
		case 4:
			possibleMoves = rookCanMove(k, l, isWhite, moveTable)

			break;
		case 5:
			possibleMoves = queenCanMove(k, l, isWhite, moveTable)

			break;
		case 9:
			possibleMoves = kingCanMove(k, l, isWhite, moveTable)

			break;

	}

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

			// remove the sakkot atugrani sem er

			var removeKmin2 = true //alapbol leszedne
			var removeKplus2 = true
				//var removeThis = false
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

function getTableData(origTable, isWhite) {
	var returnArray = [] // elso elem will be az osszes babu ertekenek osszge, aztan az osszes babu koordinataja
	var tableValue = 0
	var myTempPieces = []
	if(isWhite) {
		var origColor = 2
		var noc = 1
	} else {
		var origColor = 1
		var noc = 2
	}
	for(var lookI = 0; lookI < 8; lookI++) {
		for(var lookJ = 0; lookJ < 8; lookJ++) {
			//alert(thisTempState[lookI][lookJ][0])
			if(origTable[lookI][lookJ][0] == origColor) {
				myTempPieces.push([lookI, lookJ, origTable[lookI][lookJ][1]])
				tableValue += origTable[lookI][lookJ][1]
			} else {
				if(origTable[lookI][lookJ][0] == noc) {
					tableValue -= origTable[lookI][lookJ][1]

				}

			}
		}
	}
	returnArray.push(tableValue)
	returnArray.push(myTempPieces)
	return returnArray // elso elem az osszes babu ertekenek osszge, aztan babkuk

}

function whatsThere(i, j, aiTable) {
	//var pieceThere = []

	if(i > -1 && j > -1 && i < 8 && j < 8) {

		return aiTable[i][j] //.slice(0,4)
	}

	return []
}

function pushAid(x, y, hanyadik, milegyen, fromTable, someboolean, whatHits) {

	if(whatsThere(x, y, fromTable)[hanyadik] == milegyen) {

		canMoveTo.push([x, y, whatsThere(x, y, fromTable)[1]])

		//////////////////////////
		var thisHit = 0
		if(fromTable[x][y][1] == 9) { //ha kiralyt ut
			thisHit = 9 //??doubt it??>this global val. will be captured in another function
		} else {
			if(fromTable[x][y][6]) { //alert('protectedHit')	//ha protectedre lep
				thisHit = fromTable[x][y][1] - //thisHitbol kivonja amivel lep
					whatHits * whatHitsConst
				if(thisHit < 0) {
					thisHit = 0
				} //negaive is 0
			} else {
				thisHit = fromTable[x][y][1] //normal hivalue

			}

		}

		////////////////////////////////

		if(bestHit < thisHit) {
			bestHit = thisHit
				//alert(bestHit)
		}

		return true

	};
	return false
}

function pawnCanMove(k, l, isWhite, moveTable) {
	canMoveTo = []
		//var hitIt=false
	if((isWhite && moveTable[k][l][0] == 2) || (!isWhite && moveTable[k][l][0] == 1)) {
		var c = 2
		var nc = 1
	} else {
		var c = 1
		var nc = 2
	}
	//if(aiCalled){

	if(moveTable[k][l][0] == 2) {

		if(pushAid(k, l + 1, 0, 0, moveTable) && l == 1) {
			pushAid(k, l + 2, 0, 0, moveTable)
		}
		pushAid(k - 1, l + 1, 0, nc, moveTable, isWhite, 1)
		pushAid(k + 1, l + 1, 0, nc, moveTable, isWhite, 1)

		//en pass
		if(whatsThere(k - 1, l, moveTable)[3]) {

			pushAid(k - 1, l + 1, 0, 0, moveTable, isWhite)

		}
		if(whatsThere(k + 1, l, moveTable)[3]) {

			pushAid(k + 1, l + 1, 0, 0, moveTable, isWhite)

		}

	} else {

		if(pushAid(k, l - 1, 0, 0, moveTable) && l == 6) {
			pushAid(k, l - 2, 0, 0, moveTable)
		}
		pushAid(k - 1, l - 1, 0, c, moveTable, !isWhite, 1)
		pushAid(k + 1, l - 1, 0, c, moveTable, !isWhite, 1)

		//en pass
		if(whatsThere(k - 1, l, moveTable)[3]) {

			pushAid(k - 1, l - 1, 0, 0, moveTable, !isWhite)

		}
		if(whatsThere(k + 1, l, moveTable)[3]) {

			pushAid(k + 1, l - 1, 0, 0, moveTable, !isWhite)

		}

	}

	return canMoveTo

}

function rookCanMove(k, l, isWhite, moveTable) {
	canMoveTo = []
		// if(aiCalled){

	if(!isWhite) {
		var c = 2
		var nc = 1
	} else {
		var c = 1
		var nc = 2
	}

	var goFurther = [true, true, true, true]
	for(var moveCount = 1; moveCount < 8; moveCount++) {
		if(goFurther[0]) {
			pushAid(k + moveCount, l, 0, 0, moveTable)
			if(pushAid(k + moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k + moveCount, l, moveTable)[0] == nc) {
				goFurther[0] = false
			}
		}
		if(goFurther[1]) {
			pushAid(k - moveCount, l, 0, 0, moveTable)
			if(pushAid(k - moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k - moveCount, l, moveTable)[0] == nc) {
				goFurther[1] = false
			}
		}
		if(goFurther[2]) {
			pushAid(k, l + moveCount, 0, 0, moveTable)
			if(pushAid(k, l + moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l + moveCount, moveTable)[0] == nc) {
				goFurther[2] = false
			}
		}
		if(goFurther[3]) {
			pushAid(k, l - moveCount, 0, 0, moveTable)
			if(pushAid(k, l - moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l - moveCount, moveTable)[0] == nc) {
				goFurther[3] = false
			}
		}
	}
	return canMoveTo
}

function bishopCanMove(k, l, isWhite, moveTable) {
	canMoveTo = []
		//if(aiCalled){

	if(!isWhite) {
		var c = 2
		var nc = 1
	} else {
		var c = 1
		var nc = 2
	}

	var goFurther = [true, true, true, true]
	for(var moveCount = 1; moveCount < 8; moveCount++) {
		if(goFurther[0]) {
			pushAid(k + moveCount, l + moveCount, 0, 0, moveTable)
			if(pushAid(k + moveCount, l + moveCount, 0, c, moveTable, true, 2) || whatsThere(k + moveCount, l + moveCount, moveTable)[0] == nc) {
				goFurther[0] = false
			}
		}
		if(goFurther[1]) {
			pushAid(k - moveCount, l + moveCount, 0, 0, moveTable)
			if(pushAid(k - moveCount, l + moveCount, 0, c, moveTable, true, 2) || whatsThere(k - moveCount, l + moveCount, moveTable)[0] == nc) {
				goFurther[1] = false
			}
		}
		if(goFurther[2]) {
			pushAid(k + moveCount, l - moveCount, 0, 0, moveTable)
			if(pushAid(k + moveCount, l - moveCount, 0, c, moveTable, true, 2) || whatsThere(k + moveCount, l - moveCount, moveTable)[0] == nc) {
				goFurther[2] = false
			}
		}
		if(goFurther[3]) {
			pushAid(k - moveCount, l - moveCount, 0, 0, moveTable)
			if(pushAid(k - moveCount, l - moveCount, 0, c, moveTable, true, 2) || whatsThere(k - moveCount, l - moveCount, moveTable)[0] == nc) {
				goFurther[3] = false
			}
		}
	}
	return canMoveTo
}

function queenCanMove(k, l, isWhite, moveTable) {
	canMoveTo = []

	if(!isWhite) {
		var c = 2
		var nc = 1
	} else {
		var c = 1
		var nc = 2
	}

	var goFurther = [true, true, true, true, true, true, true, true]
	for(var moveCount = 1; moveCount < 8; moveCount++) {
		if(goFurther[0]) {
			pushAid(k + moveCount, l + moveCount, 0, 0, moveTable)
			if(pushAid(k + moveCount, l + moveCount, 0, c, moveTable, true, 5) || whatsThere(k + moveCount, l + moveCount, moveTable)[0] == nc) {
				goFurther[0] = false
			}
		}
		if(goFurther[1]) {
			pushAid(k - moveCount, l + moveCount, 0, 0, moveTable)
			if(pushAid(k - moveCount, l + moveCount, 0, c, moveTable, true, 5) || whatsThere(k - moveCount, l + moveCount, moveTable)[0] == nc) {
				goFurther[1] = false
			}
		}
		if(goFurther[2]) {
			pushAid(k + moveCount, l - moveCount, 0, 0, moveTable)
			if(pushAid(k + moveCount, l - moveCount, 0, c, moveTable, true, 5) || whatsThere(k + moveCount, l - moveCount, moveTable)[0] == nc) {
				goFurther[2] = false
			}
		}
		if(goFurther[3]) {
			pushAid(k - moveCount, l - moveCount, 0, 0, moveTable)
			if(pushAid(k - moveCount, l - moveCount, 0, c, moveTable, true, 5) || whatsThere(k - moveCount, l - moveCount, moveTable)[0] == nc) {
				goFurther[3] = false
			}
		}

		if(goFurther[4]) {
			pushAid(k + moveCount, l, 0, 0, moveTable)
			if(pushAid(k + moveCount, l, 0, c, moveTable, true, 5) || whatsThere(k + moveCount, l, moveTable)[0] == nc) {
				goFurther[4] = false
			}
		}
		if(goFurther[5]) {
			pushAid(k - moveCount, l, 0, 0, moveTable)
			if(pushAid(k - moveCount, l, 0, c, moveTable, true, 5) || whatsThere(k - moveCount, l, moveTable)[0] == nc) {
				goFurther[5] = false
			}
		}
		if(goFurther[6]) {
			pushAid(k, l + moveCount, 0, 0, moveTable)
			if(pushAid(k, l + moveCount, 0, c, moveTable, true, 5) || whatsThere(k, l + moveCount, moveTable)[0] == nc) {
				goFurther[6] = false
			}
		}
		if(goFurther[7]) {
			pushAid(k, l - moveCount, 0, 0, moveTable)
			if(pushAid(k, l - moveCount, 0, c, moveTable, true, 5) || whatsThere(k, l - moveCount, moveTable)[0] == nc) {
				goFurther[7] = false
			}
		}
	}
	return canMoveTo
}

function kingCanMove(k, l, isWhite, moveTable) {

	canMoveTo = []

	if(!isWhite) {
		var c = 2
		var nc = 1
	} else {
		var c = 1
		var nc = 2
	}

	moveCount = 1
	pushAid(k + moveCount, l + moveCount, 0, 0, moveTable)
	pushAid(k - moveCount, l + moveCount, 0, 0, moveTable)
	pushAid(k + moveCount, l - moveCount, 0, 0, moveTable)
	pushAid(k - moveCount, l - moveCount, 0, 0, moveTable)
	pushAid(k + moveCount, l, 0, 0, moveTable)
	pushAid(k - moveCount, l, 0, 0, moveTable)
	pushAid(k, l + moveCount, 0, 0, moveTable)
	pushAid(k, l - moveCount, 0, 0, moveTable)

	pushAid(k + moveCount, l + moveCount, 0, c, moveTable, true, 9)
	pushAid(k - moveCount, l + moveCount, 0, c, moveTable, true, 9)
	pushAid(k + moveCount, l - moveCount, 0, c, moveTable, true, 9)
	pushAid(k - moveCount, l - moveCount, 0, c, moveTable, true, 9)
	pushAid(k + moveCount, l, 0, c, moveTable, true, 9)
	pushAid(k - moveCount, l, 0, c, moveTable, true, 9)
	pushAid(k, l + moveCount, 0, c, moveTable, true, 9)
	pushAid(k, l - moveCount, 0, c, moveTable, true, 9)

	//sanc
	if(moveTable[k][l][3]) { //if the king hasnt moved yet, 

		// ha nincs sakkban, nem is ugrik at sakkot, minden ures kozotte

		if(moveTable[0][l][3] && // unmoved rook on [0][l]
			whatsThere(1, l, moveTable)[0] == 0 && whatsThere(2, l, moveTable)[0] == 0 && whatsThere(3, l, moveTable)[0] == 0) { //empty between

			pushAid(2, l, 0, 0, moveTable) //mark that cell if empty

		}
		if(moveTable[7][l][3] && whatsThere(5, l, moveTable)[0] == 0 && whatsThere(6, l, moveTable)[0] == 0) { // unmoved rook on [7][l] && empty between
			pushAid(6, l, 0, 0, moveTable) //mark that cell if empty

		}

	}

	return canMoveTo
}

function horseCanMove(k, l, isWhite, moveTable) {

	canMoveTo = []
	pushAid(k + 1, l + 2, 0, 0, moveTable)
	pushAid(k + 1, l - 2, 0, 0, moveTable)
	pushAid(k - 1, l + 2, 0, 0, moveTable)
	pushAid(k - 1, l - 2, 0, 0, moveTable)

	pushAid(k + 2, l + 1, 0, 0, moveTable)
	pushAid(k + 2, l - 1, 0, 0, moveTable)
	pushAid(k - 2, l + 1, 0, 0, moveTable)
	pushAid(k - 2, l - 1, 0, 0, moveTable)

	if(!isWhite) {
		var c = 2
		var nc = 1
	} else {
		var c = 1
		var nc = 2
	}

	pushAid(k + 1, l + 2, 0, c, moveTable, true, 3)
	pushAid(k + 1, l - 2, 0, c, moveTable, true, 3)
	pushAid(k - 1, l + 2, 0, c, moveTable, true, 3)
	pushAid(k - 1, l - 2, 0, c, moveTable, true, 3)

	pushAid(k + 2, l + 1, 0, c, moveTable, true, 3)
	pushAid(k + 2, l - 1, 0, c, moveTable, true, 3)
	pushAid(k - 2, l + 1, 0, c, moveTable, true, 3)
	pushAid(k - 2, l - 1, 0, c, moveTable, true, 3)

	return canMoveTo

}

function moveArrayToStrings(moveArray, ftable, fwNext) {
	var strArray = []
	moveArray.forEach(function(thisMove) {
		strArray.push(dletters[thisMove[0]] + (thisMove[1] + 1) + dletters[thisMove[2]] + (1 + thisMove[3]))

	})
	// for(var i = strArray.length - 1; i >= 0; i--) {
	// 	if(captured(ftable,fwNext)) {
	// 		strArray.splice(i, 1)
	// 	}
	// }

	return strArray

}

function getAllMoves(rawTableData, tableToMoveOn, whiteNext, hitItsOwn) {

	var tableData = rawTableData[1]
	thisArray = []
	thisStrArray = []

	if(hitItsOwn) {
		whiteNext = !whiteNext
	}
	bestHit = 0
	for(var pieceNo = 0; pieceNo < tableData.length; pieceNo++) {

		canMove(tableData[pieceNo][0], tableData[pieceNo][1], whiteNext, tableToMoveOn, true, true) //true,true for speedy(sakkba is lep),dontProtect
			.forEach(function(stepItem) {
				thisArray.push([tableData[pieceNo][0], tableData[pieceNo][1], stepItem[0], stepItem[1]])
			})
	}

	return thisArray

}

function getBestHit(tableToValidate, wNx, returnMoves) {
	bestHit = 0

	var myMoves =
		getAllMoves(getTableData(tableToValidate, wNx), tableToValidate, wNx)

	var mybest = bestHit
	bestHit = 0

	if(returnMoves) return myMoves
	return [mybest]

}

function sortAiArray(a, b) {
	if(typeof(a[0]) == "boolean") {
		return -1
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

function moveIt(moveString, intable, dontProtect) {

	var thistable = []
		//var thistable=[]
	for(var i = 0; i < 8; i++) {
		thistable[i] = new Array(8)
		for(var j = 0; j < 8; j++) {
			thistable[i][j] = [] //new Array(4?)

			for(k = 0; k < 5; k++) {

				//intable[i][j].forEach(function (value,feCount){
				thistable[i][j][k] = intable[i][j][k]
			} //)
		}
	}

	//itt indil sanc bastyatolas
	if(thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] == 9 && thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][3]) {
		//if(moveString.substring(2)=="")
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

		thistable[ij][3][3] = false

		thistable[ij][4][3] = false

	}

	if(thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] == 1 && ((moveString[1] == 2 && moveString[3] == 4) || (moveString[1] == 7 && moveString[3] == 5))) { //ha paraszt kettot lep

		thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][3] = true

	}
	//es itt a vege
	//indul en passt lepett

	if(thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] == 1 && //paraszt
		thistable[dletters.indexOf(moveString[2])][moveString[3] - 1][0] == 0 && //uresre
		!(moveString[0] == moveString[2])) { //keresztbe

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

	hitValue = thistable[dletters.indexOf(moveString[2])][moveString[3] - 1][1] //normal hivalue

	thistable[dletters.indexOf(moveString[2])][moveString[3] - 1] =
		thistable[dletters.indexOf(moveString[0])][moveString[1] - 1]
	thistable[dletters.indexOf(moveString[0])][moveString[1] - 1] = [0, 0, false, false, false] //,blankFunction]
	if(!(thistable[dletters.indexOf(moveString[2])][moveString[3] - 1][1] == 1)) {
		thistable[dletters.indexOf(moveString[2])][moveString[3] - 1][3] = false
	}

	if(!dontProtect) {
		protectPieces(thistable, true)
		protectPieces(thistable, false)
	}
	return thistable
}

function createFirstTableState(cfTable, cfColor) {
	var timeAtStart=new Date().getTime()
	var cfMoves = moveArrayToStrings(getAllMoves(getTableData(cfTable, cfColor), cfTable, cfColor), cfTable, cfColor)

	for(var i = cfMoves.length - 1; i >= 0; i--) { //sakkba nem lephetunk
		if(getBestHit(moveIt(cfMoves[i], cfTable), !cfColor) == 9) {
			cfMoves.splice(i, 1)
		}
	}

	var tempTable = new Array(8)
	var allTempTables = []
	var opponentsOrigValue = getBestHit(cfTable, !cfColor)
	var myOrigOrigValue = getBestHit(cfTable, cfColor)

	allTempTables.push([true, fadeConst, 0]) //array heading:color,fadeConst(will be multiplied),howDeep

	i = 0
		//console.log(cfMoves)
	cfMoves.forEach(function(stepMove) {
		//console.log(stepMove)
		tempTable = moveIt(stepMove, cfTable)

		var myOrigValue = hitValue
		hitValue = 0

		tTableValue = myOrigValue - escConst * (getBestHit(tempTable, !cfColor) - opponentsOrigValue) + (getBestHit(tempTable, cfColor) / 2)

		// one deeper

		var cf2Moves = moveArrayToStrings(getAllMoves(getTableData(tempTable, cfColor), tempTable, cfColor), tempTable, cfColor)
			//console.log(cf2Moves)
		var tempTable2 = new Array(8)
		var tTable2Value = 0
			//var allTempTables=[]
		var opponents2OrigValue = getBestHit(tempTable, !cfColor)
		var myOrigValue = getBestHit(tempTable, cfColor)

		cf2Moves.forEach(function(step2Move, moveNo) {

			temp2Table = moveIt(step2Move, tempTable)

			var myOrig2Value = hitValue
			hitValue = 0

			tTable2Value -= myOrig2Value - (escConst * escConst * (getBestHit(temp2Table, !cfColor) -
				opponents2OrigValue) + (getBestHit(temp2Table, cfColor) / 10) / 10)

		})

		// deepening ends

		tTable2Value /= 11
		if(tTable2Value < 0) {
			tTableValue *= dontHitConst
		}

		tTableValue *= t1const
		tTable2Value *= t2const

		var wtf = [parseInt((tTableValue + tTable2Value) * 100), parseInt(tTableValue * 100), parseInt(tTable2Value * 100)]

		allTempTables.push([stepMove, wtf[0], wtf[1], wtf[2]]) //,tableHitValue]) //row: movestring, ai val, deepen val, deep hit val, [tables]
		//console.log([stepMove, wtf[0], wtf[1], wtf[2]])
	})

	allTempTables = allTempTables.sort(sortAiArray)
	
	//console:
	allTempTables.forEach(function(thisline) {
		console.log(thisline[0] + ' ' + thisline[1] + '  =  ' + thisline[2] + '  +  ' + thisline[3])
	})
	
	 //var timeAtStart=new Date().getTime()
        //var result=ai(tableFromDb.table,tableFromDb.wNext)
        var timeItTook=new Date().getTime()-timeAtStart
        console.log(timeItTook+" ms")
		//
	return allTempTables
}

function ai(tablE, wn) {
	
	//var retTable=createFirstTableState(tablE, wn)
	// retTable.forEach(function(thisline) {
	// 	console.log(thisline[0] + ' ' + thisline[1] + '  =  ' + thisline[2] + '  +  ' + thisline[3])
	// })
	
	return createFirstTableState(tablE, wn)//retTable

}

function helpMe(wp) {
	console.log('MOVE SCORE    first    second')
	ai(table, wp)
	//.forEach(function(thisline) {
	// 	console.log(thisline[0] + ' ' + thisline[1] + '  =  ' + thisline[2] + '  +  ' + thisline[3])
	// })
}