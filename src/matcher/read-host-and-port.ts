import { throwUnhandledCaseError } from '../utils';
import { alphaNumericAndMarksRe, digitRe, alphaNumericCharsRe } from '../regex-lib';

// For debugging: search for other "For debugging" lines
// import CliTable from 'cli-table';

/**
 * Reads a host (such as 'google.com') and optional port. 
 * 
 * Examples of strings that are read: 
 * 
 * - 'google.com'
 * - 'google.com:80'
 * - 'localhost'
 * - 'my-cool-domain.com'
 * - 'word' (any word, which can be a valid hostname)
 * 
 * Returns information about the host and port that was read. 
 * 
 * @param text The text to parse the URL suffix in
 * @param startIdx The starting index of the host and port. This must point to
 *   a valid beginning domain label character in the string.
 * @return The result of reading the host and port. The `endIdx` property is the
 *   index of the last character read before a non-host/port character was read.
 */
export function readHostAndPort( 
	text: string, 
	startIdx: number
): ReadHostAndPortResult {
	const len = text.length;

	// Check that the first input character is actually a hostname start
	// character
	const startChar = text.charAt( startIdx );
	if( !alphaNumericCharsRe.test( startChar ) ) {
		throw new Error( `The input character '${startChar}' was not a valid domain label start character` );
	}

	let charIdx = startIdx,
	    lastConfirmedUrlCharIdx = charIdx,
		state = State.DomainLabelChar as State,
		tldStartIdx: number | undefined = undefined,  // the beginning index of the TLD (top-level domain) in the hostname. Ex: in 'sub.google.com', the index would be 10
		tldEndIdx: number | undefined = undefined,    // the end index of the TLD (top-level domain) in the hostname. Ex: in 'sub.google.com', the index would be 13
		domainAndPortEnded = false;
		
	// For debugging: search for other "For debugging" lines
	// const table = new CliTable( {
	// 	head: [ 'charIdx', 'char', 'state', 'lastConfirmedCharIdx', 'tldStartIdx', 'tldEndIdx' ]
	// } );

	while( charIdx < len ) {
		const char = text.charAt( charIdx );

		// For debugging: search for other "For debugging" lines
		// table.push( 
		// 	[ charIdx, char, State[ state ], lastConfirmedUrlCharIdx, tldStartIdx || '', tldEndIdx || '' ] 
		// );

		switch( state ) {
			// Domain name (host)
			case State.DomainLabelChar: stateDomainLabelChar( char ); break;
			case State.DomainHyphen: stateDomainHyphen( char ); break;
			case State.DomainDot: stateDomainDot( char ); break;

			// Port
			case State.PortNumberColon: statePortNumberColon( char ); break;
			case State.PortNumber: statePortNumber( char ); break;

			default :
				throwUnhandledCaseError( state );
		}

		// For debugging: search for other "For debugging" lines
		// table.push( 
		// 	[ charIdx, char, State[ state ], lastConfirmedUrlCharIdx, tldStartIdx || '', tldEndIdx || '' ]
		// );

		if( domainAndPortEnded ) {
			break;
		}
		charIdx++;
	}

	// For debugging: search for other "For debugging" lines
	// console.log( '\n' + table.toString() );

	return { 
		endIdx: charIdx - 1,   // -1 because we want to return the last character that was read before the character that ended the host/port. This makes the other parsing routines which leverage this function integrate it seamlessly
		lastConfirmedUrlCharIdx, 
		tld: tldStartIdx && text.slice( tldStartIdx, tldEndIdx! + 1 ) 
	};
	

	// Handles when we have read a domain label character
	function stateDomainLabelChar( char: string ) {
		if( char === '.' ) {
			switchToState( State.DomainDot );

		} else if( char === '-' ) {
			switchToState( State.DomainHyphen );

		} else if( char === ':' ) {
			switchToState( State.PortNumberColon );

		// } else if( char === '/' || char === '?' || char === '#' ) {
		// -- note: do not need to handle these chars explicitly in this parser
		// 	parseUrlSuffix();

		} else if( alphaNumericAndMarksRe.test( char ) ) {
			// Stay in the DomainLabelChar state (but update the last 
			// confirmed URL char)
			captureCharAndSwitchToState( State.DomainLabelChar );

			// an alphanumeric character may be the last character in the 
			// TLD. Thus, we'll mark it as possibly so, and if we read more
			// alphanumeric characters, we'll update this value
			tldEndIdx = charIdx;

		} else {
			// Anything else, end the host and port
			endDomainAndPort();
		}
	}


	function stateDomainHyphen( char: string ) {
		if( char === '-' ) {
			// Remain in the DomainHyphen state

		} else if( char === '.' ) {
			// Not valid to have a '-.' in a domain label
			endDomainAndPort();

		} else if( alphaNumericAndMarksRe.test( char ) ) {
			captureCharAndSwitchToState( State.DomainLabelChar );

		} else {
			// Anything else, end the host and port
			endDomainAndPort();
		}
	}


	function stateDomainDot( char: string ) {
		if( char === '.' ) {
			// domain names cannot have multiple '.'s next to each other.
			// It's possible we've already read a valid domain name though,
			// and that the '..' sequence just forms an ellipsis at the end
			// of a sentence
			endDomainAndPort();

		} else if( alphaNumericAndMarksRe.test( char ) ) {
			captureCharAndSwitchToState( State.DomainLabelChar );

			// Now that we've read a dot and a new character that would form
			// the next domain label, we can mark the location of the start of 
			// the TLD. Note: if more dots are read for the hostname, this 
			// location will change as we continue down the string
			tldStartIdx = charIdx;

		} else {
			// Anything else, end the host and port
			endDomainAndPort();
		}
	}


	function statePortNumberColon( char: string ) {
		if( digitRe.test( char ) ) {
			captureCharAndSwitchToState( State.PortNumber );

		} else {
			// Anything else, end the host and port
			endDomainAndPort();
		}
	}


	function statePortNumber( char: string ) {
		if( digitRe.test( char ) ) {
			// Still a digit, stay in the port number state (and also
			// capture the latest char as a "confirmed URL character")
			captureCharAndSwitchToState( State.PortNumber );

		// } else if( char === '/' || char === '?' || char === '#' ) {
		// -- note: do not need to handle these chars explicitly in this parser
		// 	parseUrlSuffix();

		} else {
			// Anything else, end the host and port
			endDomainAndPort();
		}
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
		lastConfirmedUrlCharIdx = charIdx;
	}


	/**
	 * When we find a character that no longer continues a URL suffix, we will
	 * return out
	 */
	function endDomainAndPort() {
		domainAndPortEnded = true;
	}
}


export interface ReadHostAndPortResult {
	endIdx: number;  // the index of the last character *before* the character that ended the host/port. So if a space is encountered which ends the host/port, the endIdx will point to the character before the space
	lastConfirmedUrlCharIdx: number;  // the index of the last character that we can confirm is part of the host/port. Ex: a letter would be included, but a '.' may not be as it might end a natural language sentence. 
	tld: string | undefined;  // if a TLD (Top-Level Domain, such as '.com') was found, this will be the name of the TLD. Ex: 'com'
}


const enum State {
	// Domain name (host) states
	DomainLabelChar,          // Note: Domain labels must begin with a letter or number (no hyphens), and can include unicode letters
	DomainHyphen,
	DomainDot,

	// Port
	PortNumberColon,
	PortNumber
}