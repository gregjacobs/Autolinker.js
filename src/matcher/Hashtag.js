/*global Autolinker */
/**
 * @class Autolinker.matcher.Hashtag
 * @extends Autolinker.matcher.Matcher
 *
 * Matcher to find Hashtag matches in an input string.
 *
 * See this class's superclass ({@link Autolinker.matcher.Matcher}) for more
 * details.
 */
Autolinker.matcher.Hashtag = Autolinker.Util.extend( Autolinker.matcher.Matcher, {

	/**
	 * @cfg {String} serviceName (required)
	 *
	 * The service to point hashtag matches to. See {@link Autolinker#hashtag}
	 * for available values.
	 */

	/**
	 * @private
	 * @property {String} matcherRegexStr
	 *
	 * The regular expression string, which when compiled, will match Hashtags.
	 * Example match:
	 *
	 *     #asdf
	 *
	 * This regular expression has the following capturing groups:
	 *
	 * 1. The whitespace character before the #sign in a Hashtag. This is needed
	 *    because there are no look-behinds in JS regular expressions to tell us
	 *    if the match was mid-word, and is needed to reconstruct the original
	 *    string for the replacement.
	 * 2. The Hashtag itself in a Hashtag match. If the matching string is
	 *    '#someHashtag', the hashtag is 'someHashtag'.
	 */
	matcherRegexStr : /(^|[^\w])#(\w{1,15})/.source,


	// @if DEBUG
	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the Match instance,
	 *   specified in an Object (map).
	 */
	constructor : function() {
		Autolinker.matcher.Matcher.prototype.constructor.apply( this, arguments );

		if( !this.serviceName ) throw new Error( '`serviceName` cfg required' );
	},
	// @endif


	/**
	 * @inheritdoc
	 */
	getMatcherRegexStr : function() {
		return this.matcherRegexStr;
	},


	/**
	 * @inheritdoc
	 */
	processCandidateMatch : function( matchStr, capturingGroups, offset ) {
		var hashtagPrefixWhitespaceChar = capturingGroups[ 0 ],
			hashtag = capturingGroups[ 1 ],
			prefixStr = '';

		// fix up the `matchStr` if there was a preceding whitespace char,
		// which was needed to determine the match itself (since there are
		// no look-behinds in JS regexes)
		if( hashtagPrefixWhitespaceChar ) {
			prefixStr = hashtagPrefixWhitespaceChar;
			matchStr = matchStr.slice( 1 );  // remove the prefixed whitespace char from the match
			offset += 1;  // the '#' character is the next character in the match after the whitespace char, so fix the offset
		}

		var match = new Autolinker.match.Hashtag( {
			matchedText : matchStr,
			offset      : offset,
			serviceName : this.serviceName,
			hashtag     : hashtag
		} );

		return new Autolinker.matcher.ReplacementDescriptor( match, prefixStr );
	}

} );