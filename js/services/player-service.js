angular.module('radio')

.factory('Player', function($document, $rootScope, Locator, Audio) {
  
  var trip = null;
  
  var isPlayerReady = function() {
    return trip && Locator.getCurrentPos() && Audio.isReady();
  };

  var startTrip = function(tripToBeStarted) {
    trip = tripToBeStarted;
    Audio.setAudioSrc(trip.audio);
    $rootScope.$broadcast('player:tripStarted');
  };

  var endTrip = function(tripToBeEnded) {
    trip = null;
    Audio.pauseAudio();
    $rootScope.$broadcast('player:tripEnded');
  };

  var playTrip = function() {
    if(isPlayerReady()) {
      playLocalClip();
    }
  };

  var playClip = function(clip) {
    Audio.playAudioSprite({start: clip.start, end: clip.end});
    $rootScope.$broadcast('player:clipStarted');
  };

  var playLocalClip = function() {
    var userLatLng = new google.maps.LatLng(pos.latitude, pos.longitude);
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

  var isCurrentClip = function(clip) {
    return Audio.isCurrentSprite({start: clip.start, end: clip.end});
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

  $rootScope.$on('audio:spriteEnded', function(event) {
    $rootScope.$broadcast('player:clipEnded');
  });

  return {
    startTrip: startTrip,
    endTrip: endTrip,
    isCurrentClip: isCurrentClip,
    getSelectedTrip: function() {
      return trip;
    }
  };
});
