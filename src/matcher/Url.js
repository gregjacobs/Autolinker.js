/*global Autolinker */
/**
 * @class Autolinker.matcher.Url
 * @extends Autolinker.matcher.Matcher
 *
 * Matcher to find URL matches in an input string.
 *
 * See this class's superclass ({@link Autolinker.matcher.Matcher}) for more details.
 */
Autolinker.matcher.Url = Autolinker.Util.extend( Autolinker.matcher.Matcher, {

	/**
	 * @private
	 * @property {String} matcherRegexStr
	 *
	 * The regular expression string, which when compiled, will match URLs with
	 * an optional protocol, port number, path, query string, and hash anchor.
	 * Example matches:
	 *
	 *     http://google.com
	 *     www.google.com
	 *     google.com/path/to/file?q1=1&q2=2#myAnchor
	 *
	 *
	 * This regular expression will have the following capturing groups:
	 *
	 * 1.  Group that matches a protocol URL (i.e. 'http://google.com'). This is
	 *     used to match protocol URLs with just a single word, like 'http://localhost',
	 *     where we won't double check that the domain name has at least one '.'
	 *     in it.
	 * 2.  A protocol-relative ('//') match for the case of a 'www.' prefixed
	 *     URL. Will be an empty string if it is not a protocol-relative match.
	 *     We need to know the character before the '//' in order to determine
	 *     if it is a valid match or the // was in a string we don't want to
	 *     auto-link.
	 * 3.  A protocol-relative ('//') match for the case of a known TLD prefixed
	 *     URL. Will be an empty string if it is not a protocol-relative match.
	 *     See #6 for more info.
	 */
	matcherRegexStr : (function() {
		var protocolRegex = /(?:[A-Za-z][-.+A-Za-z0-9]+:(?![A-Za-z][-.+A-Za-z0-9]+:\/\/)(?!\d+\/?)(?:\/\/)?)/,  // match protocol, allow in format "http://" or "mailto:". However, do not match the first part of something like 'link:http://www.google.com' (i.e. don't match "link:"). Also, make sure we don't interpret 'google.com:8000' as if 'google.com' was a protocol here (i.e. ignore a trailing port number in this regex)
		    wwwRegex = /(?:www\.)/,                  // starting with 'www.'
		    domainNameRegex = Autolinker.matcher.domainNameRegex,
		    tldRegex = Autolinker.matcher.tldRegex,  // match our known top level domains (TLDs)

		    // Allow optional path, query string, and hash anchor, not ending in the following characters: "?!:,.;"
		    // http://blog.codinghorror.com/the-problem-with-urls/
		    urlSuffixRegex = /[\-A-Za-z0-9+&@#\/%=~_()|'$*\[\]?!:,.;]*[\-A-Za-z0-9+&@#\/%=~_()|'$*\[\]]/;

		return [
			'(?:', // parens to cover match for protocol (optional), and domain
				'(',  // *** Capturing group $1, for a protocol-prefixed url (ex: http://google.com)
					protocolRegex.source,
					domainNameRegex.source,
				')',

				'|',

				'(?:',  // non-capturing paren for a 'www.' prefixed url (ex: www.google.com)
					'(.?//)?',  // *** Capturing group $2 for an optional protocol-relative URL. Must be at the beginning of the string or start with a non-word character
					wwwRegex.source,
					domainNameRegex.source,
				')',

				'|',

				'(?:',  // non-capturing paren for known a TLD url (ex: google.com)
					'(.?//)?',  // *** Capturing group $3 for an optional protocol-relative URL. Must be at the beginning of the string or start with a non-word character
					domainNameRegex.source + '\\.',
					tldRegex.source,
				')',
			')',

			'(?:' + urlSuffixRegex.source + ')?'  // match for path, query string, and/or hash anchor - optional
		].join( "" );
	} )(),


	/**
	 * @private
	 * @property {RegExp} charBeforeProtocolRelMatchRegex
	 *
	 * The regular expression used to retrieve the character before a
	 * protocol-relative URL match.
	 *
	 * This is used in conjunction with the {@link #matcherRegex}, which needs
	 * to grab the character before a protocol-relative '//' due to the lack of
	 * a negative look-behind in JavaScript regular expressions. The character
	 * before the match is stripped from the URL.
	 */
	charBeforeProtocolRelMatchRegex : /^(.)?\/\//,


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
		return 3;
	}

} );