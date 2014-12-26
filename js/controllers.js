angular.module('radio.controllers', [])

.controller('NavigationCtrl', function($scope, $ionicNavBarDelegate, Player) {
  $scope.goBack = function() {
    $ionicNavBarDelegate.back();
    Player.stopTrip();
  };
});