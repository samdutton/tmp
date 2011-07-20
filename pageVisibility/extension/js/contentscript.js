console.log("beginning of script: " + $("embed[type='application/x-shockwave-flash']").length);

$(document).ready( function() {
	console.log("document ready: " + $("embed[type='application/x-shockwave-flash']").length);
});

chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		var response = {};
//		console.log("request.type: " + request.type);
		if (request.type === "foo") {
		} else if (request.type == "bar") {
		} else {
			console.log("Unknown request type: " + request.type);
		}
//		sendResponse(response); // otherwise request remains open 
	}
);


// embed src="http://www.youtube.com/v/DH8evFsexXo" type="application/x-shockwave-flash"
// <embed type="application/x-shockwave-flash" src="http://s.ytimg.com/yt/swfbin/watch_as3-vflYi8Mkr.swf"
