var assert = require('assert');
var path = '../js/worker/deepening.js';


var fs = require('fs');

eval(fs.readFileSync('../js/all/classes.js') + '');
eval(fs.readFileSync('../js/server/splitMoves.js') + '');
eval(fs.readFileSync('../js/all/engine.js') + '');

eval(fs.readFileSync(path) + '');

var vals={}

describe('test ai /',function(){
    describe('test single thread calc /',function(){
        //this.timeout(15000);
        
        it('generate inited table',function(){
            
            vals.initedTable=new Dbtable(1,2,3)
            assert(vals.initedTable)
            
        })
        
        it('make e2e4 move',function(){
            
            moveInTable('e2e4',vals.initedTable)
            
        })
        
        it('use singleThreadAi function (depth 3)',function(done){
            
            vals.firstResult=singleThreadAi(vals.initedTable,3)
            
            setTimeout(function() {
                done()
            }, 10000);
            
            
        })
        
        describe('analyze 1st result /',function(){
            
            it(".result.length is 20",function(){
                assert(vals.firstResult.result.length==20)
            })
           
            it(".winningMove.moveTree is 'b8c6,f2f3,0,g8f6,0'",function(){      //why??
                assert(vals.firstResult.winningMove.moveTree=='b8c6,f2f3,0,g8f6,0')
            })
            
            
            it(".winningMove.score is -12832",function(){
                assert(vals.firstResult.winningMove.score==-12832)
            })
           
            
        })
        
     
    })
})
