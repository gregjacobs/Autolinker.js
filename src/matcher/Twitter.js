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
	 * This regular expression has no capturing groups.
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
	getNumCapturingGroups : function() {
		return 0;
	}

} );