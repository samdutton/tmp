var flashVideos = $("embed[type='application/x-shockwave-flash']";
var htmlVideos = $("video");

// if page not visible
// - for each video
// -- set boolean wasPlaying attribute
// -- pause

// when page visibility changes
// if page now hidden
// - for each video
// -- check if it was playing
// -- set boolean wasPlaying attribute
// -- pause
// if page now displayed
// - for each video
// -- if wasPlaying
// --- play


chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		var response = {};
//		console.log("request.type: " + request.type);
		if (request.type === "foo") {
		} else if (request.type == "bar") {
		} else {
			console.log("Unknown request type: " + request.type);
		}
//		sendResponse(response); // otherwise request remains open 
	}
);

