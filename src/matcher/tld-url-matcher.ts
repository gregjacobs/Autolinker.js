import { alphaNumericCharsRe, urlSuffixStartCharsRe } from "../regex-lib";
import { UrlMatch } from "../match/url-match";
import { Match } from "../match/match";
import { throwUnhandledCaseError } from '../utils';
import { UrlMatcher } from './url-matcher';
import { readUrlSuffix as doReadUrlSuffix } from './reader/read-url-suffix';
import { readDomainName as doReadDomainName } from './reader/read-domain-name';
import { readPort as doReadPort } from './reader/read-port';
import { isKnownTld } from '../uri-utils';

// For debugging: search for other "For debugging" lines
// import CliTable from 'cli-table';

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
	 * 
	 * General description of this algorithm: state machine parser that reads a
	 * single character at a time and keeps track of if the current character is
	 * within a URL or not. 
	 * 
	 * In order to handle trailing characters of a URL such as '.' and '-' that 
	 * could also be part of a longer URL, we keep track of the last confirmed 
	 * URL character (such as a letter character). If we then discover that the
	 * trailing '.' or '-' was followed by whitespace, we'll only take the 
	 * characters up to the last confirmed URL character.
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
			state = State.NonUrl as State,  // use switchToState() to modify
			currentUrl = noCurrentUrl;

		// For debugging: search for other "For debugging" lines
		// const table = new CliTable( {
		// 	head: [ 'charIdx', 'char', 'state', 'charIdx', 'currentUrl.idx', 'lastConfirmedCharIdx', 'tld' ]
		// } );

		while( charIdx < len ) {
			const char = text.charAt( charIdx );

			// For debugging: search for other "For debugging" lines
			// table.push( 
			// 	[ charIdx, char, State[ state ], charIdx, currentUrl.idx, currentUrl.lastConfirmedUrlCharIdx, currentUrl.tld || '' ] 
			// );

			switch( state ) {
				case State.NonUrl: stateNonUrl( char ); break;

				// Protocol-relative URL states
				case State.ProtocolRelativeSlash1: stateProtocolRelativeSlash1( char ); break;
				case State.ProtocolRelativeSlash2: stateProtocolRelativeSlash2( char ); break;

				case State.EndOfDomainName: stateEndOfDomainName( char ); break;
				case State.EndOfPort: stateEndOfPort( char ); break;
				case State.EndOfUrlSuffix: stateEndOfUrlSuffix( char ); break;

				default: 
					throwUnhandledCaseError( state );
			}

			// For debugging: search for other "For debugging" lines
			// table.push( 
			// 	[ charIdx, char, State[ state ], charIdx, currentUrl.idx, currentUrl.lastConfirmedUrlCharIdx, currentUrl.tld || '' ] 
			// );

			charIdx++;
		}

		// Capture any valid match at the end of the string
		captureMatchIfValidAndReset();

		// For debugging: search for other "For debugging" lines
		// console.log( `\nRead string:\n  ${text}` );
		// console.log( table.toString() );
		
		return matches;


		// Handles the state when we're not in a URL
		function stateNonUrl( char: string ) {
			if( char === '/' ) {
				// A slash could begin a protocol-relative URL
				beginUrl( State.ProtocolRelativeSlash1, { isProtocolRelative: true } );

			} else if( alphaNumericCharsRe.test( char ) ) {
				// A unicode alpha character or digit could start a domain name label
				beginUrl( State.EndOfDomainName );
				readDomainName();

			} else {
				// Anything else, remain in the non-url state
			}
		}


		// Handles reading a '/' from the NonUrl state
		function stateProtocolRelativeSlash1( char: string ) {
			if( char === '/' ) {
				switchToState( State.ProtocolRelativeSlash2 );

			} else {
				// Anything else, cannot be the start of a protocol-relative 
				// URL. Reconsume the current character in the non-URL state in
				// order to process the current character again, which may begin
				// a new URL.
				resetToNonUrlState();
				reconsumeCurrentCharacter();
			}
		}


		// Handles reading a second '/', which could start a protocol-relative URL
		function stateProtocolRelativeSlash2( char: string ) {
			if( alphaNumericCharsRe.test( char ) ) {
				// A digit or unicode alpha character would start a domain name label
				state = State.EndOfDomainName;
				readDomainName();

			} else {
				// Anything else, not a URL
				resetToNonUrlState();
			}
		}


		function stateEndOfDomainName( char: string ) {
			if( char === ':' ) {
				readPort();

			} else if( urlSuffixStartCharsRe.test( char ) ) {
				readUrlSuffix();

			} else {
				// Anything else, may be a host/port with a valid TLD. Capture
				// that, or otherwise reset
				captureMatchIfValidAndReset();
			}
		}


		function stateEndOfPort( char: string ) {
			if( urlSuffixStartCharsRe.test( char ) ) {
				readUrlSuffix();

			} else {
				// Anything else, may be a host/port with a valid TLD. Capture
				// that, or otherwise reset
				captureMatchIfValidAndReset();
			}
		}	


		/**
		 * Handles the end of the "URL Suffix" state. We have already read the
		 * URL suffix at this point from the {@link #readUrlSuffix} function.
		 */
		function stateEndOfUrlSuffix( char: string ) {
			// At this point, there is nothing left to read from the URL
			captureMatchIfValidAndReset();
		}
		

		/**
		 * Begins a new URL match. The current match may or may not be completed 
		 * depending on the subsequent characters read in.
		 * 
		 * @param newState 
		 * @param currentUrlOptions 
		 */
		function beginUrl(
			newState: State.ProtocolRelativeSlash1 | State.EndOfDomainName,
			currentUrlOptions: Partial<CurrentUrl> = {}
		) {
			state = newState;
			currentUrl = new CurrentUrl( { ...currentUrlOptions, idx: charIdx } );
		}


		function resetToNonUrlState() {
			switchToState( State.NonUrl );
			currentUrl = noCurrentUrl
		}


		/**
		 * Switches to the given `state`.
		 * 
		 * If the character read is also a "confirmed URL character", use
		 * {@link #captureCharAndSwitchToState} instead.
		 */
		function switchToState( newState: State ) {
			state = newState;
		}


		/**
		 * Causes the state machine to reconsume the current input character 
		 * (usually in a different state)
		 */
		function reconsumeCurrentCharacter() {
			charIdx--;
		}


		/**
		 * When a domain label character is encountered (basically any alpha
		 * char), we attempt to read it as a domain name.
		 */
		function readDomainName() {
			const { 
				endIdx, 
				lastConfirmedUrlCharIdx,
				longestDomainLabelLength,
				domainNameLength,
				tld
			} = doReadDomainName( text, charIdx );

			// Update information about the current URL being read from the
			// result of reading the domain name
			currentUrl = new CurrentUrl( { 
				...currentUrl, 
				lastConfirmedUrlCharIdx, 
				longestDomainLabelLength,
				domainNameLength,
				tld 
			} );

			// Advance the character index to the last character read by the
			// doReadDomainName() routine
			charIdx = endIdx;

			switchToState( State.EndOfDomainName );
		}


		/**
		 * When a domain label character is encountered (basically any alpha
		 * char), we attempt to read it as a domain name.
		 */
		function readPort() {
			const { 
				endIdx, 
				lastConfirmedUrlCharIdx
			} = doReadPort( text, charIdx );

			// Update the lastConfirmedUrlCharIdx
			currentUrl = new CurrentUrl( { ...currentUrl, lastConfirmedUrlCharIdx } );

			// Advance the character index to the last character read by the
			// doReadPort() routine
			charIdx = endIdx;

			switchToState( State.EndOfPort );
		}


		/**
		 * When a '/', '?', or '#' character is encountered after the domain and
		 * port, this begins the URL suffix (path, query, or hash part of the 
		 * URL). 
		 * 
		 * We'll run a shared subroutine for this part, and extract the 
		 * information about it.
		 */
		function readUrlSuffix() {
			const { 
				endIdx, 
				lastConfirmedUrlCharIdx 
			} = doReadUrlSuffix( text, charIdx );

			// Update the lastConfirmedUrlCharIdx
			currentUrl = new CurrentUrl( { ...currentUrl, lastConfirmedUrlCharIdx } );

			// Advance the character index to the last read character by the
			// doParseUrlSuffix() routine
			charIdx = endIdx;

			switchToState( State.EndOfUrlSuffix );
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
		 */
		function captureMatchIfValid() {
			const charBeforeUrlMatch = text.charAt( currentUrl.idx - 1 );

			// We need a known TLD (Top-Level Domain) in the parsed host to be 
			// considered a valid URL. We also don't want to match a URL that is 
			// preceded by an '@' character which would be an email address
			if( charBeforeUrlMatch !== '@' && currentUrl.isValid() ) {
				let url = text.slice( currentUrl.idx, currentUrl.lastConfirmedUrlCharIdx + 1 );

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
			}
		}
	}

}


const enum State {
	NonUrl = 0,

	// Protocol-relative URL states
	ProtocolRelativeSlash1,
	ProtocolRelativeSlash2,

	EndOfDomainName,  // After reading the domain name, we are in this state
	EndOfPort,        // After reading the port number, we are in this state
	EndOfUrlSuffix    // After reading a '/', '?', or '#' after the domain name, we read the "URL Suffix" of the URI, and then we are in this state
}


class CurrentUrl {
	readonly idx: number;  // the index of the first character in the URL
	readonly lastConfirmedUrlCharIdx: number;  // the index of the last character that was read that was a URL character for sure. For example, while reading "asdf.com-", the last confirmed char will be the 'm', and the current char would be '-' which *may* form an additional part of the URL
	readonly isProtocolRelative: boolean;
	readonly longestDomainLabelLength: number;
    readonly domainNameLength: number;
	readonly tld: string | undefined;  // the TLD (Top-Level Domain) that was found in the host, if any. Ex: 'com' for a host of 'google.com'

	constructor( cfg: Partial<CurrentUrl> = {} ) {
		this.idx = cfg.idx !== undefined ? cfg.idx : -1;
		this.lastConfirmedUrlCharIdx = cfg.lastConfirmedUrlCharIdx !== undefined ? cfg.lastConfirmedUrlCharIdx : this.idx;
		this.isProtocolRelative = !!cfg.isProtocolRelative;
		this.longestDomainLabelLength = cfg.longestDomainLabelLength || 0;
		this.domainNameLength = cfg.domainNameLength || 0;
		this.tld = cfg.tld;
	}

	/**
	 * Determines if the current URL is a valid URL match. 
	 * 
	 * In order to be considered valid, the current URL must:
	 * 
	 * 1. Have a TLD (top-level domain). It cannot simply be a hostname like 'localhost'
	 * 2. The TLD must be a known TLD (ex: 'com', 'org', etc.) according to the
	 *    `tldRegex` which is updated from http://data.iana.org/TLD/tlds-alpha-by-domain.txt.
	 *    This is so we can grab matches like "google.com" but skip matches like 
	 *    "hello.world"
	 * 3. The longest domain label in the domain name must be 63 octets or 
	 *    fewer. Note: our current test checks 63 characters or fewer, but this
	 *    test should suffice in that it can allow for false positives for 
	 *    multi-byte characters rather than exclude actual matches of multi-byte
	 *    characters.
	 * 4. The domain name itself, including separators, must be 255 octets or
	 *    fewer. Note: our current test checks 255 characters or fewer, but this
	 *    test should suffice in that it can allow for false positives for 
	 *    multi-byte characters rather than exclude actual matches of multi-byte
	 *    characters.
	 */
	isValid(): boolean {
		return !!this.tld
			&& isKnownTld( this.tld )
			&& this.longestDomainLabelLength <= 63
			&& this.domainNameLength <= 255;
	}
}
