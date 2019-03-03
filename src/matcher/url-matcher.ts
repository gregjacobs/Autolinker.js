import { Matcher, MatcherConfig } from "./matcher";
import { StripPrefixConfig } from "../autolinker";


/**
 * @abstract
 * @class Autolinker.matcher.Url
 * @extends Autolinker.matcher.Matcher
 *
 * Base class for the {@link Autolinker.matcher.SchemeUrl SchemeUrl} and 
 * {@link Autolinker.matcher.TldUrl TldUrl} matchers, which are responsible for
 * finding links in source text such as `http://google.com` or just `google.com`.
 *
 * See this class's superclass ({@link Autolinker.matcher.Matcher}) for more 
 * details on Matchers.
 * 
 * RFC for URLs: https://tools.ietf.org/html/rfc3986
 * 
 * Scheme ABNF (https://tools.ietf.org/html/rfc3986#section-3.1): 
 * 
 *     scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
 * 
 *     (Some observations: +, -, and . may repeat next to each other. Schemes
 *     may end with a '+', '-', or '.')
 * 
 * 
 * Domain Name BNF (https://tools.ietf.org/html/rfc1034#section-3.5), modified
 * to account for https://tools.ietf.org/html/rfc1123#section-2.1 which relaxes
 * domain name labels to be able to start with either a digit or a letter 
 * (rather than just a letter):
 * 
 *     <domain> ::= <subdomain> | " "
 *     <subdomain> ::= <label> | <subdomain> "." <label>
 *     <label> ::= <let-dig> [ [ <ldh-str> ] <let-dig> ]
 *     <ldh-str> ::= <let-dig-hyp> | <let-dig-hyp> <ldh-str>
 *     <let-dig-hyp> ::= <let-dig> | "-"
 *     <let-dig> ::= <letter> | <digit>
 *     <letter> ::= any one of the 52 alphabetic characters A through Z in
 *                  upper case and a through z in lower case
 *     <digit> ::= any one of the ten digits 0 through 9
 *
 *     Note: labels must be 63 characters or less
 * 
 *     (Some observations: '.'s may not repeat next to each other, but '-'s
 *     can. Domains cannot begin or end in a '.' or '-')
 * 
 * 
 * Full ABNF for scheme URI matches (https://tools.ietf.org/html/rfc3986#appendix-A):
 * 
 *     URI           = scheme ":" hier-part [ "?" query ] [ "#" fragment ]
 *
 *     hier-part     = "//" authority path-abempty
 *                   / path-absolute
 *                   / path-rootless
 *                   / path-empty
 * 
 *     URI-reference = URI / relative-ref
 * 
 *     absolute-URI  = scheme ":" hier-part [ "?" query ]
 * 
 *     relative-ref  = relative-part [ "?" query ] [ "#" fragment ]
 * 
 *     relative-part = "//" authority path-abempty
 *                   / path-absolute
 *                   / path-noscheme
 *                   / path-empty
 * 
 *     scheme        = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
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
 *     path          = path-abempty    ; begins with "/" or is empty
 *                   / path-absolute   ; begins with "/" but not "//"
 *                   / path-noscheme   ; begins with a non-colon segment
 *                   / path-rootless   ; begins with a segment
 *                   / path-empty      ; zero characters
 * 
 *     path-abempty  = *( "/" segment )
 *     path-absolute = "/" [ segment-nz *( "/" segment ) ]
 *     path-noscheme = segment-nz-nc *( "/" segment )
 *     path-rootless = segment-nz *( "/" segment )
 *     path-empty    = 0<pchar>
 * 
 *     segment       = *pchar
 *     segment-nz    = 1*pchar
 *     segment-nz-nc = 1*( unreserved / pct-encoded / sub-delims / "@" )
 *                   ; non-zero-length segment without any colon ":"
 * 
 *     pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 * 
 *     query         = *( pchar / "/" / "?" )
 * 
 *     fragment      = *( pchar / "/" / "?" )
 * 
 *     pct-encoded   = "%" HEXDIG HEXDIG
 * 
 *     unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *     reserved      = gen-delims / sub-delims
 *     gen-delims    = ":" / "/" / "?" / "#" / "[" / "]" / "@"
 *     sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                   / "*" / "+" / "," / ";" / "="
 */
export abstract class UrlMatcher extends Matcher {

	/**
	 * @cfg {Object} stripPrefix (required)
	 *
	 * The Object form of {@link Autolinker#cfg-stripPrefix}.
	 */
	protected stripPrefix: StripPrefixConfig = { scheme: true, www: true };  // default value just to get the above doc comment in the ES5 output and documentation generator

	/**
	 * @cfg {Boolean} stripTrailingSlash (required)
	 * @inheritdoc Autolinker#stripTrailingSlash
	 */
	protected stripTrailingSlash: boolean = true;  // default value just to get the above doc comment in the ES5 output and documentation generator

	/**
	 * @cfg {Boolean} decodePercentEncoding (required)
	 * @inheritdoc Autolinker#decodePercentEncoding
	 */
	protected decodePercentEncoding: boolean = true;  // default value just to get the above doc comment in the ES5 output and documentation generator


	/**
	 * @method constructor
	 * @param {Object} cfg The configuration properties for the Match instance,
	 *   specified in an Object (map).
	 */
	constructor( cfg: UrlMatcherConfig ) {
		super( cfg );

		this.stripPrefix = cfg.stripPrefix;
		this.stripTrailingSlash = cfg.stripTrailingSlash;
		this.decodePercentEncoding = cfg.decodePercentEncoding;
	}


	/**
	 * Determines if a match found has an unmatched closing parenthesis. If so,
	 * this parenthesis will be removed from the match itself, and appended
	 * after the generated anchor tag.
	 *
	 * A match may have an extra closing parenthesis at the end of the match
	 * because the regular expression must include parenthesis for URLs such as
	 * "wikipedia.com/something_(disambiguation)", which should be auto-linked.
	 *
	 * However, an extra parenthesis *will* be included when the URL itself is
	 * wrapped in parenthesis, such as in the case of "(wikipedia.com/something_(disambiguation))".
	 * In this case, the last closing parenthesis should *not* be part of the
	 * URL itself, and this method will return `true`.
	 *
	 * @protected
	 * @param {String} matchStr The full match string from the {@link #matcherRegex}.
	 * @return {Boolean} `true` if there is an unbalanced closing parenthesis at
	 *   the end of the `matchStr`, `false` otherwise.
	 */
	// protected matchHasUnbalancedClosingParen( matchStr: string ) {
	// 	let lastChar = matchStr.charAt( matchStr.length - 1 );

	// 	if( lastChar === ')' ) {
	// 		let openParensMatch = matchStr.match( this.openParensRe ),
	// 		    closeParensMatch = matchStr.match( this.closeParensRe ),
	// 		    numOpenParens = ( openParensMatch && openParensMatch.length ) || 0,
	// 		    numCloseParens = ( closeParensMatch && closeParensMatch.length ) || 0;

	// 		if( numOpenParens < numCloseParens ) {
	// 			return true;
	// 		}
	// 	}

	// 	return false;
	// }


	/**
	 * Determine if there's an invalid character after the TLD in a URL. Valid
	 * characters after TLD are ':/?#'. Exclude scheme matched URLs from this
	 * check.
	 *
	 * See issue #200
	 *
	 * @protected
	 * @param {String} urlMatch The matched URL, if there was one. Will be an
	 *   empty string if the match is not a URL match.
	 * @param {String} schemeUrlMatch The match URL string for a scheme
	 *   match. Ex: 'http://yahoo.com'. This is used to match something like
	 *   'http://localhost', where we won't double check that the domain name
	 *   has at least one '.' in it.
	 * @return {Number} the position where the invalid character was found. If
	 *   no such character was found, returns -1
	 */
	// protected matchHasInvalidCharAfterTld( urlMatch: string, schemeUrlMatch: string ) {
	// 	if( !urlMatch ) {
	// 		return -1;
	// 	}

	// 	let offset = 0;
	// 	if ( schemeUrlMatch ) {
	// 		offset = urlMatch.indexOf(':');
	// 		urlMatch = urlMatch.slice(offset);
	// 	}

	// 	let re = new RegExp( "^((.?\/\/)?[-." + alphaNumericAndMarksCharsStr + "]*[-" + alphaNumericAndMarksCharsStr + "]\\.[-" + alphaNumericAndMarksCharsStr + "]+)" );
	// 	let res = re.exec( urlMatch );
	// 	if ( res === null ) {
	// 		return -1;
	// 	}

	// 	offset += res[1].length;
	// 	urlMatch = urlMatch.slice(res[1].length);
	// 	if (/^[^-.A-Za-z0-9:\/?#]/.test(urlMatch)) {
	// 		return offset;
	// 	}

	// 	return -1;
	// }

}

export interface UrlMatcherConfig extends MatcherConfig {
	stripPrefix: StripPrefixConfig;
	stripTrailingSlash: boolean;
	decodePercentEncoding: boolean;
}