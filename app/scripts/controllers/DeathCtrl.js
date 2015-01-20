(function() {
  'use strict';

  angular.module('populationioApp')

  .controller('DeathCtrl', ['$scope', '$interpolate', '$timeout', '$http', '$interval', '$modal', '$state', '$location', '$document', '$rootScope', '$filter', 'ProfileService', 'PopulationIOService', 'BrowserService',
    function($scope, $interpolate, $timeout, $http, $interval, $modal, $state, $location, $document, $rootScope, $filter, ProfileService, PopulationIOService, BrowserService) {
      $scope.type = 'distribution';


      $rootScope.$on('loadDeath', function() {
        if ($rootScope.deathLoadingStarted !== true) {
          _loadDataFromServer();
        }
      });


      var _initiateLoading = function() {
        $rootScope.openConnectionsDeath = 3;
        $rootScope.loadingDataSections += 1;
        $rootScope.deathLoadingStarted = true;
      };
      var _oneAjaxFinished = function() {
        $rootScope.openConnectionsDeath -= 1;

        if ($rootScope.openConnectionsDeath === 0) {
          $rootScope.loadingDataSections -= 1;
          $rootScope.$emit('deathLoaded');
          ProfileService.hideDeathCtrl = false;
          console.log('death loaded');
        }
      };

      var _loadDataFromServer = function() {
        console.log('loading death');
        _initiateLoading();

        PopulationIOService.loadMortalityDistribution({
          country: ProfileService.country,
          gender: ProfileService.gender,
          age: ProfileService.getAge()
        }, function(data) {
          _oneAjaxFinished();
          //$scope.loading -= 1;
          $scope.mortalityDistributionData = data;
          if (data) {
            $scope.$broadcast('mortalityDistributionDataChanged', data)
          }
        });

        PopulationIOService.loadLifeExpectancyRemaining({
          sex: ProfileService.gender,
          country: 'World',
          date: $filter('date')(new Date(), 'yyyy-MM-dd'),
          age: ProfileService.getAgeString()
        }, function(remainingLife) {
          _oneAjaxFinished()
          var today = new Date();
          $scope.dodWorld = $filter('date')(today.setDate(today.getDate() + (remainingLife * 365)), 'd MMM, yyyy');
          $scope.remainingLifeWorldInYears = parseFloat(remainingLife).toFixed(1);
          $scope.totalLifeWorldInYears = moment(today).diff(moment(ProfileService.birthday), 'years', true);
        });

        PopulationIOService.loadLifeExpectancyRemaining({
          sex: ProfileService.gender,
          country: ProfileService.country,
          date: $filter('date')(new Date(), 'yyyy-MM-dd'),
          age: ProfileService.getAgeString()
        }, function(remainingLife) {
          _oneAjaxFinished();
          var today = new Date();
          $scope.dodCountry = $filter('date')(today.setDate(today.getDate() + (remainingLife * 365)), 'd MMM, yyyy');
          $scope.remainingLifeCountryInYears = parseFloat(remainingLife).toFixed(1);
          $scope.totalLifeCountryInYears = moment(today).diff(moment(ProfileService.birthday), 'years', true);
        });

        $scope.$watchGroup(['remainingLifeCountryInYears', 'remainingLifeWorldInYears'],
          function(newVals, oldVals) {
            if ((newVals[0] && newVals[1]) && (newVals[0] !== oldVals[0] && newVals[1] !== oldVals[0])) {
              var negative = false;

              var c = moment($scope.dodCountry);
              var w = moment($scope.dodWorld);
              var diffDays = c.diff(w, 'days');
              var diffYears = c.diff(w, 'years');

              // console.log(c, w);

              $scope.differenceInDays = diffDays < 0 ? '- ' + (-1 * diffDays) + ' days' : '+ ' + diffDays + ' days';
              $scope.soMuchToDo = diffDays < 1 ? 'shorter' : 'longer';

              if (diffYears < 1 && diffYears > -1) {
                $scope.differenceInUnits = diffDays.toString().replace('-', '') + ' days';
              } else {
                if (Math.abs(diffYears) <= 1) {
                  $scope.differenceInUnits = diffYears.toString().replace('-', '') + ' year';
                } else {
                  $scope.differenceInUnits = diffYears.toString().replace('-', '') + ' years';
                }
              }
            }
          })
      }
    }
  ])

  ;
}());
