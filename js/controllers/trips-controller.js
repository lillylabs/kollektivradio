angular.module('radio')

.controller('TripsCtrl', function($scope, $ionicLoading, DataSource) {

  // Set up
  if(DataSource.trips()) {
    $scope.trips = DataSource.trips() ;
  } else {
    showSpinner("Henter turer ...");
    DataSource.fetch();
  }

  // Observers
  $scope.$on('trips:fetched', function(event) {
    $scope.trips = DataSource.trips();
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

});