angular.module('radio.services', [])

/**
 * A simple example service that returns some data.
 */
.factory('Trips', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var trips = [
    { id: 'tur1', from: 'Jerbanetorget', to: 'Torshov', lines: [12], audio: "https://dl.dropboxusercontent.com/u/21145298/Trikkeradio/Trikketur1-Linje12.mp3", description: "<p>Pour-over ea nihil, 90's bicycle rights Blue Bottle quinoa 3 wolf moon bespoke pariatur forage Carles non PBR&B.</p><p>Pop-up seitan tilde gastropub sed, flexitarian yr anim pickled chillwave Williamsburg in tofu. Odio aliquip laboris lomo brunch locavore photo booth chambray. Food truck master cleanse cillum, sunt sriracha aliquip assumenda retro twee plaid flexitarian meditation disrupt. Pickled Kickstarter labore umami tofu. Roof party American Apparel Wes Anderson, VHS Etsy gastropub selfies lo-fi cronut typewriter. Crucifix leggings accusamus High Life.</p>" },
    { id: 'tur2', from: 'Majorstua', to: 'Aker Brygge', lines: [12], description: "<p>Pour-over ea nihil, 90's bicycle rights Blue Bottle quinoa 3 wolf moon bespoke pariatur forage Carles non PBR&B.</p><p>Pop-up seitan tilde gastropub sed, flexitarian yr anim pickled chillwave Williamsburg in tofu. Odio aliquip laboris lomo brunch locavore photo booth chambray. Food truck master cleanse cillum, sunt sriracha aliquip assumenda retro twee plaid flexitarian meditation disrupt. Pickled Kickstarter labore umami tofu. Roof party American Apparel Wes Anderson, VHS Etsy gastropub selfies lo-fi cronut typewriter. Crucifix leggings accusamus High Life.</p>" },
    { id: 'tur3', from: 'Carl Berner', to: 'Majorstua', lines: [20], description: "<p>Pour-over ea nihil, 90's bicycle rights Blue Bottle quinoa 3 wolf moon bespoke pariatur forage Carles non PBR&B.</p><p>Pop-up seitan tilde gastropub sed, flexitarian yr anim pickled chillwave Williamsburg in tofu. Odio aliquip laboris lomo brunch locavore photo booth chambray. Food truck master cleanse cillum, sunt sriracha aliquip assumenda retro twee plaid flexitarian meditation disrupt. Pickled Kickstarter labore umami tofu. Roof party American Apparel Wes Anderson, VHS Etsy gastropub selfies lo-fi cronut typewriter. Crucifix leggings accusamus High Life.</p>" },
    { id: 'tur4', from: 'Jerbanetorget', to: 'Carl Berner', lines: [31, 17], description: "<p>Pour-over ea nihil, 90's bicycle rights Blue Bottle quinoa 3 wolf moon bespoke pariatur forage Carles non PBR&B.</p><p>Pop-up seitan tilde gastropub sed, flexitarian yr anim pickled chillwave Williamsburg in tofu. Odio aliquip laboris lomo brunch locavore photo booth chambray. Food truck master cleanse cillum, sunt sriracha aliquip assumenda retro twee plaid flexitarian meditation disrupt. Pickled Kickstarter labore umami tofu. Roof party American Apparel Wes Anderson, VHS Etsy gastropub selfies lo-fi cronut typewriter. Crucifix leggings accusamus High Life.</p>" },
  ];

  return {
    all: function() {
      return trips;
    },
    get: function(tripId) {
      // Simple index lookup
      var selectedTrip;
      angular.forEach(trips, function(trip) {
        if(trip.id === tripId) {
          selectedTrip = trip;
        }
      });
      return selectedTrip;
    }
  }
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
        console.log("Position failed: An unknown error occurred.")
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
      }

      broadcastError(error);
    }
  };

  var clear = function() {
    stopWatch();
  }

  return {
    watchPosition: watchPosition,
    clear: clear
  };

})

.factory('AudioPlayer', function($document, $rootScope) {
  var audio = $document[0].createElement('audio');

  audio.addEventListener('canplay', function(evt) {
    console.log("Audio can play:");
    console.log(evt);
    $rootScope.$broadcast('audio:canplay');
  });

  var setAudioSrc = function(src) {
    audio.src = src;
    audio.load();
  }

  var playAudio = function() {
    audio.play();
  }

  var stopAudio = function() {
    audio.pause();
  }

  var clear = function() {
    stopAudio();
    audio.src = "";
  }

  return {
    setAudioSrc: setAudioSrc,
    playAudio: playAudio,
    clear: clear
  };

})

.factory('Player', function($document, $rootScope, Locator, AudioPlayer) {

  var internalStatus = {
    audioReady: false,
    locationReady: false
  }

  var status = {
    started: false,
    playing: false
  };

  var startTrip = function(trip) {
    console.log()
    status.started = true;
    AudioPlayer.setAudioSrc(trip.audio);
    Locator.watchPosition();
  }

  var stopTrip = function() {
    status.started = false;
    AudioPlayer.clear();
    Locator.clear();
  }

  var playTrip = function() {
    if(internalStatus.audioReady && internalStatus.locationReady) {
      status.playing = true;
      AudioPlayer.playAudio();
    }
  }

  $rootScope.$on('position:updated', function(event, pos) {
    internalStatus.locationReady = true;
    playTrip();
  });

  $rootScope.$on('audio:canplay', function(event, pos) {
    internalStatus.audioReady = true;
    playTrip();
  });

  return {
    status: status,
    startTrip: startTrip,
    stopTrip: stopTrip
  };
})
