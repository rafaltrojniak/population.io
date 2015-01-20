(function() {
  'use strict';

  angular.module('populationioApp')

  .controller('MilestonesCtrl', ['$scope', '$rootScope', '$state', '$filter', '$sce', 'ProfileService', 'PopulationIOService',
    function($scope, $rootScope, $state, $filter, $sce, ProfileService, PopulationIOService) {

      $rootScope.$on('loadMilestones', function() {
        if ($rootScope.milestonesLoadingStarted !== true) {
          _loadDataFromServer();
        }
      });


      var _getDateWithOffset = function(date, offset) {
        var year = parseInt($filter('date')(date, 'yyyy'), 0),
          month = parseInt($filter('date')(date, 'M'), 0) - 1,
          day = $filter('date')(date, 'dd');

        return new Date(parseInt(year + offset, 0), month, day);
      };

      var _loadLifeExpectancyRemaining = function(country, onSuccess) {

        //$scope.loading += 1;

        PopulationIOService.loadLifeExpectancyRemaining({
          sex: ProfileService.gender,
          country: country,
          date: $filter('date')(new Date(), 'yyyy-MM-dd'),
          age: ProfileService.getAgeString()
        }, function(remainingLife) {
          _oneAjaxFinished();
          var today = new Date();
          var date = today.setDate(today.getDate() + (remainingLife * 365));

          $scope.milestonesData.push({
            date: $filter('date')(date, 'yyyy-MM-dd'),
            year: $filter('date')(date, 'yyyy'),
            title: 'Your projected life expectancy in ' + (country === 'World' ? 'the World' : country)
          });

          if (onSuccess) {
            onSuccess(remainingLife);
          }

          //$scope.loading -= 1;
        }, function() {
          _oneAjaxFinished();
          //$scope.loading -= 1;
        });
      };

      var _loadWpRankRanked = function(rank, atomicNumber) {

        var _isDateGreaterThenToday = function(date) {
          return new Date(date) >= new Date();
        };

        var _updateTitleAlive = function(date, atomicNumber) {
          $scope.titleAlive = $sce.trustAsHtml([
            'Your next milestone is <span>' + $filter('ordinal')($filter('date')(date, 'd')) + ' ',
            $filter('date')(date, 'MMM, yyyy') + '</span>, then you’ll be <span>',
            atomicNumber + ' billionth</span> person to be alive in the world.'
          ].join(''));
        };

        PopulationIOService.loadWpRankRanked({
          dob: ProfileService.birthday.formatted,
          sex: 'unisex',
          country: 'World',
          rank: rank
        }, function(date) {

          if (_isDateGreaterThenToday(date)) {
            if (new Date(date) < $scope.nextYear || !$scope.nextYear) {
              _updateTitleAlive(date, atomicNumber);
              $scope.nextYear = new Date(date);
            }
          }

          $scope.milestonesData.push({
            date: date,
            rank: true,
            year: $filter('date')(date, 'yyyy'),
            title: atomicNumber + ' billion person'
          });

          //$scope.loading -= 1;
          _oneAjaxFinished();
        }, function() {
          //$scope.loading -= 1;
          _oneAjaxFinished();
        });
      };

      var _getInitialMilestonesData = function() {
        return [{
          date: $filter('date')(Date.now(), 'yyyy-MM-dd'),
          year: $filter('date')(Date.now(), 'yyyy'),
          title: 'Now',
          selected: true,
          now: true
        }, {
          date: ProfileService.birthday.formatted,
          year: ProfileService.birthday.year,
          title: 'Born',
          born: true
        }, {
          date: _getDateWithOffset(new Date(ProfileService.birthday.formatted), 18),
          year: $filter('date')(_getDateWithOffset(
            new Date(ProfileService.birthday.formatted),
            18
          ), 'yyyy'),
          title: 'You turn 18!'
        }];
      };

      $scope.highlightMilestone = function(item) {
        if ($scope.milestonesData) {
          _($scope.milestonesData).each(function(milestone) {
            milestone.selected = false;
          });

        }
        item.selected = true;
        $scope.selectedYear = item.year;

        //$scope.loading += 2;
        $rootScope.loadingDataSections += 2;

        $scope.age = $scope.selectedYear - ProfileService.birthday.year;
        PopulationIOService.loadPopulation({
          year: $scope.selectedYear,
          country: ProfileService.country
        }, function(data) {
          $rootScope.loadingDataSections -= 1;
          $ //scope.loading -= 1;
          $scope.localRankData = data;
        });

        PopulationIOService.loadPopulation({
          year: $scope.selectedYear,
          country: 'World'
        }, function(data) {
          $rootScope.loadingDataSections -= 1;
          //$scope.loading -= 1;
          $scope.globalRankData = data;
        });
      };
      $scope.dateOrder = function(item) {
        return (new Date(item.date)).getTime();
      };

      $rootScope.$on('selectedYearChanged', function($event, item) {
        $scope.highlightMilestone(item);
      });


      var _initiateLoading = function() {
        console.log("init loading milestones");
        $rootScope.openConnectionsMilestones = 7;
        $rootScope.loadingDataSections += 1;
        $rootScope.milestonesLoadingStarted = true;
      };

      var _oneAjaxFinished = function() {
        $rootScope.openConnectionsMilestones -= 1;
        console.log("one ajax milestones " + $rootScope.openConnectionsMilestones);
        if ($rootScope.openConnectionsMilestones === 0) {
          $rootScope.$emit('milestonesLoaded');
          $rootScope.loadingDataSections -= 1;
          ProfileService.hideMilestonesCtrl = false;
          console.log("loaded milestones");
        }
      };

      var _loadDataFromServer = function() {
        _initiateLoading();
        $scope.age = ProfileService.getAge();
        //$scope.loading = 0;
        $scope.year = $filter('date')(new Date(), 'yyyy');
        $scope.milestonesData = _getInitialMilestonesData();
        $scope.titleAlive = null;
        $scope.titleDie = null;
        $scope.localRankData = null;
        $scope.globalRankData = null;
        $scope.nextYear = null;

        $scope.$on('rankGlobalChanged', function(e, rankGlobal) {
          $scope.rankGlobal = rankGlobal;
        });

        $scope.$on('rankLocalChanged', function(e, rankLocal) {
          $scope.rankLocal = rankLocal;
        });

        _loadWpRankRanked(3000000000, '3rd');
        _loadWpRankRanked(4000000000, '4th');
        _loadWpRankRanked(5000000000, '5th');

        if (ProfileService.getAge() > 30) {
          _loadWpRankRanked(6000000000, '6th');
          _loadWpRankRanked(7000000000, '7th');
        } else {
          _loadWpRankRanked(1000000000, '1st');
          _loadWpRankRanked(2000000000, '2nd');
        }

        _loadLifeExpectancyRemaining(ProfileService.country, function(remainingLife) {

          var today = new Date();
          var date = today.setDate(today.getDate() + (remainingLife * 365));

          ProfileService.dod = date;

          $scope.titleDie = $sce.trustAsHtml([
            'You are expected to die on <span>',
            $filter('ordinal')($filter('date')(date, 'd')) + ' ',
            $filter('date')(date, 'MMM, yyyy') + '</span>'
          ].join(''));
        });
        _loadLifeExpectancyRemaining('World');

        $scope.country = ProfileService.country;
      };

    }
  ])


  ;
}());
