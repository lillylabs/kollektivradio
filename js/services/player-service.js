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
