angular.module('radio.services', [])

/**
 * A simple example service that returns some data.
 */
.factory('Trips', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var trips = [
    { id: 'tur1', from: 'Jerbanetorget', to: 'Torshov', lines: [12] },
    { id: 'tur2', from: 'Majorstua', to: 'Aker Brygge', lines: [12] },
    { id: 'tur3', from: 'Carl Berner', to: 'Majorstua', lines: [20] },
    { id: 'tur4', from: 'Jerbanetorget', to: 'Carl Berner', lines: [31, 17] },
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
});
