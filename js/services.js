angular.module('radio.services', [])

/**
 * A simple example service that returns some data.
 */
.factory('Trips', function($http, $rootScope) {
  // Might use a resource here that returns a JSON array
  var apiUrl = "https://public-api.wordpress.com/rest/v1/sites/kollektivradio.lillylabs.wpengine.com/posts/?type=trip";
  var trips = null;

  var fetchAllTrips = function() {
    $http.get(apiUrl).
    success(function(data, status, headers, config) {

      trips = {};

      angular.forEach(data.posts, function(post) {

        var metadata = {};
        for (var i = 0, len = post.metadata.length; i < len; i++) {
          metadata[post.metadata[i].key] = post.metadata[i].value;
        }

        var clips = [];
        for (i = 0, len = metadata.clips; i < len; i++) {
          clips.push({
            title: metadata['clips_' + i + '_title'],
            start: metadata['clips_' + i + '_start'],
            end: metadata['clips_' + i + '_end'],
            locations: {
              map: metadata['clips_' + i + '_map_location'],
              play: metadata['clips_' + i + '_play_location'],
            }
          });
        }

        var lines = [];
        for (i = 0, len = metadata.lines; i < len; i++) {
          lines.push({
            number: metadata['lines_' + i + '_number'],
            endStation: metadata['lines_' + i + '_end_station'],
          });
        }

        trips[post.ID] = {
          id: post.ID,
          title: post.title,
          description: post.content,
          startStation: metadata.start_station,
          endStation: metadata.end_station,
          lines: lines,
          audio: metadata.audio_url,
          clips: clips
        };

      });
      console.log("Trips fetched:");
      console.log(trips);
      $rootScope.$broadcast('trips:fetched');
    }).
    error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
  };

  return {
    fetch: fetchAllTrips,
    all: function() {
      return trips;
    },
    get: function(tripId) {
      if(trips)
        return trips[tripId];
      else
        return null;
    }
  };
})

.factory('Locator', function($rootScope) {

  var watchID = null;

  var broadcastNewPosition = function (pos) {
    console.log('Position updated: ');
    console.log(pos);
    $rootScope.$broadcast('position:updated', pos);
  };

  var broadcastError = function (error) {

    switch(error.code) {
      case error.NOT_SUPPORTED:
        console.log("Position failed: Geolocation not supported.");
        break;
      case error.PERMISSION_DENIED:
        console.log("Position failed: User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("Position failed: Location information is unavailable.");
        break;
      case error.TIMEOUT:
        console.log("Position failed: The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        console.log("Position failed: An unknown error occurred.");
        break;
    }

    $rootScope.$broadcast('position:error', error);
  };

  var stopWatch = function () {
    if(watchID) {
      console.log('Stop watching: ' + watchID);
      navigator.geolocation.clearWatch(watchID);
      watchID = null;
    }
  };

  var updateLocation = function(pos) {
    broadcastNewPosition(pos);
  };

  var errorHandler = function(err) {
    broadcastError(err);
  };

  var watchPosition = function() {
    stopWatch();

    if(navigator.geolocation) {
      // timeout at 60000 milliseconds (60 seconds)
      var options = { timeout:60000 };
      watchID = navigator.geolocation.watchPosition(updateLocation, errorHandler, options);
      console.log('Start watching ' + watchID);
    } else {
      var error = {
        code: -1,
        message: 'not supported',
        NOT_SUPPORTED: -1
      };

      broadcastError(error);
    }
  };

  var clear = function() {
    stopWatch();
  };

  return {
    watchPosition: watchPosition,
    clear: clear
  };

})

.factory('AudioPlayer', function($document, $rootScope) {
  var audio = $document[0].createElement('audio');

  audio.addEventListener('canplay', function(evt) {
    console.log("Audio can play:");
    console.log(evt);
    $rootScope.$broadcast('audio:canplay');
  });

  var setAudioSrc = function(src) {
    audio.src = src;
    audio.load();
  };

  var playAudio = function() {
    audio.play();
  };

  var stopAudio = function() {
    audio.pause();
  };

  var clear = function() {
    stopAudio();
    audio.src = "";
  };

  return {
    setAudioSrc: setAudioSrc,
    playAudio: playAudio,
    clear: clear
  };

})

.factory('Player', function($document, $rootScope, Locator, AudioPlayer) {

  var internalStatus = {
    audioReady: false,
    locationReady: false
  };

  var startTrip = function(trip) {
    AudioPlayer.setAudioSrc(trip.audio);
    Locator.watchPosition();
    $rootScope.$broadcast('player:started');
  };

  var stopTrip = function() {
    AudioPlayer.clear();
    Locator.clear();
  };

  var playTrip = function() {
    if(internalStatus.audioReady && internalStatus.locationReady) {
      AudioPlayer.playAudio();
      $rootScope.$broadcast('player:playing');
    }
  };

  //Observers
  $rootScope.$on('position:updated', function(event, pos) {
    internalStatus.locationReady = true;
    playTrip();
  });

  $rootScope.$on('audio:canplay', function(event, pos) {
    internalStatus.audioReady = true;
    playTrip();
  });

  return {
    startTrip: startTrip,
    stopTrip: stopTrip
  };
});
