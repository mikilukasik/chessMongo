var SplitMove = function(dbTableWithMoveTask) {

    this.started = new Date()

    this.splitMoveIndex = undefined

    this.splitMoveID = Math.random() * Math.random()

    var movesToSend = []

    dbTableWithMoveTask.moveTask.moveCoords.forEach(function(moveCoord, index) {

        movesToSend.push(new MoveToSend(moveCoord, index, dbTableWithMoveTask, this.splitMoveID))

    })

    this.movesToSend = movesToSend //this will get empty as we send the moves out for processing

    this.moves = movesToSend.slice() //this should stay full

    this.thinkers = [] //this will get filled with the clients working on this splitmove


    this.gameNum = dbTableWithMoveTask._id


    this.origTable = dbTableWithMoveTask.table

    this.origMoveTask = dbTableWithMoveTask.moveTask

    this.origMoveTask = dbTableWithMoveTask.moveTask

    this.pendingMoveCount = dbTableWithMoveTask.moveTask.moveCoords.length


}

var SplitMoves = function(clients) {

    var store = {

        q: [],



    }


    var getNakedQ = function() {

        var res = []

        store.q.forEach(function(splitMove) {
            res.push({
                gameNum: splitMove.gameNum,
                thinkers: splitMove.thinkers,
                moves: splitMove.moves,
                a: splitMove.movesToSend



            })
        })

        return res

    }

    var qIndexBysplitMoveID = function(splitMove) {

        for (var i = store.q.length - 1; i >= 0; i--) {

            if (splitMove.splitMoveID === store.q[i].splitMoveID) return i

        }

        //return -1


        // return store.q.findIndex(function(element,index){
        //     if(splitMove.splitMoveID===element.splitMoveID) {return true}else{return false}
        // })

    }

    var qIndexByGameID = function(gameID) {


        for (var i = store.q.length - 1; i >= 0; i--) {

            if (gameID == store.q[i].gameNum) return i

        }

        //return 

        // return store.q.findIndex(function(element,index){

        //     if(gameID==element.dbTable._id) {return true}else{return false}
        // })

    }

    this.publishToAdmin = function() {

        clients.publishView('admin.html', 'default', 'splitMoves', getNakedQ()) //[[1,2,3],[4,5,6]])//getNakedQ())


        //publishSplitMoves(getNakedQ())
        //publish to admin view here
    }

    var getSplitMoveTask = function(splitMove, percent) {

        var numberToSend = Math.ceil(percent * splitMove.movesToSend.length)

        var splitMoveTasks = []

        for (var i = 0; i < numberToSend; i++) {
            splitMoveTasks.push(splitMove.movesToSend.pop())
        }

        return splitMoveTasks

    }


    this.add = function(dbTableWithMoveTask) {

        var splitMove = new SplitMove(dbTableWithMoveTask)

        var splitMoveIndex = store.q.push(splitMove) - 1

        splitMove.splitMoveIndex = splitMoveIndex



        splitMove.origTable = dbTableWithMoveTask

        // var itsSpeed=[0.1]

        while (splitMove.movesToSend.length > 0) {



            var thinker = clients.fastestThinker()

            // console.log('============================speed:',itsSpeed[0])


            var sendThese = getSplitMoveTask(splitMove, thinker.itsSpeed)


            var sentCount = sendThese.length

            var sentTo = clients.sendTask(new Task('splitMove', sendThese, 'splitMove t' + dbTableWithMoveTask._id + ' sentCount: ' + sentCount), thinker) //string

            this.registerSentMoves(dbTableWithMoveTask._id, sentTo, sentCount, sendThese)

        }

        this.publishToAdmin()


        return splitMove


    }

    var getThinkerIndex = function(qIndex, thinker) {


        if (store.q[qIndex])
            for (var i = store.q[qIndex].thinkers.length - 1; i >= 0; i--) {


                if (store.q[qIndex].thinkers[i].thinker == thinker.toString()) {
                    return i
                }
            }



        return -1

    }

    this.registerSentMoves = function(gameID, thinker, sentCount, sentMoves) {

        var qIndex = qIndexByGameID(gameID)

        return store.q[qIndex].thinkers.push({


            thinker: thinker,
            sentCount: sentCount,
            done: false,
            progress: 0,
            sentMoves:sentMoves
            

        }) - 1


    }
    
    var removeSentMove=function(moveArray,move){
        
        var index
        
        for (var i=moveArray.length-1;i>=0;i--){
            
            if(moveArray[i].moveIndex==move.moveIndex){
                
                index=i
                console.log('found!!!!')
                
            }
            
        }
        
        if(index!=undefined){
            
            moveArray.splice(i,1)
            console.log('removed!!!!')
                
            
        }else{
            
            console.log('not found!!!!')
            
            console.log(move,'#########################',moveArray)
                
            
            
        }
        
    }

    this.updateSplitMoveProgress = function(gameID, thinker, data, connection) {

        var progress
        var beBackIn
        var movesLeft

        if (data.final) {

            progress = 100
            beBackIn = 0

            connection.addedData.currentState = 'idle' //'reCheck'

            clients.updateSpeedStats(connection, data.depth, data.dmpm)

            clients.publishAddedData()

        } else {

            progress = data.progress
            beBackIn = data.beBackIn
            movesLeft = data.movesLeft
            
        }



        var dmpm = data.dmpm

        var qIndex = qIndexByGameID(gameID)

        var tIndex = getThinkerIndex(qIndex, thinker)

        if (store.q[qIndex] && store.q[qIndex].thinkers[tIndex]) {


            if (data.results) {

                data.results.forEach(function(res) {

                    store.q[qIndex].moves[res.moveIndex].done = true
                    store.q[qIndex].moves[res.moveIndex].result = res

                    store.q[qIndex].pendingMoveCount--
                    
                    removeSentMove(store.q[qIndex].thinkers[tIndex].sentMoves,res)



                        if (store.q[qIndex].pendingMoveCount == 0) {

                            store.q[qIndex].moves.sort(function(a, b) {
                                if (a.result.value > b.result.value) {
                                    return -1
                                } else {
                                    return 1
                                }

                            })

                            console.log('will move ', store.q[qIndex].moves[0].result.move)


                            var tableInDb = store.q[qIndex].origTable

                            moveInTable(store.q[qIndex].moves[0].result.move, tableInDb)


                            tableInDb.chat = [~~((new Date() - store.q[qIndex].started) / 10) / 100 + 'sec'] //1st line in chat is timeItTook

                            store.q[qIndex].moves.forEach(function(returnedMove) {

                                tableInDb.chat = tableInDb.chat.concat({

                                    hex: returnedMove.result.value.toString(16),
                                    score: returnedMove.result.value,

                                    moves: returnedMove.result.moveTree

                                })

                            })


                            tableInDb.moveTask = {}

                            mongodb.connect(cn, function(err2, db2) {

                                db2.collection("tables")
                                    .save(tableInDb, function(err3, res) {


                                        clients.publishView('board.html', tableInDb._id, 'dbTable.table', tableInDb.table)

                                        clients.publishView('board.html', tableInDb._id, 'dbTable.wNext', tableInDb.wNext)

                                        clients.publishView('board.html', tableInDb._id, 'dbTable.chat', tableInDb.chat)

                                        clients.publishView('board.html', tableInDb._id, 'dbTable.moves', tableInDb.moves)

                                        db2.close()


                                        store.q.splice(qIndex, 1)

                                        clients.publishView('admin.html', 'default', 'splitMoves', getNakedQ())



                                    })
                            })


                        }

                })


                clients.publishView('admin.html', 'default', 'splitMoves', getNakedQ())

            }


            //




            if (progress > store.q[qIndex].thinkers[tIndex].progress) {

                store.q[qIndex].thinkers[tIndex].progress = progress
                store.q[qIndex].thinkers[tIndex].beBackIn = beBackIn
                store.q[qIndex].thinkers[tIndex].dmpm = dmpm
                store.q[qIndex].thinkers[tIndex].movesLeft = movesLeft
                store.q[qIndex].thinkers[tIndex].mspm = beBackIn/movesLeft
                
                

            }


            clients.publishView('board.html', gameID, 'busyThinkers', store.q[qIndex].thinkers)

        }

        //this.publishToAdmin()

    }


    this.update = function(splitMove, propertyName, value) {


        //  var forcePublish=false
        var index

        if (splitMove.splitMoveID) {

            index = qIndexBysplitMoveID(splitMove)

        } else {

            console.log('no id')

        }

        if (propertyName) {

            eval('(store.q[index].' + propertyName + '=value)')

            this.publishToAdmin()


        } else {

            // if (forcePublish){

            //    this.publishToAdmin()

            // }

        }


        return splitMove


    }

    this.pushToArray = function(splitMove, arrayName, value) {


        var forcePublish = false
        var index

        if (splitMove.splitMoveID) {

            index = qIndexBysplitMoveID(splitMove)

        } else {


            splitMove.splitMoveID = Math.random() * Math.random()

            index = store.q.push(splitMove) - 1

            forcePublish = true

        }

        if (arrayName) {



            eval(
                'if(store.q[index].' + arrayName + '){(store.q[index].' + arrayName + '.push(value))}else{store.q[index].' + arrayName + '=[value]}'
            )

            this.publishToAdmin()


        } else {

            if (forcePublish) {

                this.publishToAdmin()

            }

        }


        return splitMove


    }

    this.remove = function(gameID) {

        var res

        // console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
        var index = qIndexByGameID(gameID)

        if (index !== -1) {

            res = store.q.splice(index, 1)[0]

            // this.publishToAdmin()

        }

        return res

    }

    // var removeSM=this.remove

    this.qLength = function() {
        return store.q.length
    }




}