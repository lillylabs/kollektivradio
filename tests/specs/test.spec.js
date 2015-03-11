"use strict"

describe('Array', function(){
  var apiUrl = 'https://public-api.wordpress.com/rest/v1/' +
    'sites/kollektivradio.lillylabs.wpengine.com/posts/?type=trip';

  beforeEach(module('radio'));
  beforeEach(module('mockdata'));

  var tripsController, tripsDefer, tripsFixture, $httpBackend, $scope, mockTripsData;

  beforeEach(inject(function($controller, $injector, $q) {
    $scope = $injector.get('$rootScope').$new();

    mockTripsData = $injector.get('mockTripsData');

    var DataSource = {
      trips: function () {
        tripsDefer = $q.defer();
        return tripsDefer.promise;
      }
    }

    tripsController = $controller('TripsCtrl', {
      $scope: $scope,
      DataSource: DataSource
    });
  }));

  describe('before trips are loaded', function(){
    it('should not have trips on scope', function() {
      expect($scope.trips).to.equal(undefined);
    })
  })

  describe('when trips are loaded', function(){
    beforeEach(function () {
      $scope.$apply(function () {
        tripsDefer.resolve(mockTripsData);
      });
    });

    it('should have trips on scope', function() {
      expect($scope.trips).to.eql(mockTripsData);
    })

  })

})

