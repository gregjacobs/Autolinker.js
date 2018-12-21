import { Matcher, MatcherConfig } from "./matcher";
import { HashtagServices } from "../autolinker";
import { alphaNumericCharsStr } from "../regex-lib";
import { HashtagMatch } from "../match/hashtag-match";
import { Match } from "../match/match";

/**
 * @class Autolinker.matcher.Hashtag
 * @extends Autolinker.matcher.Matcher
 *
 * Matcher to find HashtagMatch matches in an input string.
 */
export class HashtagMatcher extends Matcher {

	/**
	 * @cfg {String} serviceName
	 *
	 * The service to point hashtag matches to. See {@link Autolinker#hashtag}
	 * for available values.
	 */
	private readonly serviceName: HashtagServices;


	/**
	 * The regular expression to match Hashtags. Example match:
	 *
	 *     #asdf
	 *
	 * @private
	 * @property {RegExp} matcherRegex
	 */
	matcherRegex = new RegExp( '#[_' + alphaNumericCharsStr + ']{1,139}', 'g' );

	/**
	 * The regular expression to use to check the character before a username match to
	 * make sure we didn't accidentally match an email address.
	 *
	 * For example, the string "asdf@asdf.com" should not match "@asdf" as a username.
	 *
	 * @private
	 * @property {RegExp} nonWordCharRegex
	 */
	nonWordCharRegex = new RegExp( '[^' + alphaNumericCharsStr + ']' );


	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the Match instance,
	 *   specified in an Object (map).
	 */
	constructor( cfg: HashtagMatcherConfig ) {
		super( cfg );

		this.serviceName = cfg.serviceName;
	}


	/**
	 * @inheritdoc
	 */
	parseMatches( text: string ) {
		let matcherRegex = this.matcherRegex,
		    nonWordCharRegex = this.nonWordCharRegex,
		    serviceName = this.serviceName,
		    tagBuilder = this.tagBuilder,
		    matches: Match[] = [],
		    match: RegExpExecArray | null;

		while( ( match = matcherRegex.exec( text ) ) !== null ) {
			let offset = match.index,
			    prevChar = text.charAt( offset - 1 );

			// If we found the match at the beginning of the string, or we found the match
			// and there is a whitespace char in front of it (meaning it is not a '#' char
			// in the middle of a word), then it is a hashtag match.
			if( offset === 0 || nonWordCharRegex.test( prevChar ) ) {
				let matchedText = match[ 0 ],
				    hashtag = match[ 0 ].slice( 1 );  // strip off the '#' character at the beginning

				matches.push( new HashtagMatch( {
					tagBuilder  : tagBuilder,
					matchedText : matchedText,
					offset      : offset,
					serviceName : serviceName,
					hashtag     : hashtag
				} ) );
			}
		}

		return matches;
	}

}

export interface HashtagMatcherConfig extends MatcherConfig {
	serviceName: HashtagServices
}