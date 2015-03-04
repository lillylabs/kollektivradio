// Kollektivradio App

angular.module('radio', ['leaflet-directive'])
.constant('_', window._)
.config(function($locationProvider) { 
  $locationProvider.html5Mode(true);
});