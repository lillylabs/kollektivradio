angular.module('radio.controllers', [])

.controller('TripsCtrl', function($scope, Trips) {
  $scope.trips = Trips.all();
})

.controller('TripDetailCtrl', function($scope, $stateParams, Trips) {
  $scope.trip = Trips.get($stateParams.tripId);

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
