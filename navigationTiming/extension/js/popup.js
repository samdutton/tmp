var tabId, tabUrl;

// Draw the timeline and historical data chart.
// This is the callback to Google Charts setOnLoadCallback in popup.html
function drawCharts(performanceData) {	
	// get the current tab
	chrome.tabs.getSelected(null, function(tab) {
		tabId = tab.id;
		tabUrl = tab.url;
		// request window.performance data from the contentscript, then:
		// - display a timeline and other information for the most recent data
		// - display a chart of historical data
		// note that this request will only be processed if the current page
		// is of a type that can accept a content script, 
		// i.e not pages such as chrome://extensions
		// -- for these pages, popup.html has div#dataNotAvailable 
		chrome.tabs.sendRequest(tabId, {"type": "sendPerformance"}, 
			// contentscript sends array of data saved by Lawnchair
			function(performanceData){ 
				// display the most recent performance data
				writeCurrentPerformance(performanceData[performanceData.length - 1]);
				// display a chart of historical data for the current page
				drawHistoricalChart(performanceData);
			});	
	});			
}		

// Display a chart of historical data for the current page
// -- performanceData is the array of objects saved by Lawnchair.
// Each object has window.performance attributes (memory, navigation, timing)
// plus a key added by Lawnchair.
function drawHistoricalChart(performanceData){
	var data = new google.visualization.DataTable();
	data.addColumn('string', 'Date');
	data.addColumn('number', 'Network latency');
	data.addColumn('number', 'Page load');
	data.addColumn('number', 'Total');
	data.addRows(performanceData.length);	
	console.log(performanceData);
	performanceData.forEach(function(element, index, array) {
		var timing = element.timing;
		var date = new Date(timing.navigationStart);
		var dateTimeLabel = 
			date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + 
				" " + date.toLocaleTimeString();
				
		// to cope when page hasn't yet loaded -- not sure why this happens
 		if (timing.loadEventEnd !== 0) {
			var networkLatency = timing.responseEnd - timing.fetchStart;	
			var pageLoad = timing.loadEventEnd - timing.responseEnd;	
			var soupToNuts = timing.loadEventEnd - timing.navigationStart;
			data.setValue(index, 0, dateTimeLabel);
			data.setValue(index, 1, networkLatency);
			data.setValue(index, 2, pageLoad);
			data.setValue(index, 3, soupToNuts);
		}			
	});
	
	var chartElement = document.getElementById('historicalChart');
	var chart = new google.visualization.LineChart(chartElement);
	chart.draw(data, {width: 740, height: 500, title: 'Navigation and load time (ms)'});
}


// Timeline class used for div#timeline chart.
// The Google Charts API could also be used, but does not support simple timelines.
// Constructor arguments:
// - timelineElement is the DOM element where the timeline will be displayed
// - events is an array of objects that each have a time and eventName property
function Timeline(timelineElement, events) 
{
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
    this.backgroundColor = "#fff"; 
    this.eventBorderLeftColor = "#d14c32"; 
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
	this.padding = 5; 	
	this.width = 740; 	

	$(timelineElement).css({
		"background-color": this.backgroundColor,
		"font-family": this.fontFamily,
		"font-size": this.fontSize + "px",
        "padding": this.padding + "px",
		"width": this.width + "px"
		}); 	
 }

Timeline.prototype = 
{
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
			"border-top": "1px solid #508bff" // the displayed x-axis
		});
		$(this.timeElement).append(xAxisDiv);
		
		
	}
}; // Timeline class


// Use the Timeline class to draw a timeline for the attributes (events) 
//  of a window.performance.timing object.
// Arguments: 
// - timelineElement: the element in which to draw the timeline
// - timing: a performance.timing object
function writeTimeline(timelineElement, timing) 
{
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
		"border-top": "1px solid #508bff", // the displayed x-axis
		"height": "40px",
		"margin": "10px 0 0 0",
		"position": "relative"
	});	
	
	// add ticks to the x-axis: for zero and for the maximum time, timelineObject.maxTime
	var tickDivWidth = 100;
	var tickDivCss = {
		"color": "#508bff",
		"position": "absolute", 
		"text-align": "center",
		"top": "-3px",
		"width": tickDivWidth + "px"
		};
	// this is ugly but it works!
	var zeroTickDiv = $("<div>|<br />0</div>").css(tickDivCss).css({"left": -tickDivWidth / 2}); // 50 = half width
	// get the css left value for the max tick 
	var maxTickDivLeft = timelineObject.width - timelineObject.eventWidth - 
		timelineObject.eventPadding - timelineObject.eventBorderLeftWidth - (tickDivWidth / 2) + 1; 
	var maxTickDiv = $("<div>|<br />" + timelineObject.maxTime + "ms</div>").css(tickDivCss).
		css({"left": maxTickDivLeft});
	xAxisDiv.append(zeroTickDiv).append(maxTickDiv);
	
	$(timelineElement).append(xAxisDiv);
	
	$(timelineElement).append("<div id='nonEvents'>The following events did not occur:<br/>- " + 
		nonEvents.join("<br />- ") + "</div>");


} // writeTimeline;

// Display the timeline and write data for page load speed and network latency.
// Note that this callback function (called from contentscript.js) will only 
// be called for pages that support content scripts. 
// For pages such as those with chrome: URLs, which do not support content
// scripts, div#dataNotAvailable is displayed in popup.html.
function writeCurrentPerformance(performance)
{ 
	$("div#dataNotAvailable").hide();

	var timing = performance.timing;
	
	var timelineElement = document.querySelector("#timeline");
	writeTimeline(timelineElement, timing);
	
	if (timing.loadEventEnd === 0 || timing.responseEnd === 0 || timing.navigationStart === 0 || 
		performance.navigation.type < 0) {
	} else {
		$("#results").show();
		$("#networkLatency").html(timing.responseEnd - timing.fetchStart);	
		$("#pageLoad").html(timing.loadEventEnd - timing.responseEnd);	
		$("#soupToNuts").html(timing.loadEventEnd - timing.navigationStart);	
		var navigationTypes = ["clicking a link or entering a URL", "reload", "navigating through history"];    
		// performance.navigation.type is an enumeration
		var howIGotHere = navigationTypes[performance.navigation.type];
		$("#howIGotHere").html(howIGotHere);    
	}
}

