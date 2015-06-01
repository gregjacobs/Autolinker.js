/*global Autolinker */
/**
 * @class Autolinker.matcher.Phone
 * @extends Autolinker.matcher.Matcher
 *
 * Matcher to find Phone number matches in an input string.
 *
 * See this class's superclass ({@link Autolinker.matcher.Matcher}) for more
 * details.
 */
Autolinker.matcher.Phone = Autolinker.Util.extend( Autolinker.matcher.Matcher, {

	/**
	 * @private
	 * @property {String} matcherRegexStr
	 *
	 * The regular expression string, which when compiled, will match Phone
	 * numbers. Example match:
	 *
	 *     (123) 456-7890
	 *
	 * This regular expression has no capturing groups.
	 */
	matcherRegexStr : /(?:\+?\d{1,3}[-\s.])?\(?\d{3}\)?[-\s.]?\d{3}[-\s.]\d{4}/.source,  // ex: (123) 456-7890, 123 456 7890, 123-456-7890, etc.


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
		// Remove non-numeric values from phone number string
		var cleanNumber = matchStr.replace( /\D/g, '' );

		var match = new Autolinker.match.Phone( {
			matchedText : matchStr,
			offset      : offset,
			number      : cleanNumber
		} );

		return new Autolinker.matcher.ReplacementDescriptor( match );
	}

} );