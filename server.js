
//
var express = require('express');
var morgan = require('morgan');
var http = require('http');

var app = express();
//
var mongodb = require('mongodb');

var cn='mongodb://localhost:17890/chessdb'
//
//http://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files
var fs = require('fs');

// file is included here:
eval(fs.readFileSync('public/brandNewAi.js')+'');
eval(fs.readFileSync('public/tableClass.js')+'');
//http://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files


app.use(express.static('public'))
app.use(morgan("combined"))





var t1const=11

//clear this bullshit
var activeGames=[]
activeGames[0]=[]		//tablenum
activeGames[1]=[]		//?
var tablesLastMoved=[]
//



var dletters = ["a","b","c","d","e","f","g","h"]

var allTables=[]
var allPastTables=[]
//var table=[]
var allMoves=[]
// var allStepsStringHTML=""
var allStepsStringHTML=[]

// var pollNum=0
var pollNum=[]
var allWNexts=[]
var players=[]
var randomConst=[]

var playerDisconnectConst=15000		//15sec
var gameInactiveConst=300000		//5min

players[0]=[]	//player names

players[1]=[]	//players last polled

players[2]=[]	//bolleans true if game is to start
players[3]=[]	//player colors for new games
players[4]=[]	//table numbers for new games
players[5]=[]	//opponents name

var lobbyPollNum=0
var lobbyChat=[]
var allChats=[]



var aiOn=[]

var tempRandomConst=0
// setInterval(function(){
// 	console.log('a')
// },5)
// setInterval(function(){
// 	// active games
	
	
	
// },300)
	
									// ai plays against itself:
									// setInterval(function(){
									// 		 console.log('elindult')
										
									// 	 	//for(var xx=1; xx<allTables.length; xx++){
									// 			 var xx=Math.floor(Math.random()*(allTables.length-1))+1
									// 			 if(aiOn[xx]){
									// 				 aiOn[xx]=false
									// 				 console.log('aimove on table '+xx+' started..')
									// 				//console.log(xx)
													
									// 				if(allWNexts[xx]){
									// 					t1const=1
									// 				}else{
									// 					t1const=randomConst[xx]
									// 				}
													
									// 						if(activeGames[0].indexOf(xx)==-1){
									// 					  		activeGames[0].push(xx)
									// 					  		activeGames[1].push((new Date()).getTime())
														  		
									// 					  		//activeGames.sort(sortactiveGames)
									// 					  		lobbyPollNum++
														  
									// 					  }else{
									// 					  		activeGames[1][activeGames[0].indexOf(xx)]=(new Date()).getTime()
									// 					  }
									// 					var thisAiMove=ai(allTables[xx],allWNexts[xx])
									// 					console.log('aimove on table '+xx+' generated')	
														
														
									// 					if (!(thisAiMove[1]===undefined)){
															
															
														  
									// 					   allTables[xx]=moveIt(thisAiMove[1][0],allTables[xx])
									// 					   pollNum[xx]++
														   
									// 					   if(pushTableState(xx)==3){
									// 						   //got into a loop
									// 						   //validate table by remaining pieces
															   
									// 						   var chatTemp=allChats[xx]
															
														   
														
															
									// 						lobbyChat.push(' ')
									// 						lobbyChat.push('   ------ AI START ------ ')
															
									// 						lobbyChat.push('Table: '+xx)
															
															
									// 						lobbyChat.push('t1const: '+randomConst[xx])
									// 						lobbyChat.push('looped. ')
									// 						lobbyChat.push('Value:'+getTableData(allTables[xx],false)[0])
									// 						lobbyChat.push('   ------ AI END ------ ')
									// 						lobbyPollNum++
															
									// 						//aiOn[xx]=true
									// 						var tempRandomConst=Math.random()*100
									// 						if(Math.random()>0.5){tempRandomConst=1/tempRandomConst}
															
									// 						//console.log(tempRandomConst)
															
									// 						randomConst[xx]=tempRandomConst
									// 						initTable(xx)
									// 						allChats[xx]=chatTemp
									// 						console.log('aimove on table '+xx+' reset.')
									// 						aiOn[xx]=true
															   
									// 					   }
														   
									// 					   allChats[xx].push(' ')
									// 					   allChats[xx].push('wN '+allWNexts[xx])
									// 					   allChats[xx].push('Move: '+thisAiMove[1][0])
									// 					   allChats[xx].push('t1const '+t1const)
									// 					   // allChats[xx].push('randomConst '+randomConst[xx])
														   					   
									// 					   console.log('aimove on table '+xx+' moved.')	
									// 					   allWNexts[xx]=!allWNexts[xx]
									// 					   aiOn[xx]=true
									// 					}else{
									// 						var chatTemp=allChats[xx]
															
														   
									// 					//store stats here
														
														
									// 						// initTable(xx)
															
									// 						lobbyChat.push(' ')
									// 						lobbyChat.push('   ------ AI START ------ ')
															
									// 						lobbyChat.push('Table: '+xx)
															
															
									// 						lobbyChat.push('t1const: '+randomConst[xx])
									// 						lobbyChat.push('won: '+allWNexts[xx])
									// 						lobbyChat.push('Value:'+getTableData(allTables[xx],false)[0])
															
									// 						lobbyChat.push('   ------ AI END ------ ')
									// 						lobbyPollNum++
															
									// 						//aiOn[xx]=true
									// 						var tempRandomConst=Math.random()*100
									// 						if(Math.random()>0.5){tempRandomConst=1/tempRandomConst}
															
									// 						//console.log(tempRandomConst)
															
									// 						randomConst[xx]=tempRandomConst
									// 						initTable(xx)
									// 						allChats[xx]=chatTemp
									// 						console.log('aimove on table '+xx+' reset.')
									// 						aiOn[xx]=true
																				
									// 					}
													 
													 
													 
									// 			 //}
									// 		 }
									// 		 console.log('lefutott')
										
									// 	},2000);
									
							
							//need this to avoid loop:
							// function pushTableState(tableNo){
								
							// 	var sTable=getSimpleTableState(allTables[tableNo])
							// 	var sCount=0
								
							// 	//allChats[tableNo].push(sTable) //logging past tables as chat
									
							// 	//s	
							// 	var collection = db.get('tables');
							//     collection.find({},{},function(e,docs){
							//         allChats[tableNo].push(docs[0].table)
							//     });	
								
							// 	//e
								
								
							// 	allPastTables[tableNo].push(sTable) //remember this state
							// 	allPastTables[tableNo].forEach(function(tableTempState){	//check all past states
							// 		if (tableTempState==sTable)sCount++			//count how many times this occured
							// 	})
								
							// 	return sCount
								
							// }
						//need end
var firstFreeTable=0
mongodb.connect(cn, function(err, db) {
	db.collection("tables").findOne({tableNum: "xData"},function(err2, xData) {
		if(xData==null){
			console.log("can't find firstfreetable info in db")
			
			mongodb.connect(cn, function(err, db) {
				
			
					db.collection("tables").insert({"tableNum": "xData","firstFreeTable":1}, function(err3,res){})
					db.close()
				
			});
			firstFreeTable=1
		}else{
			firstFreeTable=xData.firstFreeTable
		}
		
		db.close()
	});
});

app.get('/move', function (req, res) {

  mongodb.connect(cn, function(err, db) {
      db.collection("tables").findOne({tableNum: Number(req.query.t)},function(err2, tableInDb) {
     
      var moveStr=String(req.query.m)
 
      var toPush=  String(tableInDb.table[dletters.indexOf(moveStr[0])][moveStr[1]-1][0])+  //color of whats moving
                    tableInDb.table[dletters.indexOf(moveStr[0])][moveStr[1]-1][1]+         //piece
                    moveStr+                                                                //the string
                    tableInDb.table[dletters.indexOf(moveStr[2])][moveStr[3]-1][0]+         //color of whats hit
                    tableInDb.table[dletters.indexOf(moveStr[2])][moveStr[3]-1][1]          //piece
      
     // if(!(toPush==tableInDb.moves[tableInDb.moves.length-1])){
        tableInDb.moves.push(toPush)
        tableInDb.table=moveIt(moveStr,tableInDb.table)
        tableInDb.wNext=!tableInDb.wNext
        tableInDb.pollNum++
        
        
        tableInDb.table=addMovesToTable(tableInDb.table,tableInDb.wNext)
      
      //}
     
      db.collection("tables").save(tableInDb, function(err3,res){})
      db.close()
    });
    
    
    
    //db.close()
    res.json({});
    
  });
});


app.get('/aiMove', function (req, res) {
	// var tempConst=t1const
	// if(activeGames[0].indexOf(req.query.t)==-1){
  	// 	activeGames[0].push(req.query.t)
  	// 	activeGames[1].push((new Date()).getTime())
  		
  	// 	//activeGames.sort(sortactiveGames)
  	// 	lobbyPollNum++
  
  // }else{
  	// 	activeGames[1][activeGames[0].indexOf(req.query.t)]=(new Date()).getTime()
  // }
  // t1const=11
  
  
  	var options = {
	  host: 'localhost',
	  port: 16789,
	  path: '/aichoice?t='+req.query.t
	};

	http.request(options, function(response) {
	  var str = {};
	
	  //another chunk of data has been recieved, so append it to `str`
	  response.on('data', function (chunk) {
	    str = JSON.parse(chunk);
	  });
	
	  //the whole response has been recieved, so we just print it out here
	  response.on('end', function () {
	    //res.json(str);
/////////
	
  mongodb.connect(cn, function(err, db) {
      db.collection("tables").findOne({tableNum: Number(req.query.t)},function(err2, tableInDb) {
      // console.log(str)
	  // console.log('dssdfsdgs')
	 if(!(str==null||tableInDb==null))	{
      var moveStr=String(str.aimove)
 
      var toPush=  String(tableInDb.table[dletters.indexOf(moveStr[0])][moveStr[1]-1][0])+  //color of whats moving
                    tableInDb.table[dletters.indexOf(moveStr[0])][moveStr[1]-1][1]+         //piece
                    moveStr+                                                                //the string
                    tableInDb.table[dletters.indexOf(moveStr[2])][moveStr[3]-1][0]+         //color of whats hit
                    tableInDb.table[dletters.indexOf(moveStr[2])][moveStr[3]-1][1]          //piece
      
     // if(!(toPush==tableInDb.moves[tableInDb.moves.length-1])){
        tableInDb.moves.push(toPush)
        tableInDb.table=moveIt(moveStr,tableInDb.table)
        tableInDb.wNext=!tableInDb.wNext
        tableInDb.pollNum++
        
        
        tableInDb.table=addMovesToTable(tableInDb.table,tableInDb.wNext)
      
      //}
     
      db.collection("tables").save(tableInDb, function(err3,res){})
      
	  }
	  db.close()
    });
    
    
    
    //db.close()
    //res.json({});
    
  });
  /////////
		
		
		
		
	  });
	}).end();



 	res.json({});
 	//res.json({aimove: 1, fulltable: 0});

});

// app.get('/startAiGame', function (req, res) {

//   //randomConst=Math.random()*20
					
//   firstFreeTable++
//   initTable(firstFreeTable)
//   aiOn[firstFreeTable]=true
  
//   tempRandomConst=Math.random()*100
// 	if(Math.random()>0.5){tempRandomConst=1/tempRandomConst}
// 	console.log(tempRandomConst)
// 	// var randomConst=[]
// 	randomConst[firstFreeTable]=tempRandomConst
// 	console.log(randomConst[firstFreeTable])
//  	res.json({tableno: firstFreeTable});

// });
app.get('/getTPollNum', function (req, res) {
 
  mongodb.connect(cn, function(err, db) {
      db.collection("tables").findOne({tableNum: Number(req.query.t)},function(err2, tableInDb) {
     
       if(!(tableInDb==null)){
        var passPollNum=tableInDb.pollNum
	   }else{
		   var passPollNum=0
	   }
    
      db.close()
	 res.json({tablepollnum: passPollNum});


    });
    
  });
 	
});
app.get('/getTable', function (req, res) {
 
  mongodb.connect(cn, function(err, db) {
      db.collection("tables").findOne({tableNum: Number(req.query.t)},function(err2, tableInDb) {
     if (!(tableInDb==null)){
        var passMoves=tableInDb.moves
        var passTable=tableInDb.table
        var passWnext=tableInDb.wNext
        var passPollNum=tableInDb.pollNum
        var passChat=tableInDb.chat
	}else{
		var passMoves=0.0
        var passTable=0.0
        var passWnext=0.0
        var passPollNum=0.0
        var passChat=0.0
		}
    
      db.close()
	  res.json({table: passTable, next: passWnext, allmoves: passMoves, chat: passChat});//, pollnum: pollNum[req.query.t]});

    });
    
  });
 	
});



app.get('/chat', function (req, res) {
  //console.log(req)
  
  
 mongodb.connect(cn, function(err, db) {
      db.collection("tables").findOne({tableNum: Number(req.query.t)},function(err2, tableInDb) {
     
      tableInDb.chat.push(req.query.c)
      tableInDb.pollNum++
	   
	  var passChat=tableInDb.chat
      
	  db.collection("tables").save(tableInDb, function(err3,res){})
      db.close()
	  res.json({chat: tableInDb.chat});
    });
    
  });
  
 	

});

app.get('/startGame', function (req, res) {
 
	var wPNum=players[0].indexOf(req.query.w)
	var bPNum=players[0].indexOf(req.query.b)
	
	
	
	var initedTable=new Dbtable(firstFreeTable,req.query.w,req.query.b)
	
		
	
	mongodb.connect(cn, function(err, db) {
	    db.collection("tables").insert(initedTable, function (err, doc) {});
	    db.close()
	})
	//temp end

	//?dbTables.insert(initedTable, function (err, doc) {});
	
	players[2][wPNum]=true;		//ask wplayer to start game
	players[2][bPNum]=true;		//ask bplayer to start game
	
	players[3][wPNum]=true;		//will play w
	players[3][bPNum]=false;	//will play b
	
	players[4][wPNum]=firstFreeTable
	players[4][bPNum]=firstFreeTable

	players[5][wPNum]=req.query.b;		//give them the opponents name
	players[5][bPNum]=req.query.w;	
	
	firstFreeTable++
	
	mongodb.connect(cn, function(err, db) {
		db.collection("tables").findOne({tableNum: "xData"},function(err2, xData) {
			
			xData.firstFreeTable=firstFreeTable
			
			db.collection("tables").save(xData, function(err3,res){})
			db.close()
		});
	});
  	
 
 	res.json({none: 0});

});

app.get('/watchGame', function (req, res) {
 
	var viewerNum=players[0].indexOf(req.query.v)
	//var bPNum=players[0].indexOf(req.query.b)
	
	//firstFreeTable++
	
	//players[6][viewerNum]=true;		//ask viewer to open game
	players[2][viewerNum]=true;		//ask viewer to open game
	
	players[3][viewerNum]=true;		//will watch w
	
	players[4][viewerNum]=req.query.t	//tablenum
	
	// will have to give names
	
	// players[7][wPNum]=req.query.b;		//give them the opponents name
	players[5][viewerNum]="Spectator";		//tell lobby to open spect mode
 
 	res.json({none: 0});

});

app.get('/lobbyChat', function (req, res) {
  //console.log(req)
  
  

  lobbyChat.push(req.query.c)
  
  lobbyPollNum++
  
 	res.json({lobbychat: lobbyChat});

});

function clearDisconnectedPlayers(){
	for(var i=players.length-1;i>=0;i--){

		if(players[1][i]+playerDisconnectConst<(new Date()).getTime()){
			players[1].splice(i,1)
			players[0].splice(i,1)
			lobbyPollNum++

		}


	}
	clearInactiveGames()
}
function clearInactiveGames(){
	for(var i=activeGames.length-1;i>=0;i--){

		if(activeGames[1][i]+gameInactiveConst<(new Date()).getTime()){
			activeGames[1].splice(i,1)
			activeGames[0].splice(i,1)
			lobbyPollNum++

		}

	}
}

app.get('/getLobby', function (req, res) {
  //console.log(req)
  clearDisconnectedPlayers()
  if(players[0].indexOf(req.query.p)==-1){
  		players[0].push(req.query.p)
  		players[1].push((new Date()).getTime())
  		
  		//players.sort(sortPlayers)
  		lobbyPollNum++
  
  }else{
  		players[1][players[0].indexOf(req.query.p)]=(new Date()).getTime()
  }

  	playerIndex=players[0].indexOf(req.query.p)
  	if(players[2][playerIndex]){
  		//var askToOpen=true;
  		lobbyPollNum++
  		var openTableNum=players[4][playerIndex]
  		var openTableColor=players[3][playerIndex]
		var opponentsName=players[5][playerIndex]

  		players[2][playerIndex]=false

  		res.json({players: players[0], games: [activeGames], lobbypollnum: lobbyPollNum, lobbychat: lobbyChat,
  			asktoopen: true, opentablenum: openTableNum, opentablecolor: openTableColor, opponentsname: opponentsName});


  	}else{
  		res.json({players: players[0], games: activeGames[0],lobbypollnum: lobbyPollNum, lobbychat: lobbyChat,
  			asktoopen: false});

  	}
  	
  
});




var server = app.listen(80, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('app listening at http://%s:%s', host, port);

});