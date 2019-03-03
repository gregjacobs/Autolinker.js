import { alphaNumericAndMarksRe, whitespaceRe, urlSuffixStartCharsRe } from '../../regex-lib';

// For debugging: search for other "For debugging" lines
// import CliTable from 'cli-table';

/**
 * Reads the "authority" segment of a URI, which includes optional username, 
 * host, and optional port.
 * 
 * Documentation for the "authority" section of a URI can be found here:
 * https://tools.ietf.org/html/rfc3986#appendix-A
 * 
 * The ABNF for the authority is: 
 * 
 *     authority     = [ userinfo "@" ] host [ ":" port ]
 *     userinfo      = *( unreserved / pct-encoded / sub-delims / ":" )
 *     host          = IP-literal / IPv4address / reg-name
 *     port          = *DIGIT
 * 
 *     IP-literal    = "[" ( IPv6address / IPvFuture  ) "]"
 *
 *     IPvFuture     = "v" 1*HEXDIG "." 1*( unreserved / sub-delims / ":" )
 *
 *     IPv6address   =                            6( h16 ":" ) ls32
 *                   /                       "::" 5( h16 ":" ) ls32
 *                   / [               h16 ] "::" 4( h16 ":" ) ls32
 *                   / [ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
 *                   / [ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
 *                   / [ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
 *                   / [ *4( h16 ":" ) h16 ] "::"              ls32
 *                   / [ *5( h16 ":" ) h16 ] "::"              h16
 *                   / [ *6( h16 ":" ) h16 ] "::"
 *
 *     h16           = 1*4HEXDIG
 *     ls32          = ( h16 ":" h16 ) / IPv4address
 *     IPv4address   = dec-octet "." dec-octet "." dec-octet "." dec-octet
 * 
 *     dec-octet     = DIGIT                 ; 0-9
 *                   / %x31-39 DIGIT         ; 10-99
 *                   / "1" 2DIGIT            ; 100-199
 *                   / "2" %x30-34 DIGIT     ; 200-249
 *                   / "25" %x30-35          ; 250-255
 * 
 *     reg-name      = *( unreserved / pct-encoded / sub-delims )
 * 
 *     unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *     pct-encoded   = "%" HEXDIG HEXDIG
 *     sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                   / "*" / "+" / "," / ";" / "="
 * 
 * 
 * From the same RFC, a regular expression is provided 
 * (https://tools.ietf.org/html/rfc3986#appendix-B) which defines how we can
 * simplify the parsing of the "authority" part (capturing group number 4 in
 * the below regular expression):
 * 
 *     ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
 *      12            3  4          5       6  7        8 9
 * 
 * We'll use this for our parsing, which involves only a simple loop to read
 * the characters one by one until either the '/', '?', or '#' characters are
 * encountered, or whitespace is encountered.
 * 
 * Examples of strings that are read: 
 * 
 * - 'google.com'
 * - 'google.com:80'
 * - 'localhost'
 * - 'user@localhost'
 * - 'user@google.com'
 * - 'user:password@localhost'
 * - 'user:password@google.com'
 * - 'my-cool-domain.com'
 * - 'word' (any word, which can be a valid hostname)
 * 
 * @param text The text to parse the URL suffix in
 * @param startIdx The starting index of the host and port. This must point to
 *   a valid beginning domain label character in the string.
 * @return The result of reading the authority segment. The `endIdx` property is 
 *   the index of the last character read before a non-authority character was 
 *   read.
 */
export function readAuthority( 
	text: string, 
	startIdx: number
): ReadAuthorityResult {
	const len = text.length,
	      startChar = text.charAt( startIdx );

	// Check that the first input character is actually a hostname start
	// character
	if( whitespaceRe.test( startChar ) || urlSuffixStartCharsRe.test( startChar ) ) {
		throw new Error( `The input character '${startChar}' was not a valid URI authority start character` );
	}

	let charIdx = startIdx,
	    lastConfirmedUrlCharIdx = charIdx;
		
	// For debugging: search for other "For debugging" lines
	// const table = new CliTable( {
	// 	head: [ 'charIdx', 'char', 'lastConfirmedCharIdx' ]
	// } );

	for( ; charIdx < len; charIdx++ ) {
		const char = text.charAt( charIdx );

		// For debugging: search for and uncomment other "For debugging" lines
		// table.push( 
		// 	[ charIdx, char, lastConfirmedUrlCharIdx ] 
		// );

		if( urlSuffixStartCharsRe.test( char ) || whitespaceRe.test( char ) ) {
			// '/', '?', '#', or whitespace encountered, must be the end of the
			// authority component of the URI
			break;

		} else if( alphaNumericAndMarksRe.test( char ) ) {
			// A letter or digit is a "confirmed" URL character, whereas say, a
			// '.' is not because that may just end a natural language sentence.
			// Only if an alphanumeric character is encountered after the '.'
			// will we include the '.' as a "confirmed" character (along with 
			// the subsequent alphanumeric)
			lastConfirmedUrlCharIdx = charIdx;
		}

		// For debugging: search for and uncomment other "For debugging" lines
		// table.push( 
		// 	[ charIdx, char, lastConfirmedUrlCharIdx ] 
		// );
	}

	// For debugging: search for other "For debugging" lines
	// console.log( '\n' + table.toString() );

	return { 
		endIdx: charIdx - 1,   // -1 because we want to return the last character that was read before the character that ended the host/port. This makes the other parsing routines which leverage this function integrate it seamlessly
		lastConfirmedUrlCharIdx
	};
	
}


export interface ReadAuthorityResult {
	endIdx: number;  // the index of the last character *before* the character that ended the authority component of the URI. So if a space is encountered which ends the authority component, the endIdx will point to the character before the space
	lastConfirmedUrlCharIdx: number;  // the index of the last character that we can confirm is part of the authority component. Ex: a letter would be included, but a '.' may not be as it might end a natural language sentence. 
}