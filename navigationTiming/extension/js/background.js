/* 
var pagePerformance;

function setPagePerformance(request) {
	pagePerformance = request;   
	console.log("in background");
	console.log(pagePerformance);
}

chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		console.log(request);
		console.log(request.constructor.name);
        if (request.type === "sendPerformance") {
		} else {
			console.log("Unknown request type in background.html: " + request.type);
		}
		sendResponse({}); // otherwise request stays open -- this allows request to be cleaned up
	}
);


// tab selection changed
chrome.tabs.onSelectionChanged.addListener(
	function handleSelectionChange(tabId, selectInfo) {
// 		chrome.browserAction.setTitle({"title": "Blah"});
// 		chrome.tabs.sendRequest(tabId, {"type": "sendPerformance"}, setPagePerformance);
	}
);


// e.g. tab url changed
chrome.tabs.onUpdated.addListener(
	function handleUpdate(tabId, selectInfo) {
// 		chrome.tabs.sendRequest(tabId, {"type": "sendPerformance"}, setPagePerformance);
	}
);


 */
