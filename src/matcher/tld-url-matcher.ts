import { Matcher, MatcherConfig } from "./matcher";
import { letterRe, alphaNumericAndMarksRe, alphaNumericCharsRe, digitRe } from "../regex-lib";
import { StripPrefixConfig, UrlMatchTypeOptions } from "../autolinker";
import { tldRegex } from "./tld-regex";
import { UrlMatch } from "../match/url-match";
import { UrlMatchValidator } from "./url-match-validator";
import { Match } from "../match/match";
import { throwUnhandledCaseError } from '../utils';

// For debugging: search for other "For debugging" lines
import CliTable from 'cli-table';
import { UrlMatcher } from './url-matcher-old';

/**
 * @class Autolinker.matcher.TldUrl
 * @extends Autolinker.matcher.Matcher
 *
 * Matcher to find URL matches in an input string that match known Top-Level 
 * Domains (such as `.com`) that do *not* start with a scheme like `http://`. 
 * 
 * For example, this matcher finds links such as `google.com`, as opposed to 
 * `http://google.com` which is handled by the {@link Autolinker.matcher.SchemeUrl SchemeUrl} 
 * matcher.
 * 
 * See this class's superclass ({@link Autolinker.matcher.UrlMatcher}) for more 
 * details.
 */
export class TldUrlMatcher extends UrlMatcher {

	/**
	 * @inheritdoc
	 */
	parseMatches( text: string ) {
		const tagBuilder = this.tagBuilder,
		      stripPrefix = this.stripPrefix,
		      stripTrailingSlash = this.stripTrailingSlash,
		      decodePercentEncoding = this.decodePercentEncoding,
		      matches: Match[] = [],
		      len = text.length,
			  noCurrentUrl = new CurrentUrl();
			  
		let charIdx = 0,
			state = State.NonUrl as State,
			currentUrl = noCurrentUrl;

		// For debugging: search for other "For debugging" lines
		const table = new CliTable( {
			head: [ 'charIdx', 'char', 'state', 'charIdx', 'currentUrl.idx', 'hasHostDot' ]
		} );

		while( charIdx < len ) {
			const char = text.charAt( charIdx );

			// For debugging: search for other "For debugging" lines
			table.push( 
				[ charIdx, char, State[ state ], charIdx, currentUrl.idx, currentUrl.hasHostDot ] 
			);

			switch( state ) {
				case State.NonUrl: stateNonUrl( char ); break;

				// Protocol-relative URL states
				case State.ProtocolRelativeSlash1: stateProtocolRelativeSlash1( char ); break;
				case State.ProtocolRelativeSlash2: stateProtocolRelativeSlash2( char ); break;

				// Domain name specific states
				case State.DomainLabelChar: stateDomainLabelChar( char ); break;
				case State.DomainHyphen: stateDomainHyphen( char ); break;
				case State.DomainDot: stateDomainDot( char ); break;

				// Remainder of URL
				case State.PortNumberColon: statePortNumber( char ); break;

				default: 
					throwUnhandledCaseError( state );
			}

			// For debugging: search for other "For debugging" lines
			table.push( 
				[ charIdx, char, State[ state ], charIdx, currentUrl.idx, currentUrl.hasHostDot ] 
			);

			charIdx++;
		}

		// Capture any valid match at the end of the string
		captureMatchIfValidAndReset();

		// For debugging: search for other "For debugging" lines
		console.log( '\n' + table.toString() );
		
		return matches;


		// Handles the state when we're not in a URL
		function stateNonUrl( char: string ) {
			if( char === '/' ) {
				// A slash could begin a protocol-relative URL
				beginUrl( State.ProtocolRelativeSlash1, { isProtocolRelative: true } );

			} else if( alphaNumericCharsRe.test( char ) ) {
				// A unicode alpha character or digit could start a domain name label
				beginUrl( State.DomainLabelChar );

			} else {
				// Anything else, remain in the non-url state
			}
		}


		// Handles reading a '/' from the NonUrl state
		function stateProtocolRelativeSlash1( char: string ) {
			if( char === '/' ) {
				state = State.ProtocolRelativeSlash2;

			} else {
				// Anything else, cannot be the start of a protocol-relative URL
				resetToNonUrlState();
			}
		}

		// Handles reading a second '/', which could start a protocol-relative URL
		function stateProtocolRelativeSlash2( char: string ) {
			if( alphaNumericCharsRe.test( char ) ) {
				// A digit or unicode alpha character would start a domain name label
				state = State.DomainLabelChar;

			} else {
				// Anything else, not a URL
				resetToNonUrlState();
			}
		}


		// Handles when we have read a domain label character
		function stateDomainLabelChar( char: string ) {
			if( char === '.' ) {
				state = State.DomainDot;

			} else if( char === '-' ) {
				state = State.DomainHyphen;

			} else if( char === ':' ) {
				state = State.PortNumberColon;

				// TODO: Will need to handle the case that a colon ends the URL
				// entirely, such as with the string "google.com: great stuff"

			} else if( alphaNumericAndMarksRe.test( char ) ) {
				// Stay in the DomainLabelChar state

			} else {
				// Anything else, may either be the end of the URL or it wasn't 
				// a valid URL
				captureMatchIfValidAndReset();
			}
		}


		function stateDomainHyphen( char: string ) {
			if( char === '-' ) {
				// Remain in the DomainHyphen state

			} else if( char === '.' ) {
				// Not valid to have a '-.' in a domain label
				captureMatchIfValidAndReset();

			} else if( alphaNumericAndMarksRe.test( char ) ) {
				state = State.DomainLabelChar;

			} else {
				// Anything else, may either be the end of the URL or it wasn't 
				// a valid URL
				captureMatchIfValidAndReset();
			}
		}


		function stateDomainDot( char: string ) {
			if( char === '.' ) {
				// domain names cannot have multiple '.'s next to each other.
				// It's possible we've already read a valid domain name though,
				// and that the '..' sequence just forms an ellipsis at the end
				// of a sentence
				captureMatchIfValidAndReset();

			} else if( alphaNumericAndMarksRe.test( char ) ) {
				state = State.DomainLabelChar;

				// Now that we've read a dot and a new character that would form
				// the next domain label, we can mark the currentUrl as so, 
				// meaning that the currentUrl is valid
				currentUrl = new CurrentUrl( { ...currentUrl, hasHostDot: true } );

			} else {
				// Anything else, may either be the end of the URL or it wasn't 
				// a valid URL
				captureMatchIfValidAndReset();
			}
		}


		// We've read an ASCII letter or digit. It could mean we're either 
		// reading a scheme or a domain label. This state can only be entered 
		// into for the first character of a URL by reading an ASCII letter (not
		// a digit)
		function stateSchemeOrDomainChar( char: string ) {
			if( char === '.' ) {
				state = State.SchemeOrDomainDotChar;

			} else if( char === '-' ) {
				state = State.SchemeOrDomainHyphenChar;

			} else if( char === '+' ) {
				// Domain labels cannot have a '+' sign, so it must be a scheme 
				// character
				// OR, it could mean that two separate URLs are directly
				// next to each other, such as "google.com+yahoo.com", which 
				// should both be autolinked. Need to handle this case.
				// Options: 
				//    1) Start another state machine instance for the second
				//       potential match. If the second one fails, delete that 
				//       one and use the first. If the second one succeeds, use
				//       that instead of the first.
				// -> 2) Attempt to emit a potentially-valid domain name (what we
				//       have read so far), and start a new URL after the '+'. 
				//       This could have the drawback of something like
				//       `my-scheme.com://blahblahblah` being incorrectly split
				//       up. This seems low-risk however, as only the following
				//       known scheme could present an issue: 'microsoft.windows.camera'.
				//       Other schemes could present an issue in the future, but
				//       these are not valid TLDs as of 1/23/2019: 'iris.beep', 
				//       'iris.lwz', 'iris.xpc', 'iris.xpcs', 'soap.beep', 
				//       'soap.beeps', 'xmlrpc.beep', 'xmlrpc.beeps', 'z39.50',
				//       'z39.50r', 'z39.50s'
				//      (Going with this option for now, but may need to go with
				//      option #1 if it becomes an issue)
				//      
				//      https://www.iana.org/assignments/uri-schemes/uri-schemes.xml
				const matchWasCaptured = captureMatchIfValid();
				if( matchWasCaptured ) {
					// If a match was captured, then we probably had a situation
					// such as "google.com+yahoo.com", where we want to capture
					// both as URLs. We captured the first, reset to NonUrl 
					// state to capture the second
					resetToNonUrlState();

				} else {
					// Not a valid domain name at the point of reading the '+'
					// char, we'll assume it's part of the scheme and continue
					// reading the potential URL
					state = State.SchemeChar;
				}
				
			} else if( char === ':' ) {
				state = State.SchemeOrPortColon;

			} else if( letterRe.test( char ) || digitRe.test( char ) ) {
				// ASCII letters or digits: Could still either be a domain label 
				// or scheme character. Continue the SchemeOrDomainChar state

			} else if( alphaNumericAndMarksRe.test( char ) ) {
				// Unicode letter or digit or combination mark, must be a domain
				// label
				state = State.DomainLabelChar;

			} else {
				// Anything else, may either be the end of the URL or it wasn't 
				// a valid URL
				captureMatchIfValidAndReset();
			}
		}

		function stateSchemeOrDomainDotChar( char: string ) {
			if( char === '.' || char === '+' || char === '-' ) {
				// We've read a second '.' character, a '.+', or a '.-' sequence. 
				// It's either part of the scheme, or signifies the end of the 
				// domain name
				const matchWasCaptured = captureMatchIfValid();
				if( matchWasCaptured ) {
					// If a match was captured, then we probably had a situation
					// such as "google.com.." (the second dot beginning to form
					// an ellipsis), where we want to capture the URL
					resetToNonUrlState();

				} else {
					// Not a valid domain name at the point of reading the '+'
					// char, we'll assume it's part of the scheme and continue
					// reading the potential URL
					state = State.SchemeChar;
					currentUrl = new CurrentUrl( { 
						...currentUrl,
						type: 'scheme',
						hasHostDot: false  // now that we've switched from 'unknown' to 'scheme', any dot we found earlier does not apply to the domain
					} );
				}
				
			} else if( char === ':' ) {
				state = State.SchemeOrPortColon;
				
			} else if( letterRe.test( char ) || digitRe.test( char ) ) {
				// ASCII letters or digits: Could still either be a domain label 
				// or scheme character. Continue the SchemeOrDomainChar state
				state = State.SchemeOrDomainChar;
				currentUrl = new CurrentUrl( { 
					...currentUrl,
					hasHostDot: true  // we found a dot and then a valid scheme or domain character
				} );

			} else if( alphaNumericAndMarksRe.test( char ) ) {
				// Unicode letter or digit or combination mark, must be a domain
				// label
				state = State.DomainLabelChar;
				currentUrl = new CurrentUrl( { 
					...currentUrl,
					type: 'tld',
					hasHostDot: true  // we found a dot and then a valid scheme or domain character
				} );

			} else {
				// Anything else, may either be the end of the URL or it wasn't 
				// a valid URL
				captureMatchIfValidAndReset();
			}
		}


		function stateSchemeOrDomainHyphenChar( char: string ) {
			// TODO: Copied and pasted from DotChar, modify for HypenChar


			if( char === '.' || char === '+' ) {
				// We've read the sequence '-.' or '-+'. 
				// It's either part of the scheme, or signifies the end of the 
				// domain name
				const matchWasCaptured = captureMatchIfValid();
				if( matchWasCaptured ) {
					// If a match was captured, then we probably had a situation
					// such as "google.com.." (the second dot beginning to form
					// an ellipsis), where we want to capture the URL
					resetToNonUrlState();

				} else {
					// Not a valid domain name at the point of reading the '+'
					// char, we'll assume it's part of the scheme and continue
					// reading the potential URL
					state = State.SchemeChar;
					currentUrl = new CurrentUrl( { 
						...currentUrl,
						type: 'scheme',
						hasHostDot: false  // now that we've switched from 'unknown' to 'scheme', any dot we found earlier does not apply to the domain
					} );
				}

			} else if( char === '-' ) {
				// Continue in the SchemeOrDomainHyphenChar state
				
			} else if( char === ':' ) {
				// If we read a ':' char after a '-', then it must be for a 
				// scheme as domain labels cannot end in a '-'
				state = State.SchemeColon;
				
			} else if( letterRe.test( char ) || digitRe.test( char ) ) {
				// ASCII letters or digits: Could still either be a domain label 
				// or scheme character. Continue the SchemeOrDomainChar state
				state = State.SchemeOrDomainChar;
				currentUrl = new CurrentUrl( { 
					...currentUrl,
					hasHostDot: true  // we found a dot and then a valid scheme or domain character
				} );

			} else if( alphaNumericAndMarksRe.test( char ) ) {
				// Unicode letter or digit or combination mark, must be a domain
				// label
				state = State.DomainLabelChar;
				currentUrl = new CurrentUrl( { 
					...currentUrl,
					type: 'tld',
					hasHostDot: true  // we found a dot and then a valid scheme or domain character
				} );

			} else {
				// Anything else, may either be the end of the URL or it wasn't 
				// a valid URL
				captureMatchIfValidAndReset();
			}
		}


		function stateSchemeOrPortColon( char: string ) {}


		function stateSchemeSlash1( char: string ) {}


		function stateSchemeSlash2( char: string ) {}


		function statePortNumber( char: string ) {}
		

		function beginUrl(
			newState: State.ProtocolRelativeSlash1 | State.DomainLabelChar,
			currentUrlOptions: Partial<CurrentUrl> = {}
		) {
			state = newState;
			currentUrl = new CurrentUrl( { ...currentUrlOptions, idx: charIdx } );
		}

		function resetToNonUrlState() {
			state = State.NonUrl;
			currentUrl = noCurrentUrl
		}


		/*
		* Captures the current URL as a UrlMatch if it's valid, and resets the 
		* state to read another URL.
		* 
		* This is usually called when we have read a character that is no longer
		* valid in the current URL. When this happens, we want to capture the
		* current match if it is valid, but if it's not, we want to reset back
		* to the "NonUrl" state either way.
		*/
		function captureMatchIfValidAndReset() {
			captureMatchIfValid();

			resetToNonUrlState();
		}


		/*
		 * Captures a match if it is valid (i.e. has a full domain name for a
		 * TLD match). If a match is not valid, it is possible that we want to 
		 * keep reading characters in order to make a full match.
		 * 
		 * @return `true` if a match was valid and captured, `false` otherwise.
		 */
		function captureMatchIfValid(): boolean {
			if( currentUrl.isValid() ) {  // we need at least one dot in the domain to be considered a valid email address
				let url = text.slice( currentUrl.idx, charIdx );

				// If we read a '.' or '-' char that ended the URL
				// (valid domain name characters, but only valid URL
				// characters if they are followed by something else), strip 
				// it off now
				// TODO: Handle this how the old implementation handled it
				// if( /[-.]$/.test( url ) ){
				// 	url = url.slice( 0, -1 );
				// }

				// For the purpose of this parser, we've generalized 'www' 
				// matches as part of 'tld' matches. However, for backward
				// compatibility, we distinguish beween TLD matches and matches
				// that begin with 'www.' so that users may turn off 'www' 
				// matches. As such, we need to correct for that now if the
				// URL begins with 'www.'
				let urlMatchType: 'www' | 'tld' = /^www\./.test( url ) ? 'www' : 'tld';

				matches.push( new UrlMatch( {
					tagBuilder            : tagBuilder,
					matchedText           : url,
					offset                : currentUrl.idx,
					urlMatchType          : urlMatchType,
					url                   : url,
					protocolUrlMatch      : false,  // in this Matcher, we only match TLDs without protocols (schemes)
					protocolRelativeMatch : currentUrl.isProtocolRelative,
					stripPrefix           : stripPrefix,
					stripTrailingSlash    : stripTrailingSlash,
					decodePercentEncoding : decodePercentEncoding,
				} ) );

				return true;   // valid match was captured

			} else {
				return false;  // no match captured
			}
		}
	}

}


// TODO: const enum
enum State {
	NonUrl = 0,

	// Protocol-relative URL states
	ProtocolRelativeSlash1,
	ProtocolRelativeSlash2,

	// Domain name specific states
	DomainLabelChar,          // Note: Domain labels must begin with a letter or number (no hyphens), and can include unicode letters
	DomainHyphen,
	DomainDot,

	// Remainder of URL
	PortNumberColon,
	PortNumber,
	
	PathSlash,
	QuestionMark,
	HashSymbol

	urlSuffixRegex = new RegExp( '[/?#](?:[' + alphaNumericAndMarksCharsStr + '\\-+&@#/%=~_()|\'$*\\[\\]?!:,.;\u2713]*[' + alphaNumericAndMarksCharsStr + '\\-+&@#/%=~_()|\'$*\\[\\]\u2713])?' );
}


class CurrentUrl {
	readonly idx: number;  // the index of the first character in the URL
	readonly isProtocolRelative: boolean;
	readonly hasHostDot: boolean;

	constructor( cfg: Partial<CurrentUrl> = {} ) {
		this.idx = cfg.idx !== undefined ? cfg.idx : -1;
		this.isProtocolRelative = !!cfg.isProtocolRelative;
		this.hasHostDot = !!cfg.hasHostDot;
	}

	isValid() { 
		return this.hasHostDot;
	}
}
