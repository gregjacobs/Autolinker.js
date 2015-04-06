/*global Autolinker */
/**
 * @class Autolinker.matcher.Twitter
 * @extends Autolinker.matcher.Matcher
 *
 * Matcher to find Twitter matches in an input string.
 *
 * See this class's superclass ({@link Autolinker.matcher.Matcher}) for more
 * details.
 */
Autolinker.matcher.Twitter = Autolinker.Util.extend( Autolinker.matcher.Matcher, {

	/**
	 * @private
	 * @property {String} matcherRegexStr
	 *
	 * The regular expression string, which when compiled, will match Twitter
	 * handles. Example match:
	 *
	 *     @asdf
	 *
	 * 1. The whitespace character before the @sign in a Twitter handle. This is
	 *    needed because there are no look-behinds in JS regular expressions to
	 *    tell us if the match was mid-word, and is needed to reconstruct the
	 *    original string for the replacement.
	 * 2. The Hashtag itself in a Hashtag match. If the matching string is
	 *    '#someHashtag', the hashtag is 'someHashtag'.
	 */
	matcherRegexStr : /(^|[^\w])@(\w{1,15})/.source,


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
		var twitterHandlePrefixWhitespaceChar = capturingGroups[ 0 ],
		    twitterHandle = capturingGroups[ 1 ],
			prefixStr = '';

		// fix up the `matchStr` if there was a preceding whitespace char,
		// which was needed to determine the match itself (since there are
		// no look-behinds in JS regexes)
		if( twitterHandlePrefixWhitespaceChar ) {
			prefixStr = twitterHandlePrefixWhitespaceChar;
			matchStr = matchStr.slice( 1 );  // remove the prefixed whitespace char from the match
			offset += 1;  // the '@' character is the next character in the match after the whitespace char, so fix the offset
		}

		var match = new Autolinker.match.Twitter( {
			matchedText   : matchStr,
			offset        : offset,
			twitterHandle : twitterHandle
		} );

		return new Autolinker.matcher.ReplacementDescriptor( match, prefixStr );
	}

} );