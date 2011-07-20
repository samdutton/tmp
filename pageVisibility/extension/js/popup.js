var tabId, tabUrl;

$(document).ready( function() 
{
	// get the current tab
	chrome.tabs.getSelected(null, function(tab) {
		tabId = tab.id;
		tabUrl = tab.url;
		chrome.tabs.sendRequest(tabId, {"type": "foo"}, 
			function(response){
			});	
	});		
});


