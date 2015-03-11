'use strict';
angular.module('radio')

.factory('Player', function($document, $rootScope, Locator, Audio) {
  
  var trip = null;
  var playedClips = null;

  var startTrip = function(tripToBeStarted) {
    trip = tripToBeStarted;
    playedClips = [];
    Locator.watchPosition();
    Audio.setAudioSrc(trip.audio);
    console.log('Player: Trip started');
    $rootScope.$broadcast('player:tripStarted');
  };

  var endTrip = function(tripToBeEnded) {
    trip = null;
    playedClips = null;
    Locator.stopWatching();
    Audio.pauseAudio();
    console.log('Player: Trip ended');
    $rootScope.$broadcast('player:tripEnded');
  };

  var playClip = function(clip) {
    Audio.playAudioSprite({start: clip.start, end: clip.end});
    console.log('Player: Clip started - ' + clip.id);
    $rootScope.$broadcast('player:clipStarted', clip);
  };
  
  var findClosestClip = function(pos, clips) {
    var userLatLng = new google.maps.LatLng(pos.latitude, pos.longitude);
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

  var findAndPlayClosestClip = function() {
    
    if(!trip || !Locator.getCurrentPos()) {
      return;
    }
    
    var closestClip = findClosestClip(Locator.getCurrentPos(), trip.clips);

    if(closestClip) {
      Audio.isReady().then(function () {
        playClosestClip(closestClip);
      });
    }
  };

  //Observers
  
  $rootScope.$on('position:updated', function(event, newPos) {
    findAndPlayClosestClip();
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
