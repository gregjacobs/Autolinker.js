import { throwUnhandledCaseError } from '../utils';
import { alphaNumericAndMarksRe, urlSuffixAllowedSpecialCharsRe, urlSuffixNotAllowedAsLastCharRe } from '../regex-lib';

/**
 * Reads a URL suffix, which includes path, query, and hash parts. Returns 
 * information about the end of the suffix and the last matching "confirmed"
 * URL suffix character.
 * 
 * The character pointed to by the `startIdx` must be a '/', '?', or '#' 
 * character, and this function will read to the end of the URL suffix.
 * 
 * @param text The text to parse the URL suffix in
 * @param startIdx The starting index of the URL suffix. This should be the 
 *   index of a '/', '?', or '#' character that begins the URL suffix
 * @return The result of reading the URL suffix. The `endIdx` property is the
 *   index of the last character read before a non-URL-suffix character was 
 *   read.
 */
export function readUrlSuffix( 
	text: string, 
	startIdx: number
): ReadUrlSuffixResult {
	const len = text.length;

	let charIdx = startIdx,
	    initialChar = text.charAt( charIdx ) as '/' | '?' | '#',
		state = determineInitialState( initialChar ),
		lastConfirmedUrlCharIdx = initialChar === '/' || initialChar === '#' ? charIdx : charIdx - 1,  // if we encounter a '/' or '#', that is a "confirmed" URL character. A '?' is not, as it may end a sentence that the URL is part of.
		urlSuffixEnded = false;
		
	while( charIdx < len ) {
		const char = text.charAt( charIdx );

		switch( state ) {
			case State.Path  : statePath( char ); break;
			case State.Query : stateQuery( char ); break;
			case State.Hash  : stateHash( char ); break;

			default :
				throwUnhandledCaseError( state );
		}

		if( urlSuffixEnded ) {
			break;
		}
		charIdx++;
	}

	return { 
		endIdx: charIdx - 1,   // -1 because we want to return the last character that was read before the character that ended the host/port. This makes the other parsing routines which leverage this function integrate it seamlessly
		lastConfirmedUrlCharIdx 
	};
	

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
			// Anything else, end the URL suffix
			endUrlSuffix();
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
			// Anything else, end the URL suffix
			endUrlSuffix();
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
			// Anything else, end the URL suffix
			endUrlSuffix();
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
	function endUrlSuffix() {
		urlSuffixEnded = true;
	}
}


export interface ReadUrlSuffixResult {
	endIdx: number;  // the index of the last character *before* the character that ended the URL suffix. So if a space is encountered which ends the URL suffix, the endIdx will point to the character before the space
	lastConfirmedUrlCharIdx: number;  // the index of the last character that we can confirm is part of the URL suffix. Ex: a letter would be included, but a '.' may not be as it might end a natural language sentence. 
}


/**
 * Determines the initial state for the `parseUrlSuffix()` state machine based
 * on the first character being a '/', '?', or '#'
 */
function determineInitialState( char: string ): State {
	if( char === '/' ) { 
		return State.Path;
	} else if( char === '?' ) {
		return State.Query;
	} else if( char === '#' ) {
		return State.Hash;
	} else {
		throw new Error( `The input character '${char}' was not a valid URL suffix start character` );
	}
}


const enum State {
	Path = 0,
	Query,
	Hash
}
