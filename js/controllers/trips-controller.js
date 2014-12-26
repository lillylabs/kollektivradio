angular.module('radio')

.controller('TripsCtrl', function($scope, $sce, DataSource, Locator) {
  
  $scope.selectedTrip = {};
  Locator.watchPosition();

  // Set up
  
  if(DataSource.trips()) {
    $scope.trips = DataSource.trips() ;
  } else {
    showSpinner("Henter turer ...");
    DataSource.fetch();
  }
  
  // Scope functions
  
  $scope.toggleTrip = function(trip) {
    if($scope.selectedTrip == trip)
      $scope.selectedTrip = {};
    else
      $scope.selectedTrip = trip;
  };
  
  $scope.startTrip = function(trip) {
    console.log("Start trip");
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
  
  $scope.$on('trips:fetched', function(event) {
    $scope.trips = DataSource.trips();
    hideSpinner();
  });

  // Function
  function hideSpinner() {
//    $ionicLoading.hide();
  }

  function showSpinner(message) {
//    $ionicLoading.show({
//      template: '<i class="ion-loading-c"></i><br/>' + message
//    });
  }

});