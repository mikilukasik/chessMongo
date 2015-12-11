function pawnCanMoveN(k, l, moveTable, protectedArray, c, iHitMoves, protectScore) {

	if (c == 2) { //white pawn

		pushAidN(k, l, k + 1, l + 1, c, moveTable, protectedArray, iHitMoves, protectScore)
		pushAidN(k, l, k - 1, l + 1, c, moveTable, protectedArray, iHitMoves, protectScore)

	} else { //black pawn

		pushAidN(k, l, k + 1, l - 1, c, moveTable, protectedArray, iHitMoves, protectScore)
		pushAidN(k, l, k - 1, l - 1, c, moveTable, protectedArray, iHitMoves, protectScore)

	}

}

function rookCanMoveN(k, l, moveTable, protectedArray, c, iHitMoves, protectScore) {
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

			if (pushAidN(k, l, k + moveCount, l, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[0] = false

			//pushAidN( canMoveTo, k + moveCount, l, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k + moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k + moveCount, l, moveTable)[0] == nc) {
			// 	goFurther[0] = false
			// }
		}
		if (goFurther[1]) {

			if (pushAidN(k, l, k - moveCount, l, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[1] = false

			// pushAidN( canMoveTo, k - moveCount, l, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k - moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k - moveCount, l, moveTable)[0] == nc) {
			// 	goFurther[1] = false
			// }
		}
		if (goFurther[2]) {

			if (pushAidN(k, l, k, l + moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[2] = false

			// pushAidN( canMoveTo, k, l + moveCount, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k, l + moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l + moveCount, moveTable)[0] == nc) {
			// 	goFurther[2] = false
			// }
		}
		if (goFurther[3]) {

			if (pushAidN(k, l, k, l - moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[3] = false

			// pushAidN( canMoveTo, k, l - moveCount, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k, l - moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l - moveCount, moveTable)[0] == nc) {
			// 	goFurther[3] = false
			// }
		}
	}
	//return canMoveTo
}

function bishopCanMoveN(k, l, moveTable, protectedArray, c, iHitMoves, protectScore) {
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

			if (pushAidN(k, l, k + moveCount, l + moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[0] = false

			//pushAidN( canMoveTo, k + moveCount, l, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k + moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k + moveCount, l, moveTable)[0] == nc) {
			// 	goFurther[0] = false
			// }
		}
		if (goFurther[1]) {

			if (pushAidN(k, l, k - moveCount, l - moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[1] = false

			// pushAidN( canMoveTo, k - moveCount, l, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k - moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k - moveCount, l, moveTable)[0] == nc) {
			// 	goFurther[1] = false
			// }
		}
		if (goFurther[2]) {

			if (pushAidN(k, l, k - moveCount, l + moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[2] = false

			// pushAidN( canMoveTo, k, l + moveCount, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k, l + moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l + moveCount, moveTable)[0] == nc) {
			// 	goFurther[2] = false
			// }
		}
		if (goFurther[3]) {

			if (pushAidN(k, l, k + moveCount, l - moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[3] = false

			// pushAidN( canMoveTo, k, l - moveCount, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k, l - moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l - moveCount, moveTable)[0] == nc) {
			// 	goFurther[3] = false
			// }
		}
	}
	//return canMoveTo
}

function queenCanMoveN(k, l, moveTable, protectedArray, c, iHitMoves, protectScore) {
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

			if (pushAidN(k, l, k + moveCount, l, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[0] = false

			//pushAidN( canMoveTo, k + moveCount, l, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k + moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k + moveCount, l, moveTable)[0] == nc) {
			// 	goFurther[0] = false
			// }
		}
		if (goFurther[1]) {

			if (pushAidN(k, l, k - moveCount, l, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[1] = false

			// pushAidN( canMoveTo, k - moveCount, l, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k - moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k - moveCount, l, moveTable)[0] == nc) {
			// 	goFurther[1] = false
			// }
		}
		if (goFurther[2]) {

			if (pushAidN(k, l, k, l + moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[2] = false

			// pushAidN( canMoveTo, k, l + moveCount, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k, l + moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l + moveCount, moveTable)[0] == nc) {
			// 	goFurther[2] = false
			// }
		}
		if (goFurther[3]) {

			if (pushAidN(k, l, k, l - moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[3] = false

			// pushAidN( canMoveTo, k, l - moveCount, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k, l - moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l - moveCount, moveTable)[0] == nc) {
			// 	goFurther[3] = false
			// }
		}

		if (goFurther[4]) {

			if (pushAidN(k, l, k + moveCount, l + moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[4] = false

			//pushAidN( canMoveTo, k + moveCount, l, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k + moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k + moveCount, l, moveTable)[0] == nc) {
			// 	goFurther[0] = false
			// }
		}
		if (goFurther[5]) {

			if (pushAidN(k, l, k - moveCount, l - moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[5] = false

			// pushAidN( canMoveTo, k - moveCount, l, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k - moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k - moveCount, l, moveTable)[0] == nc) {
			// 	goFurther[1] = false
			// }
		}
		if (goFurther[6]) {

			if (pushAidN(k, l, k - moveCount, l + moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[6] = false

			// pushAidN( canMoveTo, k, l + moveCount, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k, l + moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l + moveCount, moveTable)[0] == nc) {
			// 	goFurther[2] = false
			// }
		}
		if (goFurther[7]) {

			if (pushAidN(k, l, k + moveCount, l - moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[7] = false

			// pushAidN( canMoveTo, k, l - moveCount, 0, 0, moveTable)
			// if (pushAidN( canMoveTo, k, l - moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l - moveCount, moveTable)[0] == nc) {
			// 	goFurther[3] = false
			// }
		}
	}
	//return canMoveTo
}

function kingCanMoveN(k, l, moveTable, protectedArray, c, iHitMoves, protectScore) {
	//horseCanMoveN(k, l, moveTable, c,iHitMoves,protectScore)
	//pushAidN( k,l, k + 1, l + 2,c, moveTable, protectedArray, iHitMoves, protectScore)

	// var canMoveTo = []

	// if (isWhite) {
	// 	var c = 1
	// 	var nc = 2
	// } else {
	// 	var c = 2
	// 	var nc = 1
	// }

	//moveCount = 1

	pushAidN(k, l, k + 1, l, c, moveTable, protectedArray, iHitMoves, protectScore)
	pushAidN(k, l, k - 1, l, c, moveTable, protectedArray, iHitMoves, protectScore)
	pushAidN(k, l, k + 1, l + 1, c, moveTable, protectedArray, iHitMoves, protectScore)
	pushAidN(k, l, k - 1, l + 1, c, moveTable, protectedArray, iHitMoves, protectScore)
	pushAidN(k, l, k + 1, l - 1, c, moveTable, protectedArray, iHitMoves, protectScore)
	pushAidN(k, l, k - 1, l - 1, c, moveTable, protectedArray, iHitMoves, protectScore)
	pushAidN(k, l, k, l + 1, c, moveTable, protectedArray, iHitMoves, protectScore)
	pushAidN(k, l, k, l - 1, c, moveTable, protectedArray, iHitMoves, protectScore)

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

function horseCanMoveN(k, l, moveTable, protectedArray, c, iHitMoves, protectScore) {

	// pushAidN( canMoveTo, k + 1, l + 2, 0, 0, moveTable)
	// pushAidN( canMoveTo, k + 1, l - 2, 0, 0, moveTable)
	// pushAidN( canMoveTo, k - 1, l + 2, 0, 0, moveTable)
	// pushAidN( canMoveTo, k - 1, l - 2, 0, 0, moveTable)

	// pushAidN( canMoveTo, k + 2, l + 1, 0, 0, moveTable)
	// pushAidN( canMoveTo, k + 2, l - 1, 0, 0, moveTable)
	// pushAidN( canMoveTo, k - 2, l + 1, 0, 0, moveTable)
	// pushAidN( canMoveTo, k - 2, l - 1, 0, 0, moveTable)

	pushAidN(k, l, k + 1, l + 2, c, moveTable, protectedArray, iHitMoves, protectScore)
	pushAidN(k, l, k + 1, l - 2, c, moveTable, protectedArray, iHitMoves, protectScore)
	pushAidN(k, l, k - 1, l + 2, c, moveTable, protectedArray, iHitMoves, protectScore)
	pushAidN(k, l, k - 1, l - 2, c, moveTable, protectedArray, iHitMoves, protectScore)

	pushAidN(k, l, k + 2, l + 1, c, moveTable, protectedArray, iHitMoves, protectScore)
	pushAidN(k, l, k + 2, l - 1, c, moveTable, protectedArray, iHitMoves, protectScore)
	pushAidN(k, l, k - 2, l + 1, c, moveTable, protectedArray, iHitMoves, protectScore)
	pushAidN(k, l, k - 2, l - 1, c, moveTable, protectedArray, iHitMoves, protectScore)

	//return canMoveTo

}

function whatsThereN(i, j, table) {
	//var pieceThere = []

	if (i > -1 && j > -1 && i < 8 && j < 8) {

		return table[i][j] //.slice(0,4)
	}

	return false
}

function pushAidN(k, l, x, y, c, table, protectedArray, iHitMoves, protectScore) {

	var isThere = whatsThereN(x, y, table)

	//console.log('runs',isThere)

	if (isThere && isThere[0] != 0) { //van ott vmi

		if (isThere[0] == c) {
			//my piece is there

			protectScore[0]++

				protectedArray[(8*x)+y] = true //protected		//moveit will clear, fastmove not???!!!

		} else {
			//opps piece is there
			
			iHitMoves[0]++
			
			//iHitMoves[iHitMoves[0]]=(k<<24)+(l<<20)+(x<<16)+(y<<12)+(table[k][l][1]<<8)+(table[x][y][1]<<4)
			
			iHitMoves[iHitMoves[0]]=k//([k, l, x, y, table[k][l][1], table[x][y][1]]) //[who k,l where to x,y who, hits]
			
			iHitMoves[0]++
			iHitMoves[iHitMoves[0]]=l
			
			iHitMoves[0]++
			iHitMoves[iHitMoves[0]]=x
			
			iHitMoves[0]++
			iHitMoves[iHitMoves[0]]=y
			
			iHitMoves[0]++
			iHitMoves[iHitMoves[0]]=table[k][l][1]
			
			iHitMoves[0]++
			iHitMoves[iHitMoves[0]]=table[x][y][1]
			

			// iHitMoves.push(
			// 	new Uint8Array([k, l, x, y, table[k][l][1], table[x][y][1]])
			// ) //[who k,l where to x,y who, hits]

		}

		return true

	};

}

function newCanMove(k, l, c, moveTable, protectedArray, iHitMoves, protectScore) {

	//[who k,l where to x,y who, hits]

	var what = moveTable[k][l][1]

	switch (what) {

		//horseCanMoveN(k, l, moveTable, c,iHitMoves,protectScore)

		case 1:

			pawnCanMoveN(k, l, moveTable, protectedArray, c, iHitMoves, protectScore)

			break;
		case 2:
			bishopCanMoveN(k, l, moveTable, protectedArray, c, iHitMoves, protectScore)

			break;
		case 3:
			horseCanMoveN(k, l, moveTable, protectedArray, c, iHitMoves, protectScore)

			break;
		case 4:
			rookCanMoveN(k, l, moveTable, protectedArray, c, iHitMoves, protectScore)

			break;
		case 5:
			queenCanMoveN(k, l, moveTable, protectedArray, c, iHitMoves, protectScore)

			break;
		case 9:
			kingCanMoveN(k, l, moveTable, protectedArray, c, iHitMoves, protectScore)

			break;

	}

}

function getHitScores(origTable, wNext, flipIt) {

	var iHitCoords = new Int8Array(128)  //[] //[who k,l where to x,y, who, hits]
	var heHitsCoords = new Int8Array(128)//[]
	
	// iHitCoords[0]=1
	// heHitsCoords[0]=1

	var myprotectScore = new Uint8Array(1)//[0]
	var hisprotectScore = new Uint8Array(1)//[0]

	var myAllHit=new Uint8Array(1)
	var hisAllHit=new Uint8Array(1)

	var myBestHit = new Uint8Array(1)
	var hisBestHit = new Uint8Array(1)

	var myBestHitCoords = []
		//var hisBestHit[0]Coords=[]

	var protectedArray=	new Uint8Array(64)
		
	
	

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

					newCanMove(lookI, lookJ, c, origTable, protectedArray, iHitCoords, myprotectScore) //newCanMove will protect the table
					//and append all my hits to iHitCoords
					//will increase myprotectscore, inaccurately!!!!!!!				
			} else {

				if (origTable[lookI][lookJ][0] != 0) { ////////found opponent's piece/////////												
					newCanMove(lookI, lookJ, nc, origTable, protectedArray, heHitsCoords, hisprotectScore)
				}
			}

		}
	}
	
	for(var i=  ( iHitCoords[0]+1)/6   ;i>0;i--)
	
	
	
	//iHitCoords.forEach(function(hitCoords) 
	{
		
		var thisArray=new Int8Array(6)
		
		
		thisArray[5]=iHitCoords[iHitCoords[0]]
		//iHitCoords[0]--
		
		thisArray[4]=iHitCoords[iHitCoords[0]-1]
		//iHitCoords[0]--
		
		thisArray[3]=iHitCoords[iHitCoords[0]-2]
		//iHitCoords[0]--
		
		thisArray[2]=iHitCoords[iHitCoords[0]-3]
		//iHitCoords[0]--
		
		thisArray[1]=iHitCoords[iHitCoords[0]-4]
		//iHitCoords[0]--
		
		thisArray[0]=iHitCoords[iHitCoords[0]-5]
		iHitCoords[0]-=6
		
		
		
		
		var thisValue = 0

		if (protectedArray[(8*thisArray[2])+thisArray[3]]) { //if field is protected

			thisValue = thisArray[5] - thisArray[4] //kivonja amivel lep

		} else {

			thisValue = thisArray[5] //else normal hitvalue

		}

		if (thisValue > myBestHit[0]) { //remember best

			myBestHit[0] = thisValue

			myBestHitCoords = thisArray
		}

		myAllHit[0]+=thisValue

	}

	// }

	// if(heHitsCoords==[]){
	// 	//i can't hit
	// 	hisBestHit[0]=0
	// }else{
	
	//for(var i=heHitsCoords[0];i>0;i--)
	for(var i=  ( heHitsCoords[0]+1)/6   ;i>0;i--)
	
	
	//heHitsCoords.forEach(function(iHitCoords[i]) 
	
	{
		
		
		var thisArray=new Int8Array(6)
		
		
		thisArray[5]=heHitsCoords[heHitsCoords[0]]
		//heHitsCoords[0]--
		
		thisArray[4]=heHitsCoords[heHitsCoords[0]-1]
		//heHitsCoords[0]--
		
		thisArray[3]=heHitsCoords[heHitsCoords[0]-2]
		//heHitsCoords[0]--
		
		thisArray[2]=heHitsCoords[heHitsCoords[0]-3]
		//heHitsCoords[0]--
		
		thisArray[1]=heHitsCoords[heHitsCoords[0]-4]
		//heHitsCoords[0]--
		
		thisArray[0]=heHitsCoords[heHitsCoords[0]-5]
		heHitsCoords[0]-=6
		
	
	
	
	
	

		var thisValue = 0

		if (protectedArray[(8*thisArray[2])+thisArray[3]]) { //if cell is protected

			thisValue = thisArray[5] - thisArray[4] //kivonja amivel lep

		} else {

			thisValue = thisArray[5] //normal hitvalue

		}

		if (thisValue > hisBestHit[0]) { //remember best

			hisBestHit[0] = thisValue

		}
	}
	
	var protecScore=myprotectScore[0]-hisprotectScore[0]
	var allhitScore=myAllHit[0]-hisAllHit[0]
	//var bHitScore=myBestHit[0]-hisBestHit[0]
	
	var result = new Int32Array(1)
	
	result[0] = (myBestHit[0] * 65536) - (hisBestHit[0] * 4096)
	
	//var scndScore=protecScore*16+allhitScore
	
	
	if(flipIt){
		result[0]-=   (protecScore << 8) + (allhitScore << 4)
	}else{
		result[0]+=   (protecScore << 8) + (allhitScore << 4)
	}
	//return myBestHit[0] - hisBestHit[0] / 16 //+(myAllHit[0]-hisAllHit[0]-hisBestHit[0]*128+myprotectScore-hisprotectScore)/8192//-(hisBestHit[0]/16)+(myprotectScore[0]-(hisprotectScore[0]+hisAllHit[0])/16+myAllHit[0])/256//,myBestHitCoords] //, hisTempPieces, rtnMyHitSum[0], rtnHisHitSum[0], rtnMyMovesCount] 

	return result // 65536

}