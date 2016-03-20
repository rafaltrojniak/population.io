angular.module('populationioApp').service('BrowserService',
	function(){
		'use strict';
		return {
			isSupported: function(){
				return bowser.webkit || bowser.gecko || (bowser.msie && bowser.version > 10);
			}
		};
	}
);
