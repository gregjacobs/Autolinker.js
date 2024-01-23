"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmail = exports.isEmailLocalPartChar = exports.isEmailLocalPartStartChar = exports.mailtoSchemePrefixRe = void 0;
var regex_lib_1 = require("../regex-lib");
var uri_utils_1 = require("./uri-utils");
/**
 * A regular expression to match a 'mailto:' prefix on an email address.
 */
exports.mailtoSchemePrefixRe = /^mailto:/i;
/**
 * Regular expression for all of the valid characters of the local part of an
 * email address.
 */
var emailLocalPartCharRegex = new RegExp("[".concat(regex_lib_1.alphaNumericAndMarksCharsStr, "!#$%&'*+/=?^_`{|}~-]"));
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
function isEmailLocalPartStartChar(char) {
    return regex_lib_1.alphaNumericAndMarksRe.test(char);
}
exports.isEmailLocalPartStartChar = isEmailLocalPartStartChar;
/**
 * Determines if the given character can be part of the "local part" of an email
 * address. The local part is the part to the left of the '@' sign.
 */
function isEmailLocalPartChar(char) {
    return emailLocalPartCharRegex.test(char);
}
exports.isEmailLocalPartChar = isEmailLocalPartChar;
/**
 * Determines if the given email address is valid. We consider it valid if it
 * has a valid TLD in its host.
 *
 * @param emailAddress email address
 * @return true is email have valid TLD, false otherwise
 */
function isValidEmail(emailAddress) {
    var emailAddressTld = emailAddress.split('.').pop() || '';
    return (0, uri_utils_1.isKnownTld)(emailAddressTld);
}
exports.isValidEmail = isValidEmail;
//# sourceMappingURL=email-utils.js.map