angular.module('radio.controllers', [])

.controller('TripsCtrl', function($scope, Trips) {
  $scope.trips = Trips.all();
})

.controller('TripDetailCtrl', function($scope, $stateParams, Trips) {
  // Set up
  $scope.trip = Trips.get($stateParams.tripId);
  $scope.trip.isPlaying = false;
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

  // Functions
  $scope.playTrip = function(trip) {
    trip.isPlaying = true;
  };

  $scope.cancelTrip = function(trip) {
    trip.isPlaying = false;
  };

  $scope.isPlaying = function(trip) {
    return trip.isPlaying;
  }

})
