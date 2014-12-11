angular.module('radio.controllers', [])

.controller('TripsCtrl', function($scope, Trips) {
  $scope.trips = Trips.all();
})

.controller('TripDetailCtrl', function($scope, $stateParams, Trips) {
  $scope.trip = Trips.get($stateParams.tripId);
})
