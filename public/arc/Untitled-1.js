    if (false) { //temp?
        //

        var cf2Moves = []
        var cf2MoveCoords = []

        getAllMoves(retTable, cfColor).forEach(function(thisMove) { //get all my moves in array of strings
            cf2Moves.push(dletters[thisMove[0]] + (thisMove[1] + 1) + dletters[thisMove[2]] + (1 + thisMove[3]))
            cf2MoveCoords.push(thisMove)
        })

        // es akkor nem kell ez:
        for (var i = cf2Moves.length - 1; i >= 0; i--) { //sakkba nem lephetunk			
            if (captured(moveIt(cf2Moves[i], retTable), cfColor)) { //sakkba lepnenk					<---  merge this
                cf2Moves.splice(i, 1)
                cf2MoveCoords.splice(i, 1) //ez is lehetne count:ranking, minus!!
                tTable2Value -= 0.0001
            }
        }

        //check there's a win:
        var potentMoves = [] //will make an array of potential winning moves
        var potentTables = [] //and resulting tables
            //							
        for (var i = cf2Moves.length - 1; i >= 0; i--) {

            var potentTable = moveIt(cf2Moves[i], retTable)

            if (captured(potentTable, !cfColor)) { //az lehet potent, ahol sakkot adok

                //make a ranker here
                //							<---	with this

                tTable2Value += 0.00001 //ket lepesben sakkot ad(hat)ok
                potentMoves.push(cf2Moves[i])
                potentTables.push(potentTable)
                    //cfMoveCoords.splice(i, 1)					//ez is lehetne count:ranking
            }
        }


        //check if capturing moves are winners:

        var twoStepWinners = []

        potentMoves.forEach(function(potentMove, potentMoveCount) {
            var potentTable = potentTables[potentMoveCount] //potent tablan mindenkepp sakkban all remember
                ////

            var ret2potMoves = []
                //var ret2potMoveCoords = []

            getAllMoves(potentTable, !cfColor).forEach(function(thisMove) { //get all his moves in array of strings
                    ret2potMoves.push(dletters[thisMove[0]] + (thisMove[1] + 1) + dletters[thisMove[2]] + (1 + thisMove[3]))
                        //ret2potMoveCoords.push(thisMove)

                })
                //var origLen = ret2potMoves.length
                //var removeCount = 0
            for (var i = ret2potMoves.length - 1; i >= 0; i--) { //sakkba nem lephet o sem
                if (captured(moveIt(ret2potMoves[i], potentTable), !cfColor)) { //sakkba lepne valaszkent	//moveit retmove ittis ottis
                    ret2potMoves.splice(i, 1)
                        //ret2potMoveCoords.splice(i, 1)
                        //removeCount++
                    tTable2Value += 0.000001 //sakkba lephetne

                }
            }
            //
            if (ret2potMoves.length == 0) {
                //mattot tudok adni a legjobbnak tuno lepesere
                //process.stdout.write("!");
                ////console.log('2 lepesbol mattolhatok')
                if (tTable2Value < 5) tTable2Value += 5

                //meg kene nezni ki tud-e lepni belole


                tTable2Value += 0.00001 //sakkba lephetne
            }

            ////
        })

        ///

    }