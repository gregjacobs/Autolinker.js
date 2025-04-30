import { isAlphaNumericOrMarkChar, isValidEmailLocalPartSpecialChar } from '../char-utils';
import { isKnownTld } from './uri-utils';

/**
 * A regular expression to match a 'mailto:' prefix on an email address.
 */
export const mailtoSchemePrefixRe = /^mailto:/i;

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
export const isEmailLocalPartStartChar = isAlphaNumericOrMarkChar; // alias for clarity

/**
 * Determines if the given character can be part of the "local part" of an email
 * address. The local part is the part to the left of the '@' sign.
 *
 * Checking for an email address's start char is handled with {@link #isEmailLocalPartStartChar}
 */
export function isEmailLocalPartChar(charCode: number): boolean {
    return isEmailLocalPartStartChar(charCode) || isValidEmailLocalPartSpecialChar(charCode);
}

/**
 * Determines if the given email address is valid. We consider it valid if it
 * has a valid TLD in its host.
 *
 * @param emailAddress email address
 * @return true is email have valid TLD, false otherwise
 */
export function isValidEmail(emailAddress: string): boolean {
    const emailAddressTld: string = emailAddress.split('.').pop()!; // as long as we have a valid string (as opposed to null or undefined), we will always get at least one element in the .split('.') array

    return isKnownTld(emailAddressTld);
}
