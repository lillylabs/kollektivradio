'use strict';
angular.module('radio')

.factory('Player', function($rootScope, Locator, Audio, google) {
  
  var trip = null;
  var playedClips = null;

  var startTrip = function(tripToBeStarted) {
    trip = tripToBeStarted;
    playedClips = [];
    Locator.watchPosition();
    Audio.setAudioSrc(trip.audio);
    $rootScope.$broadcast('player:tripStarted');
  };

  var endTrip = function(tripToBeEnded) {
    trip = null;
    playedClips = null;
    Locator.stopWatching();
    Audio.pauseAudio();
    $rootScope.$broadcast('player:tripEnded');
  };

  var playClip = function(clip) {
    Audio.playAudioSprite({start: clip.start, end: clip.end});
    $rootScope.$broadcast('player:clipStarted', clip);
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
  
  var clipInClips = function(needle, haystack) {
    var clipInClips = false;
    angular.forEach(haystack, function(clip) {
      if(needle === clip) {
        clipInClips = true;
      }
    });
    return clipInClips;
  };
  
  var playClosestClip = function(closestClip) {
    if(!clipInClips(closestClip, playedClips)) {
      playedClips.push(closestClip); 
      playClip(closestClip);
    } else {
      console.log('Player: Clip already played');
    }
  };

  var findAndPlayClosestClip = function(position) {
    var closestClip = findClosestClip(position, trip.clips);

    if (closestClip) {
      Audio.isReady().then(function () {
        playClosestClip(closestClip);
      });
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
