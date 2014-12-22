angular.module('radio.controllers', [])

.controller('NavigationCtrl', function($scope, $ionicNavBarDelegate, Player) {
  $scope.goBack = function() {
    $ionicNavBarDelegate.back();
    Player.stopTrip();
  };
})

.controller('TripsCtrl', function($scope, $ionicLoading, Trips) {

  // Set up
  if(Trips.all()) {
    $scope.trips = Trips.all();
  } else {
    showSpinner("Henter turer ...");
    Trips.fetch();
  }

  // Observers
  $scope.$on('trips:fetched', function(event) {
    $scope.trips = Trips.all();
    hideSpinner();
  });

  // Function
  function hideSpinner() {
    $ionicLoading.hide();
  }

  function showSpinner(message) {
    $ionicLoading.show({
      template: '<i class="ion-loading-c"></i><br/>' + message
    });
  }

})

.controller('TripDetailCtrl', function($scope, $stateParams, $window, $ionicLoading, $ionicPopup, Trips, Player, MapUtil) {

  // Set up
  $scope.userMarker = {
    id: 'current',
    icon: '/img/marker_user.png'
  };

  $scope.clipMarkers = [];

  $scope.map = {
    control: {},
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

  if(Trips.get($stateParams.tripId))
    setUpTrip(Trips.get($stateParams.tripId));
  else
    Trips.fetch();

  // Observers
  $scope.$on('trips:fetched', function(event) {
    setUpTrip(Trips.get($stateParams.tripId));
  });

  $scope.$on('position:updated', function(event, pos) {
    $scope.$apply(function() {
      $scope.userMarker.coords = pos.coords;
    });
  });

  $scope.$on('position:error', function(event, error) {
    handleError(error);
  });

  $scope.$on('player:playing', function(event) {
    hideSpinner();
  });

  $scope.$on('player:started', function(event) {
    $scope.started = true;
  });

  // Scope Functions
  $scope.startTrip = function(trip) {
    Player.startTrip(trip);
    showSpinner("Søker din lokasjon og gjør klar lyd.");
  };

  $scope.icon = function(clip) {
    console.log("isPlaying");
    if(Player.isPlayingClip(clip))
      return "/img/marker_playing.png";
    else
      return "/img/marker_paused.png";
  }

  //Functions

  function setUpTrip(trip) {
    $scope.trip = trip;

    angular.forEach(trip.clips, function(clip, key) {
      var coords = {};
      if(clip.locations.map) {
        coords = {
          latitude: clip.locations.map.lat,
          longitude: clip.locations.map.lng
        }
      } else if (clip.locations.play) {
        coords = {
          latitude: clip.locations.play.lat,
          longitude: clip.locations.play.lng
        }
      }

      if(coords.latitude && coords.longitude) {
        $scope.clipMarkers.push({
          id: "clip" + key,
          coords: coords,
          clip: clip
        });
      }

      MapUtil.fitMapToMarkers($scope.map, $scope.clipMarkers);

    });
  }

  function hideSpinner() {
    $ionicLoading.hide();
  }

  function showSpinner(message) {
    $ionicLoading.show({
      template: '<i class="ion-loading-c"></i><br/>' + message
    });
  }

  function handleError(error) {
    switch(error.code) {
      case error.NOT_SUPPORTED:
        showAlert("Lokasjonsfeil", "Din browser støtter dessverre ikke lokasjon.");
        break;
      case error.PERMISSION_DENIED:
        showAlert("Lokasjonsfeil", "Du må tillate Kollektivradio å bruke din lokasjon.");
        break;
      case error.POSITION_UNAVAILABLE:

        break;
      case error.TIMEOUT:

        break;
      case error.UNKNOWN_ERROR:

        break;
    }
  }

  function showAlert(title, message) {
    var alertPopup = $ionicPopup.alert({
      title: title,
      template: message
    });

    alertPopup.then(function(res) {
      Player.stopTrip();
      window.location.href = '/';
    });
  }

});
