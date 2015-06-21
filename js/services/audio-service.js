'use strict';
angular.module('radio')

.factory('Audio', function($document, $rootScope, $q, _, radioAudio) {

  if (!radioAudio) {
    window.alert('Audio is not supported by browser.');
    return;
  }

  var audioIsReady = $q.defer();
  var currentSprite = null;

  var isSpriteCurrentSprite = function(sprite) {
    return sprite && currentSprite && currentSprite.start === sprite.start && currentSprite.end === sprite.end;  
  };

  var setAudioSrc = function(src) {
    pauseAudio();
    currentSprite = null;

    audioIsReady.reject();
    audioIsReady = $q.defer();
    
    if (src) {
      radioAudio.src = src;
      radioAudio.load();
    } else {
      radioAudio.src = '';
      radioAudio.load();
    }
  };

  var playAudio = function() {
    radioAudio.play();
  };

  var pauseAudio = function() {
    radioAudio.pause();
  };

  var playAudioSprite = function(newSprite) {
    if(!newSprite) {
      return;
    }
    
    if(!isSpriteCurrentSprite(newSprite)) {
      currentSprite = newSprite;
      radioAudio.currentTime = currentSprite.start;
      radioAudio.play();
    } else if(currentSprite.end < radioAudio.currentTime) {
      console.log('Old sprite');
      radioAudio.play();
    }
  };
  
  // Observers
  
  radioAudio.addEventListener('canplay', function(evt) {
    $rootScope.$apply(function () {
      audioIsReady.resolve();
    });
  });
  
  radioAudio.addEventListener('play', function(evt) {
    $rootScope.$apply(function () {
      console.log('radioAudio: Play from ' + radioAudio.currentTime);
    });
  });

  radioAudio.addEventListener('playing', function(evt) {
    $rootScope.$apply(function () {
      console.log('Audio: Playing from ' + radioAudio.currentTime);
      console.log(evt);
    });
  });

  radioAudio.addEventListener('pause', function(evt) {
    $rootScope.$apply(function () {
      console.log('Audio: Pause at ' + radioAudio.currentTime);
    });
  });

  radioAudio.addEventListener('ended', function(evt) {
    $rootScope.$apply(function () {
      console.log('Audio: Ended at ' + radioAudio.currentTime);
    });
  });

  var broadcastTimeUpdate = _.throttle(function (time) {
    $rootScope.$broadcast('audio:timeUpdate', Math.floor(time));
  }, 1000);

  radioAudio.addEventListener('timeupdate', function(evt) {
    $rootScope.$apply(function () {
      if (currentSprite && radioAudio.currentTime >= currentSprite.end) {
        pauseAudio();
        currentSprite = null;
        $rootScope.$broadcast('audio:spriteEnded');
      } else if (currentSprite) {
        broadcastTimeUpdate(radioAudio.currentTime);
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
