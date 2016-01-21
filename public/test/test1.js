var assert = require('assert');
var path = '../js/worker/deepening.js';


var fs = require('fs');
var vm = require('vm');

eval(fs.readFileSync('../js/all/classes.js') + '');
eval(fs.readFileSync('../js/server/splitMoves.js') + '');
eval(fs.readFileSync('../js/all/engine.js') + '');
eval(fs.readFileSync(path) + '');


// var code = fs.readFileSync(path);
// vm.runInThisContext(code);




var vals={}

describe('test ai /',function(){
    describe('test single thread calc /',function(){
        
        it('generate inited table',function(){
            
            vals.initedTable=new Dbtable(1,2,3)
            assert(vals.initedTable)
            
        })
        
        it('get l3 move on table',function(){
            
            vals.firstResult=singleThreadAi(vals.initedTable,3)
            console.log('vals.firstResult:',vals.firstResult)
            
        })
        
        describe('analyze 1st result /',function(){
            
            it('has winning move',function(){
                
                console.log('vals.firstResult.winningMove:',vals.firstResult.winningMove)
                assert(vals.firstResult.winningMove)
                
                
            })
            
        })
        
    })
})
