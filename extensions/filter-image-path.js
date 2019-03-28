/**
 * Filter for adding default image path
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var _       = require('lodash');
	var filters = require('filter/main');

	function addDefaultImagePath(item){

		var itemStart = item.start;

		// check if the tag is img
		if( item.name() != 'img' ) {
			return itemStart;
		}

		var srcValue = '';
		for(var i in item._attributes) {
			if( item._attributes[i]['name'].toLowerCase() == 'src' ) {
				if( item._attributes[i]['value'] != '' ) {
					srcValue = item._attributes[i]['value'];
					break;
				}

			}
		}

		// check if there is other path already - look for "/"
		if( srcValue.indexOf('/') != -1 ) {
			return itemStart;
		}

		// hardcoded default image path
		var defaultPath = 'css/images/temp/';

		// no paths found, add ours
		// check if the default path is there
		return itemStart.replace('src="', 'src="' + defaultPath);
	}

	function process(tree) {
		_.each(tree.children, function(item) {
			item.start = addDefaultImagePath(item);
			process(item);
		});

		return tree;
	}

	filters.add('2c-image-path', process);
});
