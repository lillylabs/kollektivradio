angular.module('radio.services', [])

/**
 * A simple example service that returns some data.
 */
.factory('Trips', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var trips = [
    { id: 'tur1', from: 'Jerbanetorget', to: 'Torshov', lines: [12], description: "<p>Pour-over ea nihil, 90's bicycle rights Blue Bottle quinoa 3 wolf moon bespoke pariatur forage Carles non PBR&B.</p><p>Pop-up seitan tilde gastropub sed, flexitarian yr anim pickled chillwave Williamsburg in tofu. Odio aliquip laboris lomo brunch locavore photo booth chambray. Food truck master cleanse cillum, sunt sriracha aliquip assumenda retro twee plaid flexitarian meditation disrupt. Pickled Kickstarter labore umami tofu. Roof party American Apparel Wes Anderson, VHS Etsy gastropub selfies lo-fi cronut typewriter. Crucifix leggings accusamus High Life.</p>" },
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
});
