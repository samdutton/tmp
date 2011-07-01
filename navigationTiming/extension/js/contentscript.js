$(document).ready( function() {
	var request = {};
	request = window.performance; // make a copy of the performance object
	request.type = "performance"; // add a type attribute to differentiate
	chrome.extension.sendRequest(request, function(response){});    
});

chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		var response = {};
		if (request.type === "consoleLog") {
			console.log(request.value);
		}
		else {
			console.log("Unknown request type: " + request.type);
		}
		sendResponse(response); // otherwise request remains open 
	}
);