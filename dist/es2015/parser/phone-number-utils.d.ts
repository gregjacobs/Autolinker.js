/**
 * Determines if the character is a phone number separator character (i.e.
 * '-', '.', or ' ' (space))
 */
export declare function isPhoneNumberSeparatorChar(char: string): boolean;
/**
 * Determines if the character is a control character in a phone number. Control
 * characters are as follows:
 *
 * - ',': A 1 second pause. Useful for dialing extensions once the main phone number has been reached
 * - ';': A "wait" that waits for the user to take action (tap something, for instance on a smart phone)
 */
export declare function isPhoneNumberControlChar(char: string): boolean;
/**
 * Determines if the given phone number text found in a string is a valid phone
 * number.
 *
 * Our state machine parser is simplified to grab anything that looks like a
 * phone number, and this function confirms the match.
 */
export declare function isValidPhoneNumber(phoneNumberText: string): boolean;
