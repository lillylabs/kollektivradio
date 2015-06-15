'use strict';
// Kollektivradio App

angular.module('radio', ['leaflet-directive', 'environment'])
.value('radioAudio', window.Audio ? new Audio() : undefined)
.constant('_', window._)
.value('google', window.google)
.config(function($locationProvider) { 
  $locationProvider.html5Mode(true);
})
.controller('ApplicationCtrl', function (Analytics) {
  // Starts modules listening to rootscope events
});
