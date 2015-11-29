function pawnCanMoveN(k, l, moveTable, c, iHitMoves, protectScore) {

	if (c == 2) { //white pawn

		pushAidN(k, l, k + 1, l + 1, c, moveTable, iHitMoves, protectScore)
		pushAidN(k, l, k - 1, l + 1, c, moveTable, iHitMoves, protectScore)

	} else { //black pawn

		pushAidN(k, l, k + 1, l - 1, c, moveTable, iHitMoves, protectScore)
		pushAidN(k, l, k - 1, l - 1, c, moveTable, iHitMoves, protectScore)

	}

}

function rookCanMoveN(k, l, moveTable, c, iHitMoves, protectScore) {
	//horseCanMoveN(k, l, moveTable, c,iHitMoves,protectScore)
	//var canMoveTo = []
	// if(aiCalled){

	// if (isWhite) {
	// 	var c = 1
	// 	var nc = 2
	// } else {
	// 	var c = 2
	// 	var nc = 1
	// }

	var goFurther = [true, true, true, true]

	for (var moveCount = 1; moveCount < 8; moveCount++) {
		if (goFurther[0]) {

			if (pushAidN(k, l, k + moveCount, l, c, moveTable, iHitMoves, protectScore)) goFurther[0] = false

			//pushAidN( canMoveTo, k + moveCount, l, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k + moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k + moveCount, l, moveTable)[0] == nc) {
			// 	goFurther[0] = false
			// }
		}
		if (goFurther[1]) {

			if (pushAidN(k, l, k - moveCount, l, c, moveTable, iHitMoves, protectScore)) goFurther[1] = false

			// pushAidN( canMoveTo, k - moveCount, l, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k - moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k - moveCount, l, moveTable)[0] == nc) {
			// 	goFurther[1] = false
			// }
		}
		if (goFurther[2]) {

			if (pushAidN(k, l, k, l + moveCount, c, moveTable, iHitMoves, protectScore)) goFurther[2] = false

			// pushAidN( canMoveTo, k, l + moveCount, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k, l + moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l + moveCount, moveTable)[0] == nc) {
			// 	goFurther[2] = false
			// }
		}
		if (goFurther[3]) {

			if (pushAidN(k, l, k, l - moveCount, c, moveTable, iHitMoves, protectScore)) goFurther[3] = false

			// pushAidN( canMoveTo, k, l - moveCount, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k, l - moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l - moveCount, moveTable)[0] == nc) {
			// 	goFurther[3] = false
			// }
		}
	}
	//return canMoveTo
}

function bishopCanMoveN(k, l, moveTable, c, iHitMoves, protectScore) {
	//horseCanMoveN(k, l, moveTable, c,iHitMoves,protectScore)
	//var canMoveTo = []
	// if(aiCalled){

	// if (isWhite) {
	// 	var c = 1
	// 	var nc = 2
	// } else {
	// 	var c = 2
	// 	var nc = 1
	// }

	var goFurther = [true, true, true, true]

	for (var moveCount = 1; moveCount < 8; moveCount++) {
		if (goFurther[0]) {

			if (pushAidN(k, l, k + moveCount, l + moveCount, c, moveTable, iHitMoves, protectScore)) goFurther[0] = false

			//pushAidN( canMoveTo, k + moveCount, l, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k + moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k + moveCount, l, moveTable)[0] == nc) {
			// 	goFurther[0] = false
			// }
		}
		if (goFurther[1]) {

			if (pushAidN(k, l, k - moveCount, l - moveCount, c, moveTable, iHitMoves, protectScore)) goFurther[1] = false

			// pushAidN( canMoveTo, k - moveCount, l, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k - moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k - moveCount, l, moveTable)[0] == nc) {
			// 	goFurther[1] = false
			// }
		}
		if (goFurther[2]) {

			if (pushAidN(k, l, k - moveCount, l + moveCount, c, moveTable, iHitMoves, protectScore)) goFurther[2] = false

			// pushAidN( canMoveTo, k, l + moveCount, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k, l + moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l + moveCount, moveTable)[0] == nc) {
			// 	goFurther[2] = false
			// }
		}
		if (goFurther[3]) {

			if (pushAidN(k, l, k + moveCount, l - moveCount, c, moveTable, iHitMoves, protectScore)) goFurther[3] = false

			// pushAidN( canMoveTo, k, l - moveCount, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k, l - moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l - moveCount, moveTable)[0] == nc) {
			// 	goFurther[3] = false
			// }
		}
	}
	//return canMoveTo
}

function queenCanMoveN(k, l, moveTable, c, iHitMoves, protectScore) {
	//horseCanMoveN(k, l, moveTable, c,iHitMoves,protectScore)
	//var canMoveTo = []
	// if(aiCalled){

	// if (isWhite) {
	// 	var c = 1
	// 	var nc = 2
	// } else {
	// 	var c = 2
	// 	var nc = 1
	// }

	var goFurther = [true, true, true, true, true, true, true, true]

	for (var moveCount = 1; moveCount < 8; moveCount++) {

		if (goFurther[0]) {

			if (pushAidN(k, l, k + moveCount, l, c, moveTable, iHitMoves, protectScore)) goFurther[0] = false

			//pushAidN( canMoveTo, k + moveCount, l, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k + moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k + moveCount, l, moveTable)[0] == nc) {
			// 	goFurther[0] = false
			// }
		}
		if (goFurther[1]) {

			if (pushAidN(k, l, k - moveCount, l, c, moveTable, iHitMoves, protectScore)) goFurther[1] = false

			// pushAidN( canMoveTo, k - moveCount, l, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k - moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k - moveCount, l, moveTable)[0] == nc) {
			// 	goFurther[1] = false
			// }
		}
		if (goFurther[2]) {

			if (pushAidN(k, l, k, l + moveCount, c, moveTable, iHitMoves, protectScore)) goFurther[2] = false

			// pushAidN( canMoveTo, k, l + moveCount, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k, l + moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l + moveCount, moveTable)[0] == nc) {
			// 	goFurther[2] = false
			// }
		}
		if (goFurther[3]) {

			if (pushAidN(k, l, k, l - moveCount, c, moveTable, iHitMoves, protectScore)) goFurther[3] = false

			// pushAidN( canMoveTo, k, l - moveCount, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k, l - moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l - moveCount, moveTable)[0] == nc) {
			// 	goFurther[3] = false
			// }
		}

		if (goFurther[4]) {

			if (pushAidN(k, l, k + moveCount, l + moveCount, c, moveTable, iHitMoves, protectScore)) goFurther[4] = false

			//pushAidN( canMoveTo, k + moveCount, l, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k + moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k + moveCount, l, moveTable)[0] == nc) {
			// 	goFurther[0] = false
			// }
		}
		if (goFurther[5]) {

			if (pushAidN(k, l, k - moveCount, l - moveCount, c, moveTable, iHitMoves, protectScore)) goFurther[5] = false

			// pushAidN( canMoveTo, k - moveCount, l, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k - moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k - moveCount, l, moveTable)[0] == nc) {
			// 	goFurther[1] = false
			// }
		}
		if (goFurther[6]) {

			if (pushAidN(k, l, k - moveCount, l + moveCount, c, moveTable, iHitMoves, protectScore)) goFurther[6] = false

			// pushAidN( canMoveTo, k, l + moveCount, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k, l + moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l + moveCount, moveTable)[0] == nc) {
			// 	goFurther[2] = false
			// }
		}
		if (goFurther[7]) {

			if (pushAidN(k, l, k + moveCount, l - moveCount, c, moveTable, iHitMoves, protectScore)) goFurther[7] = false

			// pushAidN( canMoveTo, k, l - moveCount, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k, l - moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l - moveCount, moveTable)[0] == nc) {
			// 	goFurther[3] = false
			// }
		}
	}
	//return canMoveTo
}

function kingCanMoveN(k, l, moveTable, c, iHitMoves, protectScore) {
	//horseCanMoveN(k, l, moveTable, c,iHitMoves,protectScore)
	//pushAidN( k,l, k + 1, l + 2,c, moveTable, iHitMoves, protectScore)

	// var canMoveTo = []

	// if (isWhite) {
	// 	var c = 1
	// 	var nc = 2
	// } else {
	// 	var c = 2
	// 	var nc = 1
	// }

	//moveCount = 1

	pushAidN(k, l, k + 1, l, c, moveTable, iHitMoves, protectScore)
	pushAidN(k, l, k - 1, l, c, moveTable, iHitMoves, protectScore)
	pushAidN(k, l, k + 1, l + 1, c, moveTable, iHitMoves, protectScore)
	pushAidN(k, l, k - 1, l + 1, c, moveTable, iHitMoves, protectScore)
	pushAidN(k, l, k + 1, l - 1, c, moveTable, iHitMoves, protectScore)
	pushAidN(k, l, k - 1, l - 1, c, moveTable, iHitMoves, protectScore)
	pushAidN(k, l, k, l + 1, c, moveTable, iHitMoves, protectScore)
	pushAidN(k, l, k, l - 1, c, moveTable, iHitMoves, protectScore)

	// pushAidN( canMoveTo, k + moveCount, l + moveCount, 0, 0, moveTable)
	// pushAidN( canMoveTo, k - moveCount, l + moveCount, 0, 0, moveTable)
	// pushAidN( canMoveTo, k + moveCount, l - moveCount, 0, 0, moveTable)
	// pushAidN( canMoveTo, k - moveCount, l - moveCount, 0, 0, moveTable)
	// pushAidN( canMoveTo, k + moveCount, l, 0, 0, moveTable)
	// pushAidN( canMoveTo, k - moveCount, l, 0, 0, moveTable)
	// pushAidN( canMoveTo, k, l + moveCount, 0, 0, moveTable)
	// pushAidN( canMoveTo, k, l - moveCount, 0, 0, moveTable)

	// pushAidN( canMoveTo, k + moveCount, l + moveCount, 0, c, moveTable, true, 9)
	// pushAidN( canMoveTo, k - moveCount, l + moveCount, 0, c, moveTable, true, 9)
	// pushAidN( canMoveTo, k + moveCount, l - moveCount, 0, c, moveTable, true, 9)
	// pushAidN( canMoveTo, k - moveCount, l - moveCount, 0, c, moveTable, true, 9)
	// pushAidN( canMoveTo, k + moveCount, l, 0, c, moveTable, true, 9)
	// pushAidN( canMoveTo, k - moveCount, l, 0, c, moveTable, true, 9)
	// pushAidN( canMoveTo, k, l + moveCount, 0, c, moveTable, true, 9)
	// pushAidN( canMoveTo, k, l - moveCount, 0, c, moveTable, true, 9)

	//sanc
	if (moveTable[k][l][3]) { //if the king hasnt moved yet, 

		// ha nincs sakkban, nem is ugrik at sakkot, minden ures kozotte

		if (moveTable[0][l][3] && // unmoved rook on [0][l]
			whatsThere(1, l, moveTable)[0] == 0 && whatsThere(2, l, moveTable)[0] == 0 && whatsThere(3, l, moveTable)[0] == 0) { //empty between

			pushAidN(canMoveTo, 2, l, 0, 0, moveTable) //mark that cell if empty

		}
		if (moveTable[7][l][3] && whatsThere(5, l, moveTable)[0] == 0 && whatsThere(6, l, moveTable)[0] == 0) { // unmoved rook on [7][l] && empty between
			pushAidN(canMoveTo, 6, l, 0, 0, moveTable) //mark that cell if empty

		}

	}

	//return canMoveTo
}

function horseCanMoveN(k, l, moveTable, c, iHitMoves, protectScore) {

	// pushAidN( canMoveTo, k + 1, l + 2, 0, 0, moveTable)
	// pushAidN( canMoveTo, k + 1, l - 2, 0, 0, moveTable)
	// pushAidN( canMoveTo, k - 1, l + 2, 0, 0, moveTable)
	// pushAidN( canMoveTo, k - 1, l - 2, 0, 0, moveTable)

	// pushAidN( canMoveTo, k + 2, l + 1, 0, 0, moveTable)
	// pushAidN( canMoveTo, k + 2, l - 1, 0, 0, moveTable)
	// pushAidN( canMoveTo, k - 2, l + 1, 0, 0, moveTable)
	// pushAidN( canMoveTo, k - 2, l - 1, 0, 0, moveTable)

	pushAidN(k, l, k + 1, l + 2, c, moveTable, iHitMoves, protectScore)
	pushAidN(k, l, k + 1, l - 2, c, moveTable, iHitMoves, protectScore)
	pushAidN(k, l, k - 1, l + 2, c, moveTable, iHitMoves, protectScore)
	pushAidN(k, l, k - 1, l - 2, c, moveTable, iHitMoves, protectScore)

	pushAidN(k, l, k + 2, l + 1, c, moveTable, iHitMoves, protectScore)
	pushAidN(k, l, k + 2, l - 1, c, moveTable, iHitMoves, protectScore)
	pushAidN(k, l, k - 2, l + 1, c, moveTable, iHitMoves, protectScore)
	pushAidN(k, l, k - 2, l - 1, c, moveTable, iHitMoves, protectScore)

	//return canMoveTo

}

function whatsThereN(i, j, table) {
	//var pieceThere = []

	if (i > -1 && j > -1 && i < 8 && j < 8) {

		return table[i][j] //.slice(0,4)
	}

	return false
}

function pushAidN(k, l, x, y, c, table, iHitMoves, protectScore) {

	var isThere = whatsThereN(x, y, table)

	//console.log('runs',isThere)

	if (isThere && isThere[0] != 0) { //van ott vmi

		if (isThere[0] == c) {
			//my piece is there

			protectScore[0]++

				table[x][y][6] = true //protected		//moveit will clear, fastmove not???!!!

		} else {
			//opps piece is there

			iHitMoves.push([k, l, x, y, table[k][l][1], table[x][y][1]]) //[who k,l where to x,y who, hits]

		}

		return true

	};

}

function newCanMove(k, l, c, moveTable, iHitMoves, protectScore) {

	//[who k,l where to x,y who, hits]

	var what = moveTable[k][l][1]

	switch (what) {

		//horseCanMoveN(k, l, moveTable, c,iHitMoves,protectScore)

		case 1:

			pawnCanMoveN(k, l, moveTable, c, iHitMoves, protectScore)

			break;
		case 2:
			bishopCanMoveN(k, l, moveTable, c, iHitMoves, protectScore)

			break;
		case 3:
			horseCanMoveN(k, l, moveTable, c, iHitMoves, protectScore)

			break;
		case 4:
			rookCanMoveN(k, l, moveTable, c, iHitMoves, protectScore)

			break;
		case 5:
			queenCanMoveN(k, l, moveTable, c, iHitMoves, protectScore)

			break;
		case 9:
			kingCanMoveN(k, l, moveTable, c, iHitMoves, protectScore)

			break;

	}

}

function getHitScores(origTable, wNext, flipIt) {

	var iHitCoords = [] //[who k,l where to x,y, who, hits]
	var heHitsCoords = []

	var myprotectScore = [0]
	var hisprotectScore = [0]

	var myAllHit=0
	var hisAllHit=0

	var myBestHit = 0
	var hisBestHit = 0

	var myBestHitCoords = []
		//var hisBestHitCoords=[]

	var c = 1
	var nc = 1
	if (wNext) {
		c++
	} else {
		nc++
	}

	for (var lookI = 0; lookI < 8; lookI++) {
		for (var lookJ = 0; lookJ < 8; lookJ++) { //look through the table

			if (origTable[lookI][lookJ][0] == c) {
				////////found my piece/////////
				////////get all my moves and places i protect

				newCanMove(lookI, lookJ, c, origTable, iHitCoords, myprotectScore) //newCanMove will protect the table
					//and append all my hits to iHitCoords
					//will increase myprotectscore, inaccurate!!!!!!!				
			} else {

				if (origTable[lookI][lookJ][0] != 0) { ////////found opponent's piece/////////												
					newCanMove(lookI, lookJ, nc, origTable, heHitsCoords, hisprotectScore)
				}
			}

		}
	}

	iHitCoords.forEach(function(hitCoords) {
		var thisValue = 0

		if (origTable[hitCoords[2]][hitCoords[3]][6]) { //if field is protected

			thisValue = hitCoords[5] - hitCoords[4] //kivonja amivel lep

		} else {

			thisValue = hitCoords[5] //else normal hitvalue

		}

		if (thisValue > myBestHit) { //remember best

			myBestHit = thisValue

			myBestHitCoords = hitCoords
		}

		myAllHit+=thisValue

	})

	// }

	// if(heHitsCoords==[]){
	// 	//i can't hit
	// 	hisBestHit=0
	// }else{

	heHitsCoords.forEach(function(hitCoords) {

		var thisValue = 0

		if (origTable[hitCoords[2]][hitCoords[3]][6]) { //if cell is protected

			thisValue = hitCoords[5] - hitCoords[4] //kivonja amivel lep

		} else {

			thisValue = hitCoords[5] //normal hitvalue

		}

		if (thisValue > hisBestHit) { //remember best

			hisBestHit = thisValue

		}
	})
	
	var protecScore=myprotectScore[0]-hisprotectScore[0]
	var allhitScore=myAllHit-hisAllHit
	//var bHitScore=myBestHit-hisBestHit
	
	var scndScore=(protecScore+allhitScore/16)/256
	if(flipIt){
		return myBestHit - scndScore - hisBestHit / 16	
	}else{
		return myBestHit + scndScore - hisBestHit / 16
	}
	//return myBestHit - hisBestHit / 16 //+(myAllHit-hisAllHit-hisBestHit*128+myprotectScore-hisprotectScore)/8192//-(hisBestHit/16)+(myprotectScore[0]-(hisprotectScore[0]+hisAllHit)/16+myAllHit)/256//,myBestHitCoords] //, hisTempPieces, rtnMyHitSum[0], rtnHisHitSum[0], rtnMyMovesCount] 

}