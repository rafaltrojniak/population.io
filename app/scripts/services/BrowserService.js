'use strict';
angular.module('populationioApp').service('BrowserService',
	function(){
		return {
			isSupported: function(){
				return bowser.webkit || bowser.gecko || (bowser.msie && bowser.version > 10);
			}
		};
	}
);
