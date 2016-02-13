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
		var emailRegex = /[\w\-;:&=+$.,]+@/,  // something@ for email addresses (a.k.a. local-part)
			domainNameRegex = Autolinker.matcher.domainNameRegex,
			tldRegex = Autolinker.matcher.tldRegex;  // match our known top level domains (TLDs)

		return new RegExp( [
			emailRegex.source,
			domainNameRegex.source,
			'\\.', tldRegex.source   // '.com', '.net', etc
		].join( "" ), 'gi' );
	} )(),


	/**
	 * @inheritdoc
	 */
	parseMatches : function( text ) {
		var matcherRegex = this.matcherRegex,
		    matches = [],
		    match;

		while( ( match = matcherRegex.exec( text ) ) !== null ) {
			var matchedText = match[ 0 ],
			    email = matchedText;

			matches.push( new Autolinker.match.Email( matchedText, match.index, email ) );
		}

		return matches;
	}

} );