// Kollektivradio App

angular.module('radio', ['leaflet-directive'])
.config(function($locationProvider) { 
  $locationProvider.html5Mode(true);
});