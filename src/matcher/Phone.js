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
	matcherRegex : /(?:(\+)?\d{1,3}[-\040.])?\(?\d{3}\)?[-\040.]?\d{3}[-\040.]\d{4}/g,  // ex: (123) 456-7890, 123 456 7890, 123-456-7890, etc.

	/**
	 * @inheritdoc
	 */
	parseMatches : function( text ) {
		var matcherRegex = this.matcherRegex,
		    matches = [],
		    match;

		while( ( match = matcherRegex.exec( text ) ) !== null ) {
			// Remove non-numeric values from phone number string
			var cleanNumber = match[ 0 ].replace( /\D/g, '' );

			matches.push( new Autolinker.match.Phone( {
				matchedText : match[ 0 ],
				plusSign    : !!match[ 1 ],  // match[ 1 ] is the prefixed plus sign, if there is one
				offset      : match.index,
				number      : cleanNumber
			} ) );
		}

		return matches;
	}

} );