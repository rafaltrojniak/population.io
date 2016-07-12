angular.module('populationioApp', [
	'duScroll',
	'ngResource',
	'ngAnimate',
	'ui.bootstrap',
	'pascalprecht.translate',
	'tmh.dynamicLocale'
])
.config(function($locationProvider, $httpProvider, $translateProvider, tmhDynamicLocaleProvider){
	// device detection
	//noinspection JSUnresolvedVariable
	if(bowser.mobile) {
		window.location.href = 'http://m.population.io';
	}
	// $locationProvider.html5Mode(true);
	// cross domain restriction fixes
	$httpProvider.defaults.useXDomain = true;
	$httpProvider.defaults.cache = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
	$translateProvider.useSanitizeValueStrategy(null);
	$translateProvider.useStaticFilesLoader({
		prefix: 'i18n/',
		suffix: '.json'
	});
	tmhDynamicLocaleProvider.localeLocationPattern('i18n/angular/angular-locale_{{locale}}.js');
})
.run(function($rootScope, LanguageService){
	var userLanguage = window.navigator.userLanguage || window.navigator.language;
	userLanguage = userLanguage.slice(0, 2);

	LanguageService.change(userLanguage);
	$rootScope.currentPage = 0;
});
