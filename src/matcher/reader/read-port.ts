import { digitRe } from '../../regex-lib';

// For debugging: search for other "For debugging" lines
// import CliTable from 'cli-table';

/**
 * Reads a port segment (such as ':8080')
 * 
 * Examples of strings that are read: 
 * 
 * - ':80'
 * - ':8080'
 * 
 * @param text The text to read the port in
 * @param startIdx The starting index of the port's ':' character in the URI.
 * @return The result of reading the port. The `endIdx` property is the index of
 *   the last character read before a non-port character was read.
 */
export function readPort( 
	text: string, 
	startIdx: number
): ReadPortResult {
	const len = text.length;

	// Check that the first input character is actually the port start character
	// (i.e. the ':' character)
	const startChar = text.charAt( startIdx );
	if( startChar !== ':' ) {
		throw new Error( `The input character '${startChar}' was not a valid port segment start character. Was expecting ':'` );
	}
	
	let charIdx = startIdx + 1,  // start at the character after the ':'
	    lastConfirmedUrlCharIdx = startIdx - 1;
	
	// For debugging: search for and uncomment other "For debugging" lines
	// const table = new CliTable( {
	// 	head: [ 'charIdx', 'char', 'state', 'lastConfirmedCharIdx', 'tldStartIdx', 'tldEndIdx' ]
	// } );

	for( ; charIdx < len; charIdx++ ) {
		const char = text.charAt( charIdx );

		// For debugging: search for and uncomment other "For debugging" lines
		// table.push( 
		// 	[ charIdx, char, State[ state ], lastConfirmedUrlCharIdx, tldStartIdx || '', tldEndIdx || '' ] 
		// );

		if( digitRe.test( char ) ) {
			lastConfirmedUrlCharIdx = charIdx;
		} else {
			break;
		}

		// For debugging: search for and uncomment other "For debugging" lines
		// table.push( 
		// 	[ charIdx, char, State[ state ], lastConfirmedUrlCharIdx, tldStartIdx || '', tldEndIdx || '' ]
		// );
	}

	// For debugging: search for other "For debugging" lines
	// console.log( '\n' + table.toString() );

	return { 
		endIdx: charIdx - 1,   // -1 because we want to return the last character that was read before the character that ended the host/port. This makes the other parsing routines which leverage this function integrate it seamlessly
		lastConfirmedUrlCharIdx
	};
}


export interface ReadPortResult {
	endIdx: number;  // the index of the last character *before* the character that ended the port. So if a space is encountered which ends the port, the endIdx will point to the character before the space
	lastConfirmedUrlCharIdx: number;  // the index of the last character that we can confirm is part of the port. Ex: a digit would be included, but the ':' that starts the port may not be as it might end a segment of a natural language sentence. 
}