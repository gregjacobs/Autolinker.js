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
	 * 1. The prefixed '+' sign, if there is one.
	 *
	 * @private
	 * @property {RegExp} matcherRegex
	 */
    matcherRegex : /(?:(\+)?\d{1,3}[-\040.]?)?\(?\d{3}\)?[-\040.]?\d{3}[-\040.]?\d{4}([,;]*[0-9]+#?)*/g,    
    
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
				plusSign = !!match[1]; // match[ 1 ] is the prefixed plus sign, if there is one
			if (this.testMatch(match[2]) && this.testMatch(matchedText)) {
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
