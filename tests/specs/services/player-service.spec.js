'use strict';

describe('PlayerService', function() {
  beforeEach(module('radio'));
  beforeEach(module('mockdata'));

  var Player, mockTrip;
  var mockLocator = {
    watchPosition: sinon.spy(),
    stopWatching: sinon.spy()
  };
  var mockAudio = {
    setAudioSrc: sinon.spy(),
    pauseAudio: sinon.spy()
  };

  beforeEach(module(function ($provide) {
    $provide.value('Locator', mockLocator);
    $provide.value('Audio', mockAudio);
  }));

  beforeEach(inject(function(_Player_, $injector) {
    mockTrip = $injector.get('mockTripsData')[0];

    Player = _Player_;
  }));

  describe('before started', function () {
    it('should not have selected trip', function () {
      expect(Player.getSelectedTrip()).to.be.null;
    });
  });

  describe('when starting trip', function() {

    var tripStartedBroadcasts;
    var tripEndedBroadcasts;

    beforeEach(inject(function ($rootScope) {
      tripStartedBroadcasts = 0;
      tripEndedBroadcasts = 0;

      $rootScope.$on('player:tripStarted', function () {
        tripStartedBroadcasts += 1;
      });
      $rootScope.$on('player:tripEnded', function () {
        tripEndedBroadcasts += 1;
      });

      Player.startTrip(mockTrip);
    }));

    it('should set selected trip', function() {
      expect(Player.getSelectedTrip()).to.eql(mockTrip);
    });
    it('should initialize watch position', function() {
      expect(mockLocator.watchPosition.called).to.be.true;
    });
    it('should set audio source', function() {
      expect(mockAudio.setAudioSrc.calledWith(mockTrip.audio)).to.be.true;
    });
    it('should broadcast trip started event', function() {
      expect(tripStartedBroadcasts).to.eq(1);
      expect(tripEndedBroadcasts).to.eq(0);
    });

    describe('when ending trip', function() {

      beforeEach(inject(function ($rootScope) {
        Player.endTrip(mockTrip);
      }));

      it('should set selected trip', function() {
        expect(Player.getSelectedTrip()).to.be.null;
      });
      it('should initialize watch position', function() {
        expect(mockLocator.stopWatching.called).to.be.true;
      });
      it('should set audio source', function() {
        expect(mockAudio.pauseAudio.called).to.be.true;
      });
      it('should broadcast trip ended event and no extra started event', function() {
        expect(tripStartedBroadcasts).to.eq(1);
        expect(tripEndedBroadcasts).to.eq(1);
      });

    });

  });

});
