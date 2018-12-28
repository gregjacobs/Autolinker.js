import { Matcher, MatcherConfig } from "./matcher";
import { alphaNumericAndMarksCharsStr } from "../regex-lib";
import { MentionServices } from "../autolinker";
import { MentionMatch } from "../match/mention-match";
import { Match } from "../match/match";

/**
 * @class Autolinker.matcher.Mention
 * @extends Autolinker.matcher.Matcher
 *
 * Matcher to find/replace username matches in an input string.
 */
export class MentionMatcher extends Matcher {

	/**
	 * @cfg {'twitter'/'instagram'/'soundcloud'} protected
	 * 
	 * The name of service to link @mentions to.
	 * 
	 * Valid values are: 'twitter', 'instagram', or 'soundcloud'
	 */
	protected serviceName: MentionServices = 'twitter';  // default value just to get the above doc comment in the ES5 output and documentation generator

	/**
	 * Hash of regular expression to match username handles. Example match:
	 *
	 *     @asdf
	 *
	 * @private
	 * @property {Object} matcherRegexes
	 */
	protected readonly matcherRegexes: {[key: string]: RegExp} = {
		'twitter': new RegExp( `@[_${alphaNumericAndMarksCharsStr}]{1,50}(?![_${alphaNumericAndMarksCharsStr}])`, 'g' ),       // lookahead used to make sure we don't match something above 50 characters
		'instagram': new RegExp( `@[_.${alphaNumericAndMarksCharsStr}]{1,30}(?![_${alphaNumericAndMarksCharsStr}])`, 'g' ),    // lookahead used to make sure we don't match something above 30 characters
		'soundcloud': new RegExp( `@[-_.${alphaNumericAndMarksCharsStr}]{1,50}(?![-_${alphaNumericAndMarksCharsStr}])`, 'g' )  // lookahead used to make sure we don't match something above 50 characters
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
	protected readonly nonWordCharRegex = new RegExp( '[^' + alphaNumericAndMarksCharsStr + ']' );


	/**
	 * @method constructor
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
				let matchedText = match[ 0 ].replace( /\.+$/g, '' ), // strip off trailing .
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