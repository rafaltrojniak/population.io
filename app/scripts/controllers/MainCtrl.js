'use strict';
angular.module('populationioApp').controller('MainCtrl', [
	'$translate', '$scope', '$timeout', '$http', '$interval', '$modal', '$state', '$location', '$document', '$rootScope', '$filter',
	'ProfileService', 'PopulationIOService', 'BrowserService', 'Countries',
	function($translate, $scope, $timeout, $http, $interval, $modal, $state, $location, $document, $rootScope, $filter, ProfileService,
	         PopulationIOService, BrowserService, Countries){
		$rootScope.$on('$translateChangeSuccess', function(){
			$scope.pageHeader = {
				title: $filter('translate')('HEADER_TITLE'),
				menuAbout: $filter('translate')('HEADER_MENU_ABOUT'),
				menuMethodology: $filter('translate')('HEADER_MENU_METHODOLOGY'),
				menuApi: $filter('translate')('HEADER_MENU_API')
			};
		});
		$scope.changeLanguage = function(langKey){
			$translate.use(langKey).then(function(){
				$scope.$broadcast('languageChange');
				$scope.updatePlaceholders();
			}, function(langKey){
				console.log("Something wrong with this language:", langKey);
			});
		};
		$scope.activeLangKey = $rootScope.defaultLanguage;
		$scope.updatePlaceholders = function(){
			$("#inputBirthDay").attr("placeholder", $filter('translate')('LOCAL_DAY')); //LOCAL_DAY
			$("#inputBirthMonth").attr("placeholder", $filter('translate')('LOCAL_MONTH')); //LOCAL_MONTH
			$("#inputBirthYear").attr("placeholder", $filter('translate')('LOCAL_YEAR')); //LOCAL_YEAR
			$("#inputBirthCountry").attr("placeholder", $filter('translate')('LOCAL_COUNTRY')); //LOCAL_COUNTRY
		};
		$scope.changeLanguage($rootScope.defaultLanguage);
		$rootScope.countriesList = function(newVal){
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
				return item.alias.toLowerCase().indexOf(newVal.toLowerCase()) > -1
			});
			if(foundAlias){
				alternativeName = foundAlias.country
			}
			var getCountryName = function(value){
				switch($scope.activeLangKey){
					case 'ES':
						return value.POPIO_NAME_ES;
						break;
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
		$scope.$watch(function(){
			return ProfileService.active;
		}, function(active){
			if(active){
				PopulationIOService.loadWpRankToday({
					dob: ProfileService.birthday.formatted,
					sex: 'unisex',
					country: 'World'
				}, function(rank){
					$scope.rankGlobal = rank;
					$rootScope.$broadcast('rankGlobalChanged', $scope.rankGlobal);
				});
				//console.log(ProfileService.country)
				PopulationIOService.getLocalPopulation(ProfileService.country, function(data){
					$scope.localPopulationToday = data.total_population[0].population;
					$scope.localPopulationTomorrow = data.total_population[1].population;
				});
				$timeout(function(){
					$scope.showSection($rootScope.target);
				}, 700);
			}
		});
		$rootScope.$on('$locationChangeSuccess', function(){
			var path = $location.$$path.replace(/.+[/](.*)$/g, '$1');
			if($location.preventReload){
				$location.preventReload = false;
				return;
			}
			// TODO: check the url path for date and section
			if(path && !ProfileService.active){
				$rootScope.expanded = true;
				var pathItems = $location.$$path.split('/'),
					year = pathItems[1],
					month = pathItems[2],
					day = pathItems[3],
					gender = pathItems[4],
					country = pathItems[5];
				if(['female', 'male'].indexOf(gender) > -1 &&
					country && year && month && day){
					ProfileService.gender = gender;
					ProfileService.country = country;
					//if ((new Date()).getFullYear() - parseInt(year) < 5) {
					//    alert('You are too young!');
					//    return;
					//}
					ProfileService.birthday = {year: year, month: month, day: day, formatted: [year, month, day].join('-')};
					$rootScope.target = path;
					$rootScope.$broadcast('ready');
					$scope.$broadcast('languageChange');
				}
			}
			if(path && ProfileService.active){
				$scope.showSection(path);
			}
		});
		$rootScope.$on('ready', function(){
			$scope.showSection('home');
			$scope.loading = 1;
		});
		$rootScope.$on('loadingOn', function(){
			$scope.loading = 1
		});
		$rootScope.$on('loadingOff', function(){
			$scope.loading = 0
		});
		$rootScope.$on('duScrollspy:becameActive', function($event, $element){
			var section = $element.prop('id');
			if(section){
				var path = $location.$$path.replace(/[^/]*$/g, ''),
					pathItems = $location.$$path.split('/');
				if(pathItems.length > 4){
					$location.preventReload = true;
					$location.path(path + section).replace();
					$rootScope.currentPage = $element.attr('data-index');
					$rootScope.$apply();
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
				dob = ProfileService.birthday.formatted,
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
