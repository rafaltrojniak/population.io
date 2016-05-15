angular.module('populationioApp').directive('validateDay', function(){
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl){
			ctrl.$validators.day = function(modelValue, viewValue){
				var value = parseInt(viewValue, 0);
				if(value && value > 0 && value < 32){
					return true;
				}
				return false;
			};
		}
	};
});
angular.module('populationioApp').directive('validateMonth', ['$translate', function($translate){
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl){
			ctrl.$validators.month = function(modelValue){
				var value = parseInt(modelValue, 0);
				if(value && value > 0 && value < 13){
					return true;
				}
				return false;
			};
			ctrl.$formatters.push(function(value){
				'use strict';
				if (value){
					return $translate.instant('MONTH' + parseInt(value, 0));
				}
				return value;
			});
		}
	};
}]);
angular.module('populationioApp').directive('validateYear', function(){
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl){
			ctrl.$validators.year = function($viewValue){
				var value = parseInt($viewValue, 0);
				if(value && value > 1919 && value < new Date().getFullYear()){
					return true;
				}
				return false;
			};
		}
	};
});
angular.module('populationioApp').directive('validateCountry', ['Countries', function(Countries){
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl){
			ctrl.$validators.country = function(modelValue){
				var countriesFiltered = _.filter(Countries, function(v){
					return v.POPIO_NAME.toLowerCase() === modelValue.toLowerCase();
				});
				if(countriesFiltered.length){
					return true;
				}
				return false;
			};
		}
	};
}]);
