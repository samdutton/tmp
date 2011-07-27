

// callback to revert to pre-existing favicon when the page is closed
// otherwise the favicon will remain as paused.png or play.png
function resetFavicon() {
	favicon.change(location.protocol + "//" + location.host + "/favicon.ico");
}

// warn if the browser doesn't support document.webkitHidden
if (typeof document.webkitHidden === "undefined") {
	console.log("The Hold It! extension requires a browser such as Google Chrome 13 that supports the Page Visibility API.");
} else {
    // handle page visibility change
    // see https://developer.mozilla.org/en/API/PageVisibility/Page_Visibility_API
    document.addEventListener("webkitvisibilitychange",  handleVisibilityChange, false);
    
	// reset favicon when page is closed
    window.addEventListener("unload", function(){
    	resetFavicon();
	}, false);    
}

function setHtmlPlayState(videoElement){
	if (document.webkitVisibilityState === "hidden") {
		videoElement.pause();
	}	
}

// add event listeners for HTML video elements
function addHtmlEventListeners(videoElement){
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
}

// set event listeners for html video elements
var htmlVideos = $("video");
htmlVideos.each(function(index, videoElement) {
	setHtmlPlayState(videoElement);
	addHtmlEventListeners(videoElement);
});

function setFlashPlayState(flashVideo){
	if (document.webkitVisibilityState === "hidden") {
		// ugly, but don't know a better way
		// if you have a better solution, please email me at samdutton@gmail.com!
		var intervalId = setInterval(function(){ // YouTube
			if (flashVideo.pauseVideo) {
				var playerState = flashVideo.getPlayerState();
				if (playerState != -1 && playerState != 3) { // unstarted or buffering
					flashVideo.wasPlaying = playerState === 1;
					flashVideo.pauseVideo();
					clearInterval(intervalId);
				}
			}
		});
	}
}

// when the video pauses, set the favicon, and vice versa
// this doesn't work -- not sure why...
/* 
function addFlashEventListeners(flashVideo){
	// YouTube
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
	
	// Vimeo
	flashVideo.addEventListener("pause", function(){
		favicon.change(chrome.extension.getURL("images/paused.png"));
	}, false);	
	flashVideo.addEventListener("play", function(){
		favicon.change(chrome.extension.getURL("images/playing.png"));
	}, false);
	flashVideo.addEventListener("finish", function(){
		resetFavicon();
	}, false);	
}

 */

var flashVideos = $("embed[type='application/x-shockwave-flash']"); // YouTube
// set event listeners for flash videos
flashVideos.each(function(index, flashVideo){	
	console.log("flashVideo.src: " + flashVideo.src);
	setFlashPlayState(flashVideo);
//	addFlashEventListeners(flashVideo); // can't get this to work, not sure why
});

// in case a video element is added dynamically, e.g. on Vimeo
document.addEventListener('DOMNodeInserted', function(event) {
	var element = event.target;
    if (element.nodeName === "VIDEO") { 
        htmlVideos.push(element); // event.target is a video element
        setHtmlPlayState(element);
		addHtmlEventListeners(element);
    } else if (element.type === "application/x-shockwave-flash") { // e.g. Vimeo
    	setFlashPlayState(element);
//    	addFlashEventListeners(element); // doesn't work, not sure why 
		flashVideos.push(element); // event.target is a video element
    }
});

// pause/play videos depending on their previous state and 
// whether or not the page is now hidden
function handleVisibilityChange() {
	// if the page is now hidden
	// get the current play state of videos (for when the user 
	// returns to this page) and pause videos
	if (document.webkitHidden) {
		htmlVideos.each(function(index, videoElement){
			videoElement.wasPlaying = !videoElement.paused;
			videoElement.pause();
		});
		
		flashVideos.each(function(index, flashVideo){
			if (flashVideo.pauseVideo) { // YouTube
				flashVideo.wasPlaying = flashVideo.getPlayerState() === 1;
				flashVideo.pauseVideo();
				console.log("player state: " + flashVideo.getPlayerState());
			} else if (flashVideo.api_pause){ // Vimeo
				flashVideo.wasPlaying = !flashVideo.paused;
				flashVideo.api_pause();
			}
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
				if (flashVideo.playVideo) { // YouTube
					flashVideo.playVideo();
				} else if (flashVideo.api_play) { // Vimeo
					flashVideo.api_play();
				}
			}
		});
	}
}

