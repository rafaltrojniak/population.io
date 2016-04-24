angular.module('populationioApp').controller('DeathCtrl', [
	'$scope', '$filter', '$translate', 'ProfileService', 'PopulationIOService',
	function($scope, $filter, $translate, ProfileService, PopulationIOService){
		'use strict';
		$scope.type = 'distribution';
		$scope.$on('languageChange', function(){
			$scope.country = $translate.instant(ProfileService.country);
		});
		$scope.$on('profileUpdated', function(){
			$scope.country = $translate.instant(ProfileService.country);
			$scope.$root.loading += 1;
			PopulationIOService.loadMortalityDistribution({
				country: ProfileService.country,
				gender: ProfileService.gender,
				age: ProfileService.getAge()
			}, function(data){
				$scope.$root.loading -= 1;
				$scope.mortalityDistributionData = data;
				if(data){
					$scope.$root.$broadcast('mortalityDistributionDataChanged', data);
				}
			});

			$scope.$root.loading += 1;
			PopulationIOService.loadLifeExpectancyRemaining({
				sex: ProfileService.gender,
				country: 'World',
				date: $filter('date')(new Date(), 'yyyy-MM-dd'),
				age: ProfileService.getAgeString()
			}, function(remainingLife){
				var today = new Date();
				$scope.$root.loading -= 1;
				$scope.dodWorld = $filter('date')(today.setDate(today.getDate() + (remainingLife * 365)), 'd MMM, yyyy');
				$scope.remainingLifeWorldInYears = parseFloat(remainingLife).toFixed(1);
				$scope.totalLifeWorldInYears = moment(today).diff(moment(ProfileService.birthday.year, 'YYYY'), 'years', true);
			});

			$scope.$root.loading += 1;
			PopulationIOService.loadLifeExpectancyRemaining({
				sex: ProfileService.gender,
				country: ProfileService.country,
				date: $filter('date')(new Date(), 'yyyy-MM-dd'),
				age: ProfileService.getAgeString()
			}, function(remainingLife){
				var today = new Date();
				$scope.$root.loading -= 1;
				$scope.dodCountry = $filter('date')(today.setDate(today.getDate() + (remainingLife * 365)), 'd MMM, yyyy');
				$scope.remainingLifeCountryInYears = parseFloat(remainingLife).toFixed(1);
				$scope.totalLifeCountryInYears = moment(today).diff(moment(ProfileService.birthday.year, 'YYYY'), 'years', true);
			});

			var updateValues = function(){
				var c = moment($scope.dodCountry, 'DD MMM, YYYY');
				var w = moment($scope.dodWorld, 'DD MMM, YYYY');
				var diffDays = c.diff(w, 'days');
				var diffYears = c.diff(w, 'years');
				$scope.differenceInDays = diffDays < 0 ? '- ' + (-1 * diffDays) + ' days' : '+ ' + diffDays + ' days';
				$scope.soMuchToDo = diffDays < 1 ?
					$translate.instant('DEATH_EXPECTANCY_TXT_SHORTER') :
					$translate.instant('DEATH_EXPECTANCY_TXT_LONGER');
				if(diffYears < 1 && diffYears > -1) {
					$scope.differenceInUnits = diffDays.toString().replace('-', '') + ' ' + $translate.instant('UNIT_DAYS');
				} else {
					if(Math.abs(diffYears) <= 1) {
						$scope.differenceInUnits = diffYears.toString().replace('-', '') + ' ' + $translate.instant('UNIT_YEAR');
					} else {
						$scope.differenceInUnits = diffYears.toString().replace('-', '') + ' ' + $translate.instant('UNIT_YEARS');
					}
				}
			};
			$scope.$on('languageChange', function(){
				updateValues();
			});
			$scope.$watchGroup(
				['remainingLifeCountryInYears', 'remainingLifeWorldInYears'],
				function(newVals, oldVals){
					if((newVals[0] && newVals[1]) && (newVals[0] !== oldVals[0] && newVals[1] !== oldVals[0])){
						updateValues();
					}
				}
			);
		});
	}
]);
