angular.module('populationioApp').factory('LanguageService', [
	'$rootScope', '$translate', 'tmhDynamicLocale',
	function($rootScope, $translate, tmhDynamicLocale){
		'use strict';
		var supportedLanguages = ['EN', 'ES', 'FR', 'DE', 'ZH', 'ID', 'RU'];
		var getSupportedLanguage = function(language){
			language = language.toUpperCase();
			if (supportedLanguages.indexOf(language) > -1){
				return language;
			}

			return 'EN';
		};
		return {
			change: function(language){
				language = getSupportedLanguage(language);
				$translate.use(language).then(function(){
					moment.locale(language.toLowerCase());
					tmhDynamicLocale.set(language.toLowerCase());
					$rootScope.defaultLanguage = language;
					$rootScope.$broadcast('languageChange');
				});
			},
			getTitle: function(language){
				switch(language){
					case 'EN': return 'English';
					case 'ES': return 'Español';
					case 'FR': return 'Français';
					case 'DE': return 'Deutsch';
					case 'ZH': return '汉语';
					case 'ID': return 'Bahasa Indonesia';
					case 'RU': return 'русский';
				}

				return '';
			},
			supportedLanguages: supportedLanguages
		};
	}
]);
