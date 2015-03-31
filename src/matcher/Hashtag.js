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
	 * 1. The whitespace character before the #sign in a Hashtag handle. This
	 *    is needed because there are no look-behinds in JS regular
	 *    expressions, and can be used to reconstruct the original string in a
	 *    replace().
	 * 2. The Hashtag itself in a Hashtag match. If the matching string is
	 *    '#someHashtag', the hashtag is 'someHashtag'.
	 */
	matcherRegexStr : /(^|[^\w])#(\w{1,15})/.source,


	/**
	 * @inheritdoc
	 */
	getMatcherRegexStr : function() {
		return this.matcherRegexStr;
	},


	/**
	 * @inheritdoc
	 */
	getNumCapturingGroups : function() {
		return 2;
	}

} );