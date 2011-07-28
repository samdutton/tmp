// this is ugly, but it works...
// -- the page must be allowed to load before getting the performance object
$(document).ready(function(){
	setTimeout(function(){
		// save the current performance data
		// unused obj callback argument is the object saved by Lawnchair
		new Lawnchair(function() {
			if (window.performance.timing.loadEventEnd !== 0) {
				this.save(window.performance, function(obj) {  
					// could do something here...
				})
			} else {
				alert("window.performance.timing.loadEventEnd: " + window.performance.timing.loadEventEnd);
			}
		})
	}, 100);
});

chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		if (request.type === "consoleLog") {
			console.log(request.value);
		} else if (request.type == "sendPerformance") { // request is made in popup
			new Lawnchair(function() {
				this.all(function(performanceData) { // all saved performance data 
					sendResponse(performanceData); // send to popup
				});
			})
		} else {
			console.log("Unknown request type: " + request.type);
			sendResponse({}); // always send, otherwise request remains open 
		}
	}
);
