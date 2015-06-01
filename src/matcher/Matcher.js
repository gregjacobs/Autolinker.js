/*global Autolinker */
/**
 * @abstract
 * @class Autolinker.matcher.Matcher
 *
 * An abstract class and interface for individual matchers to provide their
 * regular expressions and processing functionality to the {@link MatcherEngine}.
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
	 * Returns the regular expression *string* that should be used to find
	 * matches in the input string.
	 *
	 * This regular expression string is combined (OR'd) with the regular
	 * expressions for other requested Matchers to provide a single regular
	 * expression to scan and find matches in the input string. It is
	 * instantiated with the 'gi' flags (global and case-insensitive).
	 *
	 * @abstract
	 * @return {String}
	 */
	getMatcherRegexStr : Autolinker.Util.abstractMethod,


	/**
	 * Processes a candidate match found by the {@link Autolinker.matcher.MatcherEngine}.
	 *
	 * @abstract
	 * @param {String} matchStr The full matching string that was found by the
	 *   regular expression returned by {@link #getMatcherRegexStr}.
	 * @param {String[]} capturingGroups An array of the capturing group
	 *   matches. Note: This array starts at index 0 (like all arrays), where
	 *   the element at index 0 would normally correspond to '$1'.
	 * @param {Number} offset The offset in the original input string that the
	 *   match was made on.
	 * @return {Autolinker.matcher.MatchDescriptor} The MatchDescriptor object
	 *   used to tell the MatcherEngine how to replace the match, or `null` if
	 *   no replacement should occur.
	 */
	processCandidateMatch : Autolinker.Util.abstractMethod

} );