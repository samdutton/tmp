chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		if (request.type === "consoleLog") {
			console.log(request.value);
		} else if (request.type == "sendPerformance") { // request is made in popup
			new Lawnchair(function() {
				// save the current performance data
				// unused callback argument is the object saved by Lawnchair
				this.save(window.performance, function(obj) {  
					this.all(function(allData) { // get all saved performance data 
						sendResponse(allData); // send array to popup
					});
				})
			})
		} else {
			console.log("Unknown request type: " + request.type);
			sendResponse({}); // always send, otherwise request remains open 
		}
	}
);
