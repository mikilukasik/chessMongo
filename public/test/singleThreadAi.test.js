var assert = require('assert');
var path = '../js/worker/deepening.js';


var fs = require('fs');
//var vm = require('vm');

eval(fs.readFileSync('../js/all/classes.js') + '');
eval(fs.readFileSync('../js/server/splitMoves.js') + '');
eval(fs.readFileSync('../js/all/engine.js') + '');

eval(fs.readFileSync(path) + '');

var vals={}

describe('test ai /',function(){
    describe('test single thread calc /',function(){
        this.timeout(15000);
        
        it('generate inited table',function(){
            
            vals.initedTable=new Dbtable(1,2,3)
            assert(vals.initedTable)
            
        })
        
        it('use singleThreadAi function',function(){
            
            vals.firstResult=singleThreadAi(vals.initedTable,3)
            
            
            
        })
        
        describe('analyze 1st result /',function(){
            
            it('has winning move',function(){
                
                assert(vals.firstResult.winningMove)
                console.log(vals.firstResult.moveStr)
                
              
            })
            
            it(".moveTree is 'g1f3,e7e5,0,f3e5,1'",function(){
                assert(vals.firstResult.winningMove.moveTree=='g1f3,e7e5,0,f3e5,1')
            })
            
            
            it(".score is 53440",function(){
                assert(vals.firstResult.winningMove.score==53440)
            })
            
        })
        
       //done()
        
    })
})
