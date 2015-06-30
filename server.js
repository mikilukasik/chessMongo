
//
var express = require('express');
var morgan = require('morgan');
var app = express();
//
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/chessdb');
//
//http://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files
var fs = require('fs');

// file is included here:
eval(fs.readFileSync('public/brandNewAi.js')+'');
eval(fs.readFileSync('public/tableClass.js')+'');
//http://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files


app.use(express.static('public'))
app.use(morgan("combined"))

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});
//
var dbTables=db.get('tables');




var firstFreeTable=0

// //temp

// var tempPracticeTable=new Dbtable(Math.floor(Math.random()*10000)+10000)
// tempPracticeTable.wNext=false
// // Submit to the DB
// dbTables.insert(tempPracticeTable, function (err, doc) {});
// //temp end



var t1const=2.5

//clear this bullshit
var activeGames=[]
activeGames[0]=[]		//tablenum
activeGames[1]=[]		//?
var tablesLastMoved=[]
//



var dletters = ["a","b","c","d","e","f","g","h"]
//var dfigures = ["","King","Queen","Rook","Bishop","Knight","Pawn"]

//this looks like a stinking hack.. 
//var dcolors = ["","Black","White"]


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



app.get('/move', function (req, res) {
	//remember when last moved:
	// if(activeGames[0].indexOf(req.query.t)==-1){
  	// 	activeGames[0].push(req.query.t)
  	// 	activeGames[1].push((new Date()).getTime())
  		
  	// 	//activeGames.sort(sortactiveGames)
  	// 	lobbyPollNum++
  
  // }else{
  	// 	activeGames[1][activeGames[0].indexOf(req.query.t)]=(new Date()).getTime()
  // }
	
 var moveStr=String(req.query.m)
 //var stringToCompare=string(allMoves[allMoves.length-1])
 //if (!(moveStr==stringToCompare.substring(2,6))){
	var toPush=  String(allTables[req.query.t][dletters.indexOf(moveStr[0])][moveStr[1]-1][0])+
		allTables[req.query.t][dletters.indexOf(moveStr[0])][moveStr[1]-1][1]+
		moveStr+
		allTables[req.query.t][dletters.indexOf(moveStr[2])][moveStr[3]-1][0]+
		allTables[req.query.t][dletters.indexOf(moveStr[2])][moveStr[3]-1][1]
	
	if(!(toPush==allMoves[allMoves.length-1])){
		allMoves[req.query.t].push(toPush)
	  	allTables[req.query.t]=moveIt(moveStr,allTables[req.query.t])
		  
		  //trick here:
		 // allTables[req.query.t]=moveIt(ai(allTables[req.query.t],false),allTables[req.query.t])
		   allWNexts[req.query.t]=!allWNexts[req.query.t]
	  allTables[req.query.t]=addMovesToTable(allTables[req.query.t],allWNexts[req.query.t])
	  // protectPieces(allTables[req.query.t],true)
	  // protectPieces(allTables[req.query.t],false)
	}
  var result=allTables[req.query.t]
  //pushTableState(req.query.t)
 
  pollNum[req.query.t]++
  
 	res.json({table: result});
 
});


app.get('/aiMove', function (req, res) {
	var tempConst=t1const
	if(activeGames[0].indexOf(req.query.t)==-1){
  		activeGames[0].push(req.query.t)
  		activeGames[1].push((new Date()).getTime())
  		
  		//activeGames.sort(sortactiveGames)
  		lobbyPollNum++
  
  }else{
  		activeGames[1][activeGames[0].indexOf(req.query.t)]=(new Date()).getTime()
  }
  t1const=11
  if(req.query.p==2){			//2 stands for white
	   var result=ai(allTables[req.query.t],true)
  }else{
	  var result=ai(allTables[req.query.t],false)
	  
  }
  t1const=tempConst
  result1=result[1][0]
 
 	res.json({aimove: result1, fulltable: result});

});

app.get('/startAiGame', function (req, res) {

  //randomConst=Math.random()*20
					
  firstFreeTable++
  initTable(firstFreeTable)
  aiOn[firstFreeTable]=true
  
  tempRandomConst=Math.random()*100
	if(Math.random()>0.5){tempRandomConst=1/tempRandomConst}
	console.log(tempRandomConst)
	// var randomConst=[]
	randomConst[firstFreeTable]=tempRandomConst
	console.log(randomConst[firstFreeTable])
 	res.json({tableno: firstFreeTable});

});
app.get('/getTPollNum', function (req, res) {
  //console.log(req)
  
 // var result=allTables[req.query.t]
  
 	res.json({tablepollnum: pollNum[req.query.t]});

});
app.get('/getTable', function (req, res) {
  //console.log(req)
  
  var result=allTables[req.query.t]
  
 	res.json({table: result, next: allWNexts[req.query.t], allmoves: allMoves[req.query.t], chat: allChats[req.query.t]});//, pollnum: pollNum[req.query.t]});

});



app.get('/chat', function (req, res) {
  //console.log(req)
  
  

  allChats[req.query.t].push(req.query.c)
  
  pollNum[req.query.t]++
  
 	res.json({chat: allChats[req.query.t]});

});

app.get('/startGame', function (req, res) {
 
	var wPNum=players[0].indexOf(req.query.w)
	var bPNum=players[0].indexOf(req.query.b)
	
	firstFreeTable++
	
	var initedTable=new Dbtable(firstFreeTable)
	dbTables.insert(initedTable, function (err, doc) {});
	
	players[2][wPNum]=true;		//ask wplayer to start game
	players[2][bPNum]=true;		//ask bplayer to start game
	
	players[3][wPNum]=true;		//will play w
	players[3][bPNum]=false;	//will play b
	
	players[4][wPNum]=firstFreeTable
	players[4][bPNum]=firstFreeTable

	players[5][wPNum]=req.query.b;		//give them the opponents name
	players[5][bPNum]=req.query.w;		
 
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
  	
  
 	//res.json({players: players[0], lobbypollnum: lobbyPollNum, lobbychat: lobbyChat});

});

function initTable(tNo){
		aiOn[tNo]=false
		allPastTables[tNo]=[]
		
//randomConst[tNo]=5//Math.random()*100
						//if(Math.random()>0.5){randomConst[tNo]=1/randomConst[tNo]}

	
	pollNum[tNo]=1

//function initTable(){	
	allWNexts[tNo]=true
	allChats[tNo]=[]
	allMoves[tNo]=[]
	//var tempString=""							
	//var 
	allTables[tNo] = new Array(8)							//create 8x8 array
	for (var i = 0; i < 8; i++) {
		allTables[tNo][i] = new Array(8)
	}
	


	for(j=2; j<6; j++){ 							//make the blanks blank
		for(i=0; i<8; i++){
			allTables[tNo][i][j]=[0,0,false,false,false]//,blankFunction]		
			//[][]=[color,piece,selected,isInItsOriginalPosition for king and rook or CanBeHitEnPass for pawns,highLighted,canMoveTo]
		}
	}




	//wNext=true



	// [3] is isInItsOriginalPosition for king and rook or CanBeHitEnPass for pawns
	
	for (var i = 0; i < 8; i++) {									//row of white pawns
		
		allTables[tNo][i][1]=[2,1,false,false,false]//,pawnCanMove]
	}
	for (var i = 0; i < 8; i++) {									//row of black pawns
		allTables[tNo][i][6]=[1,1,false,false,false]//,pawnCanMove]
	}
	allTables[tNo][0][0]=[2,4,false,true,false]//,rookCanMove]				//rooks
	allTables[tNo][7][0]=[2,4,false,true,false]//,rookCanMove]
	allTables[tNo][0][7]=[1,4,false,true,false]//,rookCanMove]
	allTables[tNo][7][7]=[1,4,false,true,false]//,rookCanMove]

	allTables[tNo][1][0]=[2,3,false,true,false]//,horseCanMove]					//knights
	allTables[tNo][6][0]=[2,3,false,true,false]//,horseCanMove]
	allTables[tNo][1][7]=[1,3,false,true,false]//,horseCanMove]
	allTables[tNo][6][7]=[1,3,false,true,false]//,horseCanMove]
	
	allTables[tNo][2][0]=[2,2,false,true,false]//,bishopCanMove]				//bishops
	allTables[tNo][5][0]=[2,2,false,true,false]//,bishopCanMove]
	allTables[tNo][2][7]=[1,2,false,true,false]//,bishopCanMove]
	allTables[tNo][5][7]=[1,2,false,true,false]//,bishopCanMove]

	allTables[tNo][3][0]=[2,5,false,true,false]//,queenCanMove]				//w queen
	allTables[tNo][4][0]=[2,9,false,true,false]//,kingCanMove]				//w king
	
	allTables[tNo][3][7]=[1,5,false,true,false]//,queenCanMove]				//b q
	allTables[tNo][4][7]=[1,9,false,true,false]//,kingCanMove]				//b k
	
	//console.log("initTable done")
	
//}
  console.log(allTables[tNo])
  
  allTables[tNo]=addMovesToTable(allTables[tNo],true)
  protectPieces(allTables[tNo],true)
  protectPieces(allTables[tNo],false)
}
app.get('/initTable', function (req,res) {
	if(activeGames[0].indexOf(req.query.t)==-1){
  		activeGames[0].push(req.query.t)
  		activeGames[1].push((new Date()).getTime())
  		
  		//activeGames.sort(sortactiveGames)
  		lobbyPollNum++
  
  }else{
  		activeGames[1][activeGames[0].indexOf(req.query.p)]=(new Date()).getTime()
  }
	initTable(req.query.t)
  var result=allTables[req.query.t]

	res.json({table: result});

});//


var server = app.listen(80, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('app listening at http://%s:%s', host, port);

});