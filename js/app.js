// Kollektivradio App

angular.module('radio', ['ionic', 'radio.controllers', 'radio.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // Each tab has its own nav history stack:

    .state('trip', {
      url: '/trips',
      templateUrl: 'templates/trips.html',
      controller: 'TripsCtrl'
    })
    .state('trip-detail', {
      url: '/trip/:tripId',
      templateUrl: 'templates/trip-detail.html',
      controller: 'TripDetailCtrl'
    })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/trips');

});
