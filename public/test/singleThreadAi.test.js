var assert = require('assert');
var path = '../js/worker/deepening.js';


var fs = require('fs');

eval(fs.readFileSync('../js/all/classes.js') + '');
eval(fs.readFileSync('../js/server/splitMoves.js') + '');
eval(fs.readFileSync('../js/all/engine.js') + '');

eval(fs.readFileSync(path) + '');

var vals={}

describe('test singleThreadAi /',function(){
    describe('test normal calc /',function(){
        this.timeout(15000);
        
        it('generate inited table',function(){
            
            vals.initedTable=new Dbtable(1,2,3)
            assert(vals.initedTable)
            
        })
        
        it('make e2e4 move',function(){
            
            moveInTable('e2e4',vals.initedTable)
            
        })
        
        it('use singleThreadAi function (depth 3)',function(done){
            
            vals.firstResult=singleThreadAi(vals.initedTable,3,function(){
                done()
            })
           
            
        })
        
        describe('analyze 1st result /',function(){
            
            it(".result.length is 20",function(){
                assert(vals.firstResult.result.length==20)
            })
           
            it(".winningMove.moveTree is 'b8c6,f2f3,0,g8f6,0'",function(){      
                assert(vals.firstResult.winningMove.moveTree=='b8c6,f2f3,0,g8f6,0')
            })
            
            
            it(".winningMove.score is -12832",function(){
                assert(vals.firstResult.winningMove.score==-12832)
            })
           
            
        })
        
        it('make that move',function(){
            
            
            moveInTable(vals.firstResult.winningMove.moveTree.slice(0,4),vals.initedTable)
            
          
            
        })
        
        
        it('use singleThreadAi function again (depth 3)',function(done){
            
            vals.secondResult=singleThreadAi(vals.initedTable,3,function(){
                done()
            })
           
            
        })
        
        describe('analyze 2nd result /',function(){
            
            it(".result.length is 30",function(){
                
                assert(vals.secondResult.result.length==30)
            })
           
            it(".winningMove.moveTree is 'b1c3,a7a6,0,g1e2,0'",function(){      
                
                assert(vals.secondResult.winningMove.moveTree=='b1c3,a7a6,0,g1e2,0')
            })
            
            
            it(".winningMove.score is -14080",function(){
                //console.log(vals.secondResult.winningMove.score)
                assert(vals.secondResult.winningMove.score==-14080)
            })
           
            
        })
        
     
    })
    
        describe('test modded calc /',function(){
        this.timeout(15000);
        
        it('generate inited table',function(){
            
            vals.initedTable=new Dbtable(1,2,3)
            assert(vals.initedTable)
            
        })
        
        it('make e2e4 move',function(){
            
            moveInTable('e2e4',vals.initedTable)
            
        })
        
        it("use modded singleThreadAi function (depth 3, 'fwV', 1.5)",function(done){
            
            vals.firstResult=singleThreadAi(vals.initedTable,3,function(){
                done()
            },{
                modType:'fwV',
                modVal:1.5
            })
           
            
        })
        
        describe('analyze 1st modded result /',function(){
            
            it(".result.length is 20",function(){

                
                assert(vals.firstResult.result.length==20)
            })
           
            it(".winningMove.moveTree is 'b8c6,f2f3,0,g8f6,0'",function(){      

                assert(vals.firstResult.winningMove.moveTree=='b8c6,f2f3,0,g8f6,0')
            })
            
            
            it(".winningMove.score is -20256",function(){

                assert(vals.firstResult.winningMove.score==-20256)
            })
           
            
        })
        
        it('make that move',function(){
            
            
            moveInTable(vals.firstResult.winningMove.moveTree.slice(0,4),vals.initedTable)
            
          
            
        })
        
        
        it("use modded singleThreadAi function again (depth 3, 'fwV', 1.5)",function(done){
            
            vals.secondResult=singleThreadAi(vals.initedTable,3,function(){
                done()
            },{
                modType:'fwV',
                modVal:1.5
            })
           
            
        })
        
        describe('analyze 2nd modded result /',function(){
            
            it(".result.length is 30",function(){

                
                assert(vals.secondResult.result.length==30)
            })
           
            it(".winningMove.moveTree is 'b1c3,a7a6,0,g1e2,0'",function(){      

                
                assert(vals.secondResult.winningMove.moveTree=='b1c3,a7a6,0,g1e2,0')
            })
            
            
            it(".winningMove.score is -21248",function(){

                assert(vals.secondResult.winningMove.score==-21248)
            })
           
            
        })
        
     
    })
    
    
    
    
    
    
    
    
    
    
    
    
    
})
