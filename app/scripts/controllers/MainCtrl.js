angular.module('populationioApp').controller('MainCtrl', [
	'$translate', '$scope', '$timeout', '$http', '$interval', '$modal', '$location', '$document', '$filter',
	'ProfileService', 'PopulationIOService', 'BrowserService', 'Countries',
	function($translate, $scope, $timeout, $http, $interval, $modal, $location, $document, $filter,
	         ProfileService, PopulationIOService, BrowserService, Countries){
		'use strict';
		$scope.$root.loading = 0;
		$scope.$root.$on('$translateChangeSuccess', function(){
			$scope.pageHeader = {
				title: $filter('translate')('HEADER_TITLE'),
				menuAbout: $filter('translate')('HEADER_MENU_ABOUT'),
				menuMethodology: $filter('translate')('HEADER_MENU_METHODOLOGY'),
				menuApi: $filter('translate')('HEADER_MENU_API')
			};
		});
		$scope.changeLanguage = function(langKey){
			$translate.use(langKey).then(function(){
				$scope.$root.$broadcast('languageChange');
				$scope.updatePlaceholders();
			}, function(langKey){
				console.log('Something wrong with this language:', langKey);
			});
		};
		$scope.activeLangKey = $scope.$root.defaultLanguage;
		$scope.updatePlaceholders = function(){
			$('#inputBirthDay').attr('placeholder', $filter('translate')('LOCAL_DAY')); //LOCAL_DAY
			$('#inputBirthMonth').attr('placeholder', $filter('translate')('LOCAL_MONTH')); //LOCAL_MONTH
			$('#inputBirthYear').attr('placeholder', $filter('translate')('LOCAL_YEAR')); //LOCAL_YEAR
			$('#inputBirthCountry').attr('placeholder', $filter('translate')('LOCAL_COUNTRY')); //LOCAL_COUNTRY
		};
		$scope.changeLanguage($scope.$root.defaultLanguage);
		$scope.$root.countriesList = function(newVal){
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
				]
				;
			var foundAlias = _.find(aliases, function(item){
				return item.alias.toLowerCase().indexOf(newVal.toLowerCase()) > -1;
			});
			if(foundAlias){
				alternativeName = foundAlias.country;
			}
			var getCountryName = function(value){
				switch($scope.activeLangKey){
					case 'ES':
						return value.POPIO_NAME_ES;
					default:
						return value.POPIO_NAME;
				}
			};
			return _.map(
				_.filter(
					Countries,
					function(v) {
						return v.POPIO_NAME.toLowerCase().indexOf(alternativeName.toLowerCase()) > -1;
					}
				),
				function(v) {
					return {
						label: getCountryName(v),
						value: v.POPIO_NAME
					};
				}
			);
		};

		$scope.rankGlobal = 0;
		if(!BrowserService.isSupported()){
			$modal.open({
				templateUrl: 'browser-warning.html'
			});
		}

		$scope.clockType = 'world';
		$scope.profile = ProfileService;
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
			var hash = newValue.substr(hashPosition+2, newValue.length);
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
		$scope.$root.$watch('loading', function(value){
			if (value === 0 && ProfileService.active === true) {
				$scope.showSection('summary');
			}
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
			$modal.open({
				templateUrl: 'about.html'
			});
		};
		$scope.showMethodology = function(){
			$modal.open({
				templateUrl: 'methodology.html'
			});
		};
		$scope.showDevelopers = function(){
			$modal.open({
				templateUrl: 'developers.html'
			});
		};
	}
]);
