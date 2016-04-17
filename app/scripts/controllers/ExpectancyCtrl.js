angular.module('populationioApp').controller('ExpectancyCtrl', [
	'$scope', 'ProfileService', 'Countries',
	function($scope, ProfileService, Countries){
		'use strict';
		$scope.countries = Countries;
		$scope.$root.$on('profileUpdated', function(){
			$scope.currentCountry = ProfileService.country;
			$scope.referenceCountry = '';
		});
	}
]);
