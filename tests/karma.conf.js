'use strict';

module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai', 'sinon'],
    basePath: '../',
    autoWatch: true,
    files: [
      'tests/lib/angular.js',
      'tests/lib/*.js',
      'lib/*.js',
      'js/**/*.js',
      'tests/mockdata/*.js',
      'tests/specs/**/*.js'
    ]
  });
};
