//http://techslides.com/html5-web-workers-for-ajax-requests
//http://stackoverflow.com/questions/6396101/pure-javascript-send-post-data-without-a-form


//simple XHR request in pure JavaScript

var getXhr = function(){
	
	var xhr;

	if(typeof XMLHttpRequest !== 'undefined') xhr = new XMLHttpRequest();
	else {
		var versions = ["MSXML2.XmlHttp.5.0", 
			 	"MSXML2.XmlHttp.4.0",
			 	"MSXML2.XmlHttp.3.0", 
			 	"MSXML2.XmlHttp.2.0",
			 	"Microsoft.XmlHttp"]

		for(var i = 0, len = versions.length; i < len; i++) {
		try {
			xhr = new ActiveXObject(versions[i]);
			break;
		}
			catch(e){}
		} // end for
	}
	
	return xhr
}

function simpleGet(url, callback, ecb) {
	
	var xhr=getXhr();

	// if(typeof XMLHttpRequest !== 'undefined') xhr = new XMLHttpRequest();
	// else {
	// 	var versions = ["MSXML2.XmlHttp.5.0", 
	// 		 	"MSXML2.XmlHttp.4.0",
	// 		 	"MSXML2.XmlHttp.3.0", 
	// 		 	"MSXML2.XmlHttp.2.0",
	// 		 	"Microsoft.XmlHttp"]

	// 	for(var i = 0, len = versions.length; i < len; i++) {
	// 	try {
	// 		xhr = new ActiveXObject(versions[i]);
	// 		break;
	// 	}
	// 		catch(e){}
	// 	} // end for
	// }
		
	xhr.onreadystatechange = ensureReadiness;
		
	function ensureReadiness() {
		if(xhr.readyState < 4) {
			return;
		}
			
		if(xhr.status !== 200) {
			ecb(xhr);
		}else{

		
			if(xhr.readyState === 4) {
				// all is well	
				
				callback(xhr);
				
			}else{
				
				ecb(xhr);
				
			}	
		}		
	}
		
	xhr.open('GET', url, true);
	xhr.send('');
}
	
	
	
	
function simplePost(url, postThis, callback, ecb) {
	
	var xhr=getXhr();

	// if(typeof XMLHttpRequest !== 'undefined') xhr = new XMLHttpRequest();
	// else {
	// 	var versions = ["MSXML2.XmlHttp.5.0", 
	// 		 	"MSXML2.XmlHttp.4.0",
	// 		 	"MSXML2.XmlHttp.3.0", 
	// 		 	"MSXML2.XmlHttp.2.0",
	// 		 	"Microsoft.XmlHttp"]

	// 	for(var i = 0, len = versions.length; i < len; i++) {
	// 	try {
	// 		xhr = new ActiveXObject(versions[i]);
	// 		break;
	// 	}
	// 		catch(e){}
	// 	} // end for
	// }
		
	xhr.onreadystatechange = ensureReadiness;
		
	function ensureReadiness() {
		if(xhr.readyState < 4) {
			return;
		}
			
		if(xhr.status !== 200) {
			ecb(xhr);
		}else{

		
			if(xhr.readyState === 4) {
				// all is well	
				
				callback(xhr);
				
			}else{
				
				ecb(xhr);
				
			}	
		}		
	}
		
	xhr.open('POST', url, true);
	xhr.send(postThis);
}
	