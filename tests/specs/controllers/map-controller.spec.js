'use strict';

describe('MapCtrl', function() {

  beforeEach(module('radio'));
  beforeEach(module('mockdata'));

  var mapController, $scope, mockPlayer, mockTrip, MarkerIcons;
  var mockOsloBounds = {
    northEast: {lat: 59.91, lng: 10.75},
    southWest: {lat: 59.91, lng: 10.75}
  };
  var mockClipBounds = {
    northEast: {lat: 59.935819, lng: 10.764870999999971},
    southWest: {lat: 59.9137503, lng: 10.750747199999978}
  };

  beforeEach(inject(function($controller, $injector, $q, _MarkerIcons_) {
   $scope = $injector.get('$rootScope').$new();
    MarkerIcons = _MarkerIcons_;
    mockTrip = $injector.get('mockTripsData')[0];
    mockPlayer = {
      getSelectedTrip: function () {
        return mockTrip;
      }
    };
    var mockMapUtil = {
      calculateBoundsForOslo: _.constant(mockOsloBounds),
      calculateBoundsForClips: _.constant(mockClipBounds)
    };

    mapController = $controller('MapCtrl', {
      $scope: $scope,
      MapUtil: mockMapUtil,
      Player: mockPlayer
    });
  }));

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
    it('should set map bounds to clip bounds', function () {
      expect($scope.map.bounds).to.eql(mockClipBounds);
    });
    it('should have one map marker for each clip', function () {
      _.each(mockTrip.clips, function (clip) {
        expect($scope.map.markers[clip.id]).to.eql({
          lat: parseFloat(clip.locations.map.lat),
          lng: parseFloat(clip.locations.map.lng),
          icon: MarkerIcons.pausedIcon
        });
      });
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
