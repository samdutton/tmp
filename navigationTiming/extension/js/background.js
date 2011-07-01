var pagePerformance;
chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
        if (request.type === "performance") {
			pagePerformance = request;        
//			console.log(pagePerformance);
		} else {
			console.log("Unknown request type in background.html: " + request.type);
		}
		sendResponse({}); // otherwise request stays open -- this allows request to be cleaned up
	}
);


// tab selection changed
chrome.tabs.onSelectionChanged.addListener(
	function handleSelectionChange(tabId, selectInfo) {
// 		chrome.browserAction.setTitle({"title": "No video elements found on this page. \nClick to view framegrabs saved from other pages."});
// 		chrome.tabs.sendRequest(tabId, {"type": "sendNumVideos"}, initBrowserAction);
	}
);


// e.g. tab url changed
chrome.tabs.onUpdated.addListener(
	function handleUpdate(tabId, selectInfo) {
	}
);

