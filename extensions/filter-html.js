/**
 * Copied from emment-app.js and overwritten
 * added 2create Formatting Standard
 *
 * -----------------------------------------------------------------------------
 * filter html
 * commented - so we can have new lines for empty tags (img, input);
 *   // item.end = '';
 *
 * filter _format_new
 * added
 *   func isLastChild()
 *
 *   // @hack - force new lines for inline elements
 *   profile.tag_nl = true;
 * -----------------------------------------------------------------------------
 * 
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {

	var _ = require('lodash');
	var abbrUtils = require('./utils/abbreviation');
	var utils = require('./utils/common');
	var tabStops = require('./assets/tabStops');
	var filters = require('filter/main');
	
	/**
	 * Creates HTML attributes string from tag according to profile settings
	 * @param {AbbreviationNode} node
	 * @param {OutputProfile} profile
	 */
	function makeAttributesString(node, profile) {
		var attrQuote = profile.attributeQuote();
		var cursor = profile.cursor();
		
		return _.map(node.attributeList(), function(a) {
			var isBoolean = profile.isBoolean(a.name, a.value);
			var attrName = profile.attributeName(a.name);
			var attrValue = isBoolean ? attrName : a.value;
			if (isBoolean && profile.allowCompactBoolean()) {
				return ' ' + attrName;
			}
			return ' ' + attrName + '=' + attrQuote + (attrValue || cursor) + attrQuote;
		}).join('');
	}
	
	/**
	 * Processes element with <code>tag</code> type
	 * @param {AbbreviationNode} item
	 * @param {OutputProfile} profile
	 */
	function processTag(item, profile) {
		if (!item.parent) { // looks like it's root element
			return item;
		}
		
		var attrs = makeAttributesString(item, profile); 
		var cursor = profile.cursor();
		var isUnary = abbrUtils.isUnary(item);
		var start = '';
		var end = '';
			
		// define opening and closing tags
		if (!item.isTextNode()) {
			var tagName = profile.tagName(item.name());
			if (isUnary) {
				start = '<' + tagName + attrs + profile.selfClosing() + '>';
				// @modified - empty tags should add new lines as well
        		// item.end = '';
			} else {
				start = '<' + tagName + attrs + '>';
				end = '</' + tagName + '>';
			}
		}
		
		var placeholder = '%s';
		// We can't just replace placeholder with new value because
		// JavaScript will treat double $ character as a single one, assuming
		// we're using RegExp literal.
		item.start = utils.replaceSubstring(item.start, start, item.start.indexOf(placeholder), placeholder);
		item.end = utils.replaceSubstring(item.end, end, item.end.indexOf(placeholder), placeholder);
		
		// should we put caret placeholder after opening tag?
		if (
				!item.children.length 
				&& !isUnary 
				&& !~item.content.indexOf(cursor)
				&& !tabStops.extract(item.content).tabstops.length
			) {
			item.start += cursor;
		}
		
		return item;
	}

	function process(tree, profile, level) {
		level = level || 0;
		
		if (!level) {
			tree = filters.apply(tree, '2c-indent', profile);
		}
		
		_.each(tree.children, function(item) {
			if (!abbrUtils.isSnippet(item)) {
				processTag(item, profile, level);
			}
			
			process(item, profile, level + 1);
		});
		
		return tree;
	}

	filters.add('html', process);

});
