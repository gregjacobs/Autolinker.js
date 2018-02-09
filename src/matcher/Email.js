/*global Autolinker */
/**
 * @class Autolinker.matcher.Email
 * @extends Autolinker.matcher.Matcher
 *
 * Matcher to find email matches in an input string.
 *
 * See this class's superclass ({@link Autolinker.matcher.Matcher}) for more details.
 */
Autolinker.matcher.Email = Autolinker.Util.extend( Autolinker.matcher.Matcher, {

	/**
	 * The regular expression to match email addresses. Example match:
	 *
	 *     person@place.com
	 *
	 * @private
	 * @property {RegExp} matcherRegex
	 */
	matcherRegex : (function() {
		var alphaNumericChars = Autolinker.RegexLib.alphaNumericCharsStr,
			specialCharacters = '!#$%&\'*+\\-\\/=?^_`{|}~',
			restrictedSpecialCharacters = '\\s"(),:;<>@\\[\\]',
			validCharacters = alphaNumericChars + specialCharacters,
			validRestrictedCharacters = validCharacters + restrictedSpecialCharacters,
		    emailRegex = new RegExp( '(?:[' + validCharacters + '](?:[' + validCharacters + ']|\\.(?!\\.|@))*|\\"[' + validRestrictedCharacters + '.]+\\")@'),
			getDomainNameStr = Autolinker.RegexLib.getDomainNameStr,
			tldRegex = Autolinker.tldRegex;  // match our known top level domains (TLDs)

		return new RegExp( [
			emailRegex.source,
			getDomainNameStr(1),
			'\\.', tldRegex.source   // '.com', '.net', etc
		].join( "" ), 'gi' );
	} )(),


	/**
	 * @inheritdoc
	 */
	parseMatches : function( text ) {
		var matcherRegex = this.matcherRegex,
		    tagBuilder = this.tagBuilder,
		    matches = [],
		    match;

		while( ( match = matcherRegex.exec( text ) ) !== null ) {
			var matchedText = match[ 0 ];

			matches.push( new Autolinker.match.Email( {
				tagBuilder  : tagBuilder,
				matchedText : matchedText,
				offset      : match.index,
				email       : matchedText
			} ) );
		}

		return matches;
	}

} );
