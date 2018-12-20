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
	 * The regular expression to match Phone numbers. Example match:
	 *
	 *     (123) 456-7890
	 *
	 * This regular expression has the following capturing groups:
	 *
	 * 1 or 2. The prefixed '+' sign, if there is one.
	 *
	 * @private
	 * @property {RegExp} matcherRegex
	 */
	matcherRegex : /(?:(?:(?:(\+)?\d{1,3}[-\040.]?)?\(?\d{3}\)?[-\040.]?\d{3}[-\040.]?\d{4})|(?:(\+)(?:9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)[-\040.]?(?:\d[-\040.]?){6,12}\d+))([,;]+[0-9]+#?)*/g,

	// ex: (123) 456-7890, 123 456 7890, 123-456-7890, +18004441234,,;,10226420346#,
	// +1 (800) 444 1234, 10226420346#, 1-800-444-1234,1022,64,20346#

	/**
	 * @inheritdoc
	 */
	parseMatches: function(text) {
		var matcherRegex = this.matcherRegex,
			tagBuilder = this.tagBuilder,
			matches = [],
			match;

		while ((match = matcherRegex.exec(text)) !== null) {
			// Remove non-numeric values from phone number string
			var matchedText = match[0],
				cleanNumber = matchedText.replace(/[^0-9,;#]/g, ''), // strip out non-digit characters exclude comma semicolon and #
				plusSign = !!(match[1] || match[2]), // match[ 1 ] or match[ 2 ] is the prefixed plus sign, if there is one
				before = match.index == 0 ? '' : text.substr(match.index - 1, 1),
				after = text.substr(match.index + matchedText.length, 1),
				contextClear = !before.match(/\d/) && !after.match(/\d/);

			if (this.testMatch(match[3]) && this.testMatch(matchedText) && contextClear) {
				matches.push(new Autolinker.match.Phone({
					tagBuilder: tagBuilder,
					matchedText: matchedText,
					offset: match.index,
					number: cleanNumber,
					plusSign: plusSign
				}));
			}
		}

		return matches;
	},

	testMatch: function(text) {
		return /\D/.test(text);
	}

} );
