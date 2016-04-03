angular.module('populationioApp').controller('BirthdaysCtrl', [
	'$scope', '$state', '$sce', '$filter', '$rootScope', 'PopulationIOService', 'ProfileService',
	function($scope, $state, $sce, $filter, $rootScope, PopulationIOService, ProfileService){
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
			var continentalCountries = _getCountriesByContinent($scope.selectedContinental),
				responseCounter = 0;
			$scope.$root.loading += continentalCountries.length;
			_loadAllCountryBirthdays(continentalCountries, function(country, birthdays){
				if(country && birthdays && parseInt(birthdays, 0) > 0){
					$scope.continentsData.push({
						countryAbbr: _getCountry(country).GMI_CNTRY,
						countryTitle: country,
						value: birthdays
					});
				}
				responseCounter += 1;
				$scope.$root.loading -= 1;
				if(continentalCountries.length === responseCounter){
					$scope.$broadcast('continentsDataLoaded');
				}
			});
		};
		var _updateCountriesAroundTheWorld = function(){
			$scope.worldData = [];
			var countriesAroundTheWorld = [
					'China', 'India', 'United States', 'Indonesia', 'Brazil',
					'Pakistan', 'Russian Federation', 'Japan', 'Nigeria',
					'Bangladesh', 'Mexico'
				],
				responseCounter = 0;
			$scope.$root.loading += countriesAroundTheWorld.length;
			_loadAllCountryBirthdays(countriesAroundTheWorld, function(country, birthdays){
				if(country && birthdays){
					$scope.worldData.push({
						countryAbbr: _getCountry(country).GMI_CNTRY,
						countryTitle: country,
						value: birthdays
					});
				}
				responseCounter += 1;
				$scope.$root.loading -= 1;
				if(countriesAroundTheWorld.length === responseCounter){
					$scope.$broadcast('worldDataLoaded');
				}
			});
		};
		var _loadAllCountryBirthdays = function(countries, callback){
			var _loadCountryBirthdays = function(country){
				PopulationIOService.loadPopulationByAge({
					year: $filter('date')(Date.now(), 'yyyy'),
					country: country,
					age: ProfileService.getAge()
				}, function(data){
					if(_getCountry(country).GMI_CNTRY){
						callback(country, data[0].total / 365);
					}
				});
			};
			for(var j = 0; j < countries.length; j += 1){
				_loadCountryBirthdays(countries[j]);
			}
		};
		var update = function(){
			$scope.selectedContinental = _getContinentByCountry(ProfileService.country);
			$scope.country = ProfileService.country;
			$scope.$root.loading += 1;
			PopulationIOService.loadPopulationByAge({
				year: $filter('date')(Date.now(), 'yyyy'),
				country: 'World',
				age: ProfileService.getAge()
			}, function(data){
				$scope.sharedDay = $filter('number')(parseInt(data[0].total / 365, 0), 0);
				$scope.sharedHour = $filter('number')(parseInt(data[0].total / 365 / 24, 0), 0);
				$scope.$root.loading -= 1;
			}, function(){
				$scope.$root.loading -= 1;
			});
			_updateCountriesAroundTheWorld();
		};
	}
]);
