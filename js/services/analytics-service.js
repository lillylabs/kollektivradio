'use strict';
angular.module('radio')

.factory('Analytics', function($rootScope, $window) {

  $rootScope.$on('player:clipStarted', function (evt, clip) {
    $window.ga('send', 'event', 'player', 'clipStarted', clip.id);
  });

  $rootScope.$on('player:tripStarted', function (evt, trip) {
    $window.ga('send', 'event', 'player', 'tripStarted', trip.id);
  });

});
