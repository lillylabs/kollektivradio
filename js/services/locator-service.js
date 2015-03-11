'use strict';
angular.module('radio')

.factory('Locator', function($rootScope) {

  var watchID = null;
  var pos = null;

  var setAndBroadcastNewPosition = function (newPos) {
    $rootScope.$apply(function () {
      pos = {
        latitude: newPos.coords.latitude,
        longitude: newPos.coords.longitude
      };
      console.log('Locator: Position updated');
      $rootScope.$broadcast('position:updated', pos);
    });
  };

  var broadcastError = function (error) {

    switch(error.code) {
      case error.NOT_SUPPORTED:
        console.log('Position failed: Geolocation not supported.');
        break;
      case error.PERMISSION_DENIED:
        console.log('Position failed: User denied the request for Geolocation.');
        break;
      case error.POSITION_UNAVAILABLE:
        console.log('Position failed: Location information is unavailable.');
        break;
      case error.TIMEOUT:
        console.log('Position failed: The request to get user location timed out.');
        break;
      case error.UNKNOWN_ERROR:
        console.log('Position failed: An unknown error occurred.');
        break;
    }

    $rootScope.$broadcast('position:error', error);
  };

  var stopWatching = function () {
    if(watchID) {
      console.log('Locator: Stop watching: ' + watchID);
      navigator.geolocation.clearWatch(watchID);
      watchID = null;
      $rootScope.$broadcast('position:ended', pos);
    }
  };

  var errorHandler = function(err) {
    if (watchID) {
      $rootScope.$apply(function () {
        broadcastError(err);
      });
    }
  };

  var watchPosition = function() {
    stopWatching();

    if(navigator.geolocation) {
      // timeout at 60000 milliseconds (60 seconds)
      var options = { timeout:60000 };
      watchID = navigator.geolocation.watchPosition(setAndBroadcastNewPosition, errorHandler, options);
      console.log('Locator: Start watching ' + watchID);
    } else {
      var error = {
        code: -1,
        message: 'not supported',
        NOT_SUPPORTED: -1
      };

      broadcastError(error);
    }
  };

  return {
    watchPosition: watchPosition,
    stopWatching: stopWatching,
    getCurrentPos: function() {
      return pos;
    }
  };

});
