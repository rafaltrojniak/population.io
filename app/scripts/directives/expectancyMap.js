angular.module('populationioApp').directive('expectancyMap', function(){
	return {
		restrict: 'E',
		scope: {
			country: '=',
			reference: '=',
			width: '@',
			height: '@'
		},
		controller: 'ExpectancyMapComponentCtrl'
	};
});

angular.module('populationioApp').controller('ExpectancyMapComponentCtrl', [
	'$scope', '$element', '$translate', 'Countries', 'ProfileService', 'PopulationIOService',
	function($scope, $element, $translate, Countries, ProfileService, PopulationIOService){
		'use strict';
		var width = $scope.width || 1200;
		var height = $scope.height || 500;

		$scope.$root.$on('timesliderChanged', function(e, year){
			_loadLifeExpectancy('ref', new Date(year, 0, 1, 0, 0, 0), $scope.country);
			_loadLifeExpectancy('rel', new Date(year, 0, 1, 0, 0, 0), $scope.reference);
		});
		$scope.$watch('country', function(country){
			if(country){
				_loadLifeExpectancy('ref', new Date(), country);
			} else {
				d3.selectAll('.desc-ref').remove();
				d3.select('.country-ref').classed('country-active', false);
			}
		});
		$scope.$watch('reference', function(country){
			if(country){
				_loadLifeExpectancy('rel', new Date(), country);
			} else {
				d3.selectAll('.desc-rel').remove();
				d3.select('.country-rel').classed('country-active', false);
			}
		});

		// Create root element
		var root = d3.select($element[0]).append('svg').attr({
			'width': width,
			'height': height
		});
		root.append('g').attr({
			'class': 'countries'
		});
		var projection = d3.geo.robinson()
			.scale(181)
			.translate([width / 2, height / 1.80]);
		var path = d3.geo.path().projection(projection);
		var getCountryTitle = function(country){
			var result = Countries.filter(function(item){
				return item.GMI_CNTRY === country;
			});
			if(result.length > 0){
				return $translate.instant(result[0].POPIO_NAME);
			}
			return country;
		};
		$scope.$on('languageChange', function(){
			root.select('.countries').selectAll('.country').attr({
				'title': function(d){
					return getCountryTitle(d.properties.GMI_CNTRY);
				}
			});
		});
		// Load countries topographic data
		d3.json('/data/countries_topo.json', function(error, data){
			if(error){
				return console.error(error);
			}
			var countries = topojson.feature(data, data.objects.populationio_countries).features;
			// Create countries
			root.select('.countries').selectAll('.country')
				.data(countries)
				.enter()
				.insert('path')
				.attr({
					'class': 'country',
					'd': path,
					'data-id': function(d){
						return d.properties.GMI_CNTRY;
					},
					'title': function(d){
						return getCountryTitle(d.properties.GMI_CNTRY);
					}
				})
				.on('click', function(d){
					$scope.reference = Countries.filter(function(item){
						return item.GMI_CNTRY === d.properties.GMI_CNTRY;
					})[0].POPIO_NAME;
				});
		});

		var _addDescriptionLine = function(type, data){
			var countryId = data.country.GMI_CNTRY;
			var textHeight = 200;
			var node = d3.select('.country[data-id="' + countryId + '"]');
			if(!node[0][0]){
				return;
			}

			var bbox = node[0][0].getBBox();
			var center = {
				x: bbox.x + bbox.width / 2,
				y: bbox.y + bbox.height / 2
			};

			// handle overflow issue
			if(center.y < 20){
				center.y = 20;
			}
			if(center.y > height - 20){
				center.y = height - 20;
			}

			var _textTween = function(data, node, label, prefix){
				var value = Math.round(data * 10) / 10;
				var i = d3.interpolate(0, value);
				var prec = (value + '').split('.');
				var round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;

				return function(t){
					node.textContent = (prefix ? prefix + ' ' : '') + Math.round(i(t) * round) / round + (label ? ' ' + label : '');
				};
			};

			// remove previous lines and highlights
			d3.selectAll('.desc-' + type).remove();
			d3.select('.country-active.country-' + type).classed('country-active', false);
			node.classed('country-active', true);
			node.classed('country-' + type, true);
			var desc = root.append('g')
				.attr({
					'class': 'desc desc-' + type,
					transform: function(){
						return 'translate(' + [center.x, center.y] + ')';
					}
				});
			desc.append('line')
				.attr({
					'x1': 0,
					'y1': 0,
					'x2': 0,
					'y2': 0
				})
				.transition()
				.duration(1000)
				.attr({
					x1: 0,
					x2: function(){
						if(type === 'ref'){
							return -center.x;
						} else {
							return width - center.x;
						}
					}
				});
			var yearsLeftText = desc.append('g')
				.attr({
					'class': 'text-' + type,
					transform: function(){
						var pos = [],
							y = center.y + textHeight > height ? -textHeight : 0;
						if(type === 'ref'){
							pos = [-center.x, y];
						} else {
							pos = [width - center.x, y];
						}
						return 'translate(' + pos + ')';
					}
				});
			yearsLeftText.append('text')
				.text(0)
				.attr({
					'class': 'years-left',
					'transform': 'translate(0,45)'
				})
				.transition()
				.duration(1000)
				.tween('text', function(){
					return _textTween(data.yearsLeft, this);
				});
			var yearsLeftDescription = yearsLeftText.append('g').attr({
				'class': 'text-block',
				'transform': 'translate(0,70)'
			});

			yearsLeftDescription.append('text').text($translate.instant('EXPECTANCY_MAP_POINTER_1'));
			yearsLeftDescription.append('text')
				.attr({
					'y': 20
				})
				.text($translate.instant('EXPECTANCY_MAP_POINTER_2'))
				.append('tspan')
				.text($translate.instant(data.country.POPIO_NAME));

			var deathDate = moment(data.dod).format('DD MMM, YYYY');
			var estimationText = yearsLeftText.append('g').attr({
				'class': 'text-block',
				'transform': 'translate(0,120)'
			});
			estimationText.append('line').attr({
				'x1': 0,
				'y1': -20,
				'x2': 200 * (type === 'ref' ? 1 : -1),
				'y2': -20
			});
			estimationText.append('text')
				.attr('y', 0)
				.text($translate.instant('EXPECTANCY_MAP_POINTER_3'));
			estimationText.append('text')
				.text($translate.instant('EXPECTANCY_MAP_POINTER_4') + data.lifeExpectancy)
				.transition()
				.duration(1000)
				.tween('text', function(){
					return _textTween(
						data.lifeExpectancy,
						this,
						$translate.instant('EXPECTANCY_MAP_POINTER_5'),
						$translate.instant('EXPECTANCY_MAP_POINTER_4')
					);
				})
				.attr('y', 20);
			estimationText.append('text')
				.attr('y', 45)
				.text(deathDate)
				.style({
					'font-size': 20,
					'fill': '#444'
				});
		};

		var _loadLifeExpectancy = function(type, date, country){
			if (!country){
				return;
			}

			var age = ProfileService.getAge();
			var ageString = ProfileService.getAgeString();
			var ageDate = new Date(Date.now() - ProfileService.getBirthDate().getTime());
			var dateString = moment(date).format('YYYY-MM-DD');

			// Load current profile expectancy
			$scope.$root.loading += 1;
			PopulationIOService.loadLifeExpectancyRemaining({
				sex: ProfileService.gender,
				country: country,
				date: dateString,
				age: ageString
			}, function(remainingLife){
				$scope.$root.loading -= 1;
				var countryObject = Countries.filter(function(item){
					return item.POPIO_NAME === country;
				})[0];
				_addDescriptionLine(type, {
					country: countryObject,
					yearsLeft: remainingLife,
					lifeExpectancy: age + remainingLife + (ageDate.getMonth() / 11),
					dod: (function(){
						var today = new Date();
						return today.setDate(today.getDate() + (remainingLife * 365));
					})()
				});

				if (type !== 'ref') {
					return;
				}

				// Load all countries expectancy dates
				angular.forEach(Countries, function(item){
					var node = d3.select('.country[data-id="' + item.GMI_CNTRY + '"]');
					if (!node[0][0]){
						return;
					}

					$scope.$root.loading += 1;
					PopulationIOService.loadLifeExpectancyRemaining({
						sex: ProfileService.gender,
						country: item.POPIO_NAME,
						date: dateString,
						age: ageString
					}, function(countryRemainingLife){
						$scope.$root.loading -= 1;
						if (countryRemainingLife > remainingLife){
							node.classed('longer', true);
						}
						if (countryRemainingLife < remainingLife){
							node.classed('shorter', true);
						}
					});
				});
			});
		};
	}
]);
