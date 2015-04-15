'use strict';
angular.module('radio')

.factory('MapUtil', function($document, Locator, google) {
  
  function leafletBoundsFromGoogleBounds(googleBounds) {
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
  }
  
  var calculateBoundsForPoints = function(points) {
    if (!points || points.length === 0) {
      return;
    }

    var googleBounds = new google.maps.LatLngBounds();

    angular.forEach(points, function(point) {
      googleBounds.extend(
        new google.maps.LatLng(point.lat, point.lng)
      );
    });

    return leafletBoundsFromGoogleBounds(googleBounds);
  };
  
  var calculateBoundsForOslo = function() {
    var oslo = {
      lat: 59.91,
      lng: 10.75,
    };
      
    var googleBounds = new google.maps.LatLngBounds();
    var latlng = new google.maps.LatLng(oslo.lat, oslo.lng);
    googleBounds.extend( latlng );
    
    return leafletBoundsFromGoogleBounds(googleBounds);
  };

  return {
    calculateBoundsForPoints: calculateBoundsForPoints,
    calculateBoundsForOslo: calculateBoundsForOslo
  };
});
