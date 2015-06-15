'use strict';

describe('DataSourceService', function() {
  var apiUrl = 'https://public-api.wordpress.com/rest/v1/sites/kollektivradio.lillylabs.wpengine.com/posts/?type=trip';
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

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('trips', function() {
    var trips;

    beforeEach(function () {
      DataSource.trips().then(function (_trips_) {
        trips = _trips_;
      });
      $httpBackend.flush();
    });

    it('should have equal first trips', function () {
      expect(JSON.stringify(trips[0])).to.equal(JSON.stringify(tripsMockData[0]));
    });

    it('should return same number of trips as response', function () {
      expect(trips.length).to.eql(tripsMockData.length);
    });

  });

  describe('trips for production', function () {
    var trips, environment, isProduction;

    beforeEach(inject(function (environment) {
      isProduction = environment.isProduction;
      environment.isProduction = true;
    }));

    beforeEach(function () {
      DataSource.trips().then(function(_trips_) {
        trips = _trips_;
      });
      $httpBackend.flush();
    });

    afterEach(inject(function (environment) {
      environment.isProduction = isProduction;
    }));

    it('should only have production trips', function () {
      expect(trips.length).to.eq(1);
    });

  });

  describe('boat trip', function () {
    var boatTrip;

    beforeEach(function () {
      DataSource.trips().then(function (trips) {
        boatTrip = _.findWhere(trips, {title: 'Båt 92'});
      });
      $httpBackend.flush();
    });

    it('should have expected id', function () {
      expect(boatTrip.id, 245);
    });

    it('should have start time defined on sight', function () {
      expect(boatTrip.clips[0].sights[0].startTime).to.equal(80);
    });

    it('should have end time defined on sight', function () {
      expect(boatTrip.clips[0].sights[0].endTime).to.equal(100);
    });

  });

});
