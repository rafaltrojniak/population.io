angular.module('populationioApp').controller('SummaryCtrl', [
	'$scope', '$interval', '$filter', 'PopulationIOService', 'ProfileService',
	function($scope, $interval, $filter, PopulationIOService, ProfileService){
		'use strict';
		var rangeLoaded = false;
		$scope.region = 'World';
		$scope.age = new Date().getFullYear() - ProfileService.birthday.year;
		var today = new Date();
		var _getNextDay = function(){
			var tomorrow = new Date();
			tomorrow.setDate((new Date()).getDate() + 1);
			return tomorrow;
		};
		var tickerYoungerGlobal = d3.scale.linear().domain([today.getTime(), _getNextDay().getTime()]);
		var tickerYoungerLocal = d3.scale.linear().domain([today.getTime(), _getNextDay().getTime()]);
		var tickerOlderGlobal = d3.scale.linear().domain([today.getTime(), _getNextDay().getTime()]);
		var tickerOlderLocal = d3.scale.linear().domain([today.getTime(), _getNextDay().getTime()]);
		
		$scope.calcWorldOlderNumber = function(){
			if(!$scope.rankGlobal || !$scope.worldPopulation){
				return 0;
			}
			return $filter('number')(Math.max(0, $scope.worldPopulation - $scope.rankGlobal), 0);
		};
		$scope.calcWorldOlderPercentage = function(){
			var value = $filter('number')(Math.max(0, 100 - $scope.rankGlobal / ($scope.worldPopulation / 100)), 0);
			return $filter('translate')('SUMMARY_PEOPLE_OLDER') + value + '%)';
		};
		$scope.calcCountryOlderNumber = function(){
			return $filter('number')(Math.max(0, $scope.countryPopulation - $scope.rankLocal), 0);
		};
		$scope.calcCountryOlderPercentage = function(){
			var value = $filter('number')(Math.max(0, 100 - $scope.rankLocal / ($scope.countryPopulation / 100)), 0);
			return $filter('translate')('SUMMARY_PEOPLE_OLDER') + value + '%)';
		};
		$scope.calcCountryYoungerPercentage = function(){
			var value = $filter('number')(Math.min(100, $scope.rankLocal / ($scope.countryPopulation / 100)), 0);
			return $filter('translate')('SUMMARY_PEOPLE_YOUNGER') + value + '%)';
		};
		$scope.calcWorldYoungerPercentage = function(){
			var value = $filter('number')(Math.min(100, $scope.rankGlobal / ($scope.worldPopulation / 100)), 0);
			return $filter('translate')('SUMMARY_PEOPLE_YOUNGER') + value + '%)';
		};
		$scope.calcCountryYoungerPercentageSimple = function(){
			return $filter('number')(Math.min(100, $scope.rankLocal / ($scope.countryPopulation / 100)), 0);
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
		$scope.$on('rankDateLocalChanged', function(event, rank){
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
				$scope.countryYoungerPercentageSimple = $filter('number')(Math.min(100, $scope.rankLocal / ($scope.countryPopulation / 100)), 0);
				$scope.worldYoungerPercentageSimple = $filter('number')(Math.min(100, $scope.rankGlobal / ($scope.worldPopulation / 100)), 0);
				if(!_(newVals).contains(undefined) && !rangeLoaded){
					tickerYoungerGlobal.range([$scope.rankGlobal, $scope.rankGlobalTomorrow]);
					tickerYoungerLocal.range([$scope.rankLocal, $scope.rankLocalTomorrow]);
					tickerOlderGlobal.range([$scope.rankGlobalTomorrow, $scope.worldPopulation]);
					tickerOlderLocal.range([$scope.rankLocal, $scope.rankLocalTomorrow]);
					$scope.scaledRankYoungerLocal = tickerYoungerLocal(new Date().getTime());
					$scope.scaledRankYoungerGlobal = tickerYoungerGlobal(new Date().getTime());
					$scope.scaledRankOlderLocal = $scope.localPopulationToday - tickerYoungerLocal(new Date().getTime());
					$scope.scaledRankOlderGlobal = $scope.worldPopulation - $scope.rankGlobal;
				}
			}
		);
		$interval(function(){
			$scope.rankGlobal += $scope.deltaRankGlobal;
			$scope.$root.$broadcast('rankGlobalChanged', $scope.rankGlobal);
		}, 1000);
	}
]);
