chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		var response = {};
		if (request.type === "consoleLog") {
			console.log(request.value);
		} else if (request.type == "sendPerformance") { // request is made in popup
			console.log("calling sendPerformance");
			new Lawnchair(function() {
				console.log("instantiating Lawnchair");
				var obj = {
					"time": Date.now(),
					"performance": window.performance
				}
				this.save(obj, function(obj) {
					this.each(function(record, index) {
						console.log(record);
					});
				})
			})
			response = window.performance;
		} else {
			console.log("Unknown request type: " + request.type);
		}
		sendResponse(response); // always send, otherwise request remains open 
	}
);
