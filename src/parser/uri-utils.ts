import { alphaNumericAndMarksRe } from '../regex-lib';
import { Char, isDigitChar, isAsciiLetterChar } from '../char-utils';
import { tldRegex } from './known-tlds';

/**
 * A regular expression that is simply the character class of the characters
 * that may be used in a domain name, minus the '-' or '.'
 */
export const domainNameCharRegex = alphaNumericAndMarksRe;

/**
 * The set of characters that are allowed in the URL suffix (i.e. the path,
 * query, and hash part of the URL) which may also form the ending character of
 * the URL.
 *
 * The {@link #urlSuffixNotAllowedAsLastCharRe} are additional allowed URL
 * suffix characters, but (generally) should not be the last character of a URL.
 */
export const urlSuffixAllowedSpecialCharsRe = /[-+&@#/%=~_()|'$*[\]{}\u2713]/;

/**
 * URL suffix characters (i.e. path, query, and has part of the URL) that are
 * not allowed as the *last character* in the URL suffix as they would normally
 * form the end of a sentence.
 *
 * The {@link #urlSuffixAllowedSpecialCharsRe} contains additional allowed URL
 * suffix characters which are allowed as the last character.
 */
export const urlSuffixNotAllowedAsLastCharRe = /[?!:,.;^]/;

/**
 * Regular expression to match an http:// or https:// scheme.
 */
export const httpSchemeRe = /https?:\/\//i;

/**
 * Regular expression to match an http:// or https:// scheme as the prefix of
 * a string.
 */
export const httpSchemePrefixRe = new RegExp('^' + httpSchemeRe.source, 'i');

export const urlSuffixedCharsNotAllowedAtEndRe = new RegExp(
    urlSuffixNotAllowedAsLastCharRe.source + '$'
);

/**
 * A regular expression used to determine the schemes we should not autolink
 */
export const invalidSchemeRe = /^(javascript|vbscript):/i;

// A regular expression used to determine if the URL is a scheme match (such as
// 'http://google.com', and as opposed to a "TLD match"). This regular
// expression is used to parse out the host along with if the URL has an
// authority component (i.e. '//')
//
// Capturing groups:
//    1. '//' if the URL has an authority component, empty string otherwise
//    2. The host (if one exists). Ex: 'google.com'
//
// See https://www.rfc-editor.org/rfc/rfc3986#appendix-A for terminology
export const schemeUrlRe = /^[A-Za-z][-.+A-Za-z0-9]*:(\/\/)?([^:/]*)/;

// A regular expression used to determine if the URL is a TLD match (such as
// 'google.com', and as opposed to a "scheme match"). This regular
// expression is used to help parse out the TLD (top-level domain) of the host.
//
// See https://www.rfc-editor.org/rfc/rfc3986#appendix-A for terminology
export const tldUrlHostRe = /^(?:\/\/)?([^/#?:]+)/; // optionally prefixed with protocol-relative '//' chars

/**
 * Determines if the given character code represents a character that may start
 * a scheme (ex: the 'h' in 'http')
 */
export const isSchemeStartChar: (code: number) => boolean = isAsciiLetterChar; // Equivalent to checking the RegExp `/[A-Za-z]/`, but aliased for clarity and maintainability

/**
 * Determines if the given character is a valid character in a scheme (such as
 * 'http' or 'ssh+git'), but only after the start char (which is handled by
 * {@link isSchemeStartChar}.
 */
export function isSchemeChar(charCode: number): boolean {
    return (
        isAsciiLetterChar(charCode) ||
        isDigitChar(charCode) ||
        charCode === Char.Plus || // '+'
        charCode === Char.Dash || // '-'
        charCode === Char.Dot // '.'
    );
}

/**
 * Determines if the character can begin a domain label, which must be an
 * alphanumeric character and not an underscore or dash.
 *
 * A domain label is a segment of a hostname such as subdomain.google.com.
 */
export function isDomainLabelStartChar(char: string): boolean {
    return alphaNumericAndMarksRe.test(char);
}

/**
 * Determines if the character is part of a domain label (but not a domain label
 * start character).
 *
 * A domain label is a segment of a hostname such as subdomain.google.com.
 */
export function isDomainLabelChar(char: string): boolean {
    return char === '_' || isDomainLabelStartChar(char);
}

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
export function isPathChar(char: string): boolean {
    return (
        alphaNumericAndMarksRe.test(char) ||
        urlSuffixAllowedSpecialCharsRe.test(char) ||
        urlSuffixNotAllowedAsLastCharRe.test(char)
    );
}

/**
 * Determines if the character given may begin the "URL Suffix" section of a
 * URI (i.e. the path, query, or hash section). These are the '/', '?' and '#'
 * characters.
 *
 * See https://tools.ietf.org/html/rfc3986#appendix-A
 */
export function isUrlSuffixStartCharCode(charCode: number): boolean {
    return (
        charCode === Char.Slash || // '/'
        charCode === Char.Question || // '?'
        charCode === Char.NumberSign // '#'
    );
}

/**
 * Determines if the top-level domain (TLD) read in the host is a known TLD.
 *
 * Example: 'com' would be a known TLD (for a host of 'google.com'), but
 * 'local' would not (for a domain name of 'my-computer.local').
 */
export function isKnownTld(tld: string) {
    return tldRegex.test(tld.toLowerCase()); // make sure the tld is lowercase for the regex
}

/**
 * Determines if the given `url` is a valid scheme-prefixed URL.
 */
export function isValidSchemeUrl(url: string): boolean {
    // If the scheme is 'javascript:' or 'vbscript:', these link
    // types can be dangerous. Don't link them.
    if (invalidSchemeRe.test(url)) {
        return false;
    }

    const schemeMatch = url.match(schemeUrlRe);
    if (!schemeMatch) {
        return false;
    }

    const isAuthorityMatch = !!schemeMatch![1];
    const host = schemeMatch![2];
    if (isAuthorityMatch) {
        // Any match that has an authority ('//' chars) after the scheme is
        // valid, such as 'http://anything'
        return true;
    }

    // If there's no authority ('//' chars), check that we have a hostname
    // that looks valid.
    //
    // The host must contain at least one '.' char and have a domain label
    // with at least one letter to be considered valid.
    //
    // Accept:
    //   - git:domain.com (scheme followed by a host
    // Do not accept:
    //   - git:something ('something' doesn't look like a host)
    //   - version:1.0   ('1.0' doesn't look like a host)
    if (host.indexOf('.') === -1 || !/[A-Za-z]/.test(host)) {
        // `letterRe` RegExp checks for a letter anywhere in the host string
        return false;
    }
    return true;
}

/**
 * Determines if the given `url` is a match with a valid TLD.
 */
export function isValidTldMatch(url: string): boolean {
    // TLD URL such as 'google.com', we need to confirm that we have a valid
    // top-level domain
    const tldUrlHostMatch = url.match(tldUrlHostRe);
    if (!tldUrlHostMatch) {
        // At this point, if the URL didn't match our TLD re, it must be invalid
        // (highly unlikely to happen, but just in case)
        return false;
    }

    const host = tldUrlHostMatch[0];
    const hostLabels = host.split('.');
    if (hostLabels.length < 2) {
        // 0 or 1 host label, there's no TLD. Ex: 'localhost'
        return false;
    }

    const tld = hostLabels[hostLabels.length - 1];
    if (!isKnownTld(tld)) {
        return false;
    }

    // TODO: Implement these conditions for TLD matcher:
    // (
    //     this.longestDomainLabelLength <= 63 &&
    //     this.domainNameLength <= 255
    // );

    return true;
}

// Regular expression to confirm a valid IPv4 address (ex: '192.168.0.1')
const ipV4Re =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

// Regular expression used to split the IPv4 address itself from any port/path/query/hash
const ipV4PartRe = /[:/?#]/;

/**
 * Determines if the given URL is a valid IPv4-prefixed URL.
 */
export function isValidIpV4Address(url: string): boolean {
    // Grab just the IP address
    const ipV4Part = url.split(ipV4PartRe, 1)[0]; // only 1 result needed

    return ipV4Re.test(ipV4Part);
}
