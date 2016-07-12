angular.module('populationioApp').controller('SummaryCtrl', [
	'$scope', '$interval', '$filter', '$translate', 'PopulationIOService', 'ProfileService',
	function($scope, $interval, $filter, $translate, PopulationIOService, ProfileService){
		'use strict';
		var rangeLoaded = false;
		$scope.region = 'World';
		$scope.profile = ProfileService;
		$scope.age = new Date().getFullYear() - ProfileService.birthday.year;
		if (ProfileService.rankGlobal > -1) {
			$scope.rankGlobal = ProfileService.rankGlobal;
		}
		if (ProfileService.rankLocal > -1) {
			$scope.rankLocal = ProfileService.rankLocal;
		}
		if (ProfileService.rankGlobalTomorrow > -1) {
			$scope.rankGlobalTomorrow = ProfileService.rankGlobalTomorrow;
			if ($scope.rankGlobal) {
				$scope.deltaRankGlobal = Math.ceil(($scope.rankGlobalTomorrow - $scope.rankGlobal) / (24 * 60 * 60));
			}
		}
		if (ProfileService.rankLocalTomorrow > -1) {
			$scope.rankLocalTomorrow = ProfileService.rankLocalTomorrow;
		}
		var today = new Date();
		var nextDay = moment(today).add(1, 'day').toDate();
		var tickerYoungerGlobal = d3.scale.linear().domain([today.getTime(), nextDay.getTime()]);
		var tickerYoungerLocal = d3.scale.linear().domain([today.getTime(), nextDay.getTime()]);

		$scope.calcWorldOlderNumber = function(){
			if(!$scope.rankGlobal || !$scope.worldPopulation){
				return 0;
			}
			return $filter('number')(Math.max(0, $scope.worldPopulation - $scope.rankGlobal), 0);
		};
		$scope.calcWorldOlderPercentage = function(){
			var value = $filter('number')(Math.max(0, 100 - $scope.rankGlobal / ($scope.worldPopulation / 100)), 0);
			return $translate.instant('SUMMARY_PEOPLE_OLDER') + value + '%)';
		};
		$scope.calcCountryOlderNumber = function(){
			return $filter('number')(Math.max(0, $scope.countryPopulation - $scope.rankLocal), 0);
		};
		$scope.calcCountryOlderPercentage = function(){
			var value = $filter('number')(Math.max(0, 100 - $scope.rankLocal / ($scope.countryPopulation / 100)), 0);
			return $translate.instant('SUMMARY_PEOPLE_OLDER') + value + '%)';
		};
		$scope.calcCountryYoungerPercentage = function(){
			var value = $filter('number')(Math.min(100, $scope.rankLocal / ($scope.countryPopulation / 100)), 0);
			return $translate.instant('SUMMARY_PEOPLE_YOUNGER') + value + '%)';
		};
		$scope.calcWorldYoungerPercentage = function(){
			var value = $filter('number')(Math.min(100, $scope.rankGlobal / ($scope.worldPopulation / 100)), 0);
			return $translate.instant('SUMMARY_PEOPLE_YOUNGER') + value + '%)';
		};
		$scope.$on('rankLocalChanged', function(event, rank){
			$scope.rankLocal = rank;
		});
		$scope.$on('rankGlobalChanged', function(event, rank){
			$scope.rankGlobal = rank;
		});
		$scope.$on('rankDateLocalChanged', function(event, rank){
			$scope.rankLocalTomorrow = rank;
		});
		$scope.$on('rankDateGlobalChanged', function(event, rank){
			$scope.rankGlobalTomorrow = rank;
			$scope.deltaRankGlobal = Math.ceil(($scope.rankGlobalTomorrow - $scope.rankGlobal) / (24 * 60 * 60));
		});
		$scope.$on('countryPopulationDataChanged', function(event, data){
			$scope.countryPopulationData = data;
			$scope.countryPopulation = _(data).reduce(function(sum, num){
				sum = sum | 0;
				return sum + num.total;
			});
		});
		$scope.$on('worldPopulationDataChanged', function(event, data){
			$scope.worldPopulationData = data;
		});
		$scope.$watchGroup(
			['rankLocal', 'rankGlobal', 'rankLocalTomorrow', 'rankGlobalTomorrow', 'countryPopulation', 'worldPopulation'],
			function(newVals){
				$scope.worldYoungerPercentageSimple = Math.min(100, $scope.rankGlobal / ($scope.worldPopulation / 100));
				$scope.countryYoungerPercentageSimple = Math.min(100, $scope.rankLocal / ($scope.countryPopulation / 100));
				if(!_(newVals).contains(undefined) && !rangeLoaded){
					tickerYoungerGlobal.range([$scope.rankGlobal, $scope.rankGlobalTomorrow]);
					tickerYoungerLocal.range([$scope.rankLocal, $scope.rankLocalTomorrow]);
					$scope.scaledRankYoungerLocal = tickerYoungerLocal(new Date().getTime());
					$scope.scaledRankYoungerGlobal = tickerYoungerGlobal(new Date().getTime());
					$scope.scaledRankOlderLocal = $scope.countryPopulation - $scope.rankLocal;
					$scope.scaledRankOlderGlobal = $scope.worldPopulation - $scope.rankGlobal;
				}
			}
		);
		$interval(function(){
			if ($scope.deltaRankGlobal) {
				$scope.rankGlobal += $scope.deltaRankGlobal;
				$scope.$root.$broadcast('rankGlobalChanged', $scope.rankGlobal);
			}
		}, 1000);
	}
]);
