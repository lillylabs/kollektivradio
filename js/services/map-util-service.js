angular.module('radio')

.factory('MapUtil', function($document, $rootScope) {

  var fitMapToMarkers = function(map, markers) {
    var bounds = new google.maps.LatLngBounds();

    // loop through all markers and create bounds
    angular.forEach(markers, function(marker, i) {
      var coords = marker.coords;
      var latlng = new google.maps.LatLng(marker.coords.latitude, marker.coords.longitude);
      bounds.extend( latlng );
    });

    // only 1 marker?
    if( markers.length == 1 ) {
      // set center of map
      map.center = {
        latitude: bounds.getCenter().lat(),
        longitude: bounds.getCenter().lng()
      };

    } else {
      // fit to bounds
      map.bounds = {
        northeast: {
          latitude: bounds.getNorthEast().lat(),
          longitude: bounds.getNorthEast().lng()
        },
        southwest: {
          latitude: bounds.getSouthWest().lat(),
          longitude: bounds.getSouthWest().lng()
        }
      };
    }
  };

  return {
    fitMapToMarkers: fitMapToMarkers
  };
});