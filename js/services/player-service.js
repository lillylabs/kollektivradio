'use strict';
angular.module('radio')

.factory('Player', function(_, $rootScope, Locator, Audio, google) {
  
  var trip = null;
  var playedClips = null;

  var startTrip = function(tripToBeStarted) {
    trip = tripToBeStarted;
    playedClips = [];
    Locator.watchPosition();
    Audio.setAudioSrc(trip.audio);
    $rootScope.$broadcast('player:tripStarted', tripToBeStarted);

    if (window.location.href.indexOf('emulate=true') > -1) {
      emulateTrip();
    }
  };

  var emulateTrip = function () {
    var stepsPerClip = 20;
    var currentClipIndex = 0;
    var latOffset = 0;
    var lngOffset = 0;
    var intervalId = setInterval(function () {
      $rootScope.$apply(function () {
        if (playedClips.length > currentClipIndex + 1) {
          latOffset = 0;
          lngOffset = 0;
          currentClipIndex += 1;
        }
        if (currentClipIndex + 1 >= trip.clips.length) {
          clearInterval(intervalId);
          return;
        } else {
          var clipLocation = trip.clips[currentClipIndex].locations.play;
          var nextClipLocation = trip.clips[currentClipIndex + 1].locations.play;

          $rootScope.$broadcast('position:updated', {
            latitude: clipLocation.lat + latOffset,
            longitude: clipLocation.lng + lngOffset
          });

          latOffset += (nextClipLocation.lat - clipLocation.lat) / stepsPerClip;
          lngOffset += (nextClipLocation.lng - clipLocation.lng) / stepsPerClip;
        }
      });
    }, 250);
  };

  var endTrip = function(tripToBeEnded) {
    trip = null;
    playedClips = null;
    Locator.stopWatching();
    Audio.pauseAudio();
    $rootScope.$broadcast('player:tripEnded');
  };

  var findClosestClip = function(position, clips) {
    var userLatLng = new google.maps.LatLng(position.latitude, position.longitude);
    var closestClip = null;
    var closestDistance = Number.MAX_VALUE;

    angular.forEach(clips, function(clip) {
      var clipLatLng = new google.maps.LatLng(clip.locations.play.lat, clip.locations.play.lng);
      var distance = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, clipLatLng);

      if (distance < clip.treshold && distance < closestDistance) {
        closestClip = clip;
        closestDistance = distance;
      }
    });

    return closestClip;
  };
  
  var playClip = function(clip) {
    if (!_.contains(playedClips, clip)) {
      playedClips.push(clip);
      Audio.isReady().then(function () {
        Audio.playAudioSprite({start: clip.start, end: clip.end});
        $rootScope.$broadcast('player:clipStarted', clip);
      });
    }
  };

  var findAndPlayClosestClip = function(position) {
    var closestClip = findClosestClip(position, trip.clips);

    if (closestClip) {
        playClip(closestClip);
    }
  };

  //Observers

  $rootScope.$on('position:updated', function(event, position) {
    if (trip) {
      findAndPlayClosestClip(position);
    }
  });

  $rootScope.$on('audio:spriteEnded', function(event) {
    console.log('Player: Clip ended');
    $rootScope.$broadcast('player:clipEnded');
  });

  return {
    startTrip: startTrip,
    endTrip: endTrip,
    getSelectedTrip: function() {
      return trip;
    }
  };
});
