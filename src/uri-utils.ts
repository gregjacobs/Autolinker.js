import { uriUnreservedRe, uriSubDelimsRe, urlSuffixStartCharsRe } from './regex-lib';
import { tldRegex } from './matcher/tld-regex';

/**
 * Determines if the character given may begin the "authority" section of a URI.
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
 * See https://tools.ietf.org/html/rfc3986#appendix-A
 */
export function isAuthorityStartChar( char: string ): boolean {
	// this condition is essentially the 'reg-name' ABNF component
	return (
		char === '%' ||  // begins a percent-encoded entity
		uriUnreservedRe.test( char ) ||
		uriSubDelimsRe.test( char )
	);
}



/**
 * Determines if the character given may begin the "URL Suffix" section of a 
 * URI (i.e. the path, query, or hash section)
 * 
 * See https://tools.ietf.org/html/rfc3986#appendix-A
 */
export function isUrlSuffixStartChar( char: string ) {
	return urlSuffixStartCharsRe.test( char );
}


/**
 * Determines if the TLD read in the host is a known TLD (Top-Level Domain).
 * 
 * Example: 'com' would be a known TLD (for a host of 'google.com'), but 
 * 'local' would not (for a domain name of 'my-computer.local').
 */
export function isKnownTld( tld: string ) {
	return tldRegex.test( tld );
}