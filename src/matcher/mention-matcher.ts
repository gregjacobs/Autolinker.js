import { Matcher, MatcherConfig } from "./Matcher";
import { alphaNumericCharsStr } from "../RegexLib";
import { MentionServices } from "../Autolinker";
import { MentionMatch } from "../match/Mention";
import { Match } from "../match/Match";

/**
 * @class Autolinker.matcher.Mention
 * @extends Autolinker.matcher.Matcher
 *
 * Matcher to find/replace username matches in an input string.
 */
export class MentionMatcher extends Matcher {
	private serviceName: MentionServices;

	/**
	 * Hash of regular expression to match username handles. Example match:
	 *
	 *     @asdf
	 *
	 * @private
	 * @property {Object} matcherRegexes
	 */
	private readonly matcherRegexes: {[key: string]: RegExp} = {
		'twitter': new RegExp( '@[_' + alphaNumericCharsStr + ']{1,20}', 'g' ),
		'instagram': new RegExp( '@[_.' + alphaNumericCharsStr + ']{1,50}', 'g' ),
		'soundcloud': new RegExp( '@[_.' + alphaNumericCharsStr + "\-" + ']{1,50}', 'g' )
	};

	/**
	 * The regular expression to use to check the character before a username match to
	 * make sure we didn't accidentally match an email address.
	 *
	 * For example, the string "asdf@asdf.com" should not match "@asdf" as a username.
	 *
	 * @private
	 * @property {RegExp} nonWordCharRegex
	 */
	private readonly nonWordCharRegex = new RegExp( '[^' + alphaNumericCharsStr + ']' );


	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the Match instance,
	 *   specified in an Object (map).
	 */
	constructor( cfg: MentionMatcherConfig ) {
		super( cfg );

		this.serviceName = cfg.serviceName;
	}


	/**
	 * @inheritdoc
	 */
	parseMatches( text: string ) {
		let serviceName = this.serviceName,
		    matcherRegex = this.matcherRegexes[ this.serviceName ],
		    nonWordCharRegex = this.nonWordCharRegex,
		    tagBuilder = this.tagBuilder,
		    matches: Match[] = [],
		    match: RegExpExecArray | null;

		if (!matcherRegex) {
			return matches;
		}

		while( ( match = matcherRegex.exec( text ) ) !== null ) {
			let offset = match.index,
			    prevChar = text.charAt( offset - 1 );

			// If we found the match at the beginning of the string, or we found the match
			// and there is a whitespace char in front of it (meaning it is not an email
			// address), then it is a username match.
			if( offset === 0 || nonWordCharRegex.test( prevChar ) ) {
				let matchedText = match[ 0 ].replace(/\.+$/g, ''), // strip off trailing .
				    mention = matchedText.slice( 1 );  // strip off the '@' character at the beginning

				matches.push( new MentionMatch( {
					tagBuilder    : tagBuilder,
					matchedText   : matchedText,
					offset        : offset,
					serviceName   : serviceName,
					mention       : mention
				} ) );
			}
		}

		return matches;
	}

}


export interface MentionMatcherConfig extends MatcherConfig {
	serviceName: MentionServices
}