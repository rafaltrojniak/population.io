angular.module('populationioApp').controller('ExpectancyCtrl', [
	'$scope', '$rootScope', '$filter', 'ProfileService', 'PopulationIOService', 'Countries',
	function($scope, $rootScope, $filter, ProfileService, PopulationIOService, Countries){
		'use strict';
		$scope.countries = Countries;
		var date = $filter('date')(new Date(), 'yyyy-MM-dd');
		$rootScope.$on('profileUpdated', function(){
			$('#countryRel').attr('placeholder', $filter('translate')('LOCAL_COUNTRY'));
			$('#countryRef').attr('placeholder', $filter('translate')('LOCAL_COUNTRY'));
			$scope.selectedCountryRef = _getCountryObjectByFullName(ProfileService.country);
			_updateCountryRef(date);
		});
		$scope.$on('languageChange', function(){
			$('#countryRel').attr('placeholder', $filter('translate')('LOCAL_COUNTRY'));
			$('#countryRef').attr('placeholder', $filter('translate')('LOCAL_COUNTRY'));
		});
		var _updateCountryRef = function(date){
			$scope.$root.loading += 1;
			var countryName;
			countryName = typeof $scope.selectedCountryRef !== 'string' ? $scope.selectedCountryRef.POPIO_NAME : $scope.selectedCountryRef;
			PopulationIOService.loadLifeExpectancyRemaining({
				sex: ProfileService.gender,
				country: countryName,
				date: date,
				age: ProfileService.getAgeString()
			}, function(remainingLife){
				var ageDate = new Date(Date.now() - (new Date(ProfileService.getFormattedBirthday())).getTime());
				var lifeExpectancy = ProfileService.getAge() + remainingLife + (ageDate.getMonth() / 11);
				$rootScope.totalLifeLengthLocal = ProfileService.getAge() + remainingLife + (ageDate.getMonth() / 11);
				$scope.activeCountryRef = {
					country: $scope.selectedCountryRef,
					yearsLeft: remainingLife,
					lifeExpectancy: lifeExpectancy,
					dod: (function(){
						var today = new Date();
						return today.setDate(today.getDate() + (remainingLife * 365));
					})()
				};
				$scope.$root.loading -= 1;
				$scope.$applyAsync();
			}, function(){
				$scope.$root.loading -= 1;
			});
		};
		var _updateCountryRel = function(date){
			$scope.$root.loading += 1;
			PopulationIOService.loadLifeExpectancyRemaining({
				sex: ProfileService.gender,
				country: _getCountryObject($scope.selectedCountryRel).POPIO_NAME,
				date: date,
				age: ProfileService.getAgeString()
			}, function(remainingLife){
				var ageDate = new Date(Date.now() - (new Date(ProfileService.getFormattedBirthday())).getTime());
				var lifeExpectancy = ProfileService.getAge() + remainingLife + (ageDate.getMonth() / 11);
				$rootScope.totalLifeLengthLocal = ProfileService.getAge() + remainingLife + (ageDate.getMonth() / 11);
				$scope.activeCountryRel = {
					country: $scope.selectedCountryRel,
					yearsLeft: remainingLife,
					lifeExpectancy: lifeExpectancy,
					dod: (function(){
						var today = new Date();
						return today.setDate(today.getDate() + (remainingLife * 365));
					})()
				};
				$scope.$root.loading -= 1;
				$scope.$applyAsync();
			}, function(){
				$scope.$root.loading -= 1;
			});
		};
		var _getCountryObject = function(country){
			if(typeof country === 'object'){
				return country;
			}
			return _.find($scope.countries, function(item){
				return item.GMI_CNTRY === country || item.POPIO_NAME === country;
			});
		};
		var _getCountryObjectByFullName = function(country){
			return _.find($scope.countries, function(item){
				return item.POPIO_NAME === country;
			});
		};
		$scope.$on('timesliderChanged', function(e, year){
			date = $filter('date')(new Date(year, 1, 1), 'yyyy-MM-dd');
			if($scope.selectedCountryRef){
				_updateCountryRef(date);
			}
			if($scope.selectedCountryRel){
				_updateCountryRel(date);
			}
		});
		$scope.$watch('selectedCountryRef', function(newVal){
			if(ProfileService.active && newVal && _getCountryObjectByFullName(newVal)){
				_updateCountryRef(date);
			}
		}, true);
		$scope.$watch('selectedCountryRel', function(newVal){
			if(ProfileService.active && newVal && (_getCountryObjectByFullName(newVal) || typeof newVal !== 'string')){
				_updateCountryRel(date);
			}
		}, true);
		$rootScope.$on('countryRelChanged', function(e, country){
			if(ProfileService.active && country){
				var foundCountry = _getCountryObject(country);
				if(foundCountry){
					$scope.selectedCountryRel = foundCountry;
				} else {
					alert(country + ' not available!');
				}
				if(!$scope.$$phase){
					$scope.$apply();
				}
			}
		});
	}
]);
