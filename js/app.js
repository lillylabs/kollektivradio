'use strict';
// Kollektivradio App

angular.module('radio', ['leaflet-directive'])
.constant('environment', {
  isProduction: (function isProduction() {
      var env = window.location.href.match(/[\?\&]env=([^&]*)/);
      return !env || env[1].indexOf('prod') > -1;
  })()
})
.value('radioAudio', window.Audio ? new Audio() : undefined)
.constant('_', window._)
.value('google', window.google)
.config(function($locationProvider) { 
  $locationProvider.html5Mode(true);
});
