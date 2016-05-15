angular.module('populationioApp').directive('countryTranslate', [
	'$translate', function($translate){
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, element, attrs, ctrl){
				'use strict';
				ctrl.$formatters.unshift(function(value){
					return $translate.instant(value);
				});
			}
		};
	}
]);
