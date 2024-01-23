import { alphaNumericAndMarksCharsStr, alphaNumericAndMarksRe } from '../regex-lib';
import { isKnownTld } from './uri-utils';
/**
 * A regular expression to match a 'mailto:' prefix on an email address.
 */
export var mailtoSchemePrefixRe = /^mailto:/i;
/**
 * Regular expression for all of the valid characters of the local part of an
 * email address.
 */
var emailLocalPartCharRegex = new RegExp("[".concat(alphaNumericAndMarksCharsStr, "!#$%&'*+/=?^_`{|}~-]"));
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
export function isEmailLocalPartStartChar(char) {
    return alphaNumericAndMarksRe.test(char);
}
/**
 * Determines if the given character can be part of the "local part" of an email
 * address. The local part is the part to the left of the '@' sign.
 */
export function isEmailLocalPartChar(char) {
    return emailLocalPartCharRegex.test(char);
}
/**
 * Determines if the given email address is valid. We consider it valid if it
 * has a valid TLD in its host.
 *
 * @param emailAddress email address
 * @return true is email have valid TLD, false otherwise
 */
export function isValidEmail(emailAddress) {
    var emailAddressTld = emailAddress.split('.').pop() || '';
    return isKnownTld(emailAddressTld);
}
//# sourceMappingURL=email-utils.js.map