angular.module('radio')

.factory('Audio', function($document, $rootScope, $q) {
  
  var audio = $document[0].createElement('audio');
  
  var audioIsReady = $q.defer();
  var currentSprite = null;

  var isSpriteCurrentSprite = function(sprite) {
    return sprite && currentSprite && currentSprite.start == sprite.start && currentSprite.end == sprite.end;  
  };

  var setAudioSrc = function(src) {
    pauseAudio();
    currentSprite = null;

    audioIsReady.reject();
    audioIsReady = $q.defer();
    
    if(src) {
      audio.src = src;
      audio.load();
    } else {
      audio.src = "";
      audio.load();
    }
  };

  var playAudio = function() {
    audio.play();
  };

  var pauseAudio = function() {
    audio.pause();
  };

  var playAudioSprite = function(newSprite) {
    if(!newSprite)
      return;
    
    if(!isSpriteCurrentSprite(newSprite)) {
      console.log("New sprite");
      currentSprite = newSprite;
      audio.currentTime = currentSprite.start;
      audio.play();
    } else if(currentSprite.end < audio.currentTime) {
      console.log("Old sprite");
      audio.play();
    }
  };
  
  // Observers
  
  audio.addEventListener('canplay', function(evt) {
    $rootScope.$apply(function () {
      audioIsReady.resolve();
    });
  });
  
  audio.addEventListener('play', function(evt) {
    $rootScope.$apply(function () {
      console.log("Audio: Play from " + audio.currentTime);
    });
  });

  audio.addEventListener('playing', function(evt) {
    $rootScope.$apply(function () {
      console.log("Audio: Playing from " + audio.currentTime);
      console.log(evt);
    });
  });

  audio.addEventListener('pause', function(evt) {
    $rootScope.$apply(function () {
      console.log("Audio: Pause at " + audio.currentTime);
    });
  });

  audio.addEventListener('ended', function(evt) {
    $rootScope.$apply(function () {
      console.log("Audio: Ended at " + audio.currentTime);
    });
  });

  audio.addEventListener('timeupdate', function(evt) {
    $rootScope.$apply(function () {
      if (currentSprite && audio.currentTime >= currentSprite.end) {
        pauseAudio();
        currentSprite = null;
        console.log("Audio: Sprite ended");
        $rootScope.$broadcast('audio:spriteEnded');
      }
    });
  });

  return {
    setAudioSrc: setAudioSrc,
    playAudioSprite: playAudioSprite,
    playAudio: playAudio,
    pauseAudio: pauseAudio,
    isReady: function() {
      return audioIsReady.promise;
    }
  };

});