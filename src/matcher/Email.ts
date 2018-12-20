import { Matcher } from "./Matcher";
import { alphaNumericCharsStr, getDomainNameStr } from "../RegexLib";
import { tldRegex } from "./TldRegex";
import { EmailMatch } from "../match/Email";
import { Match } from "../match/Match";

/**
 * @class Autolinker.matcher.Email
 * @extends Autolinker.matcher.Matcher
 *
 * Matcher to find email matches in an input string.
 *
 * See this class's superclass ({@link Autolinker.matcher.Matcher}) for more details.
 */
export class EmailMatcher extends Matcher {

	/**
	 * The regular expression to match email addresses. Example match:
	 *
	 *     person@place.com
	 *
	 * @private
	 * @property {RegExp} matcherRegex
	 */
	matcherRegex = (function() {
		var alphaNumericChars = alphaNumericCharsStr,
			specialCharacters = '!#$%&\'*+\\-\\/=?^_`{|}~',
			restrictedSpecialCharacters = '\\s"(),:;<>@\\[\\]',
			validCharacters = alphaNumericChars + specialCharacters,
			validRestrictedCharacters = validCharacters + restrictedSpecialCharacters,
		    emailRegex = new RegExp( '(?:[' + validCharacters + '](?:[' + validCharacters + ']|\\.(?!\\.|@))*|\\"[' + validRestrictedCharacters + '.]+\\")@');

		return new RegExp( [
			emailRegex.source,
			getDomainNameStr( 1 ),
			'\\.', tldRegex.source   // '.com', '.net', etc
		].join( "" ), 'gi' );
	} )();


	/**
	 * @inheritdoc
	 */
	parseMatches( text: string ) {
		let matcherRegex = this.matcherRegex,
		    tagBuilder = this.tagBuilder,
		    matches: Match[] = [],
		    match: RegExpExecArray | null;

		while( ( match = matcherRegex.exec( text ) ) !== null ) {
			let matchedText = match[ 0 ];

			matches.push( new EmailMatch( {
				tagBuilder  : tagBuilder,
				matchedText : matchedText,
				offset      : match.index,
				email       : matchedText
			} ) );
		}

		return matches;
	}

}
