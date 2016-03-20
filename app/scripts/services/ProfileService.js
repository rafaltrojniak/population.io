angular.module('populationioApp').service('ProfileService',
	function(){
		'use strict';
		return {
			gender: 'female',
			birthday: {year: null, month: null, day: null, formatted: ''},
			country: '',
			active: false,
			getAge: function(){
				var ageDate = new Date(Date.now() - (new Date(this.birthday.formatted)).getTime());
				return Math.abs(ageDate.getUTCFullYear() - 1970);
			},
			getAgeString: function(){
				var ageDate = new Date(Date.now() - (new Date(this.birthday.formatted)).getTime());
				var year = Math.abs(ageDate.getUTCFullYear() - 1970),
					months = ageDate.getMonth();
				return year + 'y' + months + 'm';
			}
		};
	}
);
