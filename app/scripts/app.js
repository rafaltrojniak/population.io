angular
  .module('populationioApp', [ 'ngRoute', 'duScroll', 'ngResource', 'ui.router', 'ngAnimate', 'ui.bootstrap', 'pascalprecht.translate'])
  .config(function ($locationProvider, $urlRouterProvider, $httpProvider, $translateProvider) {


    // $locationProvider.html5Mode(true);

    // cross domain restriction fixes
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $translateProvider.useSanitizeValueStrategy(null);

    $translateProvider.useStaticFilesLoader({
      prefix: 'i18n/',
      suffix: '.json'
    });


  $translateProvider.preferredLanguage('EN');

  })
  .run(function ($rootScope) {
    console.log('App is running...');
    $rootScope.currentPage = 0;
  })
;
