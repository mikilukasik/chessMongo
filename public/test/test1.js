var assert = require('assert');
var path = '../js/worker/deepening.js';


var fs = require('fs');
var vm = require('vm');

var code = fs.readFileSync(path);
vm.runInThisContext(code);


eval(fs.readFileSync('../js/all/classes.js') + '');
eval(fs.readFileSync('../js/all/engine.js') + '');


var vals={}

describe('ai',function(){
    describe('single thread calc works',function(){
        
        it('generate inited table',function(){
            
            vals.initedTable=new Dbtable(1,2,3)
            assert(vals.initedTable)
            
        })
        
        // it('has singleThreadAi function',function(){
            
        //     assert(singleThreadAi)
            
        // })
        
        
        
        
        
        
    })
})
