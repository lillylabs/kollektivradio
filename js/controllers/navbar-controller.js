angular.module('radio')

.controller('NavbarCtrl', function($scope, Player) {
  
  $scope.endTrip = function() {
    Player.endTrip();
  };

});