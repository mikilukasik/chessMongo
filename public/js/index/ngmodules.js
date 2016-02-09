/////////////// directives and filters
        
        var reverseFilter=function() {
            return function(items) {
                return items.slice().reverse();
            };
        }
        
        var wtable=function() {
			return {
				restrict: 'E',
				scope: {
					'input': '=',
					'clickfunc': '=',
					'myclass': '=',
					'imgh': '=',
					'imgv': '=',
                    
					
				},
                link: function(scope, element, attrs) {
                    
                    var origtable=undefined	
                  
                    scope.$watch('input',function(oldValue,newValue){
                       
                        var changed=false
                        
                         for (var i = 0; i < 8; i++) {
                            
                           
                            
                            for (var j = 0; j < 8; j++) {
                                
                                if(origtable==undefined || oldValue[i][j][0]!=newValue[i][j][0])changed=true
                        
                            }
                            
                         }
                        
                        if(changed){
                            
                            scope.outTable=new Array(8)
                        
                            for (var i = 0; i < 8; i++) {
                                
                                scope.outTable[i]=new Array(8)
                                
                                for (var j = 0; j < 8; j++) {
                                    
                                    if(oldValue[i][j][0] != newValue[i][j][0]) scope.input[i][j][15] = true       //highlight moved
                                    

                                    scope.outTable[i][j] = new Array(8)
                                    scope.outTable[i][j] = scope.input[j][7 - i]
                                   

                                    if ((i + j) & 1) scope.outTable[i][j][7] = true     //grey fields
                                    
                                    
                                }
                            }
                            
                            origtable = scope.outTable
                          
                            
                        }else{
                            
                            scope.outTable=new Array(8)
                        
                            for (var i = 0; i < 8; i++) {
                                
                                scope.outTable[i]=new Array(8)
                                
                                for (var j = 0; j < 8; j++) {
                                    
                                    if(origtable[i][j]&&origtable[i][j][15]) scope.input[j][7-i][15] = true       //highlight the old one
                                    

                                    scope.outTable[i][j] = new Array(8)
                                    scope.outTable[i][j] = scope.input[j][7 - i]
                                    

                                    if ((i + j) & 1) scope.outTable[i][j][7] = true     //grey fields
                                    
                                    
                                }
                            }
                         
                        }
                        
                                
                        console.log(scope.outTable)
                        
                        
                    },true)
                   
                    
                   
                   
                   
                   
                },
				template: '<table class="{{myclass}}" onload="updateSizes()" style="width:{{sizempl}}%">\
							<tr class="heading row0">\
								<td class="left-column"></td>\
								<td>A</td>\
								<td>B</td>\
								<td>C</td>\
								<td>D</td>\
								<td>E</td>\
								<td>F</td>\
								<td>G</td>\
								<td>H</td>\
							</tr>\
							<tr ng-repeat="(xIndex, x) in outTable">\
								<td class="left-column">{{8-$index}}</td>\
								<td ng-repeat="(yIndex, y) in x" ng-click="clickfunc(xIndex+1,yIndex)" ng-class="{ darker: y[7], square: !y[7]}">\
									<div ng-class="divAroundIt">\
										<img ng-src="{{\'cPiecesPng/\'+y[0]+y[1]+\'.png\'}}" height="{{imgh}}" width="{{imgw}}" ng-class="{ selected: y[8]||y[9], selected2: y[15]}">\
									</div>\
								</td>\
							</tr>\
						</table>'
	
			}
		}
        
        
        var btable=function() {
			return {
				restrict: 'E',
				scope: {
					'input': '=',
					'clickfunc': '=',
					'myclass': '=',
					'imgh': '=',
					'imgv': '=',
					
				},
                link: function(scope, element, attrs) {
                    
                    var origtable=undefined	
                   
                    scope.$watch('input',function(oldValue,newValue){
                        
                         var changed=false
                        
                         for (var i = 0; i < 8; i++) {
                            
                           
                            
                            for (var j = 0; j < 8; j++) {
                                
                                if(origtable==undefined || oldValue[i][j][0]!=newValue[i][j][0])changed=true
                        
                            }
                            
                         }
                         
                         
                        if(changed){
                        
                            scope.outTable=new Array(8)
                        
                            for (var i = 0; i < 8; i++) {
                                
                                scope.outTable[i]=new Array(8)
                                
                                for (var j = 0; j < 8; j++) {
                                    
                                    if(oldValue[i][j][0] != newValue[i][j][0]) scope.input[i][j][15] = true       //highlight moved
                                    
                                    

                                    scope.outTable[i][j] = new Array(8)
                                    scope.outTable[i][j] = scope.input[7-j][i]
                                    

                                    if ((i + j) & 1) scope.outTable[i][j][7] = true     //makes grey fields grey
                                    
                                }
                            }
                            
                            origtable = scope.outTable
                            
                            
                            
                        }else{
                            
                            scope.outTable=new Array(8)
                        
                            for (var i = 0; i < 8; i++) {
                                
                                scope.outTable[i]=new Array(8)
                                
                                for (var j = 0; j < 8; j++) {
                                    
                                    if(origtable[i][j]&&origtable[i][j][15]) scope.input[7-j][i][15] = true       //highlight the old one
                                    
                                    

                                    scope.outTable[i][j] = new Array(8)
                                    scope.outTable[i][j] = scope.input[7-j][i]
                                    

                                    if ((i + j) & 1) scope.outTable[i][j][7] = true     //makes grey fields grey
                                    
                                }
                            }
                            
                            
                            
                            
                        }
                        
                        
                        console.log(scope.outTable)
                        
                        
                    },true)
                   
                    
                   
                   
                   
                   
                },
				template: '<table class="{{myclass}}" onload="updateSizes()"">\
							<tr class="heading row0">\
								<td class="left-column"></td>\
								<td>H</td>\
								<td>G</td>\
								<td>F</td>\
								<td>E</td>\
								<td>D</td>\
								<td>C</td>\
								<td>B</td>\
								<td>A</td>\
							</tr>\
							<tr ng-repeat="(xIndex, x) in outTable">\
								<td class="left-column">{{1+$index}}</td>\
								<td ng-repeat="(yIndex, y) in x" ng-click="clickfunc(8-xIndex,7-yIndex)" ng-class="{ darker: y[7], square: !y[7]}">\
									<div ng-class="divAroundIt">\
										<img ng-src="{{\'cPiecesPng/\'+y[0]+y[1]+\'.png\'}}" height="{{imgh}}" width="{{imgw}}" ng-class="{ selected: y[8]||y[9], selected2: y[15]}">\
									</div>\
								</td>\
							</tr>\
						</table>'
	
			}
		}