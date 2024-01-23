"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPhoneNumber = exports.isPhoneNumberControlChar = exports.isPhoneNumberSeparatorChar = void 0;
// Regex that holds the characters used to separate segments of a phone number
var separatorCharRe = /[-. ]/;
// Regex that specifies any delimiter char that allows us to treat the number as
// a phone number rather than just any other number that could appear in text.
var hasDelimCharsRe = /[-. ()]/;
// "Pause" and "Wait" control chars
var controlCharRe = /[,;]/;
// Over the years, many people have added to this regex, but it should have been
// split up by country. Maybe one day we can break this down.
var mostPhoneNumbers = /(?:(?:(?:(\+)?\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4})|(?:(\+)(?:9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)[-. ]?(?:\d[-. ]?){6,12}\d+))([,;]+[0-9]+#?)*/;
// Regex for Japanese phone numbers
var japanesePhoneRe = /(0([1-9]-?[1-9]\d{3}|[1-9]{2}-?\d{3}|[1-9]{2}\d{1}-?\d{2}|[1-9]{2}\d{2}-?\d{1})-?\d{4}|0[789]0-?\d{4}-?\d{4}|050-?\d{4}-?\d{4})/;
// Combined regex
var validPhoneNumberRe = new RegExp("^".concat(mostPhoneNumbers.source, "|").concat(japanesePhoneRe.source, "$"));
/**
 * Determines if the character is a phone number separator character (i.e.
 * '-', '.', or ' ' (space))
 */
function isPhoneNumberSeparatorChar(char) {
    return separatorCharRe.test(char);
}
exports.isPhoneNumberSeparatorChar = isPhoneNumberSeparatorChar;
/**
 * Determines if the character is a control character in a phone number. Control
 * characters are as follows:
 *
 * - ',': A 1 second pause. Useful for dialing extensions once the main phone number has been reached
 * - ';': A "wait" that waits for the user to take action (tap something, for instance on a smart phone)
 */
function isPhoneNumberControlChar(char) {
    return controlCharRe.test(char);
}
exports.isPhoneNumberControlChar = isPhoneNumberControlChar;
/**
 * Determines if the given phone number text found in a string is a valid phone
 * number.
 *
 * Our state machine parser is simplified to grab anything that looks like a
 * phone number, and this function confirms the match.
 */
function isValidPhoneNumber(phoneNumberText) {
    // We'll only consider the match as a phone number if there is some kind of
    // delimiter character (a prefixed '+' sign, or separator chars).
    //
    // Accepts:
    //     (123) 456-7890
    //     +38755233976
    // Does not accept:
    //     1234567890  (no delimiter chars - may just be a random number that's not a phone number)
    var hasDelimiters = phoneNumberText.charAt(0) === '+' || hasDelimCharsRe.test(phoneNumberText);
    return hasDelimiters && validPhoneNumberRe.test(phoneNumberText);
}
exports.isValidPhoneNumber = isValidPhoneNumber;
//# sourceMappingURL=phone-number-utils.js.map