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
}

/**
 * Determines if the given character is a letter char which matches the RegExp
 * `/[A-Za-z]/`
 */
export function isLetterChar(char: string): boolean {
    // Previous implementation of this function was using the /[A-Za-z]/ regexp,
    // but this is 90% slower than testing by char code ranges as numbers
    // according to jsperf
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
