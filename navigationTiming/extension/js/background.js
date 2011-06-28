console.log("background.js");



chrome.browserAction.setBadgeBackgroundColor({"color": [0, 200, 0, 100]});

// function initBrowserAction(request) {
	// if (request.numVideos > 0) {
		// var numVideos = request.numVideos.toString();
		// chrome.browserAction.setBadgeText({"text": numVideos});
		// chrome.browserAction.setTitle({"title": numVideos + " video element(s) found on this page. \nClick to view stored framegrabs, or save framegrabs \nby using the icons overlaid on the video(s)."});
	// }
// }

// chrome.extension.onRequest.addListener(
	// function(request, sender, sendResponse) {
        // if (request.type === "displayFramegrabFromPopup") {
			// });	
		// } else if (request.type === "openCanvasInNewTab") {
		// } else {
			// alert("Unknown request type in background.html: " + request.type);
		// }
		// sendResponse({}); // otherwise request stays open -- this allows request to be cleaned up
	// }
// );


// tab selection changed
// chrome.tabs.onSelectionChanged.addListener(
	// function handleSelectionChange(tabId, selectInfo) {
		// chrome.browserAction.setBadgeText({"text": ""});
		// chrome.browserAction.setTitle({"title": "No video elements found on this page. \nClick to view framegrabs saved from other pages."});
		// chrome.tabs.sendRequest(tabId, {"type": "sendNumVideos"}, initBrowserAction);
	// }
// );


// e.g. tab url changed
// chrome.tabs.onUpdated.addListener(
	// function handleUpdate(tabId, selectInfo) {
		// chrome.browserAction.setBadgeText({"text": ""});
		// chrome.browserAction.setTitle({"title": "No video elements found on this page. \nClick to view framegrabs saved from other pages."});
		// chrome.tabs.sendRequest(tabId, {"type": "sendNumVideos"}, initBrowserAction);
	// }
// );

