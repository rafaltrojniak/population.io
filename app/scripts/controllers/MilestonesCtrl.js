angular.module('populationioApp').controller('MilestonesCtrl', [
	'$scope', '$rootScope', '$state', '$filter', '$sce', 'ProfileService', 'PopulationIOService',
	function($scope, $rootScope, $state, $filter, $sce, ProfileService, PopulationIOService){
		'use strict';
		var translate = $filter('translate');
		var getMilestoneTitle = function(title){
			switch(title){
				case 'lifeExpWorld':
					return translate('MILESTONES_MILESTONE_LIFE_EXPECTANCY') + translate('LOCAL_WORLD');
				case 'lifeExpCountry':
					return translate('MILESTONES_MILESTONE_LIFE_EXPECTANCY') + ProfileService.country;
				case 'ORDINAL_NUMBER_1':
					return translate('MILESTONES_MILESTONE_1_BILLION');
				case 'ORDINAL_NUMBER_2':
					return translate('MILESTONES_MILESTONE_2_BILLION');
				case 'ORDINAL_NUMBER_3':
					return translate('MILESTONES_MILESTONE_3_BILLION');
				case 'ORDINAL_NUMBER_4':
					return translate('MILESTONES_MILESTONE_4_BILLION');
				case 'ORDINAL_NUMBER_5':
					return translate('MILESTONES_MILESTONE_5_BILLION');
				case 'ORDINAL_NUMBER_6':
					return translate('MILESTONES_MILESTONE_6_BILLION');
				case 'ORDINAL_NUMBER_7':
					return translate('MILESTONES_MILESTONE_7_BILLION');
				case 'ORDINAL_NUMBER_8':
					return translate('MILESTONES_MILESTONE_8_BILLION');
				case 'ORDINAL_NUMBER_9':
					return translate('MILESTONES_MILESTONE_9_BILLION');
				case 'ORDINAL_NUMBER_10':
					return translate('MILESTONES_MILESTONE_10_BILLION');
				case 'ORDINAL_NUMBER_11':
					return translate('MILESTONES_MILESTONE_11_BILLION');
				default:
					return translate(title);
			}
		};
		$scope.$on('languageChange', function(){
			$scope.milestoneCounter = translate($scope.atomicNumber);
			if($scope.milestonesData){
				for(var i = 0; i < $scope.milestonesData.length; i += 1){
					$scope.milestonesData[i].title = getMilestoneTitle($scope.milestonesData[i].titleType);
				}
			}
		});
		var _getDateWithOffset = function(date, offset){
			var year = parseInt($filter('date')(date, 'yyyy'), 0),
				month = parseInt($filter('date')(date, 'M'), 0) - 1,
				day = $filter('date')(date, 'dd');
			return new Date(parseInt(year + offset, 0), month, day);
		};
		var _loadLifeExpectancyRemaining = function(country, onSuccess){
			$scope.$root.loading += 1;
			PopulationIOService.loadLifeExpectancyRemaining({
				sex: ProfileService.gender,
				country: country,
				date: $filter('date')(new Date(), 'yyyy-MM-dd'),
				age: ProfileService.getAgeString()
			}, function(remainingLife){
				var today = new Date();
				var date = today.setDate(today.getDate() + (remainingLife * 365));
				$scope.milestonesData.push({
					date: $filter('date')(date, 'yyyy-MM-dd'),
					year: $filter('date')(date, 'yyyy'),
					titleType: (country === 'World' ? 'lifeExpWorld' : 'lifeExpCountry'),
					title: translate('MILESTONES_MILESTONE_LIFE_EXPECTANCY') + (country === 'World' ? translate('LOCAL_WORLD') : country)
				});
				if(onSuccess){
					onSuccess(remainingLife);
				}
				$scope.$root.loading -= 1;
			}, function(){
				$scope.$root.loading -= 1;
			});
		};
		var _loadWpRankRanked = function(rank, atomicNumber){
			$scope.atomicNumber = atomicNumber;
			var _isDateGreaterThenToday = function(date){
				return new Date(date) >= new Date();
			};
			var _updateTitleAlive = function(date, atomicNumber){
				$scope.milestoneDate = $filter('date')(date, 'd MMM, yyyy');
				$scope.milestoneCounter = translate(atomicNumber);
			};
			$scope.$root.loading += 1;
			var dayOfDeath = new Date(ProfileService.dod);
			var formatted = ProfileService.getFormattedBirthday();
			PopulationIOService.loadWpRankRanked({
				dob: formatted,
				sex: 'unisex',
				country: 'World',
				rank: rank
			}, function(date){
				$scope.$root.loading -= 1;
				var loadedDate = new Date(date);
				// Show only milestones that are expected to be during ones life.
				if(dayOfDeath < loadedDate){
					return;
				}
				if(_isDateGreaterThenToday(date)){
					if(loadedDate < $scope.nextYear || !$scope.nextYear){
						_updateTitleAlive(date, atomicNumber);
						$scope.nextYear = loadedDate;
					}
				}
				$scope.milestonesData.push({
					date: date,
					rank: true,
					titleType: atomicNumber,
					year: $filter('date')(date, 'yyyy'),
					title: getMilestoneTitle(atomicNumber)
				});
			}, function(){
				$scope.$root.loading -= 1;
			});
		};
		var _getInitialMilestonesData = function(){
			var milestoneNow = translate('MILESTONES_MILESTONE_NOW');
			var milestoneBorn = translate('MILESTONES_MILESTONE_BORN');
			var milestone18 = translate('MILESTONES_MILESTONE_18');
			return [
				{
					date: $filter('date')(Date.now(), 'yyyy-MM-dd'),
					year: $filter('date')(Date.now(), 'yyyy'),
					title: milestoneNow,
					titleType: 'MILESTONES_MILESTONE_NOW',
					selected: true,
					now: true
				},
				{
					date: ProfileService.getFormattedBirthday(),
					year: ProfileService.birthday.year,
					title: milestoneBorn,
					titleType: 'MILESTONES_MILESTONE_BORN',
					born: true
				},
				{
					date: _getDateWithOffset(new Date(ProfileService.getFormattedBirthday()), 18),
					year: $filter('date')(_getDateWithOffset(
						new Date(ProfileService.getFormattedBirthday()),
						18
					), 'yyyy'),
					title: milestone18,
					titleType: 'MILESTONES_MILESTONE_18'
				}
			];
		};
		$scope.highlightMilestone = function(item){
			if($scope.milestonesData){
				_($scope.milestonesData).each(function(milestone){
					milestone.selected = false;
				});
			}
			item.selected = true;
			$scope.selectedYear = item.year;
			var selectedExactDate = item.date.split('-'); // 2020-07-28
			var yearsOnSelectedMilestone = selectedExactDate[0] - ProfileService.birthday.year;
			if(ProfileService.birthday.month > selectedExactDate[1]){
				yearsOnSelectedMilestone -= 1;
			} else if(ProfileService.birthday.month === selectedExactDate[1] && ProfileService.birthday.day > selectedExactDate[2]){
				yearsOnSelectedMilestone -= 1;
			}
			$scope.age = yearsOnSelectedMilestone;
			PopulationIOService.loadPopulation({
				year: $scope.selectedYear,
				country: ProfileService.country
			}, function(data){
				$scope.localRankData = data;
			});
			PopulationIOService.loadPopulation({
				year: $scope.selectedYear,
				country: 'World'
			}, function(data){
				$scope.globalRankData = data;
			});
		};
		$scope.dateOrder = function(item){
			return (new Date(item.date)).getTime();
		};
		$scope.$root.$on('selectedYearChanged', function($event, item){
			$scope.highlightMilestone(item);
		});
		$scope.$on('rankGlobalChanged', function(e, rankGlobal){
			$scope.rankGlobal = rankGlobal;
		});
		$scope.$on('rankLocalChanged', function(e, rankLocal){
			$scope.rankLocal = rankLocal;
		});
		$scope.$on('profileUpdated', function(){
			$scope.age = ProfileService.getAge();
			$scope.year = $filter('date')(new Date(), 'yyyy');
			$scope.country = ProfileService.country;
			$scope.milestonesData = _getInitialMilestonesData();
			$scope.nextYear = null; // This is required for next milestone to reload properly

			_loadLifeExpectancyRemaining(ProfileService.country, function(remainingLife){
				var today = new Date();
				var date = today.setDate(today.getDate() + (remainingLife * 365));
				ProfileService.dod = date;
				_loadWpRankRanked(10000000000, 'ORDINAL_NUMBER_10');
				_loadWpRankRanked(9000000000, 'ORDINAL_NUMBER_9');
				_loadWpRankRanked(8000000000, 'ORDINAL_NUMBER_8');
				_loadWpRankRanked(7000000000, 'ORDINAL_NUMBER_7');
				_loadWpRankRanked(6000000000, 'ORDINAL_NUMBER_6');
				_loadWpRankRanked(5000000000, 'ORDINAL_NUMBER_5');
				_loadWpRankRanked(4000000000, 'ORDINAL_NUMBER_4');
				_loadWpRankRanked(3000000000, 'ORDINAL_NUMBER_3');
				_loadWpRankRanked(2000000000, 'ORDINAL_NUMBER_2');
				_loadWpRankRanked(1000000000, 'ORDINAL_NUMBER_1');
				$scope.titleDie = $sce.trustAsHtml([
					'You are expected to die on <span>',
					$filter('ordinal')($filter('date')(date, 'd')) + ' ',
					$filter('date')(date, 'MMM, yyyy') + '</span>'
				].join(''));
			});
			_loadLifeExpectancyRemaining('World');
		});
	}
]);
