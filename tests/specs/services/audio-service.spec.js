'use strict';

describe('AudioService', function() {
  beforeEach(module('radio'));
  beforeEach(module('mockdata'));

  var Audio, mockAudio, mockTrip, $q;
  beforeEach(module(function ($provide) {
    mockAudio = {
      isPlaying: false,
      eventListeners: {},
      pause: function () {
        mockAudio.isPlaying = false;
      },
      play: function () {
        mockAudio.isPlaying = true;
      },
      load: sinon.spy(),
      addEventListener: function (eventName, listener) {
        mockAudio.eventListeners[eventName] = listener;
      },
      src: null
    };
    $provide.value('radioAudio', mockAudio);
  }));

  beforeEach(inject(function(_Audio_, $injector, _$q_) {
    mockTrip = $injector.get('mockTripsData')[0];
    $q = _$q_;
    Audio = _Audio_;
  }));

  describe('before clip is loaded and started', function () {
    it('should have empty src', function () {
      expect(mockAudio.src).to.be.null;
    });
    it('should not be playing', function () {
      expect(mockAudio.isPlaying).to.be.false;
    });
  });

  describe('when clip is loaded', function () {

    beforeEach(function () {
      Audio.setAudioSrc(mockTrip.audio);
    });

    it('should not have empty src', function () {
      expect(mockAudio.src).to.equal(mockTrip.audio);
    });
    it('should not be playing', function () {
      expect(mockAudio.isPlaying).to.be.false;
    });
    it('should start loading', function () {
      expect(mockAudio.load.calledOnce).to.be.true;
    });
    it('should resolve isReady on canplay event', function (done) {
      Audio.isReady().then(function () {
        done();
      });
      mockAudio.eventListeners.canplay();
    });

    describe('when clip is played', function() {
      var clip;

      beforeEach(function () {
        clip = mockTrip.clips[1];
      });

      beforeEach(function () {
        Audio.playAudioSprite({start: clip.start, end: clip.end});
      });

      it ('should set sprite current time to clip start', function () {
        expect(mockAudio.currentTime).to.equal(clip.start);
      });
      it ('should start audio', function () {
        expect(mockAudio.isPlaying).to.be.true;
      });

      describe('when current time reaches clip end', function () {
        var spriteEndedBroadcasts;
        beforeEach(inject(function ($rootScope) {
          spriteEndedBroadcasts = sinon.spy();
          $rootScope.$on('audio:spriteEnded', spriteEndedBroadcasts);
          mockAudio.currentTime = clip.end;
          mockAudio.eventListeners.timeupdate();
        }));

        it ('should stop to play', function () {
          expect(mockAudio.isPlaying).to.be.false;
        });
        it('should broadcast audio:spriteEnded once', function () {
          expect(spriteEndedBroadcasts.calledOnce).to.be.true;
        });
      });

    });

  });
});
