angular.module('radio')

.factory('DataSource', function($http, $rootScope, $location) {
  
  var apiUrl = "https://public-api.wordpress.com/rest/v1/sites/kollektivradio.lillylabs.wpengine.com/posts/?type=trip";
  var trips = null;
  
  var tripFromTripJson = function(tripJson) {
    var metadata = metadataFromTripJson(tripJson);

    var clips = [];
    for (i = 0, len = metadata.clips; i < len; i++) {
      clips.push(clipFromMetadata(metadata, i));
    }

    var lines = [];
    for (i = 0, len = metadata.lines; i < len; i++) {
      lines.push(lineFromMetadata(metadata, i));
    }
    
    var trip = {
      id: tripJson.ID,
      title: tripJson.title,
      description: tripJson.content,
      startStation: metadata.start_station,
      endStation: metadata.end_station,
      lines: lines,
      audio: metadata.audio_url,
      clips: clips
    };
    
    return trip;
  };
  
  var metadataFromTripJson = function(tripJson) {
    var metadata = {};
    for (var i = 0, len = tripJson.metadata.length; i < len; i++) {
      metadata[tripJson.metadata[i].key] = tripJson.metadata[i].value;
    }
    return metadata;
  };
  
  var clipFromMetadata = function(metadata, clipIndex) {
    var clip = {
      id: "clip" + clipIndex,
      title: metadata['clips_' + clipIndex + '_title'],
      start: metadata['clips_' + clipIndex + '_start'],
      end: metadata['clips_' + clipIndex + '_end'],
      treshold: metadata['clips_' + clipIndex + '_treshold'],
      locations: {
        map: metadata['clips_' + clipIndex + '_map_location'],
        play: metadata['clips_' + clipIndex + '_play_location'],
      }
    };

    if(!clip.locations.map)
      clip.locations.map = clip.locations.play;
    
    return clip;
  };
  
  var lineFromMetadata = function(metadata, lineIndex) {
    var line = {
      number: metadata['lines_' + lineIndex + '_number'],
      endStation: metadata['lines_' + lineIndex + '_end_station'],
    };
    
    return line;
  };
  
  var isTripJsonForProduction = function(tripJson) { 
    return tripJson.categories.Prod;
  };
  
  var isProduction = function() {
    var env = $location.search().env;
    return !env || env == "prod";
  };

  var fetchAllTrips = function() {
    $http.get(apiUrl).success(function(data, status, headers, config) {

      trips = [];
      angular.forEach(data.posts, function(post) {
        if(isTripJsonForProduction(post))
          trips.push(tripFromTripJson(post));  
        else if(!isProduction())
          trips.push(tripFromTripJson(post));
      });
      
      console.log("Trips fetched:");
      console.log(trips);
      $rootScope.$broadcast('trips:fetched');
    }).
    error(function(data, status, headers, config) {
      console.log("Trips could not be fetched:");
      $rootScope.$broadcast('trips:error');
    });
  };

  return {
    fetch: fetchAllTrips,
    trips: function() {
      return trips;
    },
    get: function(tripId) {
      if(trips)
        return trips[tripId];
      else
        return null;
    }
  };
});
