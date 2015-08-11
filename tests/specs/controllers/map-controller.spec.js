'use strict';

describe('MapCtrl', function() {

  beforeEach(module('radio'));
  beforeEach(module('mockdata'));

  var clock,
    mapController,
    $scope, $timeout,
    mockPlayer,
    mockTrip, MarkerIcons,
    mockMapUtil, mockTripSightPoints;
  var mockOsloBounds = {
    northEast: {lat: 59.91, lng: 10.75},
    southWest: {lat: 59.91, lng: 10.75}
  };

  var mockClipBounds = {
    northEast: {lat: 59.935819, lng: 10.764870999999971},
    southWest: {lat: 59.9137503, lng: 10.750747199999978}
  };

  beforeEach(function () {
      clock = sinon.useFakeTimers();
      module(function ($provide) {
          $provide.constant('_', window._.runInContext());
      });
  });

  beforeEach(inject(function($controller, $injector, _$timeout_, $q, _MarkerIcons_) {
    $timeout = _$timeout_;
    $scope = $injector.get('$rootScope').$new();
    MarkerIcons = _MarkerIcons_;
    mockTrip = $injector.get('mockTripsData')[0];
    mockTripSightPoints = _.reduce(mockTrip.clips, function (locations, clip) {
      return locations.concat(_.map(clip.sights, function (sight) {
        return _.pick(sight.location, ['lat', 'lng']);
      })).concat(_.pick(clip.locations.play, ['lat', 'lng']));
    }, []);
    mockPlayer = {
      getSelectedTrip: function () {
        return mockTrip;
      }
    };
    mockMapUtil = {
      calculateBoundsForOslo: _.constant(mockOsloBounds),
      calculateBoundsForPoints: sinon.stub().returns(mockClipBounds)
    };

    mapController = $controller('MapCtrl', {
      $scope: $scope,
      MapUtil: mockMapUtil,
      Player: mockPlayer
    });
  }));

  afterEach(function () {
      clock.restore();
  });

  describe('before clip is started', function() {
    it('should have oslo as map bounds', function() {
      expect($scope.map.bounds).to.equal(mockOsloBounds);
    });
    it('should not have map markers', function() {
      expect($scope.map.markers).to.eql({});
    });
    it('should disable double click zoom in map ', function() {
      expect($scope.map.defaults.doubleClickZoom).to.be.false;
    });
    it('should disable scroll wheel zoom in map ', function() {
      expect($scope.map.defaults.scrollWheelZoom).to.be.false;
    });
    it('should disable attribution control in map ', function() {
      expect($scope.map.defaults.attributionControl).to.be.false;
    });
    it('should hide map controls', function () {
      expect($scope.showMapControls).to.be.false;
    });
  });

  describe('when trip is started', function () {
    beforeEach(function () {
      $scope.$broadcast('player:tripStarted');
    });

    it('should show map controls', function () {
      expect($scope.showMapControls).to.be.true;
    });
    it('should set map bounds to clip bounds after 150ms', function () {
      clock.tick(150);
      $timeout.flush();
      expect($scope.map.bounds).to.eql(mockClipBounds);
    });
    it('should not set map bounds to clip bounds before 150ms', function () {
      clock.tick(149);
      expect($timeout.flush).to.throw('No deferred tasks to be flushed');
    });
    it('should have one map marker for each play location', function () {
      _.each(mockTrip.clips, function (clip) {
        expect($scope.map.markers[clip.id]).to.eql({
          id: clip.id,
          lat: parseFloat(clip.locations.play.lat),
          lng: parseFloat(clip.locations.play.lng),
          icon: MarkerIcons.pausedIcon
        });
      });
    });
    it('should have one disabled map marker for each sight', function () {
      _.each(mockTrip.clips, function (clip) {
        _.each(clip.sights, function (sight) {
          expect($scope.map.markers[sight.id]).to.eql({
            id: sight.id,
            clipId: clip.id,
            lat: parseFloat(sight.location.lat),
            lng: parseFloat(sight.location.lng),
            icon: MarkerIcons.inactiveSightIcon
          });
        });
      });
    });
    it('should not include current position in map bounds', function () {
      expect(mockMapUtil.calculateBoundsForPoints.calledWith(mockTripSightPoints)).to.be.true;
    });

    describe('when clip is started', function () {
      var activeClip;
      beforeEach(function () {
        activeClip = mockTrip.clips[0];
        $scope.$broadcast('player:clipStarted', activeClip);
      });

      describe('on time update events', function () {
        var currentTime, expectActiveSights;
        beforeEach(function () {
          currentTime = _.pluck(activeClip.sights, 'startTime')[1];
          expectActiveSights = _.filter(activeClip.sights, function (sight) {
            return sight.startTime <= currentTime && currentTime < sight.endTime;
          });
          $scope.$broadcast('player:timeUpdate', activeClip, currentTime);
        });
        it('should show sights without or within time boundaries', function () {
          _.each($scope.map.markers, function (marker) {
            if (_.findWhere(expectActiveSights, {id: marker.id}) !== undefined) {
              expect(marker.icon).to.be.equal(MarkerIcons.activeSightIcon);
            } else if (_.findWhere(activeClip.sights, {id: marker.id}) !== undefined) {
              expect(marker.icon).to.be.equal(MarkerIcons.inactiveSightIcon);
            }
          });
        });
      });

      it('should set marker sights as inactive', function () {
        _.each($scope.map.markers, function (marker) {
          if (marker.id === activeClip.id) {
            expect(marker.icon).to.eq(MarkerIcons.playingIcon);
          } else if (marker.clipId) {
            expect(marker.icon).to.eq(MarkerIcons.inactiveSightIcon);
          } else if (marker.icon !== MarkerIcons.locationIcon) {
            expect(marker.icon).to.eq(MarkerIcons.pausedIcon);
          }
        });
      });

      describe('then clip is ended', function () {
        beforeEach(function () {
          $scope.$broadcast('player:clipEnded', activeClip);
        });

        it('should set marker sights as inactive', function () {
          _.each($scope.map.markers, function (marker) {
            if (marker.icon === activeClip.id) {
              expect(marker.icon).to.eq(MarkerIcons.pausedIcon);
            } else if (marker.clipId === activeClip.id) {
              expect(marker.icon).to.eq(MarkerIcons.inactiveSightIcon);
            }
          });
        });
      });
    });

    describe('on updated position', function () {

      var mockCurrentPosition = {latitude: 59.926342247, longitude: 10.7544};

      beforeEach(function () {
        $scope.$broadcast('position:updated', mockCurrentPosition);
      });

      it('should set current position marker on location updates', function () {
        expect($scope.map.markers.currentLocation).to.be.eql({
          lat: mockCurrentPosition.latitude,
          lng: mockCurrentPosition.longitude,
          icon: MarkerIcons.locationIcon
        });
      });
      it('should include current position in map bounds', function () {
        var expectBoundPoints = mockTripSightPoints.concat({
          lat: mockCurrentPosition.latitude,
          lng: mockCurrentPosition.longitude
        });

        expect(mockMapUtil.calculateBoundsForPoints.calledWith(expectBoundPoints)).to.be.true;
      });
    });

    describe('when trip is ended', function () {
      beforeEach(function () {
        $scope.$broadcast('player:tripEnded');
      });

      it('should show map controls', function () {
        expect($scope.showMapControls).to.be.false;
      });
      it('should set map bounds to clip bounds', function () {
        expect($scope.map.bounds).to.eql(mockOsloBounds);
      });
      it('should have one map marker for each clip', function () {
        expect($scope.map.markers).to.eql({});
      });

      it('should set current position marker on location updates', function () {
        var mockCurrentPosition = {latitude: 59.926342247, longitude: 10.7544};
        $scope.$broadcast('position:updated', mockCurrentPosition);
        expect($scope.map.markers.currentLocation).to.be.eql({
          lat: mockCurrentPosition.latitude,
          lng: mockCurrentPosition.longitude,
          icon: MarkerIcons.locationIcon
        });
      });

    });

  });

});
