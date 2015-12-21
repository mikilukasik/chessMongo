


// function noCircular(input){
	
// 	//http://stackoverflow.com/questions/11616630/json-stringify-avoid-typeerror-converting-circular-structure-to-json
		
// 	var cache = [];
// 	var result = JSON.stringify(input, function(key, value) {
// 		if (typeof value === 'object' && value !== null) {
// 			if (cache.indexOf(value) !== -1) {
// 				// Circular reference found, discard key
// 				return;
// 			}
// 			// Store value in our collection
// 			cache.push(value);
// 		}
// 		return value;
// 	});
// 	cache = null; // Enable garbage collection
		
// 	return result
	
// }