angular.module('populationioApp').controller('HomeCtrl', [
	'$scope', '$timeout', '$location', '$translate', 'ProfileService', 'Countries',
	function($scope, $timeout, $location, $translate, ProfileService, Countries){
		'use strict';
		$scope.$on('languageChange', function(){
			$scope.months = [
				{ label: $translate.instant('MONTH1'), value: '01' },
				{ label: $translate.instant('MONTH2'), value: '02' },
				{ label: $translate.instant('MONTH3'), value: '03' },
				{ label: $translate.instant('MONTH4'), value: '04' },
				{ label: $translate.instant('MONTH5'), value: '05' },
				{ label: $translate.instant('MONTH6'), value: '06' },
				{ label: $translate.instant('MONTH7'), value: '07' },
				{ label: $translate.instant('MONTH8'), value: '08' },
				{ label: $translate.instant('MONTH9'), value: '09' },
				{ label: $translate.instant('MONTH10'), value: '10' },
				{ label: $translate.instant('MONTH11'), value: '11' },
				{ label: $translate.instant('MONTH12'), value: '12' }
			];
		});
		$scope.$on('profileUpdated', function(){
			$scope.$root.expanded = true;
			$scope.profile = $.extend(true, {}, ProfileService);
		});
		$scope.$on('languageChange', function(){
			// This part is required to properly update (and translate) month
			var month = $scope.profile.birthday.month;
			var country = $scope.profile.country;
			$scope.profile.birthday.month = '';
			$scope.profile.country = '';
			$scope.$applyAsync(function(){
				$scope.profile.birthday.month = month;
				$scope.profile.country = country;
			});
		});
		$scope.goGoGadget = function(){
			if($scope.goForm.$invalid){
				$scope.highlightErrors = true;
				$scope.highlightExtra = true;
				$timeout(function(){
					$scope.highlightExtra = false;
				}, 2000);
				return;
			}
			$location.path([
				$scope.profile.birthday.year,
				$scope.profile.birthday.month,
				$scope.profile.birthday.day,
				$scope.profile.gender,
				$scope.profile.country,
				'summary'
			].join('/'));
		};
		$scope.countries = Countries;
		$scope.profile = {
			birthday: {
				year: '',
				month: '',
				day: ''
			},
			gender: 'female',
			country: ''
		};
	}
]);
