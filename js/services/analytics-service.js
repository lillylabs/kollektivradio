'use strict';
angular.module('radio')

.factory('Analytics', function($rootScope, GoogleAnalytics) {

  $rootScope.$on('player:clipStarted', function (evt, clip) {
    GoogleAnalytics.ga('send', 'event', 'player', 'clipStarted', clip.id);
  });

  $rootScope.$on('player:tripStarted', function (evt, trip) {
    GoogleAnalytics.ga('send', 'event', 'player', 'tripStarted', trip.id);
  });

});
