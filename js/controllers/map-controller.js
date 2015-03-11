'use strict';
angular.module('radio')

.controller('MapCtrl', function($scope, Locator, MapUtil, Player) {
  
  var locationIcon = {
    iconUrl: '/img/marker_location.png',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  };
  
  var playingIcon = {
    iconUrl: '/img/marker_playing.png',
    iconSize: [50, 50],
    iconAnchor: [25, 47]
  };
  
  var pausedIcon = {
    iconUrl: '/img/marker_paused.png',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  };
  
  var positron = {
    name: 'Positron',
    url: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    type: 'xyz'
  };
  
  var osloBounds = MapUtil.calculateBoundsForOslo();
  
  $scope.showMapControls = false;
  
  $scope.map = {
    bounds: osloBounds,
    markers: {},
    layers: {
      baselayers: {
        base: positron
      }
    },
    defaults: {
      doubleClickZoom: false,
      scrollWheelZoom: false,
      attributionControl: false
    }
  };
  
  // Scope functions
  
  $scope.endTrip = function(trip) {
    Player.endTrip(trip);
  };
  
  // Functions
  function fitMapToClips(clips) {
    updateBounds(MapUtil.calculateBoundsForClips(clips));
  }
  
  function updateBounds(bounds) {
    if (bounds) {
      $scope.map.bounds = bounds;
    }
  }
  
  function updateCurrentLocation(lat, lng) {
    $scope.map.markers = angular.extend({}, $scope.map.markers, {
      currentLocation: {
        lat: lat,
        lng: lng,
        icon: locationIcon
       }
    });
  }
  
  function addClipMarker(clip) {
    $scope.map.markers[clip.id] = {
      lat: parseFloat(clip.locations.map.lat),
      lng: parseFloat(clip.locations.map.lng),
      icon: pausedIcon
    };
  }
  
  function addClips(clips) {
    angular.forEach(clips, function(clip) {
      addClipMarker(clip);
    });
  }
  
  // Observers
  $scope.$on('position:updated', function(event, pos) {
    updateCurrentLocation(pos.latitude, pos.longitude);
  });
  
  $scope.$on('player:clipStarted', function(event, clip) {
    var markers = angular.extend({}, $scope.map.markers);
    angular.forEach(markers, function (marker) {
      if (marker === markers[clip.id]) {
        marker.icon = playingIcon;
      } else if (marker.icon === playingIcon) {
        marker.icon = pausedIcon;
      }
    });
    $scope.map.markers = markers;
  });
  
  $scope.$on('player:clipEnded', function(event, clip) {
    var markers = angular.extend({}, $scope.map.markers);
    angular.forEach(markers, function(marker) {
      if(marker.icon === playingIcon) {
        marker.icon = pausedIcon;
      }
    });
    $scope.map.markers = markers;
  });

  $scope.$on('player:tripStarted', function(event) {
    $scope.showMapControls = true;
    addClips(Player.getSelectedTrip().clips);
    fitMapToClips(Player.getSelectedTrip().clips);
  });
  
  $scope.$on('player:tripEnded', function(event) {
    $scope.showMapControls = false;
    $scope.map.markers = {};
    $scope.map.bounds = osloBounds;
  });

});
