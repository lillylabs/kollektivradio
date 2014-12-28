angular.module('radio')

.controller('MapCtrl', function($scope, Locator, MapUtil, Player) {
  
  $scope.showMapControls = false;
  
  $scope.userMarker = {
    id: 'userLocation',
    icon: '/img/marker_user.png'
  };
  
  $scope.map = {
    control: {},
    pan: true,
    center: { // Oslo
      latitude: 59.8938549,
      longitude: 10.7851165
    },
    zoom: 16,
    options: {
      streetViewControl: false,
      panControl: false,
      maxZoom: 20,
      minZoom: 3
    },
    dragging: false
  };
  
  // Scope functions
  
  $scope.endTrip = function(trip) {
    Player.endTrip(trip);
  };
  
  $scope.clipIcon = function(clip) {
    if(Player.isCurrentClip(clip))
      return "/img/marker_playing.png";
    else
      return "/img/marker_paused.png";
  };
  
  // Functions
  function fitMapToMarkers() {
    MapUtil.fitMap($scope.map, $scope.clips);
  }
  
  // Observers
  $scope.$on('position:updated', function(event, pos) {
    $scope.$apply(function() {
      $scope.userMarker.coords = pos;
    });
  });
  
  $scope.$on('player:clipStarted', function(event, pos) {
    $scope.$apply();
  });
  
  $scope.$on('player:clipEnded', function(event, pos) {
    $scope.$apply();
  });

  $scope.$on('player:tripStarted', function(event) {
    $scope.showMapControls = true;
    $scope.clips = Player.getSelectedTrip().clips;
    fitMapToMarkers();
  });
  
  $scope.$on('player:tripEnded', function(event) {
    $scope.showMapControls = false;
    $scope.clips = [];
  });

});