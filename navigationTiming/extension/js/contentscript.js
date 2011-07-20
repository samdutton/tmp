chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		var response = {};
		if (request.type === "consoleLog") {
			console.log(request.value);
		} else if (request.type == "sendPerformance") {
			response = window.performance;
		} else {
			console.log("Unknown request type: " + request.type);
		}
		sendResponse(response); // always send, otherwise request remains open 
	}
);
