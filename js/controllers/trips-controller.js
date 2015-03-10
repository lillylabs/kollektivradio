angular.module('radio')

.controller('TripsCtrl', function($scope, $sce, DataSource, Locator, Player) {
  $scope.showTrips = true;

  // Set up
  
  DataSource.trips().then(function (trips) {
    $scope.trips = trips;
  });
  
  // Scope functions
  
  $scope.startTrip = function(trip) {
    Player.startTrip(trip);
  };
  
  $scope.lineClass = function(line) {
    if(line.number < 10)
      return "metro";
    else if(line.number >= 10 && line.number < 20) 
      return "tram";
    else if(line.number >= 20 && line.number < 90)
      return "bus";
    else if(line.number >= 90)
      return "boat";
  };
  
  $scope.trustHtml = function(html) {
    return $sce.trustAsHtml(html);
  };
  
  // Observers
  
  $scope.$on('player:tripStarted', function(event) {
    $scope.showTrips = false;
  });
  
  $scope.$on('player:tripEnded', function(event) {
    $scope.showTrips = true;
  });

});