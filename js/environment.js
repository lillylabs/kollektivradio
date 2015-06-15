'use strict';

angular.module('environment', []).constant('environment', {
  isProduction: (function isProduction() {
      var env = window.location.href.match(/[\?\&]env=([^&]*)/);
      return !env || env[1].indexOf('prod') > -1;
  })()
});
