'use strict';

module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai', 'sinon'],
    basePath: '../',
    autoWatch: true,
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/'
    },
    preprocessors: {
      'js/**/*.js': ['coverage']
    },
    exclude: [
      'js/environment.js'
    ],
    files: [
      'tests/lib/angular.js',
      'tests/lib/*.js',
      'lib/*.js',
      'js/**/*.js',
      'tests/environment.js',
      'tests/mockdata/*.js',
      'tests/specs/**/*.js'
    ]
  });
};
