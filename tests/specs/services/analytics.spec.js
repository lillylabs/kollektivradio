'use strict';

describe('AudioService', function() {
  beforeEach(module('radio'));
  beforeEach(module('mockdata'));

  var Analytics, mockGA, mockTrip, scope;

  beforeEach(module(function ($provide) {
    mockGA = {
      ga: sinon.spy()
    };
    $provide.value('GoogleAnalytics', mockGA);
  }));

  beforeEach(inject(function(_Analytics_, $injector, $rootScope) {
    mockTrip = $injector.get('mockTripsData')[0];
    Analytics = _Analytics_;
    scope = $rootScope;
  }));

  describe('when clip is started', function () {

    beforeEach(function () {
      scope.$broadcast('player:clipStarted', mockTrip.clips[0]);
    });

    it('should send event to GA', function () {
      expect(mockGA.ga.calledWith(
        'send', 'event', 'player', 'clipStarted', mockTrip.clips[0].id)
      ).to.be.true;
    });
  });

  describe('when trip is started', function () {

    beforeEach(function () {
      scope.$broadcast('player:tripStarted', mockTrip);
    });

    it('should send event to GA', function () {
      expect(mockGA.ga.calledWith(
        'send', 'event', 'player', 'tripStarted', mockTrip.id)
      ).to.be.true;
    });

  });
});

