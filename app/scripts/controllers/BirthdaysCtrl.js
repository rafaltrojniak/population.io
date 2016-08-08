angular.module('populationioApp').controller('BirthdaysCtrl', [
	'$scope', '$filter', 'PopulationIOService', 'ProfileService',
	function($scope, $filter, PopulationIOService, ProfileService){
		'use strict';
		var countries = [];
		var dataLoaded = false;
		var profileUpdated = false;
		d3.csv('data/countries.csv', function(data){
			countries = data;
			dataLoaded = true;
			if (profileUpdated) {
				update();
			}
		});
		$scope.$on('profileUpdated', function(){
			profileUpdated = true;
			if (dataLoaded) {
				update();
			}
		});
		var _getCountry = function(name){
			for(var i = 0; i < countries.length; i += 1){
				var country = countries[i];
				if(country.POPIO_NAME === name){
					return country;
				}
			}
			return null;
		};
		var _getContinentByCountry = function(name){
			for(var i = 0; i < countries.length; i += 1){
				var country = countries[i];
				if(country.POPIO_NAME === name){
					return country.CONTINENT;
				}
			}
			return null;
		};
		var _getCountriesByContinent = function(continent){
			var res = [];
			for(var i = 0; i < countries.length; i += 1){
				var country = countries[i];
				if(country.CONTINENT === continent){
					res.push(country.POPIO_NAME);
				}
			}
			return res;
		};
		$scope.$watch('selectedContinental', function(newValue, oldValue){
			if(ProfileService.active && oldValue !== newValue){
				_updateContinentalCountries();
			}
		});
		var _updateContinentalCountries = function(){
			$scope.continentsData = [];
			var continentalCountries = _getCountriesByContinent($scope.selectedContinental);
			_loadAllCountryBirthdays(continentalCountries, function(country, birthdays){
				if(country && birthdays && parseInt(birthdays, 0) > 0){
					$scope.continentsData.push({
						countryAbbr: _getCountry(country).GMI_CNTRY,
						countryTitle: country,
						value: birthdays
					});
				}
				$scope.$broadcast('continentsDataLoaded');
			});
		};
		var _updateCountriesAroundTheWorld = function(){
			$scope.worldData = [];
			var countriesAroundTheWorld = [
					'China', 'India', 'United States', 'Indonesia', 'Brazil',
					'Pakistan', 'Russian Federation', 'Japan', 'Nigeria',
					'Bangladesh', 'Mexico'
				];
			_loadAllCountryBirthdays(countriesAroundTheWorld, function(country, birthdays){
				if(country && birthdays){
					$scope.worldData.push({
						countryAbbr: _getCountry(country).GMI_CNTRY,
						countryTitle: country,
						value: birthdays
					});
				}
				$scope.$broadcast('worldDataLoaded');
			});
		};
		var _loadAllCountryBirthdays = function(countries, callback){
			$scope.$root.loading += 1;
			PopulationIOService.loadPopulationByAge({
				year: $filter('date')(Date.now(), 'yyyy'),
				age: ProfileService.getAge()
			}, function(data){
				data.forEach(function(element){
					var country = _getCountry(element.country);
					if(country !== null && countries.indexOf(element.country) !== -1 && country.GMI_CNTRY){
						callback(element.country, element.total / 365);
					}
				});
				$scope.$root.loading -= 1;
			});
		};
		var update = function(){
			$scope.selectedContinental = _getContinentByCountry(ProfileService.country);
			$scope.country = ProfileService.country;
			$scope.$root.loading += 1;
			PopulationIOService.loadPopulationByCountryAndAge({
				year: $filter('date')(Date.now(), 'yyyy'),
				country: 'World',
				age: ProfileService.getAge()
			}, function(data){
				$scope.sharedDay = parseInt(data[0].total / 365, 0);
				$scope.sharedHour = parseInt(data[0].total / 365 / 24, 0);
				$scope.$root.loading -= 1;
			}, function(){
				$scope.$root.loading -= 1;
			});
			_updateCountriesAroundTheWorld();
		};
	}
]);
