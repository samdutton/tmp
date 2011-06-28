var toExecute = function() {

	window.allMaps = [];
	window.oldMapConstructor = google.maps.Map;
	google.maps.Map = function(div, opts) {
		console.log("calling map constructor");
		console.log(div);
		console.log(opts);
		var map = new oldMapConstructor(div, opts);
		window.allMaps.push(map);
		
		google.maps.event.addListener(map, "bounds_changed", function() {
			var bounds = map.getBounds();
			var northEast = bounds.getNorthEast().toString();
			var southWest = bounds.getSouthWest().toString();
			console.log("contenscript.js, northEast: " + northEast + 
				", southWest: " + southWest);
		});
		
		return map;
	};


};

function createScript() {
  var script = document.createElement('script');
  script.innerHTML = '(' + toExecute + ')()';
  return script;
}

window.addEventListener('DOMContentLoaded', function() {
  var scripts = document.getElementsByTagName('script');
  for (var i = 0, script; script = scripts[i]; i++) {
    if (/maps.google.com/.test(script.src)) {
      console.log('Reimplementing map constructor');
      script.nextSibling && script.parentNode.insertBefore(createScript(), script.nextSibling);
      break;
    }
  }
});

