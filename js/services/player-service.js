angular.module('radio')

.factory('Player', function($document, $rootScope, Locator, Audio) {

  var audioReady = false;
  var pos = {};
  var trip = {};

  var isPlayerReady = function() {
    return audioReady && pos.coords;
  };

  var startTrip = function(newTrip) {
    trip = newTrip;
    Audio.setAudioSrc(trip.audio);
    Locator.watchPosition();
    $rootScope.$broadcast('player:started');
  };

  var stopTrip = function() {
    Audio.clear();
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
    Audio.playAudioSprite({start: clip.start, end: clip.end});
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

  var isCurrentClip = function(clip) {
    return Audio.isCurrentSprite({start: clip.start, end: clip.end});
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

  $rootScope.$on('audio:spriteEnded', function(event) {
    $rootScope.$broadcast('player:clipEnded');
  });

  return {
    startTrip: startTrip,
    stopTrip: stopTrip,
    isCurrentClip: isCurrentClip
  };
});
