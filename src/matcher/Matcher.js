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
	 * expressions for other requested matchers to provide a single regular
	 * expression to scan and find matches in the input string. It is then
	 * instantiated with the 'gi' (global and case-insensitive).
	 *
	 * @abstract
	 * @return {String}
	 */
	getMatcherRegexStr : Autolinker.Util.abstractMethod,


	/**
	 * Returns the number of capturing groups in the regular expression returned
	 * by {@link #getMatcherRegex}.
	 *
	 * This is needed by the {@link MatcherEngine} so that it can determine
	 * which capturing groups belong to which {@link Matcher Matchers}. In the
	 * future, this may be handled automatically by using a simple regex parser,
	 * but for now simplicity dictates to just provide it.
	 *
	 * Note: Must be kept in sync with the regular expression returned by
	 * {@link #getMatcherRegex}!
	 *
	 * @abstract
	 * @return {Number}
	 */
	getNumCapturingGroups : Autolinker.Util.abstractMethod,


	/**
	 *
	 *
	 * @abstract
	 * @return {Autolinker.matcher.MatchDescriptor}
	 */
	processCandidateMatch : Autolinker.Util.abstractMethod

} );