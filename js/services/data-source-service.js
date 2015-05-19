'use strict';
angular.module('radio')

.factory('DataSource', function($http, $rootScope, $location, _, environment) {
  
  var apiUrl = 'https://public-api.wordpress.com/rest/v1/sites/kollektivradio.lillylabs.wpengine.com/posts/?type=trip';
  
  var tripFromTripJson = function(tripJson) {
    var metadata = metadataFromTripJson(tripJson);

    var clips = _.times(metadata.clips, function (i) {
      return clipFromMetadata(metadata, i);
    });

    var lines = _.times(metadata.lines, function (i) {
      return lineFromMetadata(metadata, i);
    });
    
    var trip = {
      /*jshint camelcase: false */
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
    return _.object(_.map(tripJson.metadata, function (tripMetaData) {
      return [tripMetaData.key, tripMetaData.value];
    }));
  };
  
  var clipFromMetadata = function(metadata, clipIndex) {
    var clipPrefix = 'clips_' + clipIndex + '_';
    var clipMetadata = _.reduce(metadata, function (acc, value, key) {
      if (key.indexOf(clipPrefix) === 0) {
        acc[key.substr(clipPrefix.length)] = value;
      }
      return acc;
    }, {});

    var sightKeyMapping = {
      /*jshint camelcase: false */
      map_location: 'location',
      title: 'title'
    };
    var sights = _.reduce(clipMetadata, function (acc, value, key) {
      var keyMatch = key.match(/^sights_(\d+)_/);
      if (keyMatch) {
        var sightsIndex = parseInt(keyMatch[1], 10);
        var propertyName = sightKeyMapping[key.substr(keyMatch[0].length)];

        acc[sightsIndex] = acc[sightsIndex] || {};
        acc[sightsIndex][propertyName] = value;
      }

      return acc;
    }, []);

    var clip = {
      /*jshint camelcase: false */
      id: 'clip' + clipIndex,
      title: clipMetadata.title,
      start: clipMetadata.start,
      end: clipMetadata.end,
      treshold: clipMetadata.treshold,
      sights: sights,
      locations: {
        map: clipMetadata.map_location,
        play: clipMetadata.play_location,
      }
    };

    if(!clip.locations.map) {
      clip.locations.map = clip.locations.play;
    }

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
  
  var fetchTrips = function() {
    return $http.get(apiUrl).then(function(response) {
      var filteredTrips = _.filter(response.data.posts, function (trip) {
        return isTripJsonForProduction(trip) || !environment.isProduction;
      });
      var mappedTrips = _.map(filteredTrips, function(trip) {
        return tripFromTripJson(trip);
      });

      return mappedTrips;
    });
  };

  return {
    trips: fetchTrips
  };
});
