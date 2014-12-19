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
            treshold: metadata['clips_' + i + '_treshold'],
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

.factory('MapUtil', function($document, $rootScope) {

  var fitMapToMarkers = function(map, markers) {
    var bounds = new google.maps.LatLngBounds();

    // loop through all markers and create bounds
    angular.forEach(markers, function(marker, i) {
      var coords = marker.coords;
      var latlng = new google.maps.LatLng(marker.coords.latitude, marker.coords.longitude);
      bounds.extend( latlng );
    });

    // only 1 marker?
    if( markers.length == 1 ) {
      // set center of map
      map.center = {
        latitude: bounds.getCenter().lat(),
        longitude: bounds.getCenter().lng()
      };

    } else {
      // fit to bounds
      map = {
        bounds: {
          northeast: {
            latitude: bounds.getNorthEast().lat(),
            longitude: bounds.getNorthEast().lng()
          },
          southwest: {
            latitude: bounds.getSouthWest().lat(),
            longitude: bounds.getSouthWest().lng()
          }
        }
      };
    }
  };

  return {
    fitMapToMarkers: fitMapToMarkers
  };
})

.factory('AudioPlayer', function($document, $rootScope) {
  var audio = $document[0].createElement('audio');
  var audioSprite = {};

  audio.addEventListener('canplay', function(evt) {
    console.log("Audio can play:");
    console.log(evt);
    $rootScope.$broadcast('audio:canplay');
  });

  audio.addEventListener('timeupdate', function(evt) {
    if (audio.currentTime > audioSprite.end) {
      pauseAudio();
      console.log("Audio sprite ended");
      $rootScope.$broadcast('audio:spriteEnded');
    }
  });

  var isSameSprite = function(sprite1, sprite2) {
    return (sprite1.start == sprite2.start) || (sprite1.end == sprite2.end);
  };

  var setAudioSrc = function(src) {
    audio.src = src;
    audio.load();
  };

  var playAudio = function() {
    audio.play();
  };

  var pauseAudio = function() {
    audio.pause();
  };

  var playAudioSprite = function(newSprite) {
    if(!isSameSprite(audioSprite, newSprite)) {
      console.log("New sprite");
      audioSprite = newSprite;
      audio.play(audioSprite.start);
    }
  };

  var clear = function() {
    pauseAudio();
    audio.src = "";
    audioSprite = {};
  };

  return {
    setAudioSrc: setAudioSrc,
    playAudioSprite: playAudioSprite,
    playAudio: playAudio,
    pauseAudio: pauseAudio,
    clear: clear
  };

})

.factory('Player', function($document, $rootScope, Locator, AudioPlayer) {

  var audioReady = false;
  var pos = {};
  var trip = {};

  var isPlayerReady = function() {
    return audioReady && pos.coords;
  };

  var startTrip = function(newTrip) {
    trip = newTrip;
    AudioPlayer.setAudioSrc(trip.audio);
    Locator.watchPosition();
    $rootScope.$broadcast('player:started');
  };

  var stopTrip = function() {
    AudioPlayer.clear();
    Locator.clear();
    clear();
  };

  var playTrip = function() {
    if(isPlayerReady()) {
      playLocalClip();
      $rootScope.$broadcast('player:playing');
    }
  };

  var playClip = function(clip) {
    AudioPlayer.playAudioSprite({start: clip.start, end: clip.end});
  };

  var playLocalClip = function() {
    var userLatLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    console.log("User location:");
    console.log(userLatLng);
    var closestClip = null;
    var closestDistance = null;

    angular.forEach(trip.clips, function(clip) {
      var clipLatLng = new google.maps.LatLng(clip.locations.play.lat, clip.locations.play.lng);
      var distance = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, clipLatLng);

      if( distance < clip.treshold &&
         (!closestDistance || distance < closestDistance)) {
        closestClip = clip;
        closestDistance = distance;
      }
    });

    if(closestClip) {
      playClip(closestClip);
    }
  };

  var clear = function() {
    audioReady = false;
    pos = {};
    trip = {};
  };

  //Observers
  $rootScope.$on('position:updated', function(event, newPos) {
    pos = newPos;
    playTrip();
  });

  $rootScope.$on('audio:canplay', function(event) {
    audioReady = true;
    playTrip();
  });

  return {
    startTrip: startTrip,
    stopTrip: stopTrip
  };
});
