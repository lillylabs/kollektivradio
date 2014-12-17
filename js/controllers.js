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

.controller('TripDetailCtrl', function($scope, $stateParams, $window, $ionicLoading, $ionicPopup, Trips, Player) {
  
  // Set up
  if(Trips.get($stateParams.tripId))
    $scope.trip = Trips.get($stateParams.tripId)
  else
    Trips.fetch();

  $scope.map = {
    control: {},
    center: { // Oslo
      latitude: 59.8938549,
      longitude: 10.7851165
    },
    zoom: 11,
    options: {
      streetViewControl: false,
      panControl: false,
      maxZoom: 20,
      minZoom: 3
    },
    dragging: false
  };

  $scope.marker = {
    id: 'current'
  }

  // Observers
  $scope.$on('trips:fetched', function(event) {
    $scope.trip = Trips.get($stateParams.tripId);
  });

  $scope.$on('position:updated', function(event, pos) {
    $scope.$apply(function() {
      $scope.marker.coords = pos.coords;
    })
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

  //Functions
  function hideSpinner() {
    $ionicLoading.hide();
  };

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

})
