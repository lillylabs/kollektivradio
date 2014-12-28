angular.module('radio')

.factory('Audio', function($document, $rootScope) {
  var audio = $document[0].createElement('audio');
  var audioIsReady = false;
  var audioSprite = {};

  var isCurrentSprite = function(sprite) {
    return (audioSprite.start == sprite.start) || (audioSprite.end == sprite.end);
  };

  var setAudioSrc = function(src) {
    pauseAudio();
    audioSprite = {};
    audio.src = src;
    audioIsReady = false;
    
    if(src) {
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
    if(!isCurrentSprite(newSprite)) {
      audioSprite = newSprite;
      audio.play(audioSprite.start);
    } else if(audioSprite.end < audio.currentTime) {
      audio.play();
    }
  };
  
  // Observers
  
  audio.addEventListener('canplay', function(evt) {
    audioIsReady = true;
    console.log("Audio can play:");
    console.log(evt);
    $rootScope.$broadcast('audio:canplay');
  });
  
  audio.addEventListener('play', function(evt) {
    console.log("Play from " + audio.currentTime + ":");
    console.log(evt);
  });

  audio.addEventListener('playing', function(evt) {
    console.log("Playing from " + audio.currentTime + ":");
    console.log(evt);
  });

  audio.addEventListener('pause', function(evt) {
    console.log("Pause at " + audio.currentTime + ":");
    console.log(evt);
  });

  audio.addEventListener('ended', function(evt) {
    console.log("Ended at " + audio.currentTime + ":");
    console.log(evt);
  });

  audio.addEventListener('timeupdate', function(evt) {
    if (audio.currentTime >= audioSprite.end) {
      pauseAudio();
      audioSprite = {};
      console.log("Audio sprite ended");
      $rootScope.$broadcast('audio:spriteEnded');
    }
  });

  return {
    setAudioSrc: setAudioSrc,
    playAudioSprite: playAudioSprite,
    isCurrentSprite: isCurrentSprite,
    playAudio: playAudio,
    pauseAudio: pauseAudio,
    isReady: function() {
      return audioIsReady;
    }
  };

});