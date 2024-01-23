/**
 * A regular expression that is simply the character class of the characters
 * that may be used in a domain name, minus the '-' or '.'
 */
export declare const domainNameCharRegex: RegExp;
/**
 * The set of characters that will start a URL suffix (i.e. the path, query, and
 * hash part of the URL)
 */
export declare const urlSuffixStartCharsRe: RegExp;
/**
 * The set of characters that are allowed in the URL suffix (i.e. the path,
 * query, and hash part of the URL) which may also form the ending character of
 * the URL.
 *
 * The {@link #urlSuffixNotAllowedAsLastCharRe} are additional allowed URL
 * suffix characters, but (generally) should not be the last character of a URL.
 */
export declare const urlSuffixAllowedSpecialCharsRe: RegExp;
/**
 * URL suffix characters (i.e. path, query, and has part of the URL) that are
 * not allowed as the *last character* in the URL suffix as they would normally
 * form the end of a sentence.
 *
 * The {@link #urlSuffixAllowedSpecialCharsRe} contains additional allowed URL
 * suffix characters which are allowed as the last character.
 */
export declare const urlSuffixNotAllowedAsLastCharRe: RegExp;
/**
 * Regular expression to match an http:// or https:// scheme.
 */
export declare const httpSchemeRe: RegExp;
/**
 * Regular expression to match an http:// or https:// scheme as the prefix of
 * a string.
 */
export declare const httpSchemePrefixRe: RegExp;
export declare const urlSuffixedCharsNotAllowedAtEndRe: RegExp;
/**
 * A regular expression used to determine the schemes we should not autolink
 */
export declare const invalidSchemeRe: RegExp;
export declare const schemeUrlRe: RegExp;
export declare const tldUrlHostRe: RegExp;
/**
 * Determines if the given character may start a scheme (ex: 'http').
 */
export declare function isSchemeStartChar(char: string): boolean;
/**
 * Determines if the given character is a valid character in a scheme (such as
 * 'http' or 'ssh+git'), but only after the start char (which is handled by
 * {@link isSchemeStartChar}.
 */
export declare function isSchemeChar(char: string): boolean;
/**
 * Determines if the character can begin a domain label, which must be an
 * alphanumeric character and not an underscore or dash.
 *
 * A domain label is a segment of a hostname such as subdomain.google.com.
 */
export declare function isDomainLabelStartChar(char: string): boolean;
/**
 * Determines if the character is part of a domain label (but not a domain label
 * start character).
 *
 * A domain label is a segment of a hostname such as subdomain.google.com.
 */
export declare function isDomainLabelChar(char: string): boolean;
/**
 * Determines if the character is a path character ("pchar") as defined by
 * https://tools.ietf.org/html/rfc3986#appendix-A
 *
 *     pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *
 *     unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *     pct-encoded   = "%" HEXDIG HEXDIG
 *     sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                   / "*" / "+" / "," / ";" / "="
 *
 * Note that this implementation doesn't follow the spec exactly, but rather
 * follows URL path characters found out in the wild (spec might be out of date?)
 */
export declare function isPathChar(char: string): boolean;
/**
 * Determines if the character given may begin the "URL Suffix" section of a
 * URI (i.e. the path, query, or hash section). These are the '/', '?' and '#'
 * characters.
 *
 * See https://tools.ietf.org/html/rfc3986#appendix-A
 */
export declare function isUrlSuffixStartChar(char: string): boolean;
/**
 * Determines if the TLD read in the host is a known TLD (Top-Level Domain).
 *
 * Example: 'com' would be a known TLD (for a host of 'google.com'), but
 * 'local' would not (for a domain name of 'my-computer.local').
 */
export declare function isKnownTld(tld: string): boolean;
/**
 * Determines if the given `url` is a valid scheme-prefixed URL.
 */
export declare function isValidSchemeUrl(url: string): boolean;
/**
 * Determines if the given `url` is a match with a valid TLD.
 */
export declare function isValidTldMatch(url: string): boolean;
/**
 * Determines if the given URL is a valid IPv4-prefixed URL.
 */
export declare function isValidIpV4Address(url: string): boolean;
