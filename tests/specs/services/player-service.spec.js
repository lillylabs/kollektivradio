'use strict';

describe('PlayerService', function() {
  beforeEach(module('radio'));
  beforeEach(module('mockdata'));

  var Player, mockTrip, $q;
  var mockLocator = {
    watchPosition: sinon.spy(),
    stopWatching: sinon.spy()
  };
  var mockAudio = {
    setAudioSrc: sinon.spy(),
    pauseAudio: sinon.spy(),
    playAudioSprite: sinon.spy(),
    isReady: function () {
      return $q.when();
    }
  };
  var mockGoogle = {maps: {
    LatLng: function (lat, lng) {
      return {latitude: lat, longitude: lng};
    },
    geometry: {spherical: {
      computeDistanceBetween: function (position, otherPosition) {
        return 10.0;
      }
    }}
  }};

  beforeEach(module(function ($provide) {
    $provide.value('Locator', mockLocator);
    $provide.value('Audio', mockAudio);
    $provide.value('google', mockGoogle);
  }));

  beforeEach(inject(function(_Player_, $injector, _$q_) {
    mockTrip = $injector.get('mockTripsData')[0];
    $q = _$q_;

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

    describe('when receiving position update', function () {
      var $rootScope, mockPosition = {}, clipStartedEvents = 0;
      beforeEach(inject(function (_$rootScope_) {
        $rootScope = _$rootScope_;

        clipStartedEvents = 0;
        $rootScope.$on('player:clipStarted', function () {
          clipStartedEvents += 1;
        });

        mockAudio.playAudioSprite.reset();

        $rootScope.$broadcast('position:updated', mockPosition);
        $rootScope.$apply();
      }));

      it('should play closest clip', function () {
        var clip = mockTrip.clips[0];
        expect(mockAudio.playAudioSprite.calledWith({
          start: clip.start, end: clip.end
        })).to.be.true;
      });
      it('should broadcast player:clipStarted event', function () {
        expect(clipStartedEvents).to.equal(1);
      });
      it('should not play same clip again on later position updates', function () {
        $rootScope.$broadcast('position:updated', mockPosition);
        $rootScope.$apply();
        expect(clipStartedEvents).to.equal(1);
        expect(mockAudio.playAudioSprite.calledOnce).to.be.true;
      });
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
