/////////////general////////////////////// 
var objectToString = function(obj) {
  var cache = [];
  return JSON.stringify(obj, function(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  })
}

///////////////////evalgame////////////////
var evalFuncs = {
  getPieceValues: function(dbTable) {

    var result = {
      wVal: 0,
      bVal: 0
    }

    var table = dbTable.table

    table.forEach(function(x) {
      x.forEach(function(y) {
        switch (y[0]) {
          case 1:

            result.bVal += y[1]

            break;

          case 2:

            result.wVal += y[1]

            break;

          default:
            break;
        }
      })
    })

    return result

  },

  shouldIDraw: function(dbTable) {
    var pieceVals = this.getPieceValues(dbTable)

    if (dbTable.wNext) {
      if (pieceVals.wVal < pieceVals.bVal) return true
    } else {
      if (pieceVals.wVal > pieceVals.bVal) return true
    }

    return false
  },

  checkIfLooped: function(newTable, allPastTables) {

    var seenCount = 0
    var thisState = createState(newTable)

    //console.log('-------------thisState',thisState)  

    allPastTables.forEach(function(pastTable) {

      //console.log('pastTable',pastTable)  

      if (pastTable === thisState) seenCount++
    })

    //console.log('seenCount',seenCount)

    return seenCount

  },
}

function checkIfFinished(dbTable) {

  var result = {
    goOn: true,
    result: {}

  }

  if (!canIMove(dbTable.table, dbTable.wNext)) {

    result.goOn = false

    dbTable.gameIsOn = false
    dbTable.result = {

      blackWon: false,
      whiteWon: false,
      isDraw: false,

      whiteValue: 0,
      blackValue: 0,

      totalMoves: 0,
      moveLog: dbTable.moves,

      _id: dbTable._id

    }

    if (captured(dbTable.table, dbTable.wNext)) {

      if (dbTable.wNext) {

        dbTable.result.blackWon = true

      } else {
        dbTable.result.whiteWon = true

      }

    } else {
      dbTable.result.isDraw = true
    }

    var pieceVals = evalFuncs.getPieceValues(dbTable)

    dbTable.result.whiteValue = pieceVals.wVal
    dbTable.result.blackValue = pieceVals.bVal

    dbTable.result.totalMoves = dbTable.moveCount

  }

  result.result = dbTable.result

  return result

}

/////////////////////// from old ai //////////////////////////

function getMcFromMv(modVal) {

  var modConst = 1

  if (modVal <= 50) {
    modConst = modVal / 50
  } else {
    modConst = 50 / (100 - modVal)
  }
  modConst = Math.pow(modConst, 3)

  return modConst

}

function getMvFromMc(modConst) {

  modConst = Math.pow(modConst, 1 / 3)

  var modVal = 0

  if (modConst <= 1) {
    modVal = modConst * 50
  } else {
    modVal = 100 - 50 / modConst
  }

  return modVal

}

var dletters = ["a", "b", "c", "d", "e", "f", "g", "h"]

function addMovesToTable(originalTable, whiteNext, dontClearInvalid, returnMoveStrings) {

  //rewrite this to use getTableData to find my pieces, don't copy the array just change the original

  var myCol = 1;
  if (whiteNext) myCol++ //myCol is 2 when white

    var tableWithMoves = new Array(8)
  for (var i = 0; i < 8; i++) {
    tableWithMoves[i] = new Array(8)
    for (var j = 0; j < 8; j++) {
      tableWithMoves[i][j] = originalTable[i][j].slice() //[]

      if (originalTable[i][j][0] === myCol) {
        var returnMoveCoords = []
        tableWithMoves[i][j][5] = canMove(i, j, whiteNext, originalTable, undefined, undefined, undefined, dontClearInvalid, returnMoveStrings) //:  canMove(k, l, isWhite, moveTable, speedy, dontProt, hitSumm, dontRemoveInvalid) { //, speedy) {
      } else {
        tableWithMoves[i][j][5] === []
      }
    }
  }

  return tableWithMoves

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

  if (oppKingPos === undefined) oppKingPos = whereIsTheKing(origTable, !isWhite)

  var origColor = 1
  if (isWhite) origColor = 2

  if (isWhite && origTable[4][0][3]) { //we play with white and have not moved the king yet

    var sancolhat = false

    if (origTable[0][0][3]) {
      lSancVal += 3 //unmoved rook worth more than moved
      sancolhat = true

      if (origTable[3][0][0] === 0) lSancVal += 1 //trying to empty between
      if (origTable[2][0][0] === 0) lSancVal += 3
      if (origTable[1][0][0] === 0) lSancVal += 1

      if (origTable[2][1][0] === 2) { //trying to keep my pieces  there to cover
        lSancVal += 1
        if (origTable[2][1][1] === 1) lSancVal += 4
      }
      if (origTable[1][1][0] === 2) { //trying to keep my pieces  there to cover
        lSancVal += 1
        if (origTable[1][1][1] === 1) lSancVal += 4
      }
      if (origTable[0][1][0] === 2) { //trying to keep my pieces  there to cover
        lSancVal += 1
        if (origTable[0][1][1] === 1) lSancVal += 4
      }

    }

    if (origTable[7][0][3]) {
      sancolhat = true
      rSancVal += 3

      if (origTable[6][0][0] === 0) rSancVal += 1
      if (origTable[5][0][0] === 0) rSancVal += 3

      if (origTable[7][1][0] === 2) { //trying to keep my pieces  there to cover
        rSancVal += 1
        if (origTable[7][1][1] === 1) rSancVal += 4
      }
      if (origTable[6][1][0] === 2) { //trying to keep my pieces  there to cover
        rSancVal += 1
        if (origTable[6][1][1] === 1) rSancVal += 4
      }
      if (origTable[5][1][0] === 2) { //trying to keep my pieces  there to cover
        rSancVal += 1
        if (origTable[5][1][1] === 1) rSancVal += 4
      }

    }

    if (sancolhat) {
      if (origTable[3][1][1] === 1 && origTable[3][1][0] === 2) lSancVal -= 6 //try to move d2 or e2 first
      if (origTable[4][1][1] === 1 && origTable[4][1][0] === 2) rSancVal -= 6

      if (origTable[2][0][1] === 2 && origTable[2][0][0] === 2) lSancVal -= 6 //try to move out bishops
      if (origTable[5][0][1] === 2 && origTable[5][0][0] === 2) rSancVal -= 6
    }

  }

  if (!isWhite && origTable[4][7][3]) { //we play with black and have not moved the king yet
    var sancolhat = false

    if (origTable[0][7][3]) {
      sancolhat = true
      lSancVal += 3 //unmoved rook worth more than moved

      if (origTable[3][7][0] === 0) lSancVal += 1
      if (origTable[2][7][0] === 0) lSancVal += 3
      if (origTable[1][7][0] === 0) lSancVal += 1

      if (origTable[2][6][0] === 1) { //trying to keep my pieces  there to cover
        lSancVal += 1
        if (origTable[2][6][1] === 1) lSancVal += 4
      }
      if (origTable[1][6][0] === 1) { //trying to keep my pieces  there to cover
        lSancVal += 1
        if (origTable[1][6][1] === 1) lSancVal += 4
      }
      if (origTable[0][6][0] === 1) { //trying to keep my pieces  there to cover
        lSancVal += 1
        if (origTable[0][6][1] === 1) lSancVal += 4
      }
    }

    if (origTable[7][7][3]) {
      sancolhat = true
      rSancVal += 3

      if (origTable[6][7][0] === 0) rSancVal += 1
      if (origTable[5][7][0] === 0) rSancVal += 3

      if (origTable[7][6][0] === 1) { //trying to keep my pieces  there to cover
        rSancVal += 1
        if (origTable[7][6][1] === 1) rSancVal += 4
      }
      if (origTable[6][6][0] === 1) { //trying to keep my pieces  there to cover
        rSancVal += 1
        if (origTable[6][6][1] === 1) rSancVal += 4
      }
      if (origTable[5][6][0] === 1) { //trying to keep my pieces  there to cover
        rSancVal += 1
        if (origTable[5][6][1] === 1) rSancVal += 4
      }

    }
    //	
    if (sancolhat) {
      if (origTable[3][6][1] === 1 && origTable[3][6][0] === 1) lSancVal -= 4
      if (origTable[4][6][1] === 1 && origTable[4][6][0] === 1) rSancVal -= 4

      if (origTable[2][7][1] === 2 && origTable[2][7][0] === 1) lSancVal -= 4
      if (origTable[5][7][1] === 2 && origTable[5][7][0] === 1) rSancVal -= 4

      // if(){

      // }
    }

  }
  var myMostMoved = 0

  var getToMiddle = 0
  for (var lookI = 0; lookI < 8; lookI++) { //
    for (var lookJ = 0; lookJ < 8; lookJ++) { //look through the table

      if (origTable[lookI][lookJ][0] === origColor) { //ha sajat babum

        //rtnMyHitSum = [0]

        //below:	minnel nagyobb erteku babum minnel kozelebb az ellenfel kiralyahoz

        rtnApproachTheKing += ((7 - Math.abs(oppKingPos[0] - lookI)) + (7 - Math.abs(oppKingPos[1] - lookJ))) * origTable[lookI][lookJ][1]

        // if ((!(origTable[lookI][lookJ][1] === 1)) && lookI > 1 && lookJ > 1 && lookI < 6 && lookJ < 6) { //ha nem paraszt es kozepen van a babu
        //     getToMiddle++
        // }

        canMove(lookI, lookJ, isWhite, origTable, true, true, rtnMyHitSum) //this can give back the moves, should use it
        if (origTable[lookI][lookJ][2] > myMostMoved) myMostMoved = origTable[lookI][lookJ][2] //get the highest number any piece moved

        if (isWhite) {
          rtnPushHimBack += lookJ
        } else {
          rtnPushHimBack += 7 - lookJ
        }

        tableValue += origTable[lookI][lookJ][1]

      } else {

        if (!(origTable[lookI][lookJ][0] === 0)) { //ha ellenfele

          rtnHisMoveCount += (canMove(lookI, lookJ, !isWhite, origTable, true, true, rtnHisHitSum)
            .length - 2)
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

  //////////////console.log(rtnApproachTheKing)

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

      if (origTable[lookI][lookJ][0] === origColor) { //ha sajat babum

        myTempPieces.push([lookI, lookJ, origTable[lookI][lookJ][1]]) //itt kene szamitott erteket is adni a babuknak 

      }

    }
  }

  return [0, myTempPieces] //, hisTempPieces, rtnMyHitSum[0], rtnHisHitSum[0], rtnMyMovesCount] //returnArray // elso elem az osszes babu ertekenek osszge, aztan babkuk

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

  return thisArray

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
    if (originalTable[thisMoveCoords[2]][thisMoveCoords[3]][0] === myCol) { //if i have sg there
      originalTable[thisMoveCoords[2]][thisMoveCoords[3]][6] = true //that must be protected

      if (originalTable[thisMoveCoords[0]][thisMoveCoords[1]][1] === 9) {
        protectedSum += (9 - originalTable[thisMoveCoords[2]][thisMoveCoords[3]][1]) * 2 //king protects double

      } else {

        protectedSum += 9 - originalTable[thisMoveCoords[2]][thisMoveCoords[3]][1]
      }

    }
  })

  return protectedSum

}

function protectTable(table, myCol) {
  return protectPieces(table, myCol) - protectPieces(table, !myCol)

}

function whereIsTheKing(table, wn) {

  var myCol = 1;
  if (wn) myCol++ //myCol is 2 when white

    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        if (table[i][j][1] === 9 && table[i][j][0] === myCol) {
          //itt a kiraly
          return [i, j]
        }
      }
    }

}

function canMove(k, l, isWhite, moveTable, speedy, dontProt, hitSumm, dontRemoveInvalid, returnMoveStrings) { //, speedy) {

  if (typeof(hitSumm) === 'undefined') var hitSumm = [0]
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

  if (returnMoveStrings !== undefined) { //and not undefined..
    possibleMoves.forEach(function(move) {
      returnMoveStrings.push(coordsToMoveString(k, l, move[0], move[1]))
    })

  }

  if (!speedy) { //     lefut.
    for (var i = possibleMoves.length - 1; i >= 0; i--) { //sakkba nem lephetunk
      if (captured(moveIt(coordsToMoveString(k, l, possibleMoves[i][0], possibleMoves[i][1]), moveTable, dontProt), isWhite)) { //sakkba lepnenk
        possibleMoves.splice(i, 1)

      }
    }

    if (what === 9 && moveTable[k][l][3]) { //lesznek sanc lepesek is a possibleMoves tombben: kiraly nem mozdult meg

      if (captured(moveTable, isWhite)) { // de sakkban allunk
        for (var spliceCount = possibleMoves.length - 1; spliceCount >= 0; spliceCount--) {
          if (possibleMoves[spliceCount][1] === l && (possibleMoves[spliceCount][0] === k - 2 || possibleMoves[spliceCount][0] === k + 2)) {
            possibleMoves.splice(spliceCount, 1) //remove
          }
        }

      }

      // remove the sakkot atugrani sem er sanc

      var removeKmin2 = true //alapbol leszedne
      var removeKplus2 = true

      for (var i = possibleMoves.length - 1; i >= 0; i--) { //
        if (possibleMoves[i][1] === l && possibleMoves[i][0] === k - 1) removeKmin2 = false //de ha van koztes lepes, ne szedd le
        if (possibleMoves[i][1] === l && possibleMoves[i][0] === k + 1) removeKplus2 = false
      }

      for (var i = possibleMoves.length - 1; i >= 0; i--) { //itt szedi le a sanclepeseket
        if (possibleMoves[i][1] === l &&
          ((possibleMoves[i][0] === k - 2 && removeKmin2) ||
            (possibleMoves[i][0] === k + 2 && removeKplus2))) {

          possibleMoves.splice(i, 1)

        }

      }
    }
  }

  return possibleMoves

}

function whatsThere(i, j, aiTable) {
  //var pieceThere = []

  if (i > -1 && j > -1 && i < 8 && j < 8) {

    return aiTable[i][j] //.slice(0,4)
  }

  return []
}

function pushAid(hitSummmm, canMoveTo, x, y, hanyadik, milegyen, fromTable, someboolean, whatHits) {

  if (whatsThere(x, y, fromTable)[hanyadik] === milegyen) {

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

    if (!(hitSummmm === undefined)) { //aiming for the best only? why?
      if (hitSummmm[0] < thisHit) hitSummmm[0] = thisHit
    }

    return true

  };
  return false
}

function pawnCanMove(k, l, isWhite, moveTable, hitSummm) {
  var canMoveTo = []
    //var hitIt=false
  if ((!isWhite && moveTable[k][l][0] === 1) || (isWhite && moveTable[k][l][0] === 2)) {
    var c = 2
    var nc = 1
  } else {
    var c = 1
    var nc = 2
  }
  //if(aiCalled){

  if (moveTable[k][l][0] === 2) {

    if (pushAid(hitSummm, canMoveTo, k, l + 1, 0, 0, moveTable) && l === 1) {
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

    if (pushAid(hitSummm, canMoveTo, k, l - 1, 0, 0, moveTable) && l === 6) {
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
      if (pushAid(hitSummm, canMoveTo, k + moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k + moveCount, l, moveTable)[0] === nc) {
        goFurther[0] = false
      }
    }
    if (goFurther[1]) {
      pushAid(hitSummm, canMoveTo, k - moveCount, l, 0, 0, moveTable)
      if (pushAid(hitSummm, canMoveTo, k - moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k - moveCount, l, moveTable)[0] === nc) {
        goFurther[1] = false
      }
    }
    if (goFurther[2]) {
      pushAid(hitSummm, canMoveTo, k, l + moveCount, 0, 0, moveTable)
      if (pushAid(hitSummm, canMoveTo, k, l + moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l + moveCount, moveTable)[0] === nc) {
        goFurther[2] = false
      }
    }
    if (goFurther[3]) {
      pushAid(hitSummm, canMoveTo, k, l - moveCount, 0, 0, moveTable)
      if (pushAid(hitSummm, canMoveTo, k, l - moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l - moveCount, moveTable)[0] === nc) {
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
      if (pushAid(hitSummm, canMoveTo, k + moveCount, l + moveCount, 0, c, moveTable, true, 2) || whatsThere(k + moveCount, l + moveCount, moveTable)[0] === nc) {
        goFurther[0] = false
      }
    }
    if (goFurther[1]) {
      pushAid(hitSummm, canMoveTo, k - moveCount, l + moveCount, 0, 0, moveTable)
      if (pushAid(hitSummm, canMoveTo, k - moveCount, l + moveCount, 0, c, moveTable, true, 2) || whatsThere(k - moveCount, l + moveCount, moveTable)[0] === nc) {
        goFurther[1] = false
      }
    }
    if (goFurther[2]) {
      pushAid(hitSummm, canMoveTo, k + moveCount, l - moveCount, 0, 0, moveTable)
      if (pushAid(hitSummm, canMoveTo, k + moveCount, l - moveCount, 0, c, moveTable, true, 2) || whatsThere(k + moveCount, l - moveCount, moveTable)[0] === nc) {
        goFurther[2] = false
      }
    }
    if (goFurther[3]) {
      pushAid(hitSummm, canMoveTo, k - moveCount, l - moveCount, 0, 0, moveTable)
      if (pushAid(hitSummm, canMoveTo, k - moveCount, l - moveCount, 0, c, moveTable, true, 2) || whatsThere(k - moveCount, l - moveCount, moveTable)[0] === nc) {
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
      if (pushAid(hitSummm, canMoveTo, k + moveCount, l + moveCount, 0, c, moveTable, true, 5) || whatsThere(k + moveCount, l + moveCount, moveTable)[0] === nc) {
        goFurther[0] = false
      }
    }
    if (goFurther[1]) {
      pushAid(hitSummm, canMoveTo, k - moveCount, l + moveCount, 0, 0, moveTable)
      if (pushAid(hitSummm, canMoveTo, k - moveCount, l + moveCount, 0, c, moveTable, true, 5) || whatsThere(k - moveCount, l + moveCount, moveTable)[0] === nc) {
        goFurther[1] = false
      }
    }
    if (goFurther[2]) {
      pushAid(hitSummm, canMoveTo, k + moveCount, l - moveCount, 0, 0, moveTable)
      if (pushAid(hitSummm, canMoveTo, k + moveCount, l - moveCount, 0, c, moveTable, true, 5) || whatsThere(k + moveCount, l - moveCount, moveTable)[0] === nc) {
        goFurther[2] = false
      }
    }
    if (goFurther[3]) {
      pushAid(hitSummm, canMoveTo, k - moveCount, l - moveCount, 0, 0, moveTable)
      if (pushAid(hitSummm, canMoveTo, k - moveCount, l - moveCount, 0, c, moveTable, true, 5) || whatsThere(k - moveCount, l - moveCount, moveTable)[0] === nc) {
        goFurther[3] = false
      }
    }

    if (goFurther[4]) {
      pushAid(hitSummm, canMoveTo, k + moveCount, l, 0, 0, moveTable)
      if (pushAid(hitSummm, canMoveTo, k + moveCount, l, 0, c, moveTable, true, 5) || whatsThere(k + moveCount, l, moveTable)[0] === nc) {
        goFurther[4] = false
      }
    }
    if (goFurther[5]) {
      pushAid(hitSummm, canMoveTo, k - moveCount, l, 0, 0, moveTable)
      if (pushAid(hitSummm, canMoveTo, k - moveCount, l, 0, c, moveTable, true, 5) || whatsThere(k - moveCount, l, moveTable)[0] === nc) {
        goFurther[5] = false
      }
    }
    if (goFurther[6]) {
      pushAid(hitSummm, canMoveTo, k, l + moveCount, 0, 0, moveTable)
      if (pushAid(hitSummm, canMoveTo, k, l + moveCount, 0, c, moveTable, true, 5) || whatsThere(k, l + moveCount, moveTable)[0] === nc) {
        goFurther[6] = false
      }
    }
    if (goFurther[7]) {
      pushAid(hitSummm, canMoveTo, k, l - moveCount, 0, 0, moveTable)
      if (pushAid(hitSummm, canMoveTo, k, l - moveCount, 0, c, moveTable, true, 5) || whatsThere(k, l - moveCount, moveTable)[0] === nc) {
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
      whatsThere(1, l, moveTable)[0] === 0 && whatsThere(2, l, moveTable)[0] === 0 && whatsThere(3, l, moveTable)[0] === 0) { //empty between

      pushAid(hitSummm, canMoveTo, 2, l, 0, 0, moveTable) //mark that cell if empty

    }
    if (moveTable[7][l][3] && whatsThere(5, l, moveTable)[0] === 0 && whatsThere(6, l, moveTable)[0] === 0) { // unmoved rook on [7][l] && empty between
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

function createState(table) {

  // make this string and concat!!!!!!!!!!!!!!!!!!!!

  var stateToRemember = []

  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {

      var x = 10 * Number(table[i][j][0]) + Number(table[i][j][1]) + 55 //  B vagy nagyobb
      if (x < 65) x = 65 // ez egy nagy A

      stateToRemember[8 * i + j] = String.fromCharCode(x)

      // if (table[i][j][5] && //mozdulhat
      // 	(table[i][j][1] === 1 || table[i][j][1] === 9)) { //paraszt v kiraly

      // 	table[i][j][5].forEach(function(canmov) {
      // 		stateToRemember[8 * i + j] = stateToRemember[8 * i + j] + canmov[0] + canmov[1]
      // 	})
      // }

    }
  }
  return stateToRemember.join('')

}

function getPushString(table, moveStr) {

  var cWhatMoves = String(table[dletters.indexOf(moveStr[0])][moveStr[1] - 1][0]) //color of whats moving
  var pWhatMoves = String(table[dletters.indexOf(moveStr[0])][moveStr[1] - 1][1]) //piece

  var whatsHit = String(table[dletters.indexOf(moveStr[2])][moveStr[3] - 1][0]) + //color of whats hit
    table[dletters.indexOf(moveStr[2])][moveStr[3] - 1][1] //piece

  if (pWhatMoves === "1" && //paraszt
    moveStr[0] !== moveStr[2] && //keresztbe
    whatsHit === '00' //uresre
  ) { //akkor tuti enpass
    if (cWhatMoves === '1') { //fekete
      whatsHit = '21' //akkor feher parasztot ut
    } else {
      whatsHit = '11'
    }

  }

  return cWhatMoves + pWhatMoves + moveStr + whatsHit

}

function moveInTable(moveStr, dbTable, isLearner) {

  var toPush = getPushString(dbTable.table, moveStr) //piece

  dbTable.moves.push(toPush)

  dbTable.table = moveIt(moveStr, dbTable.table) //	<----moves it

  dbTable.wNext = !dbTable.wNext

  dbTable.pollNum++

    dbTable.moveCount++

    dbTable.table = addMovesToTable(dbTable.table, dbTable.wNext)

  var pushThis = createState(dbTable.table)

  dbTable.allPastTables.push(pushThis)

  return dbTable

}

function captured(table, color) {

  var tempMoves = []

  var myCol = 1;

  if (color) myCol++ //myCol is 2 when white

    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {

        if (table[i][j][1] === 9 && table[i][j][0] === myCol) {
          //itt a kiraly

          tempMoves = bishopCanMove(i, j, color, table)

          for (var tempMoveCount = 0; tempMoveCount < tempMoves.length; tempMoveCount++) {
            if (table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] === 5 ||
              table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] === 2) {
              return true;
            }

          }

          tempMoves = rookCanMove(i, j, color, table)

          for (var tempMoveCount = 0; tempMoveCount < tempMoves.length; tempMoveCount++) {
            if (table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] === 5 ||
              table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] === 4) {
              return true;
            }

          }

          tempMoves = horseCanMove(i, j, color, table)

          for (var tempMoveCount = 0; tempMoveCount < tempMoves.length; tempMoveCount++) {
            if (table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] === 3) {
              return true;
            }

          }

          tempMoves = pawnCanMove(i, j, color, table)

          for (var tempMoveCount = 0; tempMoveCount < tempMoves.length; tempMoveCount++) {
            if (table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] === 1) {
              return true;
            }

          }

          tempMoves = kingCanMove(i, j, color, table)

          for (var tempMoveCount = 0; tempMoveCount < tempMoves.length; tempMoveCount++) {
            if (table[tempMoves[tempMoveCount][0]][tempMoves[tempMoveCount][1]][1] === 9) {
              return true;
            }

          }

        }
      }
    }
  return false
}

function moveIt(moveString, intable, dontProtect, hitValue) {
  if (hitValue === undefined) var hitValue = [0]
  var thistable = []

  for (var i = 0; i < 8; i++) {
    thistable[i] = new Array(8)
    for (var j = 0; j < 8; j++) {

      thistable[i][j] = intable[i][j].slice(0, 4)

    }
  }

  //itt indil sanc bastyatolas
  if (thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] === 9 && thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][3]) {

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

  if (thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] === 1 && ((moveString[1] === 2 && moveString[3] === 4) || (moveString[1] === 7 && moveString[3] === 5))) { //ha paraszt kettot lep

    thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][3] = true //[3]true for enpass

  }
  //es itt a vege
  //indul en passt lepett
  var enPass = false
  if (thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] === 1 && //paraszt
    thistable[dletters.indexOf(moveString[2])][moveString[3] - 1][0] === 0 && //uresre
    !(moveString[0] === moveString[2])) { //keresztbe
    enPass = true
    thistable[dletters.indexOf(moveString[2])][moveString[3] - 1] = thistable[dletters.indexOf(moveString[2])][moveString[1] - 1]

    thistable[dletters.indexOf(moveString[2])][moveString[1] - 1] = [0, 0, false, false, false] //ures

  }

  if (thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] === 1 && ( //ha paraszt es

      (thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][0] === 2 && //es feher
        moveString[3] === 8) || //es 8asra lep vagy
      (thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][0] === 1 && //vagy fekete
        moveString[3] === 1)) //1re
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
  if (!(thistable[dletters.indexOf(moveString[2])][moveString[3] - 1][1] === 1)) {
    thistable[dletters.indexOf(moveString[2])][moveString[3] - 1][3] = false
  }

  return thistable
}

function coordsToMoveString(a, b, c, d) {

  return dletters[a] + (b + 1) + dletters[c] + (d + 1)
}

/////////////////////// from old ai end //////////////////////////

function pawnCanMoveN(k, l, moveTable, protectedArray, c, iHitMoves, protectScore) {

  ////if(counter)counter[0]++

  if (c === 2) { //white pawn

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
        //if(counter)counter[0]++
        //pushAidN( canMoveTo, k + moveCount, l, 0, 0, moveTable)
        // if (pushAidN( canMoveTo, k + moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k + moveCount, l, moveTable)[0] === nc) {
        // 	goFurther[0] = false
        // }
    }
    if (goFurther[1]) {

      if (pushAidN(k, l, k - moveCount, l, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[1] = false
        //if(counter)counter[0]++
        // pushAidN( canMoveTo, k - moveCount, l, 0, 0, moveTable)
        // if (pushAidN( canMoveTo, k - moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k - moveCount, l, moveTable)[0] === nc) {
        // 	goFurther[1] = false
        // }
    }
    if (goFurther[2]) {

      if (pushAidN(k, l, k, l + moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[2] = false
        //if(counter)counter[0]++
        // pushAidN( canMoveTo, k, l + moveCount, 0, 0, moveTable)
        // if (pushAidN( canMoveTo, k, l + moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l + moveCount, moveTable)[0] === nc) {
        // 	goFurther[2] = false
        // }
    }
    if (goFurther[3]) {

      if (pushAidN(k, l, k, l - moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[3] = false
        //if(counter)counter[0]++
        // pushAidN( canMoveTo, k, l - moveCount, 0, 0, moveTable)
        // if (pushAidN( canMoveTo, k, l - moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l - moveCount, moveTable)[0] === nc) {
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
        //if(counter)counter[0]++
        //pushAidN( canMoveTo, k + moveCount, l, 0, 0, moveTable)
        // if (pushAidN( canMoveTo, k + moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k + moveCount, l, moveTable)[0] === nc) {
        // 	goFurther[0] = false
        // }
    }
    if (goFurther[1]) {

      if (pushAidN(k, l, k - moveCount, l - moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[1] = false
        //if(counter)counter[0]++
        // pushAidN( canMoveTo, k - moveCount, l, 0, 0, moveTable)
        // if (pushAidN( canMoveTo, k - moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k - moveCount, l, moveTable)[0] === nc) {
        // 	goFurther[1] = false
        // }
    }
    if (goFurther[2]) {

      if (pushAidN(k, l, k - moveCount, l + moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[2] = false
        //if(counter)counter[0]++
        // pushAidN( canMoveTo, k, l + moveCount, 0, 0, moveTable)
        // if (pushAidN( canMoveTo, k, l + moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l + moveCount, moveTable)[0] === nc) {
        // 	goFurther[2] = false
        // }
    }
    if (goFurther[3]) {

      if (pushAidN(k, l, k + moveCount, l - moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[3] = false
        //if(counter)counter[0]++
        // pushAidN( canMoveTo, k, l - moveCount, 0, 0, moveTable)
        // if (pushAidN( canMoveTo, k, l - moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l - moveCount, moveTable)[0] === nc) {
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
        //if(counter)counter[0]++
        //pushAidN( canMoveTo, k + moveCount, l, 0, 0, moveTable)
        // if (pushAidN( canMoveTo, k + moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k + moveCount, l, moveTable)[0] === nc) {
        // 	goFurther[0] = false
        // }
    }
    if (goFurther[1]) {

      if (pushAidN(k, l, k - moveCount, l, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[1] = false
        //if(counter)counter[0]++
        // pushAidN( canMoveTo, k - moveCount, l, 0, 0, moveTable)
        // if (pushAidN( canMoveTo, k - moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k - moveCount, l, moveTable)[0] === nc) {
        // 	goFurther[1] = false
        // }
    }
    if (goFurther[2]) {

      if (pushAidN(k, l, k, l + moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[2] = false
        //if(counter)counter[0]++
        // pushAidN( canMoveTo, k, l + moveCount, 0, 0, moveTable)
        // if (pushAidN( canMoveTo, k, l + moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l + moveCount, moveTable)[0] === nc) {
        // 	goFurther[2] = false
        // }
    }
    if (goFurther[3]) {

      if (pushAidN(k, l, k, l - moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[3] = false
        //if(counter)counter[0]++
        // pushAidN( canMoveTo, k, l - moveCount, 0, 0, moveTable)
        // if (pushAidN( canMoveTo, k, l - moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l - moveCount, moveTable)[0] === nc) {
        // 	goFurther[3] = false
        // }
    }

    if (goFurther[4]) {

      if (pushAidN(k, l, k + moveCount, l + moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[4] = false
        //if(counter)counter[0]++
        //pushAidN( canMoveTo, k + moveCount, l, 0, 0, moveTable)
        // if (pushAidN( canMoveTo, k + moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k + moveCount, l, moveTable)[0] === nc) {
        // 	goFurther[0] = false
        // }
    }
    if (goFurther[5]) {

      if (pushAidN(k, l, k - moveCount, l - moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[5] = false
        //if(counter)counter[0]++
        // pushAidN( canMoveTo, k - moveCount, l, 0, 0, moveTable)
        // if (pushAidN( canMoveTo, k - moveCount, l, 0, c, moveTable, true, 4) || whatsThere(k - moveCount, l, moveTable)[0] === nc) {
        // 	goFurther[1] = false
        // }
    }
    if (goFurther[6]) {

      if (pushAidN(k, l, k - moveCount, l + moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[6] = false
        //if(counter)counter[0]++
        // pushAidN( canMoveTo, k, l + moveCount, 0, 0, moveTable)
        // if (pushAidN( canMoveTo, k, l + moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l + moveCount, moveTable)[0] === nc) {
        // 	goFurther[2] = false
        // }
    }
    if (goFurther[7]) {

      if (pushAidN(k, l, k + moveCount, l - moveCount, c, moveTable, protectedArray, iHitMoves, protectScore)) goFurther[7] = false
        //if(counter)counter[0]++
        // pushAidN( canMoveTo, k, l - moveCount, 0, 0, moveTable)
        // if (pushAidN( canMoveTo, k, l - moveCount, 0, c, moveTable, true, 4) || whatsThere(k, l - moveCount, moveTable)[0] === nc) {
        // 	goFurther[3] = false
        // }
    }
  }
  //return canMoveTo
}

function kingCanMoveN(k, l, moveTable, protectedArray, c, iHitMoves, protectScore) {
  //horseCanMoveN(k, l, moveTable, c,iHitMoves,protectScore)
  //pushAidN( k,l, k + 1, l + 2,c, moveTable, protectedArray, iHitMoves, protectScore)
  //if(counter)counter[0]+=4
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
      whatsThere(1, l, moveTable)[0] === 0 && whatsThere(2, l, moveTable)[0] === 0 && whatsThere(3, l, moveTable)[0] === 0) { //empty between

      //pushAidN(canMoveTo, 2, l, 0, 0, moveTable) //mark that cell if empty

      pushAidN(k, l, 2, l, c, moveTable, protectedArray, iHitMoves, protectScore)

    }
    if (moveTable[7][l][3] && whatsThere(5, l, moveTable)[0] === 0 && whatsThere(6, l, moveTable)[0] === 0) { // unmoved rook on [7][l] && empty between
      //pushAidN(canMoveTo, 6, l, 0, 0, moveTable) //mark that cell if empty

      pushAidN(k, l, 6, l, c, moveTable, protectedArray, iHitMoves, protectScore)

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

  if (isThere && isThere[0] !== 0) { //van ott vmi

    if (isThere[0] === c) {
      //my piece is there

      protectScore[0]++

        protectedArray[x][y] = true //protected		//moveit will clear, fastmove not???!!!

    } else {
      //opps piece is there

      iHitMoves.push([k, l, x, y, table[k][l][1], table[x][y][1]]) //[who k,l where to x,y who, hits]

    }

    return true

  };

}

function fastMove(moveString, intable, dontProtect, hitValue) {

  //typed!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  var thistable = new Array(8)

  for (var i = 0; i < 8; i++) {
    thistable[i] = new Array(8)
    for (var j = 0; j < 8; j++) {

      thistable[i][j] = intable[i][j].slice(0, 2)

    }
  }

  if (thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] === 9 && thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][3]) {

    switch (moveString.substring(2)) {
      case "c1":
        thistable = fastMove("a1d1", thistable)
        break;

      case "g1":
        thistable = fastMove("h1f1", thistable)
        break;

      case "c8":
        thistable = fastMove("a8d8", thistable)
        break;

      case "g8":
        thistable = fastMove("h8f8", thistable)
        break;

    }
  }

  if (thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] === 1 && ( //ha paraszt es

      (thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][0] === 2 && //es feher
        moveString[3] === 8) || //es 8asra lep vagy
      (thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][0] === 1 && //vagy fekete
        moveString[3] === 1)) //1re
  ) {
    //AKKOR
    thistable[dletters.indexOf(moveString[0])][moveString[1] - 1][1] = 5 //kiralyno lett

  }

  thistable[dletters.indexOf(moveString[2])][moveString[3] - 1] =
    thistable[dletters.indexOf(moveString[0])][moveString[1] - 1]
  thistable[dletters.indexOf(moveString[0])][moveString[1] - 1] = [0, 0, 0] //, false, false, false]

  return thistable
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

function getHitScores(origTable, wNext, flipIt, wPlayer, mod) {

  var fwVdef = 0.846

  var fwV = 1

  if (mod && mod.modType === 'fwV') {
    fwV = mod.modConst

  }

  var pawnVal = 0

  var iHitCoords = [] //[who k,l where to x,y, who, hits]
  var heHitsCoords = []

  var myprotectScore = new Uint8Array(1) //[0]
  var hisprotectScore = new Uint8Array(1) //[0]

  var myAllHit = 0
  var hisAllHit = 0

  var myBestHit = 0
  var hisBestHit = 0

  var myBestHitCoords = []

  var protectedArray = [ //new Array(8)

    new Uint8Array(8),
    new Uint8Array(8),
    new Uint8Array(8),
    new Uint8Array(8),

    new Uint8Array(8),
    new Uint8Array(8),
    new Uint8Array(8),
    new Uint8Array(8)

  ]

  var c = 1
  var nc = 1

  if (wNext) {
    c++

  } else {
    nc++
  }

  for (var lookI = 0; lookI < 8; lookI++) {
    for (var lookJ = 0; lookJ < 8; lookJ++) { //look through the table

      if (origTable[lookI][lookJ][0] === c) {
        ////////found my piece/////////
        ////////get all my moves and places i protect
        if (origTable[lookI][lookJ][1] === 1) {
          if (c === 1) {
            pawnVal += (7 - lookJ)
          } else {
            pawnVal += lookJ
          }
        }
        newCanMove(lookI, lookJ, c, origTable, protectedArray, iHitCoords, myprotectScore) //newCanMove will protect the table
          //and append all my hits to iHitCoords
          //will increase myprotectscore, inaccurate!!!!!!!				
      } else {

        if (origTable[lookI][lookJ][0] !== 0) { ////////found opponent's piece/////////												
          if (origTable[lookI][lookJ][1] === 1) {
            if (nc === 1) {
              pawnVal -= (7 - lookJ)
            } else {
              pawnVal -= lookJ
            }

          } //pawnVal+=lookJ * fwV //*myCMplyer
          newCanMove(lookI, lookJ, nc, origTable, protectedArray, heHitsCoords, hisprotectScore)
        }
      }

    }
  }

  iHitCoords.forEach(function(hitCoords) {
    var thisValue = 0

    if (protectedArray[hitCoords[2]][hitCoords[3]]) { //if field is protected

      thisValue = hitCoords[5] - hitCoords[4] //kivonja amivel lep

    } else {

      thisValue = hitCoords[5] //else normal hitvalue

    }

    if (thisValue > myBestHit) { //remember best

      myBestHit = thisValue

      myBestHitCoords = hitCoords
    }

    myAllHit += thisValue

  })

  heHitsCoords.forEach(function(hitCoords) {

    var thisValue = 0

    if (protectedArray[hitCoords[2]][hitCoords[3]]) { //if cell is protected

      thisValue = hitCoords[5] - hitCoords[4] //kivonja amivel lep

    } else {

      thisValue = hitCoords[5] //normal hitvalue

    }

    if (thisValue > hisBestHit) { //remember best

      hisBestHit = thisValue
        //
    }

    hisAllHit += thisValue
  })

  var protecScore = myprotectScore[0] - hisprotectScore[0]
  var allhitScore = myAllHit - hisAllHit
    //console.log(wPlayer)
    // if(wPlayer){

  //     pawnVal*=-1
  // }

  pawnVal *= fwV * fwVdef

  var result = new Int32Array(1)
  result[0] = (myBestHit * 65536) - (hisBestHit * 4096)

  if (flipIt) {
    result[0] -= (protecScore << 8) + (allhitScore << 4) + (pawnVal << 8) //*1633333
  } else {
    result[0] += (protecScore << 8) + (allhitScore << 4) + (pawnVal << 8) //*1633333
  }

  return result // 65536

} //

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') module.exports = {
  moveInTable: moveInTable
}