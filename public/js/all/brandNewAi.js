//var hitSum = 0
var escConst = 1
var fadeConst = 1
var level = 1
var whatHitsConst = 1
var hitValueConst = 0.5
	//var t1const = 1
var t2const = 0.0025
var dontHitConst = 0.8

function dbAi(dbTable) {

	var retMove = newAi(dbTable)

	var moveStr = ""
	if (retMove.length > 1) moveStr = retMove[1].move


	dbTable = moveInTable(moveStr, dbTable)


	return dbTable




}
///

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


function noc(colr) {
	if (colr = 1) {
		return 2
	} else {
		return 1
	}
}


function moveArrayToStrings(moveArray, ftable, fwNext) {
	var strArray = []
	moveArray.forEach(function(thisMove) {
		strArray.push(dletters[thisMove[0]] + (thisMove[1] + 1) + dletters[thisMove[2]] + (1 + thisMove[3]))

	})

	return strArray

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

}




function canIMove(winTable, winColor) {
	var winRetMoves = []
		
	getAllMoves(winTable, winColor)
		.forEach(function(thisMove) { //get all his moves in array of strings
			winRetMoves.push(dletters[thisMove[0]] + (thisMove[1] + 1) + dletters[thisMove[2]] + (1 + thisMove[3]))
				
		})
		
	for (var i = winRetMoves.length - 1; i >= 0; i--) { //sakkba 
		if (captured(moveIt(winRetMoves[i], winTable), winColor)) { //sakkba lepne valaszkent	//moveit retmove ittis ottis
			
			winRetMoves.splice(i, 1)
			
		}
	}
	if (winRetMoves.length > 0) {
		return true
	} else {
		return false
	}
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
//             //////////////console.log('nem loopolhatok')
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
//         ////////////console.log(counted)
//         if (counted > 1) {
//             //3szorra lepnenk ugyanabba a statuszba
//             //ideiglenesen ne
//             ////// //////////////console.log ('i could 3fold '+counted)

//             //////////////console.log('counted >1')

//             if (dontLoop) {

//                 loopedValue -= 2000

//                 //////////////console.log('dontloop: -2000')

//             }



//             if (counted > 3) {
//                 //surely looped

//                 ////////////console.log(counted > 3, counted)

//                 looped = true

//             }

//         } else {
//             // //// //////////////console.log (counted)
//             // //// //////////////console.log(thisTState)
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
//                             //////////////console.log('temprettable:   loopedValue-=11000')
//                     } else {
//                         forceLoopValue += 0.5

//                         //////////////console.log('temprettable:   forceLoopValue+=0.5')	
//                     }

//                     looped = true
//                         ////// //////////////console.log('he could 3fold')
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
//                     ////// //////////////console.log('2 lepesbol mattolhatok')
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

//         ////// //////////////console.log(modType)
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
//     //////////////console.log('old ai func called!!!!!')
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
	var solvedMoves = mtProcessDeepSplitMoves(aiTable.movesToSend, thinker, modType, modConst, looped) //processSplitMoves(aiTable.movesToSend, thinker, modType, modConst, looped)

	////////////////console.log(solvedMoves)

	solvedMoves.sort(moveSorter)



	solvedMoves.unshift([true, true, new Date()
		.getTime() - started
	])

	if (looped) solvedMoves[0][6] = true //looped

	return solvedMoves

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
	//// //////////////console.log('MOVE SCORE    first    second')
	ai(table, wp)
		.forEach(function(thisline) {
			//// //////////////console.log(thisline[0] + ' ' + thisline[1] + '  =  ' + thisline[2] + '  +  ' + thisline[3])
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
			//////////////console.log('nem loopolhatok')
	}



	//var d


	////////////////console.log(cfMoveCoords,cfTable)


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

		////////////////console.log ('i could 3fold '+counted)



		if (dontLoop) {
			loopedValue -= 1000

			//////////////console.log(' loopedValue-=1000')
		}



		if (counted > 3) {
			//surely looped
			looped = true

		}

	} else {
		// //////////////console.log (counted)
		// //////////////console.log(thisTState)
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
					////////////////console.log('he could 3fold')
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
			//////////////console.log('modType == undefined')
			break;

		case "lpV":

			loopValue *= modConst
				//////////////console.log('lpV modded: '+modConst)
			break;

		case "cpS":

			captureScore *= modConst
				//////////////console.log('cpS modded: '+modConst)
			break;

		case "tt2":

			tTable2Value *= modConst
				//////////////console.log('tt2 modded: '+modConst)
			break;

		case "sVS":

			smallValScore *= modConst
				//////////////console.log('sVS modded: '+modConst)
			break;


		case "dGH":

			dontGetHit *= modConst
				//////////////console.log('dGH modded: '+modConst)
			break;


		case "rPr":

			retProtect *= modConst
				//////////////console.log('rPr modded: '+modConst)
			break;


		case "mHt":

			mhit *= modConst
				//////////////console.log('mHt modded: '+modConst)
			break;


		case "hHt":

			hhit *= modConst
				//////////////console.log('hHt modded: '+modConst)
			break;

		case "mMv":

			mostMoved *= modConst
				//////////////console.log('mMv modded: '+modConst)
			break;

		case "pHB":

			pushHimBack *= modConst
				//////////////console.log('pHB modded: '+modConst)
			break;

		case "gTM":

			getToMiddle *= modConst
				//////////////console.log('gTM modded: '+modConst)
			break;

		case "fwV":

			fwdVal *= modConst
				//////////////console.log('fwV modded: '+modConst)
			break;

		case "scV":

			lsancValue *= modConst
			rsancValue *= modConst
			sancValue *= modConst
				//////////////console.log('scV modded: '+modConst)
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


// ////////////////////////////temp speedtest///////////////////////
// function speedTest(depth, passToWorkers) {
// 	////////////console.log(1,depth)
// 	var started = new Date()
// 		.getTime()

// 	var solvedTableCount = 0

// 	var values = []
// 	var dbTable = new Dbtable(1, 2, 3)

// 	dbTable.desiredDepth = depth
// 		////////////console.log(2,dbTable.desiredDepth)
// 	var aiTable = new MoveTask(dbTable); //level 3 deepening on new table
// 	////////////console.log(3,aiTable.desiredDepth)
// 	var tds = [];
// 	var tds2 = [];
// 	aiTable.movesToSend.forEach(function(step) {
// 		tds.push(step)
// 	});
// 	tds.forEach(function(a) {
// 		tds2.push(new DeepeningTask(a))
// 	});
// 	var tempCommand = 'a'
// 	tds2.forEach(function(a) {
// 		//////////////console.log(a)
// 		var thisMoveValue = 0
// 		var totals = solveDeepeningTask(a, tempCommand, thisMoveValue)
// 		solvedTableCount += totals.solved

// 		values.push({
// 			move: a.moveStr,
// 			//loopValue: totals.value
// 		})
// 	});

// 	values.sort(function(a, b) {
// 		if (a.loopValue > b.loopValue) {
// 			return 1
// 		} else {
// 			return -1
// 		}
// 	})

// 	return {
// 		timeItTook: new Date().getTime() - started, //timeItTook
// 		solved: solvedTableCount,
// 		values: values,
// 		winningMove: values[0].move,
// 		winningValue: values[0].loopValue
// 	}
// 	////////////////////////////temp speedtest end///////////////////////
// }





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