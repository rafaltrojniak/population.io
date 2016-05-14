angular.module('populationioApp').factory('LanguageService', [
	'$rootScope', '$translate', 'tmhDynamicLocale',
	function($rootScope, $translate, tmhDynamicLocale){
		'use strict';
		var getSupportedLanguage = function(language){
			language = language.toUpperCase();
			if (['EN', 'ES', 'FR', 'DE', 'ZH', 'ID', 'RU'].indexOf(language) > -1){
				return language;
			}

			return 'EN';
		};
		return {
			change: function(language){
				language = getSupportedLanguage(language);
				$translate.use(language).then(function(){
					tmhDynamicLocale.set(language.toLowerCase());
					$rootScope.defaultLanguage = language;
					$rootScope.$broadcast('languageChange');
				});
			}
		};
	}
]);
