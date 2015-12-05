/*global Autolinker */
/**
 * @abstract
 * @class Autolinker.matcher.Matcher
 *
 * An abstract class and interface for individual matchers to replace matches in an input
 * string with linkified versions of them.
 */
Autolinker.matcher.Matcher = Autolinker.Util.extend( Object, {

	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the Matcher
	 *   instance, specified in an Object (map).
	 */
	constructor : function( cfg ) {
		Autolinker.Util.assign( this, cfg );
	},
	
	
	/**
	 * Parses the input `text` and returns the array of {@link Match Matches} for the 
	 * matcher.
	 * 
	 * @abstract
	 * @param {String} text The text to scan and replace matches in.
	 * @return {Autolinker.match.Match[]}
	 */
	parseMatches : Autolinker.Util.abstractMethod

} );