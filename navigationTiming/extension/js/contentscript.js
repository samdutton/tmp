function sendPerformanceObject() {
// 	var request = {};
// 	request = window.performance; // make a copy of the performance object
//	request.type = "performance"; // add a type attribute to differentiate
//	chrome.extension.sendRequest(request, function(response){});    
	chrome.extension.sendRequest(window.performance, function(response){});    
	console.log("in contentscript");
	console.log(request);
}

$(document).ready( function() {
	setTimeout(sendPerformanceObject, 100);
});

chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		var response = {};
		if (request.type === "consoleLog") {
			console.log(request.value);
// 		} else if (request.type = "sendPerformance") {
// 			sendPerformanceObject();
		} else {
			console.log("Unknown request type: " + request.type);
		}
		sendResponse(response); // otherwise request remains open 
	}
);