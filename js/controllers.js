angular.module('radio.controllers', [])

.controller('NavigationCtrl', function($scope, $ionicNavBarDelegate, Trips, Locator) {
  $scope.goBack = function() {
    $ionicNavBarDelegate.back();
    Locator.stopWatch();
  };
})

.controller('TripsCtrl', function($scope, Trips) {
  $scope.trips = Trips.all();
})

.controller('TripDetailCtrl', function($scope, $stateParams, $ionicLoading, $ionicPopup, Trips, Locator) {
  // Set up
  $scope.trip = Trips.get($stateParams.tripId);
  $scope.trip.selected = false;
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
  $scope.$on('position:updated', function(event, pos) {
    $scope.marker.coords = pos.coords;
    $scope.hideSpinner();
  });


  // Observers
  $scope.$on('position:error', function(event, error) {
    $scope.marker.coords = {};
    $scope.hideSpinner();
    $scope.showLocationErrorAlert(error);
  });

  // Functions
  $scope.playTrip = function(trip) {
    trip.selected = true;

    Locator.watchPosition();
    $scope.showLocationSpinner();
  };

  $scope.cancelTrip = function(trip) {
    trip.selected = false;
  };

  $scope.isSelected = function(trip) {
    return trip.selected;
  }

  $scope.hideSpinner = function() {
    $ionicLoading.hide();
  };

  $scope.showSpinner = function(message) {
    $ionicLoading.show({
      template: '<i class="ion-loading-c"></i><br/>' + message
    });
  }

  $scope.showLocationSpinner = function() {
    $scope.showSpinner("Søker din lokasjon ...");
  }

  $scope.showLocationErrorAlert = function(error) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Lokasjonsfeil',
      template: 'Det gikk dessverre ikke å lokalisere deg, vil du prøve igjen?',
      cancelText: 'Avbryt',
      okText: 'Prøv igjen',
    });
    confirmPopup.then(function(res) {
      if(res) {
        Locator.watchPosition();
      } else {
        $scope.trip.selected = false;
      }
    });
  }

})
