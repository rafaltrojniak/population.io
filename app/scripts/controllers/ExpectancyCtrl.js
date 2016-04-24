angular.module('populationioApp').controller('ExpectancyCtrl', [
	'$scope', 'ProfileService', 'Countries',
	function($scope, ProfileService, Countries){
		'use strict';
		$scope.countries = Countries;
		$scope.$root.$on('profileUpdated', function(){
			$scope.currentCountry = ProfileService.country;
			$scope.referenceCountry = '';
		});
		$scope.$on('languageChange', function(){
			// This part is required to properly update (and translate) country
			var currentCountry = $scope.currentCountry;
			var referenceCountry = $scope.referenceCountry;
			$scope.currentCountry = '';
			$scope.referenceCountry = '';
			$scope.$applyAsync(function(){
				$scope.currentCountry = currentCountry;
				$scope.referenceCountry = referenceCountry;
			});
		});
	}
]);
