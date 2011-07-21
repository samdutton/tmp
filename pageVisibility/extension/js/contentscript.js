// revert to existing favicon when the page is closed
// otherwise the favicon will remain as paused.png or play.png
function resetFavicon() {
	favicon.change(location.protocol + "//" + location.host + "/favicon.ico");
}


// set event listeners for html video elements
var htmlVideos = $("video");
htmlVideos.each(function(index, videoElement)
{
	if (document.webkitVisibilityState === "hidden") {
		videoElement.pause();
	}
	
	// when the video pauses, set the favicon
    videoElement.addEventListener("pause", function(){
        favicon.change(chrome.extension.getURL("images/paused.png"));
	}, false);
    
    // when the video plays, set the favicon
    videoElement.addEventListener("play", function(){
		favicon.change(chrome.extension.getURL("images/playing.png"));
	}, false);
    
    // when the video ends, reset the favicon
    videoElement.addEventListener("ended", function(){
    	resetFavicon();
	}, false);
    
    // set the document (tab) title from the current video time
    videoElement.addEventListener("timeupdate", function(){
		document.title = Math.floor(videoElement.currentTime) + " second(s)";
	}, false);

});

// set event listeners for flash videos
var flashVideos = $("embed[type='application/x-shockwave-flash']");
flashVideos.each(function(index, flashVideo)
{	
	console.log("flashVideo");
	if (document.webkitVisibilityState === "hidden") {
		console.log("hidden");
		// this is nasty, but it works and I can't think of a better way :(
		// if you have a better idea, please email me at samdutton@gmail.com!
		var intervalId = setInterval(function(){
			if (flashVideo.getPlayerState) {
				flashVideo.wasPlaying = flashVideo.getPlayerState() === 1; // playing
				flashVideo.pauseVideo();
				console.log("paused");
				clearInterval(intervalId);
			}
		});
	}
	
	// when the video pauses, set the favicon
    flashVideo.addEventListener("onStateChange", function(newState){
		switch(newState) {
		// when the video ends, reset the favicon
		case 0: // ended
			resetFavicon();
			break;
		// when the video plays, set the playing favicon
		case 1: // playing
			favicon.change(chrome.extension.getURL("images/playing.png"));
			break;
		// when the video pauses, set the paused favicon
		case 2: // paused
			favicon.change(chrome.extension.getURL("images/paused.png"));
			break;
		}
	}, false);
    
    // set the document (tab) title from the current video time 
    // a bit dodgy if there is more than one video...
	//	window.setIntervalId = window.setInterval(1000, function() {
	//		document.title = Math.floor(flashVideo.getCurrentTime()) + " second(s)";
	//	});

});


function handleVisibilityChange() {
	// if the page is now hidden
	// get the current play state of videos
	// and pause them
	if (document.webkitHidden) {
		htmlVideos.each(function(index, videoElement){
			videoElement.wasPlaying = !videoElement.paused;
			videoElement.pause();
		});
		flashVideos.each(function(index, flashVideo){
			console.log("in handleVisibilityChange");
			flashVideo.wasPlaying = flashVideo.getPlayerState() === 1;
			flashVideo.pauseVideo();
		});
	// if the page is now displayed, 
	// play videos that were playing before the page was hidden
	} else {
		htmlVideos.each(function(index, videoElement){
			if (videoElement.wasPlaying === true) {
				videoElement.play();
			}
		});
		flashVideos.each(function(index, flashVideo){
			if (flashVideo.wasPlaying === true) {
				flashVideo.playVideo();
			}
		});
	}
}


// warn if the browser doesn't support document.webkitHidden
if (typeof document.webkitHidden === "undefined") {
	alert("This demo requires a browser such as Google Chrome 13 that supports the Page Visibility API.");
} else {
    // handle page visibility change
    // see https://developer.mozilla.org/en/API/PageVisibility/Page_Visibility_API
    document.addEventListener("webkitvisibilitychange",  handleVisibilityChange, false);
    
	// reset favicon when page is closed
    window.addEventListener("unload", function(){
    	resetFavicon();
	}, false);    
}




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

