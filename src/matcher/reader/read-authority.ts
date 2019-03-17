import { alphaNumericAndMarksRe, whitespaceRe, urlSuffixStartCharsRe, digitRe } from '../../regex-lib';
import { isAuthorityStartChar } from '../../uri-utils';
import { throwUnhandledCaseError, isUndefined } from '../../utils';

// For debugging: search for and uncomment other "For debugging" lines
//import CliTable from 'cli-table';

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

	// Check that the first input character is actually an authority start
	// character
	if( !isAuthorityStartChar( startChar ) ) {
		throw new Error( `The input character '${startChar}' was not a valid URI authority start character` );
	}

	let charIdx = startIdx,
		lastConfirmedUrlCharIdx = charIdx,
		state = ( digitRe.test( startChar ) ? State.IPv4AddressOctet : State.RegName ) as State,
		ipV4Address: number[] = [],  // if we're reading an IPv4 address, we'll add the 4 octets to this array
		lastIpV4AddressDotIdx: number | undefined = undefined,  // the index of the last dot in an IPv4 address
		authorityEnded = false;
		
	// For debugging: search for and uncomment other "For debugging" lines
	// const table = new CliTable( {
	// 	head: [ 'charIdx', 'char', 'state', 'lastConfirmedCharIdx', 'IPv4 Address' ]
	// } );

	for( ; charIdx < len; charIdx++ ) {
		const char = text.charAt( charIdx );

		// For debugging: search for and uncomment other "For debugging" lines
		// table.push( 
		// 	[ charIdx, char, State[ state ], lastConfirmedUrlCharIdx, ipV4Address.join( '.' ) ]
		// );

		switch( state ) {
			case State.IPv4AddressOctet: stateIPv4AddressNumber( char ); break;
			case State.IPV4AddressDot: stateIPv4AddressDot( char ); break;

			case State.RegName: stateRegName( char ); break;
			
			default: 
				throwUnhandledCaseError( state );
		}

		// For debugging: search for and uncomment other "For debugging" lines
		// table.push( 
		// 	[ charIdx, char, State[ state ], lastConfirmedUrlCharIdx, ipV4Address.join( '.' ) ] 
		// );

		if( authorityEnded ) {
			break;
		}
	}

	// For debugging: search for and uncomment other "For debugging" lines
	// console.log( '\n' + table.toString() );

	// Capture the last octet if we ran out of characters while reading an IPv4
	// Address octet
	if( state === State.IPv4AddressOctet ) {
		captureIPv4Octet();
	}

	// For debugging: search for and uncomment other "For debugging" lines
	// console.log( 'IPv4 address: ', ipV4Address );

	return { 
		isValidAuthority: isIPv4Address() ? isValidIPv4Address() : true,
		endIdx: charIdx - 1,   // -1 because we want to return the last character that was read before the character that ended the host/port. This makes the other parsing routines which leverage this function integrate it seamlessly
		lastConfirmedUrlCharIdx: ( !isIPv4Address() || isValidIPv4Address() ) ? lastConfirmedUrlCharIdx : startIdx - 1
	};


	function stateIPv4AddressNumber( char: string ) {
		if( isAuthorityEndChar( char ) ) {
			// '/', '?', '#', or whitespace encountered, must be the end of the
			// authority component of the URI
			authorityEnded = true;

		} else if( char === '.' ) {
			// Grab the current IPv4 address octet
			captureIPv4Octet();

			state = State.IPV4AddressDot;
			lastIpV4AddressDotIdx = charIdx;

		} else if( digitRe.test( char ) ) {
			// Stay in the IPv4AddressNumber state
			lastConfirmedUrlCharIdx = charIdx;

		} else if( alphaNumericAndMarksRe.test( char ) ) {
			state = State.RegName;
			lastConfirmedUrlCharIdx = charIdx;

		} else {
			authorityEnded = true;
		}
	}


	function stateIPv4AddressDot( char: string ) {
		if( isAuthorityEndChar( char ) ) {
			// '/', '?', '#', or whitespace encountered, must be the end of the
			// authority component of the URI
			authorityEnded = true;

		} else if( digitRe.test( char ) ) {
			state = State.IPv4AddressOctet;
			lastConfirmedUrlCharIdx = charIdx;

		} else if( alphaNumericAndMarksRe.test( char ) ) {
			state = State.RegName;
			lastConfirmedUrlCharIdx = charIdx;

		} else {
			authorityEnded = true;
		}
	}


	function stateRegName( char: string ) {
		if( isAuthorityEndChar( char ) ) {
			// '/', '?', '#', or whitespace encountered, must be the end of the
			// authority component of the URI
			authorityEnded = true;

		} else if( alphaNumericAndMarksRe.test( char ) ) {
			// A letter or digit is a "confirmed" URL character, whereas say, a
			// '.' is not because that may just end a natural language sentence.
			// Only if an alphanumeric character is encountered after the '.'
			// will we include the '.' as a "confirmed" character (along with 
			// the subsequent alphanumeric)
			lastConfirmedUrlCharIdx = charIdx;

		} else {
			// stay in the RegName state, but don't necessarily capture the
			// character. For instance, it could be a '.', but we'll only
			// capture it as a "confirmed" character if an alphanumeric comes
			// after it
		}
	}


	function captureIPv4Octet() {
		const octetStartIdx = isUndefined( lastIpV4AddressDotIdx ) ? startIdx : lastIpV4AddressDotIdx + 1,
		      octet = text.slice( octetStartIdx, charIdx );

		ipV4Address.push( +octet );
	}


	// Determines if the state machine ended in one of the IPv4 states
	function isIPv4Address() {
		return state === State.IPv4AddressOctet || state === State.IPV4AddressDot;
	}


	function isValidIPv4Address() {
		return (
			ipV4Address.length === 4 &&
			ipV4Address.every( octet => octet >= 0 && octet <= 255 )
		);
	}


	function isAuthorityEndChar( char: string ) {
		// '/', '?', '#', or whitespace encountered, must be the end of the
		// authority component of the URI
		return urlSuffixStartCharsRe.test( char ) || whitespaceRe.test( char );
	}
}


export interface ReadAuthorityResult {
	isValidAuthority: boolean;  // will be false if an IPv4 address was being read, but it did not form a valid IPv4 address. Ex: 1.2.3 (no 4th octet, and ending in a number)
	endIdx: number;  // the index of the last character *before* the character that ended the authority component of the URI. So if a space is encountered which ends the authority component, the endIdx will point to the character before the space
	lastConfirmedUrlCharIdx: number;  // the index of the last character that we can confirm is part of the authority component. Ex: a letter would be included, but a '.' may not be as it might end a natural language sentence. 
}


// TODO: const enum
enum State {
	IPv4AddressOctet = 0,  // state while reading a single octet (of the 4) of an IPv4 address
	IPV4AddressDot,

	RegName  // The "regname" BNF from the function's description
}


