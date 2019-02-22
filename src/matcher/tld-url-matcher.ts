import { Matcher, MatcherConfig } from "./matcher";
import { letterRe, alphaNumericAndMarksRe, alphaNumericCharsRe, digitRe, urlSuffixAllowedSpecialCharsRe, urlSuffixNotAllowedAsLastCharRe } from "../regex-lib";
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
		const table = new CliTable( {
			head: [ 'charIdx', 'char', 'state', 'charIdx', 'currentUrl.idx', 'lastConfirmedCharIdx', 'tldStartIdx', 'tldEndIdx' ]
		} );

		while( charIdx < len ) {
			const char = text.charAt( charIdx );

			// For debugging: search for other "For debugging" lines
			table.push( 
				[ charIdx, char, State[ state ], charIdx, currentUrl.idx, currentUrl.lastConfirmedUrlCharIdx, currentUrl.tldStartIdx, currentUrl.tldEndIdx ] 
			);

			switch( state ) {
				case State.NonUrl: stateNonUrl( char ); break;

				// Protocol-relative URL states
				case State.ProtocolRelativeSlash1: stateProtocolRelativeSlash1( char ); break;
				case State.ProtocolRelativeSlash2: stateProtocolRelativeSlash2( char ); break;

				// Domain name
				case State.DomainLabelChar: stateDomainLabelChar( char ); break;
				case State.DomainHyphen: stateDomainHyphen( char ); break;
				case State.DomainDot: stateDomainDot( char ); break;

				// Port
				case State.PortNumberColon: statePortNumberColon( char ); break;
				case State.PortNumber: statePortNumber( char ); break;

				// URL Suffix (path, query, and hash)
				case State.Path: statePath( char ); break;
				case State.Query: stateQuery( char ); break;
				case State.Hash: stateHash( char ); break;

				default: 
					throwUnhandledCaseError( state );
			}

			// For debugging: search for other "For debugging" lines
			table.push( 
				[ charIdx, char, State[ state ], charIdx, currentUrl.idx, currentUrl.lastConfirmedUrlCharIdx, currentUrl.tldStartIdx, currentUrl.tldEndIdx ] 
			);

			charIdx++;
		}

		// Capture any valid match at the end of the string
		captureMatchIfValidAndReset();

		// For debugging: search for other "For debugging" lines
		//console.log( '\n' + table.toString() );
		
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
				switchToState( State.ProtocolRelativeSlash2 );

			} else {
				// Anything else, cannot be the start of a protocol-relative URL
				resetToNonUrlState();
			}
		}

		// Handles reading a second '/', which could start a protocol-relative URL
		function stateProtocolRelativeSlash2( char: string ) {
			if( alphaNumericCharsRe.test( char ) ) {
				// A digit or unicode alpha character would start a domain name label
				captureCharAndSwitchToState( State.DomainLabelChar );

			} else {
				// Anything else, not a URL
				resetToNonUrlState();
			}
		}


		// Handles when we have read a domain label character
		function stateDomainLabelChar( char: string ) {
			if( char === '.' ) {
				switchToState( State.DomainDot );

			} else if( char === '-' ) {
				switchToState( State.DomainHyphen );

			} else if( char === ':' ) {
				switchToState( State.PortNumberColon );

			} else if( char === '/' ) {
				switchToState( State.Path );

			} else if( char === '?' ) {
				switchToState( State.Query );

			} else if( char === '#' ) {
				switchToState( State.Hash );

			} else if( alphaNumericAndMarksRe.test( char ) ) {
				// Stay in the DomainLabelChar state (but update the last 
				// confirmed URL char)
				captureCharAndSwitchToState( State.DomainLabelChar );

				// an alphanumeric character may be the last character in the 
				// TLD. Thus, we'll mark it as possibly so, and if we read more
				// alphanumeric characters, we'll update this value
				currentUrl = new CurrentUrl( { ...currentUrl, tldEndIdx: charIdx } );

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
				captureCharAndSwitchToState( State.DomainLabelChar );

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
				captureCharAndSwitchToState( State.DomainLabelChar );

				// Now that we've read a dot and a new character that would form
				// the next domain label, we know that we have a valid hostname,
				// and we can mark the location of the start of the TLD. Note:
				// if more dots are read for the hostname, this location will
				// change as we continue down the string
				currentUrl = new CurrentUrl( { ...currentUrl, tldStartIdx: charIdx } );

			} else {
				// Anything else, may either be the end of the URL or it wasn't 
				// a valid URL
				captureMatchIfValidAndReset();
			}
		}


		function statePortNumberColon( char: string ) {
			if( digitRe.test( char ) ) {
				captureCharAndSwitchToState( State.PortNumber );

			} else {
				// Anything else, may either be the end of the URL or it wasn't 
				// a valid URL
				captureMatchIfValidAndReset();
			}
		}


		function statePortNumber( char: string ) {
			if( digitRe.test( char ) ) {
				// Still a digit, stay in the port number state (and also
				// capture the latest char as a "confirmed URL character")
				captureCharAndSwitchToState( State.PortNumber );

			} else if( char === '/' ) {
				captureCharAndSwitchToState( State.Path );
				
			} else if( char === '?' ) {
				switchToState( State.Query );

			} else if( char === '#' ) {
				captureCharAndSwitchToState( State.Hash );

			} else {
				// Anything else, may either be the end of the URL or it wasn't 
				// a valid URL
				captureMatchIfValidAndReset();
			}
		}

		function statePath( char: string ) {
			if( char === '?' ) {
				switchToState( State.Query );

			} else if( char === '#' ) {
				captureCharAndSwitchToState( State.Hash )
				
			} else if( 
				alphaNumericAndMarksRe.test( char ) || 
				urlSuffixAllowedSpecialCharsRe.test( char ) 
			) {
				captureCharAndSwitchToState( State.Path );
				
			} else if( urlSuffixNotAllowedAsLastCharRe.test( char ) ) {
				// Switch to the Path state, but don't necessarily capture
				// the character unless more URL characters come afterwards
				switchToState( State.Path );

			} else {
				// Anything else, may either be the end of the URL or it wasn't 
				// a valid URL
				captureMatchIfValidAndReset();
			}
		}


		/**
		 * Handles the "query" part of a URL, i.e. "?a=1&b=2"
		 */
		function stateQuery( char: string ) {
			if( char === '?' ) {
				// Stay in Query state

			} else if( char === '/' ) {
				// Stay in the Query state, and capture the character as a
				// "confirmed" URL character
				captureCharAndSwitchToState( State.Query );

			} else if( char === '#' ) {
				captureCharAndSwitchToState( State.Hash )
				
			} else if( 
				alphaNumericAndMarksRe.test( char ) || 
				urlSuffixAllowedSpecialCharsRe.test( char ) 
			) {
				// Stay in the Query state, and capture the character as a
				// "confirmed" URL character
				captureCharAndSwitchToState( State.Query );
				
			} else if( urlSuffixNotAllowedAsLastCharRe.test( char ) ) {
				// Stay in the Query state, but don't necessarily capture
				// the character unless more URL characters come afterwards

			} else {
				// Anything else, may either be the end of the URL or it wasn't 
				// a valid URL
				captureMatchIfValidAndReset();
			}
		}

		function stateHash( char: string ) {
			if( char === '?' ) {
				// Stay in Hash state

			} else if( char === '/' || char === '#' ) {
				// Stay in the Hash state, and capture the character as a
				// "confirmed" URL character
				captureCharAndSwitchToState( State.Hash );

			} else if( 
				alphaNumericAndMarksRe.test( char ) || 
				urlSuffixAllowedSpecialCharsRe.test( char ) 
			) {
				// Stay in the Hash state, and capture the character as a
				// "confirmed" URL character
				captureCharAndSwitchToState( State.Hash );
				
			} else if( urlSuffixNotAllowedAsLastCharRe.test( char ) ) {
				// Stay in the Hash state, but don't necessarily capture
				// the character unless more URL characters come afterwards

			} else {
				// Anything else, may either be the end of the URL or it wasn't 
				// a valid URL
				captureMatchIfValidAndReset();
			}
		}
		

		function beginUrl(
			newState: State.ProtocolRelativeSlash1 | State.DomainLabelChar,
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
		 * Switches to the given `state` and also captures the current character
		 * as a "confirmed URL character"
		 */
		function captureCharAndSwitchToState( newState: State ) {
			switchToState( newState );
			currentUrl = new CurrentUrl( { ...currentUrl, lastConfirmedUrlCharIdx: charIdx } );
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
			// we need at least one dot in the domain to be considered a valid 
			// URL. We also don't want to match a URL that is preceded by an
			// '@' character which would be an email address
			if( 
				currentUrl.isValid() && 
				text.charAt( currentUrl.idx - 1 ) !== '@' &&
				isKnownTld( currentUrl.tldStartIdx, currentUrl.tldEndIdx )
			) {
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

				return true;   // valid match was captured

			} else {
				return false;  // no match captured
			}
		}


		/**
		 * Determines if the characters between the startIdx and endIdx 
		 * (inclusive) form a known TLD (Top-Level Domain).
		 * 
		 * Example: 'co' or 'com' would be a known TLD
		 */
		function isKnownTld( startIdx: number, endIdx: number ) {
			const tld = text.slice( startIdx, endIdx + 1 );

			return tldRegex.test( tld );
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

	// Port
	PortNumberColon,
	PortNumber,
	
	// URL Suffix (path, query, and hash)
	Path,
	Query,
	Hash
}


class CurrentUrl {
	readonly idx: number;  // the index of the first character in the URL
	readonly lastConfirmedUrlCharIdx: number;  // the index of the last character that was read that was a URL character for sure. For example, while reading "asdf.com-", the last confirmed char will be the 'm', and the current char would be '-' which *may* form an additional part of the URL
	readonly isProtocolRelative: boolean;
	readonly tldStartIdx: number;  // the index of the first character in the TLD of the hostname, so we can read the TLD. Ex: in 'sub.google.com/something', the index would be 10
	readonly tldEndIdx: number;    // the index of the last host character, so we can read the TLD. Ex: in 'sub.google.com/something', the index would be 13

	constructor( cfg: Partial<CurrentUrl> = {} ) {
		this.idx = cfg.idx !== undefined ? cfg.idx : -1;
		this.lastConfirmedUrlCharIdx = cfg.lastConfirmedUrlCharIdx !== undefined ? cfg.lastConfirmedUrlCharIdx : this.idx;
		this.isProtocolRelative = !!cfg.isProtocolRelative;
		this.tldStartIdx = cfg.tldStartIdx !== undefined ? cfg.tldStartIdx : -1;
		this.tldEndIdx = cfg.tldEndIdx !== undefined ? cfg.tldEndIdx : -1;
	}

	isValid() { 
		return this.tldStartIdx > -1;  // we found a '.' in the hostname
	}
}
