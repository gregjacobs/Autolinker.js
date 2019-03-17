import { throwUnhandledCaseError, isUndefined } from '../../utils';
import { alphaNumericAndMarksRe, digitRe, alphaNumericCharsRe } from '../../regex-lib';

// For debugging: search for other "For debugging" lines
// import CliTable from 'cli-table';

/**
 * Reads a domain name (such as 'google.com'). 
 * 
 * Examples of strings that are read: 
 * 
 * - 'google.com'
 * - 'maps.google.com'
 * - 'localhost'  # although we won't count this as a valid domain name
 * - 'my-cool-domain.com'
 * 
 * Returns information about the domain name and its labels. 
 * 
 * @param text The text to parse the URL suffix in
 * @param startIdx The starting index of the domain name. This must point to
 *   a valid beginning domain label character in the string.
 * @return The result of reading the domain name. The `endIdx` property is the
 *   index of the last character read before a non-domain-name character was 
 *   read.
 */
export function readDomainName( 
	text: string, 
	startIdx: number
): ReadDomainNameResult {
	const len = text.length;

	// Check that the first input character is actually a domain name start
	// character
	const startChar = text.charAt( startIdx );
	if( !alphaNumericCharsRe.test( startChar ) ) {
		throw new Error( `The input character '${startChar}' was not a valid domain label start character` );
	}

	let charIdx = startIdx,
		lastConfirmedUrlCharIdx = charIdx,  // the last character that we can confirm is part of the domain name, such as an alphanumeric character. A '.' character would not be included as a "confirmed" character as it may either separate a domain label or end a natural language sentence
		lastConfirmedDomainDotIdx: number | undefined = undefined,  // the last '.' that is confirmed to be part of the domain name (and not say, a period that ends a natural language sentence)
		longestDomainLabelLength = 0,   // the length of the longest domain label
		state = State.DomainLabelChar as State,
		domainNameEnded = false;
		
	// For debugging: search for other "For debugging" lines
	// const table = new CliTable( {
	// 	head: [ 'charIdx', 'char', 'state', 'lastConfirmedCharIdx', 'lastDomainDotIdx', 'longestDomainLabelLength' ]
	// } );

	while( charIdx < len ) {
		const char = text.charAt( charIdx );

		// For debugging: search for other "For debugging" lines
		// table.push( 
		// 	[ charIdx, char, State[ state ], lastConfirmedUrlCharIdx, lastConfirmedDomainDotIdx || '', longestDomainLabelLength ] 
		// );

		switch( state ) {
			case State.DomainLabelChar: stateDomainLabelChar( char ); break;
			case State.DomainHyphen: stateDomainHyphen( char ); break;
			case State.DomainDot: stateDomainDot( char ); break;

			default :
				throwUnhandledCaseError( state );
		}

		// For debugging: search for other "For debugging" lines
		// table.push( 
		// 	[ charIdx, char, State[ state ], lastConfirmedUrlCharIdx, lastConfirmedDomainDotIdx || '', longestDomainLabelLength ]
		// );

		if( domainNameEnded ) {
			break;
		}
		charIdx++;
	}

	// Update the longest domain label length one last time to account for the 
	// last character of the domain name which forms the last domain label
	updateLongestDomainLabelLength();

	// For debugging: search for other "For debugging" lines
	// console.log( '\n' + table.toString() );

	return { 
		endIdx: charIdx - 1,   // -1 because we want to return the last character that was read before the character that ended the domain name. This makes the other parsing routines which leverage this function integrate it seamlessly, without having to backtrack a character
		lastConfirmedUrlCharIdx, 
		longestDomainLabelLength,
		domainNameLength: lastConfirmedUrlCharIdx - startIdx + 1,
		tld: lastConfirmedDomainDotIdx && text.slice( lastConfirmedDomainDotIdx + 1, lastConfirmedUrlCharIdx + 1 ) 
	};
	

	// Handles when we have read a domain label character
	function stateDomainLabelChar( char: string ) {
		if( char === '.' ) {
			switchToState( State.DomainDot );
			updateLongestDomainLabelLength();
			
		} else if( char === '-' ) {
			switchToState( State.DomainHyphen );

		} else if( char === ':' ) {
			// Beginning of a port number, end the domain name
			endDomainName();

		// } else if( char === '/' || char === '?' || char === '#' ) {
		// -- note: do not need to handle these chars explicitly in this parser

		} else if( alphaNumericAndMarksRe.test( char ) ) {
			// Stay in the DomainLabelChar state (but update the last 
			// confirmed URL char)
			captureCharAndSwitchToState( State.DomainLabelChar );

		} else {
			// Anything else, end the domain name
			endDomainName();
		}
	}


	function stateDomainHyphen( char: string ) {
		if( char === '-' ) {
			// Remain in the DomainHyphen state

		} else if( char === '.' ) {
			// Not valid to have a '-.' in a domain label
			endDomainName();

		} else if( alphaNumericAndMarksRe.test( char ) ) {
			captureCharAndSwitchToState( State.DomainLabelChar );

		} else {
			// Anything else, end the domain name
			endDomainName();
		}
	}


	function stateDomainDot( char: string ) {
		if( char === '.' ) {
			// domain names cannot have multiple '.'s next to each other.
			// It's possible we've already read a valid domain name though,
			// and that the '..' sequence just forms an ellipsis at the end
			// of a sentence
			endDomainName();

		} else if( alphaNumericAndMarksRe.test( char ) ) {
			captureCharAndSwitchToState( State.DomainLabelChar );
			lastConfirmedDomainDotIdx = charIdx - 1;

		} else {
			// Anything else, end the domain name
			endDomainName();
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
	 * When we encounter a '.' character or the end of the domain name, we want
	 * to update the `longestDomainLabelLength` variable to have the latest value.
	 */
	function updateLongestDomainLabelLength() {
		let currentDomainLabelLength: number;

		if( isUndefined( lastConfirmedDomainDotIdx ) ) {  
			// no '.' has been found yet in the domain name, use the startIdx
			currentDomainLabelLength = lastConfirmedUrlCharIdx - startIdx + 1;
		} else {
			currentDomainLabelLength = lastConfirmedUrlCharIdx - lastConfirmedDomainDotIdx;
		}

		longestDomainLabelLength = Math.max( longestDomainLabelLength, currentDomainLabelLength );
	}


	/**
	 * When we find a character that no longer continues a domain name, exit the 
	 * readDomainName() function
	 */
	function endDomainName() {
		domainNameEnded = true;
	}
}


export interface ReadDomainNameResult {
	endIdx: number;                   // the index of the last character *before* the character that ended the domain name. So if a space is encountered which ends the domain name, the endIdx will point to the character before the space
	lastConfirmedUrlCharIdx: number;  // the index of the last character that we can confirm is part of the domain name. Ex: a letter would be included, but a '.' may not be as it might end a natural language sentence. 
	longestDomainLabelLength: number;     // the length of the longest domain label. According to https://tools.ietf.org/rfc/rfc2181, domain labels can only be 63 octets or fewer. We'll use this number to determine if it's a valid domain name or not.
	domainNameLength: number;         // the number of total characters in the domain name, including separators. According to https://tools.ietf.org/rfc/rfc2181, domain names can only be 255 octets or fewer. We'll use this number to determine if it's a valid domain name or not.
	tld: string | undefined;          // if a TLD (Top-Level Domain, such as '.com') was found, this will be the name of the TLD. Ex: 'com'
}


// For debugging: temporarily remove the 'const' modifier
const enum State {
	DomainLabelChar,  // Note: Domain labels must begin with a letter or number (no hyphens), and can include unicode letters
	DomainHyphen,
	DomainDot
}