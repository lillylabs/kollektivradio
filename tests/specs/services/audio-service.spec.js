'use strict';

describe('AudioService', function() {
  beforeEach(module('radio'));
  beforeEach(module('mockdata'));

  var Audio, mockAudio, mockTrip, $q;
  beforeEach(module(function ($provide) {
    var isPlaying = false;
    mockAudio = {
      isPlaying: isPlaying,
      pause: function () {
        isPlaying = false;
      },
      play: function () {
        isPlaying = true;
      },
      load: sinon.spy(),
      addEventListener: _.noop,
      removeEventListener: _.noop,
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
    it('should not have empty src', function () {
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
  });
});
