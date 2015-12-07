/*global Autolinker */
/**
 * @class Autolinker.matcher.Hashtag
 * @extends Autolinker.matcher.Matcher
 *
 * Matcher to find Hashtag matches in an input string.
 */
Autolinker.matcher.Hashtag = Autolinker.Util.extend( Autolinker.matcher.Matcher, {

	/**
	 * @cfg {String} serviceName
	 *
	 * The service to point hashtag matches to. See {@link Autolinker#hashtag}
	 * for available values.
	 */

	/**
	 * The regular expression to match Hashtags. Example match:
	 *
	 *     #asdf
	 *
	 * @private
	 * @property {RegExp} matcherRegex
	 */
	matcherRegex : /#\w{1,139}/g,

	/**
	 * The regular expression to use to check the character before a username match to
	 * make sure we didn't accidentally match an email address.
	 *
	 * For example, the string "asdf@asdf.com" should not match "@asdf" as a username.
	 *
	 * @private
	 * @property {RegExp} nonWordCharRegex
	 */
	nonWordCharRegex : /[^\w]/,


	// @if DEBUG
	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the Match instance,
	 *   specified in an Object (map).
	 */
	constructor : function() {
		Autolinker.matcher.Matcher.prototype.constructor.apply( this, arguments );

		// TODO: if( !this.serviceName ) throw new Error( '`serviceName` cfg required' );
	},
	// @endif


	/**
	 * @inheritdoc
	 */
	parseMatches : function( text ) {
		var matcherRegex = this.matcherRegex,
		    nonWordCharRegex = this.nonWordCharRegex,
		    matches = [],
		    match;

		while( ( match = matcherRegex.exec( text ) ) !== null ) {
			var offset = match.index,
			    prevChar = text.charAt( offset - 1 );

			// If we found the match at the beginning of the string, or we found the match
			// and there is a whitespace char in front of it (meaning it is not a '#' char
			// in the middle of a word), then it is a hashtag match.
			if( offset === 0 || nonWordCharRegex.test( prevChar ) ) {
				matches.push( new Autolinker.match.Hashtag( {
					matchedText : match[ 0 ],
					offset      : offset,
					serviceName : this.serviceName,
					hashtag     : match[ 0 ].slice( 1 )  // strip off the '#' character at the beginning
				} ) );
			}
		}

		return matches;
	}

} );