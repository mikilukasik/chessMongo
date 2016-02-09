  var testing={
            testAi:function(){
                
                var success=true
                
                var vals={}
                
                console.log('generate inited table')
                vals.initedTable=new Dbtable(1,2,3)
                
                console.log('make e2e4 move')
                moveInTable('e2e4',vals.initedTable)
                
                console.log('use singleThreadAi function (depth 3)')
                vals.firstResult=singleThreadAi(vals.initedTable,3)
                
                if(vals.firstResult.result.length==20){
                    console.log(".result.length is 20")
                }else{
                    throw new Error('.result.length is not 20')
                    console.log('.result.length:',vals.firstResult.result.length)
                    success=false
                }
                if(vals.firstResult.winningMove.moveTree=='b8c6,f2f3,0,g8f6,0'){
                    console.log(".winningMove.moveTree is 'b8c6,f2f3,0,g8f6,0'")
                }else{
                    throw new Error(".winningMove.moveTree is not 'b8c6,f2f3,0,g8f6,0'")
                    console.log('.winningMove.moveTree:',vals.firstResult.winningMove.moveTree)
                    success=false
                }
                if(vals.firstResult.winningMove.score==1504){
                    console.log(".winningMove.score is 1504")
                }else{
                    throw new Error('.winningMove.score is not 1504')
                    console.log('.winningMove.score:',vals.firstResult.winningMove.score)
                    success=false
                }
                
                
                return success
                
                
                
                
            }
        }