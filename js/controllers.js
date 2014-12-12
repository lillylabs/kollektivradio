angular.module('radio.controllers', [])

.controller('TripsCtrl', function($scope, Trips) {
  $scope.trips = Trips.all();
})

.controller('TripDetailCtrl', function($scope, $stateParams, Trips, Geo) {
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

  $scope.position = Geo.position;

  // Functions
  $scope.playTrip = function(trip) {
    trip.selected = true;

    Geo.locator.watchPosition();
  };

  $scope.cancelTrip = function(trip) {
    trip.selected = false;
  };

  $scope.isSelected = function(trip) {
    return trip.selected;
  }

})
