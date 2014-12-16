angular.module('radio.controllers', [])

.controller('NavigationCtrl', function($scope, $ionicNavBarDelegate, Player) {
  $scope.goBack = function() {
    $ionicNavBarDelegate.back();
    Player.stopTrip();
  };
})

.controller('TripsCtrl', function($scope, Trips) {
  if(Trips.all())
    $scope.trips = Trips.all();
  else
    Trips.fetch();

  // Observers
  $scope.$on('trips:fetched', function(event) {
    $scope.trips = Trips.all();
  });

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
    $scope.handleError(error);
  });

  $scope.$on('player:playing', function(event) {
    $scope.hideSpinner();
  });

  $scope.$on('player:started', function(event) {
    $scope.started = true;
  });

  // Functions
  $scope.startTrip = function(trip) {
    Player.startTrip(trip);
    $scope.showLocationSpinner();
  };

  $scope.hideSpinner = function() {
    $ionicLoading.hide();
  };

  $scope.showSpinner = function(message) {
    $ionicLoading.show({
      template: '<i class="ion-loading-c"></i><br/>' + message
    });
  }

  $scope.showLocationSpinner = function() {
    $scope.showSpinner("Søker din lokasjon og gjør klar lyd.");
  }

  $scope.handleError = function(error) {
    switch(error.code) {
      case error.NOT_SUPPORTED:
        $scope.showAlert("Lokasjonsfeil", "Din browser støtter dessverre ikke lokasjon.");
        break;
      case error.PERMISSION_DENIED:
        $scope.showAlert("Lokasjonsfeil", "Du må tillate Kollektivradio å bruke din lokasjon.");
        break;
      case error.POSITION_UNAVAILABLE:

        break;
      case error.TIMEOUT:

        break;
      case error.UNKNOWN_ERROR:

        break;
    }
  }

  $scope.showAlert = function(title, message) {
    var alertPopup = $ionicPopup.alert({
      title: title,
      template: message
    });
    alertPopup.then(function(res) {
      Player.stopTrip();
      $window.location.href = '/';
    });
  };

})
