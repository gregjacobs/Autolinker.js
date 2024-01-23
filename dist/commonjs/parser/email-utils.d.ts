/**
 * A regular expression to match a 'mailto:' prefix on an email address.
 */
export declare const mailtoSchemePrefixRe: RegExp;
/**
 * Determines if the given character may start the "local part" of an email
 * address. The local part is the part to the left of the '@' sign.
 *
 * Technically according to the email spec, any of the characters in the
 * {@link emailLocalPartCharRegex} can start an email address (including any of
 * the special characters), but this is so rare in the wild and the
 * implementation is much simpler by only starting an email address with a word
 * character. This is especially important when matching the '{' character which
 * generally starts a brace that isn't part of the email address.
 */
export declare function isEmailLocalPartStartChar(char: string): boolean;
/**
 * Determines if the given character can be part of the "local part" of an email
 * address. The local part is the part to the left of the '@' sign.
 */
export declare function isEmailLocalPartChar(char: string): boolean;
/**
 * Determines if the given email address is valid. We consider it valid if it
 * has a valid TLD in its host.
 *
 * @param emailAddress email address
 * @return true is email have valid TLD, false otherwise
 */
export declare function isValidEmail(emailAddress: string): boolean;
