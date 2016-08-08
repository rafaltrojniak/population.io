angular.module('populationioApp').service('ProfileService', [
	'$rootScope', 'PopulationIOService',
	function($rootScope, PopulationIOService){
		'use strict';
		return {
			gender: 'female',
			birthday: {year: null, month: null, day: null, formatted: ''},
			country: '',
			active: false,
			rankGlobal: -1,
			rankGlobalTomorrow: -1,
			rankLocal: -1,
			rankLocalTomorrow: -1,
			getBirthDate: function(){
				return new Date(this.birthday.year, this.birthday.month - 1, this.birthday.day, 0, 0, 0);
			},
			getFormattedBirthday: function(){
				return moment(this.getBirthDate()).format('YYYY-MM-DD');
			},
			getAge: function(){
				var ageDate = new Date(Date.now() - this.getBirthDate().getTime());
				return Math.abs(ageDate.getUTCFullYear() - 1970);
			},
			getAgeString: function(){
				var ageDate = new Date(Date.now() - this.getBirthDate().getTime());
				var year = Math.abs(ageDate.getUTCFullYear() - 1970);
				var months = ageDate.getMonth();
				return year + 'y' + months + 'm';
			},
			update: function(){
				var self = this;
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
					self.rankLocal = rank;
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
					self.rankGlobal = rank;
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
					self.rankLocalTomorrow = rank;
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
					self.rankGlobalTomorrow = rank;
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
