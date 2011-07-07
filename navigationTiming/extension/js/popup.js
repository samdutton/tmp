// var backgroundPage = chrome.extension.getBackgroundPage();
// var performanceObject;
// var timing = backgroundPage.pagePerformance.timing;
// 	console.log("in popup");
// console.log(timing);

var tabId, tabUrl;

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	console.log(request);
	// double check object sent is window.performance and it has a valid timing property
	if (sender.tab && request.constructor.name = "Performance" && request.timing) { 
		console.log(request.timing);
	} else {
		sendResponse({}); 
	}
});

$(document).ready( function() {
	// get the current tab
	chrome.tabs.getSelected(null, function(tab) {
		tabId = tab.id;
		tabUrl = tab.url;
		// request the window.performance object from the contentscript
		// write a timeline and other dynamic elements when the response is received
		chrome.tabs.sendRequest(tabId, {"type": "sendPerformance"}, 
			function(response){
				writeDynamicElements(response);
			});	
	});	
	

});



// workaround for lack of Inspect Popup in Chrome 4 -- copes with strings and other objects
function clog(val) {
	var message = JSON.stringify(val).replace(/\n/g, " ");
	chrome.tabs.sendRequest(tabId, {"type": "consoleLog", "value": message});	
}




// Timeline class used for div#timeline chart.
// The Google Charts API could also be used, but does not support simple timelines.
// Constructor arguments:
// - timelineElement is the DOM element where the timeline will be displayed
// - events is an array of objects that each have a time and eventName property
function Timeline(timelineElement, events) {
	this.events = events;
	this.timelineElement = timelineElement;
	// get the minimum and maximum time values
	this.minTime = Number.MAX_VALUE;
	this.maxTime = Number.MIN_VALUE;
	for (var i = 0; i != events.length; ++i) {
		var time = events[i].time;
		if (time > this.maxTime) {
			this.maxTime = time;
		}
		if (time < this.minTime) {
			this.minTime = time;
		}
	}

	// defaults for event name display
	// could easily be refactored to make these values customisable
    this.backgroundColor = "#eee"; 
    this.eventBorderLeftColor = "#080"; 
    this.eventBorderLeftStyle = "solid"; 
    this.eventBorderLeftWidth = 2; 
    this.eventColor = "#666"; 
    this.eventMargin = 5;
    this.eventPadding = 5;
    this.eventWidth = 220; // hack: large enough to fit longest event name...

    // flag: to combine events with the same time in the same div
    this.combineEvents = true;

	// defaults for timeline
    this.fontFamily = "Consolas, sans-serif";
    this.fontSize = 12;
	this.numTicks = 5; // number of ticks on x-axis
	this.padding = 10; 	
	this.width = 740; 	

	$(timelineElement).css({
		"background-color": this.backgroundColor,
		"font-family": this.fontFamily,
		"font-size": this.fontSize + "px",
        "padding": this.padding + "px",
		"width": this.width + "px"
		}); 	
 }

Timeline.prototype = {
	draw: function() {
		var i;
		// draw event divs
		for (i = 0; i != this.events.length; ++i) {
			var event = this.events[i];
			var eventDiv = $("<div />");
			eventDiv.append(event.eventName);
			// get the offset for the event div
			var left = (event.time / this.maxTime) * (this.width - 
					this.eventWidth - this.eventPadding - this.eventBorderLeftWidth);
            eventDiv.css({
                "border-left-color": this.eventBorderLeftColor,
                "border-left-style": this.eventBorderLeftStyle,
                "border-left-width": this.eventBorderLeftWidth + "px",
                "color": this.eventColor,
                "cursor": "pointer",
                "left": left, 
                "margin-bottom": this.eventMargin + "px",
                "padding-left": this.eventPadding + "px",
                "position": "relative",
                "width": this.eventWidth + "px"
            });
            eventDiv.attr({"title": event.time + "ms"});
			$("#timeline").append(eventDiv);
		};		
		// draw timeline x-axis ticks and labels
		var xAxisDiv = $("<div />");
		xAxisDiv.css({
			"border-top": "1px solid #ccc" // the actual x-axis
		});
		$(this.timeElement).append(xAxisDiv);
		
		
	}
}; // Timeline class


// Use the Timeline class to draw a timeline for the attributes (events) 
//  of a window.performance.timing object.
// Arguments: 
// - timelineElement: the element in which to draw the timeline
// - timing: a performance.timing object
function writeTimeline(timelineElement, timing) {
	// events is an array of objects, each with a time and an event name
	// -- note that there may be more than one event for each time
	var events = []; 
	
	// names of possible events that did not occur
	var nonEvents = []; 
	
	// minTime will be used to normalise event times so they start from zero
	var minTime = Number.MAX_VALUE;
	
	// get the time value for each attribute in performance.timing
	// each attribute is the name of a navigation or page load event
	// not all of which may have occurred, for example secureConnectionStart or redirectStart
	// -- performance.timing properties aren't enumerable in IE 9.0 so Object.keys() won't work
	// timing is defined globally
//	console.log(window.timing);
	for (eventName in timing) {	
		var time = parseInt(timing[eventName]); 
		// events that did not occur have zero time
		if (time === 0) {  
			nonEvents.push(eventName);
        // hack! but IE 9.0 doesn't seem to support 
        // performance.timing.hasOwnProperty correctly 
		} else if (eventName !== "toJSON") { 
			events.push({"eventName": eventName, "time": time});
			if (time < minTime) { 
				minTime = time;
			}
		}
	}
		
	// normalise times so they start from zero
	for (var i = 0; i != events.length; ++i) {
		events[i].time -= minTime;
	}
	
	// sort events by time, since object key enumeration does not guarantee this
	// -- and if events have the same time, order them so the event names are displayed  
	// in a sensible order, e.g. unloadEventStart before unloadEventEnd
	var orderedEventNames = ["navigationStart", "unloadEventStart", "unloadEventEnd", "redirectStart", "redirectEnd", "fetchStart", "domainLookupStart", "domainLookupEnd", "connectStart", "connectEnd", "secureConnectionStart", "requestStart", "responseStart", "responseEnd", "domLoading", "domInteractive", "domContentLoadedEventStart", "domContentLoadedEventEnd", "domComplete", "loadEventStart", "loadEventEnd"]	
	events.sort(function(a, b){
		// if times are different, sort by time
		if (a.time !== b.time) {
			return a.time - b.time;
		// if times are the same, sort by position in orderedEventNames
		} else {
			// indexOf is available in IE9 and Chrome
 			return orderedEventNames.indexOf(a.eventName) - orderedEventNames.indexOf(b.eventName);
		}
	});


	// draw timeline
	var timelineObject = new Timeline(timelineElement, events);
	timelineObject.draw();

	// draw basic timeline x-axis ticks and labels
	var xAxisDiv = $("<div />");
		xAxisDiv.css({
		"border-top": "1px solid #060", // the actual x-axis
		"height": "40px",
		"margin": "10px 0 20px 0",
		"position": "relative"
	});	
	
	// add ticks to the x-axis: for zero and for the maximum time, timelineObject.maxTime
	var tickDivWidth = 100;
	var tickDivCss = {
		"color": "#060",
		"position": "absolute", 
		"text-align": "center",
		"top": "-3px",
		"width": tickDivWidth + "px"
		};
	// this is hacky and ugly but it works
	var zeroTickDiv = $("<div>|<br />0</div>").css(tickDivCss).css({"left": -tickDivWidth / 2}); // 50 = half width
	// get the css left value for the max tick 
	var maxTickDivLeft = timelineObject.width - timelineObject.eventWidth - 
		timelineObject.eventPadding - timelineObject.eventBorderLeftWidth - (tickDivWidth / 2); 
	var maxTickDiv = $("<div>|<br />" + timelineObject.maxTime + "ms</div>").css(tickDivCss).
		css({"left": maxTickDivLeft});
	xAxisDiv.append(zeroTickDiv).append(maxTickDiv);
	
	$(timelineElement).append(xAxisDiv);
	
	$(timelineElement).append("<div id='nonEvents'>The following events did not occur:<br/>- " + 
		nonEvents.join("<br />- ") + "</div>");


} // writeTimeline;


function writeDynamicElements(performance){
//    $("#networkLatency").html("for this page, " + (t.responseEnd - t.fetchStart) + "ms");
//	var pageLoadMessage = t.loadEventEnd == 0 ? 
// 		"unable to calculate in the page, because loadEventEnd had not yet occurred" : 
//     	(t.loadEventEnd - t.responseEnd) + "ms";
//  $("#pageLoad").html(pageLoadMessage);
//  var soupToNutsMessage = t.loadEventEnd == 0 ? "likewise!" : 
// 		(t.loadEventEnd - t.navigationStart) + "ms"
//  $("#soupToNuts").html(soupToNutsMessage);

//     var navigationTypes = ["clicking a link or entering a URL", "reload", "navigating through history"];    
//     var howIGotHere = navigationTypes[performance.navigation.type];
//     $("#howIGotHere").html(howIGotHere);
    
	writeTimeline(document.querySelector("#timeline"), performance.timing);
}
