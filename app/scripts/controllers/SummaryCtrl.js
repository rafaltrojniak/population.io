(function () {
    'use strict';

    angular.module('populationioApp')

      .controller('SummaryCtrl', ['$scope', '$rootScope', '$interval', '$filter', 'PopulationIOService', 'ProfileService', '$timeout',
          function ($scope, $rootScope, $interval, $filter, PopulationIOService, ProfileService, $timeout) {
              var rangeLoaded = false;
              $scope.region = 'World';
              $scope.age = new Date().getFullYear() - ProfileService.birthday.year;

              $rootScope.$on('loadSummary', function () {
                if($rootScope.summaryLoadingStarted !== true ){
                  console.log("loading loadSummary");
                  _loadDataFromServer();
                }

              });

              /*
              $scope.$watch(function () {
                return ProfileService.hideSummaryCtrl;
              }, function (hideSummaryCtrl) {
                if(!hideSummaryCtrl){
                  _loadDataFromServer();
                }

              });*/

              var today = new Date();

              var _getNextDay = function () {
                  var tomorrow = new Date();
                  tomorrow.setDate((new Date()).getDate() + 1);
                  return tomorrow;
              };
              var tickerYoungerGlobal = d3.scale.linear()
                .domain([today.getTime(), _getNextDay().getTime()]);

              var tickerYoungerLocal = d3.scale.linear()
                .domain([today.getTime(), _getNextDay().getTime()]);

              var tickerOlderGlobal = d3.scale.linear()
                .domain([today.getTime(), _getNextDay().getTime()]);

              var tickerOlderLocal = d3.scale.linear()
                .domain([today.getTime(), _getNextDay().getTime()]);


              $scope.calcWorldOlderNumber = function () {
                  if (!$scope.rankGlobal || !$scope.worldPopulation) {return 0}
                  return $filter('number')(Math.max(0, $scope.worldPopulation - $scope.rankGlobal), 0);
              };
              $scope.calcWorldOlderPercentage = function () {
                  var value = $filter('number')(Math.max(0, 100 - $scope.rankGlobal / ($scope.worldPopulation / 100)), 0);
                  return 'People older than you (' + value + '%)';
              };

              $scope.calcCountryOlderNumber = function () {
                  return $filter('number')(Math.max(0, $scope.countryPopulation - $scope.rankLocal), 0);
              };
              $scope.calcCountryOlderPercentage = function () {

                  var value = $filter('number')(Math.max(0, 100 - $scope.rankLocal / ($scope.countryPopulation / 100)), 0);
                  return 'People older than you (' + value + '%)';
              };

              $scope.calcCountryYoungerPercentage = function () {
                  var value = $filter('number')(Math.min(100, $scope.rankLocal / ($scope.countryPopulation / 100)), 0);
                  return 'People younger than you (' + value + '%)';
              };

              $scope.calcWorldYoungerPercentage = function () {
                  var value = $filter('number')(Math.min(100, $scope.rankGlobal / ($scope.worldPopulation / 100)), 0);
                  return 'People younger than you (' + value + '%)';
              };
              $scope.calcCountryYoungerPercentageSimple = function () {
                  return $filter('number')(Math.min(100, $scope.rankLocal / ($scope.countryPopulation / 100)), 0);
              };

              var _initiateLoading = function(){
                $rootScope.openConnectionsSummary = 6;
                $rootScope.loadingDataSections += 1;
                $rootScope.summaryLoadingStarted = true;
              };
              var _oneAjaxFinished = function(){
                $rootScope.openConnectionsSummary -=1;
                console.log("_oneAjaxFinished " + $rootScope.openConnectionsSummary);

                if($rootScope.openConnectionsSummary === 0){
                  $rootScope.loadingDataSections -=1;
                  $rootScope.$emit('summaryLoaded');
                  ProfileService.hideSummaryCtrl = false;
                }
              };

              var _loadDataFromServer = function () {
                _initiateLoading();
                  // Local rank for country of the user
                  PopulationIOService.loadWpRankToday({
                      dob: ProfileService.birthday.formatted,
                      sex: 'unisex',
                      country: ProfileService.country
                  }, function (rank) {
                      _oneAjaxFinished();
                      $scope.rankLocal = rank;
                      //console.log('$scope.rankLocal', $scope.rankLocal)
                      $rootScope.$emit('rankLocalChanged', $scope.rankLocal);
                  });

                  // Global rank for world of the user
                  PopulationIOService.loadWpRankToday({
                      dob: ProfileService.birthday.formatted,
                      sex: 'unisex',
                      country: 'World'
                  }, function (rank) {
                      _oneAjaxFinished();
                      $scope.rankGlobal = rank;
                      //console.log('$scope.rankGlobal', $scope.rankGlobal)
                      $rootScope.$emit('rankGlobalChanged', $scope.rankGlobal);
                  });

                  // Local rank for country of the user
                  PopulationIOService.loadWpRankOnDate({
                      dob: ProfileService.birthday.formatted,
                      sex: 'unisex',
                      country: ProfileService.country,
                      date: $filter('date')(_getNextDay(), 'yyyy-MM-dd')
                  }, function (rank) {
                      _oneAjaxFinished();
                      $scope.rankLocalTomorrow = rank;
                  });

                  // Global rank for world of the user
                  PopulationIOService.loadWpRankOnDate({
                      dob: ProfileService.birthday.formatted,
                      sex: 'unisex',
                      country: 'World',
                      date: $filter('date')(_getNextDay(), 'yyyy-MM-dd')
                  }, function (rank) {
                      _oneAjaxFinished();
                      $scope.rankGlobalTomorrow = rank;
                      //console.log('$scope.rankGlobalTomorrow', $scope.rankGlobalTomorrow)
                  });

                  PopulationIOService.loadPopulation({
                      year: new Date().getFullYear(),
                      country: ProfileService.country
                  }, function (data) {
                      _oneAjaxFinished();

                      $scope.countryPopulationData = data;
                      $scope.countryPopulation = _(data).reduce(function (sum, num) {
                          sum = sum | 0;
                          return sum + num.total;
                      });
                      if (data) {
                          $scope.$broadcast('countryPopulationDataChanged', data)
                      }
                  });
                  PopulationIOService.loadPopulation({
                      year: new Date().getFullYear(),
                      country: 'World'
                  }, function (data) {
                      _oneAjaxFinished();
                      $scope.worldPopulationData = data;
                      if (data) {
                          $scope.$broadcast('worldPopulationDataChanged', data)
                      }
                  });
              };

              $scope.$watchGroup(['rankLocal', 'rankGlobal', 'rankLocalTomorrow', 'rankGlobalTomorrow', 'countryPopulation', 'worldPopulation'], function (newVals, oldVals) {

                  if (!_(newVals).contains(undefined) && !rangeLoaded) {

                      tickerYoungerGlobal
                        .range([$scope.rankGlobal, $scope.rankGlobalTomorrow]);
                      tickerYoungerLocal
                        .range([$scope.rankLocal, $scope.rankLocalTomorrow])

                      tickerOlderGlobal
                        .range([$scope.rankGlobalTomorrow, $scope.worldPopulation]);

                      tickerOlderLocal
                        .range([$scope.rankLocal, $scope.rankLocalTomorrow]);


                      $scope.scaledRankYoungerLocal = tickerYoungerLocal(new Date().getTime())
                      $scope.scaledRankYoungerGlobal = tickerYoungerGlobal(new Date().getTime())

                      $scope.scaledRankOlderLocal = $scope.localPopulationToday - tickerYoungerLocal(new Date().getTime())
                      $scope.scaledRankOlderGlobal = $scope.worldPopulation - tickerYoungerGlobal(new Date().getTime())

                  }
              });

          }])
          ;
}());
