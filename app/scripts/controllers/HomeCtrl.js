angular.module('populationioApp').controller('HomeCtrl', [
	'$scope', '$document', '$timeout', '$filter', '$location', '$rootScope', 'ProfileService', 'PopulationIOService', 'Countries',
	function($scope, $document, $timeout, $filter, $location, $rootScope, ProfileService, PopulationIOService, Countries){
		'use strict';
		var getMonths = function(){
			var month1 = $filter('translate')('MONTH1');
			var month2 = $filter('translate')('MONTH2');
			var month3 = $filter('translate')('MONTH3');
			var month4 = $filter('translate')('MONTH4');
			var month5 = $filter('translate')('MONTH5');
			var month6 = $filter('translate')('MONTH6');
			var month7 = $filter('translate')('MONTH7');
			var month8 = $filter('translate')('MONTH8');
			var month9 = $filter('translate')('MONTH9');
			var month10 = $filter('translate')('MONTH10');
			var month11 = $filter('translate')('MONTH11');
			var month12 = $filter('translate')('MONTH12');
			return [month1, month2, month3, month4, month5, month6, month7, month8, month9, month10, month11, month12];
		};
		var months = getMonths();
		var days = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
			'20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
		var years = [];
		for(var i = 1920; i < new Date().getFullYear(); i += 1){
			years.push(i.toString());
		}
		$scope.setDay = function(){
			$scope.goForm.birthdayDay.$setValidity('validateDay', true);
		};
		$scope.setMonth = function(){
			$scope.goForm.birthdayMonth.$setValidity('validateMonth', true);
		};
		$scope.setYear = function(){
			$scope.goForm.birthdayYear.$setValidity('validateYear', true);
		};
		$scope.setCountry = function(){
			$scope.goForm.country.$setValidity('validateCountry', true);
		};
		$scope.$on('languageChange', function(){
			months = getMonths();
		});
		$scope.birthdays = function(newVal, type){
			switch(type){
				case 'd':
					return _.filter(days, function(v){
						return v.indexOf(parseInt(newVal, 10)) > -1;
					});
				case 'm':
					if(isNaN(parseInt(newVal, 10))){
						return _.filter(months, function(v){
							return v.toLowerCase().indexOf(newVal.toLowerCase()) > -1;
						});
					}
					else {
						var monthIndex = parseInt(newVal, 10) - 1;
						if(monthIndex < 1){
							monthIndex = 0;
						}
						if(monthIndex > 11){
							monthIndex = 11;
						}
						return [months[monthIndex]];
					}
					break;
				case 'y':
					return _.filter(years, function(v){
						return v.indexOf(parseInt(newVal, 10)) > -1;
					});
			}
		};
		$scope.$on('profileUpdated', function(){
			$rootScope.expanded = true;
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
			var year = moment().year(ProfileService.birthday.year).format('YYYY');
			var month = moment().month(ProfileService.birthday.month).format('MM');
			var day = moment().date(ProfileService.birthday.day).format('DD');
			$location.path([
				year,
				month,
				day,
				ProfileService.gender,
				ProfileService.country,
				'home'
			].join('/'));
		};
		$scope.showDatepicker = function($event){
			$event.preventDefault();
			$event.stopPropagation();
			$scope.isDatepickerVisible = true;
		};
		$scope.isDatepickerVisible = false;
		$scope.countries = Countries;
	}
]);
