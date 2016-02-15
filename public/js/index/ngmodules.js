/////////////// directives and filters
        
        var reverseFilter=function() {
            return function(items) {
                return items.slice().reverse();
            };
        }
        
        var mc2mvFilter=function () {
            return function (mc) {
                return getMvFromMc(mc)
                
            }
        }
        
        var mv2mcFilter=function () {
            return function (mv) {
                return getMcFromMv(mv)
                
            }
        }
        
        var wtable=function() {
			return {
				restrict: 'E',
				scope: {
					'input': '=',
					'clickfunc': '=',
					'myclass': '=',
                    'headingclass': '=',
					'imgh': '=',
					'imgv': '=',
                    
					
				},
                link: function(scope, element, attrs) {
                    
                    var origtable=undefined	
                  
                    scope.$watch('input',function(oldValue,newValue){
                        
                        //console.log('si',scope.input,'o',oldValue,'n',newValue)
                       
                        if(scope.input&&oldValue&&newValue){
                       
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
                                    
                                    if(oldValue&&oldValue[i][j][0] != newValue[i][j][0]) scope.input[i][j][15] = true       //highlight moved
                                    

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
                        
                                
                        ////console.log(scope.outTable)
                    }
                        
                    },true)
                   
                    
                   
                   
                   
                   
                },
				template: '<table class="{{myclass}}" onload="updateSizes()" style="width:{{sizempl}}%">\
							<tr class="heading row0 {{headingclass}}">\
								<td class="left-column {{headingclass}}"></td>\
								<td>A</td>\
								<td>B</td>\
								<td>C</td>\
								<td>D</td>\
								<td>E</td>\
								<td>F</td>\
								<td>G</td>\
								<td>H</td>\
							</tr>\
							<tr ng-repeat="(xIndex, x) in outTable track by $index">\
								<td class="left-column {{headingclass}}">{{8-$index}}</td>\
								<td ng-repeat="(yIndex, y) in x track by $index" ng-click="clickfunc(xIndex+1,yIndex)" ng-class="{ darker: y[7], square: !y[7]}">\
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
                    'headingclass': '=',
					'imgh': '=',
					'imgv': '=',
					
				},
                link: function(scope, element, attrs) {
                    
                    
                    
                    var origtable=undefined	
                   
                    scope.$watch('input',function(oldValue,newValue){
                        
                        if(scope.input&&oldValue&&newValue){
                          
                        
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
                                    
                                    if(oldValue&&oldValue[i][j][0] != newValue[i][j][0]) scope.input[i][j][15] = true       //highlight moved
                                    
                                    

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
                        
                        
                    }
                    },true)
                   
                    
                   
                   
                   
                   
                },
				template: '<table class="{{myclass}}" onload="updateSizes()"">\
							<tr class="heading row0 {{headingclass}}">\
								<td class="left-column {{headingclass}}"></td>\
								<td>H</td>\
								<td>G</td>\
								<td>F</td>\
								<td>E</td>\
								<td>D</td>\
								<td>C</td>\
								<td>B</td>\
								<td>A</td>\
							</tr>\
							<tr ng-repeat="(xIndex, x) in outTable track by $index">\
								<td class="left-column {{headingclass}}">{{1+$index}}</td>\
								<td ng-repeat="(yIndex, y) in x track by $index" ng-click="clickfunc(8-xIndex,7-yIndex)" ng-class="{ darker: y[7], square: !y[7]}">\
									<div ng-class="divAroundIt">\
										<img ng-src="{{\'cPiecesPng/\'+y[0]+y[1]+\'.png\'}}" height="{{imgh}}" width="{{imgw}}" ng-class="{ selected: y[8]||y[9], selected2: y[15]}">\
									</div>\
								</td>\
							</tr>\
						</table>'
	
			}
		}  
        
        
        
              
        var movesDtv=function() {
			return {
				restrict: 'E',
				scope: {
					'input': '=',
                    'imgsize': '='
					
				},
                link: function(scope, element, attrs) {
                    
                    
        
                   
                },
				template: '<td class="scrollThis">\
							<div class="lbborder scrollThis moves" style="overflow-y:scroll">\
								<div ng-repeat="x in input track by $index">\
									<img ng-src="{{\'cPiecesPng/\'+x[0]+x[1]+\'.png\'}}"  height="{{imgsize}}" width="{{imgsize}}">\
									<div style="display:inline-block;position:relative;top:-5px">{{x[2]+x[3]+x[4]+x[5]}}</div>\
									<img ng-src="{{\'cPiecesPng/\'+x[6]+x[7]+\'.png\'}}"  class="rotate90" height="{{imgsize}}" width="{{imgsize}}">\
								</div>\
							</div>\
						</td>'
	
			}
		}
        
        
        var busyThinkersDtv=function() {
			return {
				restrict: 'E',
				scope: {
					'input': '=',
                    // 'imgsize': '='
					
				},
                link: function(scope, element, attrs) {
                    
                    
        
                   
                },
				template: '<div ng-repeat="x in input track by $index">\
								<div ng-if="x.sentCount!=0" style="font-size: 0.75em;text-align: center;" ng-class="{ makeGreen: x.done , makeRed: !x.done , makeGrey: x.sentCount==0 }">{{x.lastUser}}: {{x.sentCount}} <span ng-if="x.sentCount!=1">moves</span><span\ ng-if="x.sentCount==1">move</span><span><br>eta:{{x.beBackIn/1000}}s</span></div>\
								<progress  ng-if="x.sentCount!=0" class="prog" max="100" style="width:100%; height:4px; color:blue" value="{{x.progress*(1-x.addProgress)+(100*x.addProgress)}}">\
						  </div>'
	
			}
		}
        
        var learnerResultsDtv=function() {
			return {
				restrict: 'E',
				scope: {
					'input': '=',
                    'selectreporterfunc': '=',
                   
					
				},
                link: function(scope, element, attrs) {
                    
                    
        
                   
                },
				template: '<table class="atable">\
								<tr>\
									<td>_id</td>\
									<td>reporting</td>\
									<td>modStr</td>\
									<td>wModded</td>\
									<td>learningOn</td>\
									<td>result</td>\
								</tr>\
								<tr ng-repeat="x in input">\
									<td>\
										{{x._id}}\
									</td>\
									<td>\
										<input type="checkbox" ng-model="x.reporting" ng-change="selectreporterfunc(\'reporting\',x,x.reporting)" />\
									</td>\
									<td>\
										{{x.modStr}}\
									</td>\
									<td>\
										{{x.wModded}}\
									</td>\
									<td>\
										{{x.learningOn}}\
									</td>\
									<td>\
                                        <table>\
                                            <tr ng-if="x.result" style="font-size:0.6em">\
                                                <td>\
                                                    whiteWon\
                                                </td>\
                                                <td>\
                                                    blackWon\
                                                </td>\
                                                <td>\
                                                    isDraw\
                                                </td>\
                                                <td>\
                                                    whiteValue\
                                                </td>\
                                                <td>\
                                                    blackValue\
                                                </td>\
                                                <td>\
                                                    totalMoves\
                                                </td>\
                                            </tr>\
                                            <tr>\
                                                <td>\
                                                    {{x.result.whiteWon}}\
                                                </td>\
                                                <td>\
                                                    {{x.result.blackWon}}\
                                                </td>\
                                                <td>\
                                                    {{x.result.isDraw}}\
                                                </td>\
                                                <td>\
                                                    {{x.result.whiteValue}}\
                                                </td>\
                                                <td>\
                                                    {{x.result.blackValue}}\
                                                </td>\
                                                <td>\
                                                    {{x.result.totalMoves}}\
                                                </td>\
                                            </tr>\
                                        </table>\
									</td>\
								</tr>\
							</table>'
	
			}
		}
        
        