angular.module('radio')

.factory('MapUtil', function($document, Locator) {
  
  var calculateBoundsForClips = function(clips) {
    if(!clips || clips.length === 0)
      return;
    
    var googleBounds = new google.maps.LatLngBounds();

    // loop through all clips and create bounds
    angular.forEach(clips, function(clip, i) {
      var latlng = new google.maps.LatLng(clip.locations.map.lat, clip.locations.map.lng);
      googleBounds.extend( latlng );
    });
    
    // fit to bounds
    var bounds = {
      northEast: {
        lat: googleBounds.getNorthEast().lat(),
        lng: googleBounds.getNorthEast().lng()
      },
      southWest: {
        lat: googleBounds.getSouthWest().lat(),
        lng: googleBounds.getSouthWest().lng()
      }
    };
    
    return bounds;
  };

  return {
    calculateBoundsForClips: calculateBoundsForClips
  };
});