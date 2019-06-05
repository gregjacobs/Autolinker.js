import { Matcher } from "./matcher";
import { alphaNumericAndMarksCharsStr, domainNameCharRegex } from "../regex-lib";
import { EmailMatch } from "../match/email-match";
import { Match } from "../match/match";
import { throwUnhandledCaseError } from '../utils';

// For debugging: search for other "For debugging" lines
// import CliTable from 'cli-table';

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
	 * Valid characters that can be used in the "local" part of an email address,
	 * i.e. the "name" part of "name@site.com"
	 */
	protected localPartCharRegex = new RegExp( `[${alphaNumericAndMarksCharsStr}!#$%&'*+/=?^_\`{|}~-]` );

	/**
	 * Valid URI scheme for email address URLs
	 */
	protected mailToScheme : string = 'mailto:';


	/**
	 * @inheritdoc
	 */
	parseMatches( text: string ) {
		const tagBuilder = this.tagBuilder,
			  localPartCharRegex = this.localPartCharRegex,
			  mailToScheme = this.mailToScheme,
			  matches: Match[] = [],
			  len = text.length,
			  noCurrentEmailAddress = new CurrentEmailAddress();

		let charIdx = 0,
			state = State.NonEmailAddress as State,
			currentEmailAddress = noCurrentEmailAddress;

		// For debugging: search for other "For debugging" lines
		// const table = new CliTable( {
		// 	head: [ 'charIdx', 'char', 'state', 'charIdx', 'currentEmailAddress.idx', 'hasDomainDot' ]
		// } );

		while( charIdx < len ) {
			const char = text.charAt( charIdx );

			// For debugging: search for other "For debugging" lines
			// table.push( 
			// 	[ charIdx, char, State[ state ], charIdx, currentEmailAddress.idx, currentEmailAddress.hasDomainDot ] 
			// );

			switch( state ) {
				case State.NonEmailAddress: stateNonEmailAddress( char ); break;
				case State.LocalPart: stateLocalPart( char ); break;
				case State.LocalPartDot: stateLocalPartDot( char ); break;
				case State.AtSign: stateAtSign( char ); break;
				case State.DomainChar: stateDomainChar( char ); break;
				case State.DomainHyphen: stateDomainHyphen( char ); break;
				case State.DomainDot: stateDomainDot( char ); break;
	
				default: 
					throwUnhandledCaseError( state );
			}

			// For debugging: search for other "For debugging" lines
			// table.push( 
			// 	[ charIdx, char, State[ state ], charIdx, currentEmailAddress.idx, currentEmailAddress.hasDomainDot ] 
			// );

			charIdx++;
		}

		// Capture any valid match at the end of the string
		captureMatchIfValidAndReset();

		// For debugging: search for other "For debugging" lines
		//console.log( '\n' + table.toString() );
		
		return matches;


		// Handles the state when we're not in an email address
		function stateNonEmailAddress( char: string ) {
			if( localPartCharRegex.test( char ) ) {
				beginEmailAddress();

			} else {
				// not an email address character, continue
			}
		}


		// Handles the state when we're currently in the "local part" of an 
		// email address (as opposed to the "domain part")
		function stateLocalPart( char: string ) {
			if( char === '.' ) {
				state = State.LocalPartDot;

			} else if( char === '@' ) {
				state = State.AtSign;

			} else if( localPartCharRegex.test( char ) ) {
				// stay in the "local part" of the email address

			} else {
				// not an email address character, return to "NonEmailAddress" state
				resetToNonEmailAddressState();
			}
		}


		// Handles the state where we've read 
		function stateLocalPartDot( char: string ) {
			if( char === '.' ) {
				// We read a second '.' in a row, not a valid email address 
				// local part
				resetToNonEmailAddressState();

			} else if( char === '@' ) {
				// We read the '@' character immediately after a dot ('.'), not 
				// an email address
				resetToNonEmailAddressState();

			} else if( localPartCharRegex.test( char ) ) {
				state = State.LocalPart;

			} else {
				// Anything else, not an email address
				resetToNonEmailAddressState();
			}
		}


		function stateAtSign( char: string ) {
			if( domainNameCharRegex.test( char ) ) {
				state = State.DomainChar;

			} else {
				// Anything else, not an email address
				resetToNonEmailAddressState();
			}
		}

		function stateDomainChar( char: string ) {
			if( char === '.' ) {
				state = State.DomainDot;

			} else if( char === '-' ) {
				state = State.DomainHyphen;

			} else if( domainNameCharRegex.test( char ) ) {
				// Stay in the DomainChar state

			} else {
				// Anything else, we potentially matched if the criteria has
				// been met
				captureMatchIfValidAndReset();
			}
		}

		function stateDomainHyphen( char: string ) {
			if( char === '-' || char === '.' ) {
				// Not valid to have two hyphens ("--") or hypen+dot ("-.")
				captureMatchIfValidAndReset();

			} else if( domainNameCharRegex.test( char ) ) {
				state = State.DomainChar;

			} else {
				// Anything else
				captureMatchIfValidAndReset();
			}
		}

		function stateDomainDot( char: string ) {
			if( char === '.' || char === '-' ) {
				// not valid to have two dots ("..") or dot+hypen (".-")
				captureMatchIfValidAndReset();

			} else if( domainNameCharRegex.test( char ) ) {
				state = State.DomainChar;

				// After having read a '.' and then a valid domain character,
				// we now know that the domain part of the email is valid, and
				// we have found at least a partial EmailMatch (however, the
				// email address may have additional characters from this point)
				currentEmailAddress = new CurrentEmailAddress( { 
					...currentEmailAddress, 
					hasDomainDot: true 
				} );

			} else {
				// Anything else
				captureMatchIfValidAndReset();
			}
		}


		function beginEmailAddress() {
			state = State.LocalPart;
			currentEmailAddress = new CurrentEmailAddress( { idx: charIdx } );
		}

		function resetToNonEmailAddressState() {
			state = State.NonEmailAddress;
			currentEmailAddress = noCurrentEmailAddress
		}


		/*
		 * Captures the current email address as an EmailMatch if it's valid,
		 * and resets the state to read another email address.
		 */
		function captureMatchIfValidAndReset() {
			if( currentEmailAddress.hasDomainDot ) {  // we need at least one dot in the domain to be considered a valid email address
				let offset = currentEmailAddress.idx;
				let emailAddress = text.slice( offset, charIdx );

				// If we read a '.' or '-' char that ended the email address
				// (valid domain name characters, but only valid email address
				// characters if they are followed by something else), strip 
				// it off now
				if( /[-.]$/.test( emailAddress ) ){
					emailAddress = emailAddress.slice( 0, -1 );
				}

				let matchedText = emailAddress;

				// get the characters immediately preceding the email match
				const potentialMailToSchemeOffset = offset - mailToScheme.length
				const potentialMailToScheme = text.slice( potentialMailToSchemeOffset, offset );
				if ( potentialMailToScheme === mailToScheme ) {
					// if the email match is preceded by the 'mailTo:' scheme, 
					// include those characters in the matched text
					offset = potentialMailToSchemeOffset;
					matchedText = text.slice( offset, charIdx );
				}

				matches.push( new EmailMatch( {
					tagBuilder  : tagBuilder,
					matchedText : matchedText,
					offset      : offset,
					email       : emailAddress
				} ) );
			}

			resetToNonEmailAddressState();
		}
	}

}


const enum State {
	NonEmailAddress = 0,
	LocalPart,
	LocalPartDot,
	AtSign,
	DomainChar,
	DomainHyphen,
	DomainDot
}


class CurrentEmailAddress {
	readonly idx: number;  // the index of the first character in the email address
	readonly hasDomainDot: boolean;

	constructor( cfg: Partial<CurrentEmailAddress> = {} ) {
		this.idx = cfg.idx !== undefined ? cfg.idx : -1;
		this.hasDomainDot = !!cfg.hasDomainDot;
	}
}