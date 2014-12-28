angular.module('radio')

.factory('MapUtil', function($document, $rootScope, Locator) {
  
  var centerMapOnUserLocation = function(map) {
    if(!Locator.getCurrentPos())
      return;
    
    map.center = Locator.getCurrentPos().coords;
    console.log("Centered map to user location");
  };
  
  var centerMapOnClip = function(map, clip) {
    if(!clip)
      return;
    
    map.center = clip.locations.map;  
    console.log("Centered map to clip");
  };
  
  var fitMapToClips = function(map, clips) {
    if(!clips)
      return;
    
    var bounds = new google.maps.LatLngBounds();

    // loop through all clips and create bounds
    angular.forEach(clips, function(clip, i) {
      var latlng = new google.maps.LatLng(clip.locations.map.latitude, clip.locations.map.longitude);
      bounds.extend( latlng );
    });
    
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
    
    console.log("Fitted map to clips");
    
  };

  var fitMap= function(map, clips) {
    if(!clips || clips.length === 0)
      centerMapOnUserLocation(map);
    else if(clips.length === 1)
      centerMapOnClip(map, clips[0]);
    else
      fitMapToClips(map, clips);
  };

  return {
    fitMap: fitMap
  };
});