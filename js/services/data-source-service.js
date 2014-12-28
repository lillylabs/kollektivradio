angular.module('radio')

.factory('DataSource', function($http, $rootScope) {
  
  var apiUrl = "https://public-api.wordpress.com/rest/v1/sites/kollektivradio.lillylabs.wpengine.com/posts/?type=trip";
  var trips = null;
  
  var metadataToClip = function(metadata, clipIndex) {
    var clip = {
      id: 'clip' + clipIndex,
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
    
    if(clip.locations.map) {
      clip.locations.map.latitude = clip.locations.map.lat;
      clip.locations.map.longitude = clip.locations.map.lng;
    }
    
    if(clip.locations.play) {
      clip.locations.play.latitude = clip.locations.map.lat;
      clip.locations.play.longitude = clip.locations.map.lng;
    }
    
    return clip;
  };

  var fetchAllTrips = function() {
    $http.get(apiUrl).success(function(data, status, headers, config) {

      trips = {};

      angular.forEach(data.posts, function(post) {

        var metadata = {};
        for (var i = 0, len = post.metadata.length; i < len; i++) {
          metadata[post.metadata[i].key] = post.metadata[i].value;
        }

        var clips = [];
        for (i = 0, len = metadata.clips; i < len; i++) {
          clips.push(metadataToClip(metadata, i));
        }

        var lines = [];
        for (i = 0, len = metadata.lines; i < len; i++) {
          lines.push({
            number: metadata['lines_' + i + '_number'],
            endStation: metadata['lines_' + i + '_end_station'],
          });
        }

        trips[post.ID] = {
          id: post.ID,
          title: post.title,
          description: post.content,
          startStation: metadata.start_station,
          endStation: metadata.end_station,
          lines: lines,
          audio: metadata.audio_url,
          clips: clips
        };

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
