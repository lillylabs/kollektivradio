angular.module('radio')

.controller('AlertsCtrl', function($scope, Locator) {
  
  $scope.alerts = {};
  
  $scope.removeAlert = function(alert) {
    angular.forEach($scope.alerts, function(a, key) {
      console.log("remove " + key);
      delete $scope.alerts[key];
    });
  };
  
  $scope.$on('position:error', function(event, error) {
    var alert = {message: "Kollektivradio kan dessverre ikke finne din lokasjon.", type: "danger"};
    switch(error.code) {
      case error.NOT_SUPPORTED:
        alert.message = "Kollektivradio har behov for å vite hvor du er, men din enhet støtter dessverre ikke sporing av din posisjon.";
        break;
      case error.PERMISSION_DENIED:
        alert.message = "Kollektivradio har behov for å vite hvor du er, venligst tillat sporing av din posisjon.";
        break;
    }
    
    $scope.$apply(function() {
      $scope.alerts.position = alert;
    });
  });
  
  $scope.$on('position:updated', function(event, pos) {
    $scope.$apply(function() {
      delete $scope.alerts.position;
    });
  });

});