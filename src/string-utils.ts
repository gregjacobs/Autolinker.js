/**
 * Common UTF-16 character codes used by the string functions.
 *
 * This is a 'const' enum, meaning that the numerical value will be inlined into
 * the code when TypeScript is compiled.
 */
const enum Char {
    A = 65,
    Z = 90,
    a = 97,
    z = 122,
    Zero = 48, // char code for '0'
    Nine = 57, // char code for '9'
}

/**
 * Regular expression to match one or more upper and lowercase ASCII letters.
 *
 * Do not use for single letter checks. The {@link #isLetterChar} and
 * {@link #isLetterCharCode} functions are 10x faster.
 */
export const letterRe = /[A-Za-z]/;

/**
 * Determines if the given character is a letter char which matches the RegExp
 * `/[A-Za-z]/`
 */
export function isLetterChar(char: string): boolean {
    // Previous implementation of this function was just testing against the
    // /[A-Za-z]/ regexp, but this is 90% slower than testing by char code
    // ranges as ASCII values according to jsperf
    //return letterRe.test(char);

    return isLetterCharCode(char.charCodeAt(0));
}

/**
 * Determines if the given character code represents a letter char which matches
 * the RegExp `/[A-Za-z]/`
 */
export function isLetterCharCode(code: number): boolean {
    return (code >= Char.A && code <= Char.Z) || (code >= Char.a && code <= Char.z);
}

/**
 * Determines if the given character is a digit char which matches the RegExp
 * `/[\d]/`
 */
export function isDigitChar(char: string): boolean {
    // Previous implementation of this function was just testing against the
    // /[\d]/ regexp, but this is 95% slower than testing by char code
    // range as ASCII values according to jsperf
    //return letterRe.test(char);

    return isDigitCharCode(char.charCodeAt(0));
}

/**
 * Determines if the given character code represents a digit char which matches
 * the RegExp `/[\d]/`
 */
export function isDigitCharCode(code: number): boolean {
    return code >= Char.Zero && code <= Char.Nine;
}
