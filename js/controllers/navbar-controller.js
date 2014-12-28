angular.module('radio')

.controller('NavbarCtrl', function($scope, Locator, MapUtil) {
  
  $scope.showNavbar = true;
  
  //Observer
  
  $scope.$on('player:tripStarted', function(event) {
    $scope.showNavbar = false;
  });
  
  $scope.$on('player:tripEnded', function(event) {
    $scope.showNavbar = true;
  });

});