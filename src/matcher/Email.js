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
	 * @private
	 * @property {String} matcherRegexStr
	 *
	 * The regular expression string, which when compiled, will match email
	 * addresses. Example match:
	 *
	 *     person@place.com
	 *
	 * This regular expression has no capturing groups.
	 */
	matcherRegexStr : (function() {
		var emailRegex = /(?:[\-;:&=\+\$,\w\.]+@)/,  // something@ for email addresses (a.k.a. local-part)
			domainNameRegex = Autolinker.matcher.domainNameRegex,
			tldRegex = Autolinker.matcher.tldRegex;  // match our known top level domains (TLDs)

		return [
			emailRegex.source,
			domainNameRegex.source,
			tldRegex.source
		].join( "" );
	} )(),


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
		var match = new Autolinker.match.Email( {
			matchedText : matchStr,
			offset      : offset,
			email       : matchStr
		} );

		return new Autolinker.matcher.ReplacementDescriptor( match );
	}

} );