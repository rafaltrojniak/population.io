angular.module('populationioApp').controller('MainCtrl', [
	'$translate', '$scope', '$http', '$interval', '$uibModal', '$location', '$document', '$filter',
	'ProfileService', 'PopulationIOService', 'BrowserService', 'Countries', 'LanguageService',
	function($translate, $scope, $http, $interval, $uibModal, $location, $document, $filter,
	         ProfileService, PopulationIOService, BrowserService, Countries, LanguageService){
		'use strict';
		$scope.$root.loading = 0;
		$scope.$root.$on('$translateChangeSuccess', function(){
			$scope.pageHeader = {
				title: $translate.instant('HEADER_TITLE'),
				menuAbout: $translate.instant('HEADER_MENU_ABOUT'),
				menuMethodology: $translate.instant('HEADER_MENU_METHODOLOGY'),
				menuApi: $translate.instant('HEADER_MENU_API')
			};
		});
		$scope.changeLanguage = LanguageService.change;
		$scope.languages = LanguageService.supportedLanguages;
		$scope.getLanguageTitle = LanguageService.getTitle;
		$scope.profile = ProfileService;
		$scope.$root.countriesList = function(newVal){
			newVal = $translate.instant(newVal).toLowerCase();
			var alternativeName = newVal;
			var aliases = [
				{alias: 'Great Britain', country: 'United Kingdom'},
				{alias: 'Britain', country: 'United Kingdom'},
				{alias: 'England', country: 'United Kingdom'},
				{alias: 'United States of America', country: 'United States'},
				{alias: 'USA', country: 'United States'},
				{alias: 'Egypt', country: 'Arab Rep of Egypt'},
				{alias: 'North Korea', country: 'Dem Peoples Rep of Korea'},
				{alias: 'South Korea', country: 'Rep of Korea'}
			];
			var foundAlias = _.find(aliases, function(item){
				return item.alias.toLowerCase().indexOf(newVal.toLowerCase()) > -1;
			});
			if(foundAlias){
				alternativeName = foundAlias.country.toLowerCase();
			}
			return _.map(
				_.filter(
					Countries,
					function(v) {
						var name = $translate.instant(v.POPIO_NAME).toLowerCase();
						return name.indexOf(alternativeName) > -1 || name.indexOf(newVal) > -1;
					}
				),
				function(v) {
					return {
						label: $translate.instant(v.POPIO_NAME),
						value: v.POPIO_NAME
					};
				}
			);
		};

		$scope.rankGlobal = 0;
		if(!BrowserService.isSupported()){
			$uibModal.open({
				templateUrl: 'browser-warning.html'
			});
		}

		$scope.clockType = 'world';
		$scope.worldPopulation = 0;
		PopulationIOService.getWorldPopulation(function(data){
			$scope.worldPopulation = data.total_population[1].population;
			$scope.worldPopulationToday = data.total_population[0].population;
			$scope.worldPopulationTomorrow = data.total_population[1].population;
			$scope.peopleBornPerSecond = Math.ceil((data.total_population[1].population - data.total_population[0].population) / (24 * 60 * 60));
		});

		$interval(function(){
			$scope.worldPopulation += $scope.peopleBornPerSecond;
		}, 1000);
		$scope.$on('$locationChangeSuccess', function (e, newValue) {
			var hashPosition = newValue.indexOf('#/');
			var hash = decodeURIComponent(newValue.substr(hashPosition+2, newValue.length));
			var newLocation = hash.split('/');

			if (newLocation.length !== 6) {
				return;
			}

			var year = newLocation[0];
			var month = newLocation[1];
			var day = newLocation[2];
			var gender = newLocation[3];
			var country = newLocation[4];

			if (
				['female', 'male'].indexOf(gender) > -1 &&
				(
					ProfileService.birthday.year !== year ||
					ProfileService.birthday.month !== month ||
					ProfileService.birthday.day !== day ||
					ProfileService.gender !== gender ||
					ProfileService.country !== country
				)
			) {
				ProfileService.gender = gender;
				ProfileService.country = country;
				ProfileService.birthday = {
					year: year,
					month: month,
					day: day
				};
				ProfileService.update();
			}
		});
		$scope.$on('profileUpdated', function(){
			$scope.showSection('summary');
		});
		$scope.$root.$on('duScrollspy:becameActive', function($event, $element){
			var section = $element.prop('id');
			if(section){
				var path = $location.$$path.replace(/[^/]*$/g, ''),
					pathItems = $location.$$path.split('/');
				if(pathItems.length > 4){
					$location.preventReload = true;
					$location.path(path + section).replace();
					$scope.$root.currentPage = $element.attr('data-index');
					$scope.$root.$apply();
				}
			}
		});
		$scope.downloadICal = function(){
			if(!ProfileService.active){
				alert([
					'Please fill out the form and press ',
					'"Go" for getting your Date of Death!'
				].join(''));
				return;
			}
			var cal = ics(),
				dstart = $filter('date')(ProfileService.dod, 'yyyy-MM-dd'),
				dend = $filter('date')(ProfileService.dod, 'yyyy-MM-dd'),
				dob = ProfileService.getFormattedBirthday(),
				dod = $filter('date')(ProfileService.dod, 'yyyy-MM-dd'),
				dsum = 'Your Date of Death',
				url = 'http://population.io',
				ddesc = [
					'According to your birthday ' + dob,
					' and the life expectancy in ' + ProfileService.country,
					' you will die on ' + dod,
					' . http://population.io'
				].join('');
			cal.addEvent(dsum, ddesc, '', dstart, dend, url);
			cal.download();
		};
		$scope.showSection = function(id){
			var section = document.getElementById(id) || document.getElementById('home');
			var sectionElement = angular.element(section);
			$document.scrollToElement(sectionElement, 80, 1000);
		};
		$scope.showHomepage = function(){
			$scope.showSection('home');
		};
		$scope.registerMail = function(){
			$scope.sending = true;
			$http({
				url: 'http://api.47nord.de/population.io/v1/mail.php?auth=jLFscl7E7oz85D8P',
				method: 'POST',
				data: {
					email: $scope.email
				}
			})
				.success(function(){
					alert($scope.email + ' has been registered successfully!');
					$scope.email = '';
					$scope.sending = false;
				})
				.error(function(){
					$scope.sending = false;
					alert('Whoops, An error occurred!');
				});
		};
		$scope.showAbout = function(){
			$uibModal.open({
				templateUrl: 'about.html'
			});
		};
		$scope.showMethodology = function(){
			$uibModal.open({
				templateUrl: 'methodology.html'
			});
		};
		$scope.showDevelopers = function(){
			$uibModal.open({
				templateUrl: 'developers.html'
			});
		};
	}
]);
