'use strict';
angular.module('radio')

.constant('MarkerIcons', {
  locationIcon: {
    iconUrl: '/img/marker_user_location.png',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    className: 'marker-current-location'
  },
  playingClipIcon: {
    iconUrl: '/img/marker_audio.png',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    className: 'marker-clip playing'
  },
  pausedClipIcon: {
    iconUrl: '/img/marker_audio.png',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    className: 'marker-clip paused'
  },
  activeSightIcon: {
    iconUrl: '/img/marker_active.png',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    className: 'marker-sight active'
  },
  inClipSightIcon: {
    iconUrl: '/img/marker_sight.png',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    className: 'marker-sight in-clip'
  },
  inactiveSightIcon: {
    iconUrl: '/img/marker_sight.png',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    className: 'marker-sight inactive'
  },
  positron: {
    name: 'Positron',
    url: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    type: 'xyz'
  }
})
.controller('MapCtrl', function(_, $scope, $timeout, Locator, MapUtil, Player, MarkerIcons, environment) {
  var osloBounds = MapUtil.calculateBoundsForOslo();
  
  $scope.isTestEnv = !environment.isProduction;
  $scope.showMapControls = false;
  
  $scope.map = {
    bounds: osloBounds,
    markers: {},
    layers: {
      baselayers: {
        base: MarkerIcons.positron
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
    updateBounds(MapUtil.calculateBoundsForPoints(boundingPointsFromClips(clips)));
  }

  var boundingPointsFromClips = function (clips) {
    return _.reduce(clips, function (locations, clip) {
      _.each(clip.sights, function (sight) {
        locations.push(_.pick(sight.location, ['lat', 'lng']));
      });
      locations.push(_.pick(clip.locations.play, ['lat', 'lng']));
      return locations;
    }, []);
  };
  
  var updateBounds = _.throttle(function updateBounds(bounds) {
    $timeout(function () {
      if (bounds) {
        $scope.map.bounds = bounds;
      }
    });
  }, 150, {leading: false, trailing: true});
  
  function updateCurrentLocation(lat, lng) {
    $scope.map.markers = angular.extend({}, $scope.map.markers, {
      currentLocation: {
        lat: lat,
        lng: lng,
        icon: MarkerIcons.locationIcon
       }
    });

    var clips = Player.getSelectedTrip().clips;
    var points = boundingPointsFromClips(clips).concat([{lat: lat, lng: lng}]);
    updateBounds(MapUtil.calculateBoundsForPoints(points));
  }

  function addPlayLocation(clip) {
    $scope.map.markers[clip.id] = {
      id: clip.id,
      lat: clip.locations.play.lat,
      lng: clip.locations.play.lng,
      icon: MarkerIcons.pausedClipIcon
    };
  }

  function addClipSight(clip, sight) {
    $scope.map.markers[sight.id] = {
      id: sight.id,
      clipId: clip.id,
      lat: sight.location.lat,
      lng: sight.location.lng,
      icon: MarkerIcons.inactiveSightIcon
    };
  }

  function addClips(clips) {
    _.each(clips, function(clip) {
      addPlayLocation(clip);
      _.each(clip.sights, function (sight) {
        addClipSight(clip, sight);
      });
    });
  }
  
  // Observers
  $scope.$on('position:updated', function(event, pos) {
    updateCurrentLocation(pos.latitude, pos.longitude);
  });

  $scope.$on('player:timeUpdate', function (event, clip, time) {
    var activeSightIds = _.pluck(_.filter(clip.sights, function (sight) {
      return (sight.startTime === null ||
        sight.startTime <= time && (sight.endTime === null || time < sight.endTime));
    }), 'id');
    var markers = angular.extend({}, $scope.map.markers);
    angular.forEach(markers, function (marker) {
      if (marker.clipId === clip.id) {
        marker.icon = MarkerIcons.inClipSightIcon;
        if(_.contains(activeSightIds, marker.id)) {
          marker.icon = MarkerIcons.activeSightIcon;
        }
      } else if (marker.icon.className.indexOf('marker-sight') > -1) {
        marker.icon = MarkerIcons.inactiveSightIcon;
      }
    });
    $scope.map.markers = markers;
  });
  
  $scope.$on('player:clipStarted', function(event, clip) {
    var markers = angular.extend({}, $scope.map.markers);
    angular.forEach(markers, function (marker) {
      if (marker.id === clip.id) {
        marker.icon = MarkerIcons.playingClipIcon;
      } else if (marker.icon.className.indexOf('marker-clip') > -1) {
        marker.icon = MarkerIcons.pausedClipIcon;
      } else if (marker.icon.className.indexOf('marker-sight') > -1) {
        marker.icon = MarkerIcons.inactiveSightIcon;
      }
    });
    $scope.map.markers = markers;
  });
  
  $scope.$on('player:clipEnded', function(event) {
    var markers = angular.extend({}, $scope.map.markers);
    angular.forEach(markers, function(marker) {
      if(marker.icon.className.indexOf('marker-clip') > -1) {
        marker.icon = MarkerIcons.pausedClipIcon;
      } else if (marker.icon.className.indexOf('marker-sight') > -1) {
          marker.icon = MarkerIcons.inactiveSightIcon;
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
