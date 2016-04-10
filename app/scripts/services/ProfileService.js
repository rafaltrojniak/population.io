angular.module('populationioApp').service('ProfileService', [
	'$rootScope', 'PopulationIOService',
	function($rootScope, PopulationIOService){
		'use strict';
		return {
			gender: 'female',
			birthday: {year: null, month: null, day: null, formatted: ''},
			country: '',
			active: false,
			getFormattedBirthday: function(){
				return [this.birthday.year, this.birthday.month, this.birthday.day].join('-');
			},
			getAge: function(){
				var formatted = [this.birthday.year, this.birthday.month, this.birthday.day].join('-');
				var ageDate = new Date(Date.now() - (new Date(formatted)).getTime());
				return Math.abs(ageDate.getUTCFullYear() - 1970);
			},
			getAgeString: function(){
				var formatted = [this.birthday.year, this.birthday.month, this.birthday.day].join('-');
				var ageDate = new Date(Date.now() - (new Date(formatted)).getTime());
				var year = Math.abs(ageDate.getUTCFullYear() - 1970),
					months = ageDate.getMonth();
				return year + 'y' + months + 'm';
			},
			update: function(){
				this.active = false;
				$rootScope.loading = 0;
				var formatted = this.getFormattedBirthday();
				var _getNextDay = function(){
					var tomorrow = new Date();
					tomorrow.setDate((new Date()).getDate() + 1);
					return tomorrow;
				};

				// Local rank for country of the user
				$rootScope.loading += 1;
				PopulationIOService.loadWpRankToday({
					dob: formatted,
					sex: 'unisex',
					country: this.country
				}, function(rank){
					$rootScope.loading -= 1;
					$rootScope.$broadcast('rankLocalChanged', rank);
				});

				// Global rank for world of the user
				$rootScope.loading += 1;
				PopulationIOService.loadWpRankToday({
					dob: formatted,
					sex: 'unisex',
					country: 'World'
				}, function(rank){
					$rootScope.loading -= 1;
					$rootScope.$broadcast('rankGlobalChanged', rank);
				});

				// Local rank for country of the user
				var date = moment(_getNextDay()).format('YYYY-MM-DD');
				$rootScope.loading += 1;
				PopulationIOService.loadWpRankOnDate({
					dob: formatted,
					sex: 'unisex',
					country: this.country,
					date: date
				}, function(rank){
					$rootScope.loading -= 1;
					$rootScope.$broadcast('rankDateLocalChanged', rank, date);
				});

				// Global rank for world of the user
				$rootScope.loading += 1;
				PopulationIOService.loadWpRankOnDate({
					dob: formatted,
					sex: 'unisex',
					country: 'World',
					date: date
				}, function(rank){
					$rootScope.loading -= 1;
					$rootScope.$broadcast('rankDateGlobalChanged', rank, date);
				});

				$rootScope.loading += 1;
				PopulationIOService.loadPopulation({
					year: new Date().getFullYear(),
					country: this.country
				}, function(data){
					$rootScope.loading -= 1;
					$rootScope.$broadcast('countryPopulationDataChanged', data);
				});

				$rootScope.loading += 1;
				PopulationIOService.loadPopulation({
					year: new Date().getFullYear(),
					country: 'World'
				}, function(data){
					$rootScope.loading -= 1;
					$rootScope.$broadcast('worldPopulationDataChanged', data);
				});

				var self = this;
				var deregisterWatcher = $rootScope.$watch('loading', function(newValue){
					if (!newValue){
						deregisterWatcher();
						self.active = true;
						$rootScope.$broadcast('profileUpdated');
					}
				});
			}
		};
	}
]);
