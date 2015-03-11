"use strict"

describe('TripsCtrl', function(){

  beforeEach(module('radio'));
  beforeEach(module('mockdata'));

  var tripsController, tripsDefer, tripsFixture, $httpBackend, $scope, mockTripsData, mockPlayer;

  beforeEach(inject(function($controller, $injector, $q) {
    $scope = $injector.get('$rootScope').$new();

    mockTripsData = $injector.get('mockTripsData');

    var DataSource = {
      trips: function () {
        tripsDefer = $q.defer();
        return tripsDefer.promise;
      }
    }

    mockPlayer = {
      startTrip: sinon.spy()
    };

    tripsController = $controller('TripsCtrl', {
      $scope: $scope,
      DataSource: DataSource,
      Player: mockPlayer
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

    it('should show trips on player:tripEnded event', function () {
      $scope.$broadcast('player:tripEnded');
      expect($scope.showTrips).to.equal(true);
    });

    it('should hide trips on player:tripStarted event', function () {
      $scope.$broadcast('player:tripStarted');
      expect($scope.showTrips).to.equal(false);
    });

    it('should have a function on scope to get correct style class for trip lines', function () {
      expect($scope.lineClass({number: 1})).to.equal('metro');
      expect($scope.lineClass({number: 9})).to.equal('metro');
      expect($scope.lineClass({number: 10})).to.equal('tram');
      expect($scope.lineClass({number: 19})).to.equal('tram');
      expect($scope.lineClass({number: 20})).to.equal('bus');
      expect($scope.lineClass({number: 89})).to.equal('bus');
      expect($scope.lineClass({number: 90})).to.equal('boat');
    });

    it('should have a function to start trip', function () {
      var tripToStart = mockTripsData[0];
      $scope.startTrip(tripToStart);
      expect(mockPlayer.startTrip.calledWith(tripToStart)).to.be.true;
    });

  })

})

