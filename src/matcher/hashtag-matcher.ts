import { Matcher, MatcherConfig } from "./matcher";
import { HashtagServices } from "../autolinker";
import { alphaNumericAndMarksCharsStr } from "../regex-lib";
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
	protected readonly serviceName: HashtagServices = 'twitter';  // default value just to get the above doc comment in the ES5 output and documentation generator


	/**
	 * The regular expression to match Hashtags. Example match:
	 *
	 *     #asdf
	 *
	 * @protected
	 * @property {RegExp} matcherRegex
	 */
	protected matcherRegex = new RegExp( `#[_${alphaNumericAndMarksCharsStr}]{1,139}(?![_${alphaNumericAndMarksCharsStr}])`, 'g' );  // lookahead used to make sure we don't match something above 139 characters

	/**
	 * The regular expression to use to check the character before a username match to
	 * make sure we didn't accidentally match an email address.
	 *
	 * For example, the string "asdf@asdf.com" should not match "@asdf" as a username.
	 *
	 * @protected
	 * @property {RegExp} nonWordCharRegex
	 */
	protected nonWordCharRegex = new RegExp( '[^' + alphaNumericAndMarksCharsStr + ']' );


	/**
	 * @method constructor
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