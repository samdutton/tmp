var backgroundPage = chrome.extension.getBackgroundPage();


$(document).ready( function() {

});


// workaround for lack of Inspect Popup in Chrome 4 -- copes with strings and other objects
function clog(val) {
	var message = JSON.stringify(val).replace(/\n/g, " ");
	chrome.tabs.sendRequest(tabId, {"type": "consoleLog", "value": message});	
}




