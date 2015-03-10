"use strict"

describe('DataSourceService', function() {
  var apiUrl = "https://public-api.wordpress.com/rest/v1/sites/kollektivradio.lillylabs.wpengine.com/posts/?type=trip";
  beforeEach(module('radio'));
  beforeEach(module('mockdata'));

  var DataSource, tripsFixture, $httpBackend, tripsMockData;

  beforeEach(inject(function(_DataSource_, $injector) {
    tripsMockData = $injector.get('mockTripsData');
    tripsFixture = $injector.get('mockTripsResponse');

    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET(apiUrl).respond(tripsFixture);

    DataSource = _DataSource_;
  }));

  describe('trips', function(){
    it('should return trips for current environment', function(done) {
      DataSource.trips().then(function (trips) {
        expect(trips).to.eql(tripsMockData);
        done();
      });
      $httpBackend.flush();
    })
  })

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

});
