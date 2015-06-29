var Dbtable=function (tableNum) {	//class
	this.tableNum = tableNum,
	this.table=[],
	this.wNext=true,
	this.aiOn=false,
	this.chat=[],
	this.moves=[],
	this.pollNum=1,
	this.allPastTables=[]
	console.log('dskhbbvkdbfksdbc')
}

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