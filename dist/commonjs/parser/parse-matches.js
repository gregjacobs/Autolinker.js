"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.excludeUnbalancedTrailingBracesAndPunctuation = exports.parseMatches = void 0;
var regex_lib_1 = require("../regex-lib");
var url_match_1 = require("../match/url-match");
var utils_1 = require("../utils");
var uri_utils_1 = require("./uri-utils");
var email_utils_1 = require("./email-utils");
var email_match_1 = require("../match/email-match");
var hashtag_utils_1 = require("./hashtag-utils");
var hashtag_match_1 = require("../match/hashtag-match");
var mention_utils_1 = require("./mention-utils");
var mention_match_1 = require("../match/mention-match");
var phone_number_utils_1 = require("./phone-number-utils");
var phone_match_1 = require("../match/phone-match");
// For debugging: search for and uncomment other "For debugging" lines
// import CliTable from 'cli-table';
/**
 * Parses URL, email, twitter, mention, and hashtag matches from the given
 * `text`.
 */
function parseMatches(text, args) {
    var tagBuilder = args.tagBuilder;
    var stripPrefix = args.stripPrefix;
    var stripTrailingSlash = args.stripTrailingSlash;
    var decodePercentEncoding = args.decodePercentEncoding;
    var hashtagServiceName = args.hashtagServiceName;
    var mentionServiceName = args.mentionServiceName;
    var matches = [];
    var textLen = text.length;
    // An array of all active state machines. Empty array means we're in the
    // "no url" state
    var stateMachines = [];
    // For debugging: search for and uncomment other "For debugging" lines
    // const table = new CliTable({
    //     head: ['charIdx', 'char', 'states', 'charIdx', 'startIdx', 'reached accept state'],
    // });
    var charIdx = 0;
    for (; charIdx < textLen; charIdx++) {
        var char = text.charAt(charIdx);
        if (stateMachines.length === 0) {
            stateNoMatch(char);
        }
        else {
            // Must loop through the state machines backwards for when one
            // is removed
            for (var stateIdx = stateMachines.length - 1; stateIdx >= 0; stateIdx--) {
                var stateMachine = stateMachines[stateIdx];
                switch (stateMachine.state) {
                    // Protocol-relative URL states
                    case 11 /* State.ProtocolRelativeSlash1 */:
                        stateProtocolRelativeSlash1(stateMachine, char);
                        break;
                    case 12 /* State.ProtocolRelativeSlash2 */:
                        stateProtocolRelativeSlash2(stateMachine, char);
                        break;
                    case 0 /* State.SchemeChar */:
                        stateSchemeChar(stateMachine, char);
                        break;
                    case 1 /* State.SchemeHyphen */:
                        stateSchemeHyphen(stateMachine, char);
                        break;
                    case 2 /* State.SchemeColon */:
                        stateSchemeColon(stateMachine, char);
                        break;
                    case 3 /* State.SchemeSlash1 */:
                        stateSchemeSlash1(stateMachine, char);
                        break;
                    case 4 /* State.SchemeSlash2 */:
                        stateSchemeSlash2(stateMachine, char);
                        break;
                    case 5 /* State.DomainLabelChar */:
                        stateDomainLabelChar(stateMachine, char);
                        break;
                    case 6 /* State.DomainHyphen */:
                        stateDomainHyphen(stateMachine, char);
                        break;
                    case 7 /* State.DomainDot */:
                        stateDomainDot(stateMachine, char);
                        break;
                    case 13 /* State.IpV4Digit */:
                        stateIpV4Digit(stateMachine, char);
                        break;
                    case 14 /* State.IpV4Dot */:
                        stateIPv4Dot(stateMachine, char);
                        break;
                    case 8 /* State.PortColon */:
                        statePortColon(stateMachine, char);
                        break;
                    case 9 /* State.PortNumber */:
                        statePortNumber(stateMachine, char);
                        break;
                    case 10 /* State.Path */:
                        statePath(stateMachine, char);
                        break;
                    // Email States
                    case 15 /* State.EmailMailto_M */:
                        stateEmailMailto_M(stateMachine, char);
                        break;
                    case 16 /* State.EmailMailto_A */:
                        stateEmailMailto_A(stateMachine, char);
                        break;
                    case 17 /* State.EmailMailto_I */:
                        stateEmailMailto_I(stateMachine, char);
                        break;
                    case 18 /* State.EmailMailto_L */:
                        stateEmailMailto_L(stateMachine, char);
                        break;
                    case 19 /* State.EmailMailto_T */:
                        stateEmailMailto_T(stateMachine, char);
                        break;
                    case 20 /* State.EmailMailto_O */:
                        stateEmailMailto_O(stateMachine, char);
                        break;
                    case 21 /* State.EmailMailto_Colon */:
                        stateEmailMailtoColon(stateMachine, char);
                        break;
                    case 22 /* State.EmailLocalPart */:
                        stateEmailLocalPart(stateMachine, char);
                        break;
                    case 23 /* State.EmailLocalPartDot */:
                        stateEmailLocalPartDot(stateMachine, char);
                        break;
                    case 24 /* State.EmailAtSign */:
                        stateEmailAtSign(stateMachine, char);
                        break;
                    case 25 /* State.EmailDomainChar */:
                        stateEmailDomainChar(stateMachine, char);
                        break;
                    case 26 /* State.EmailDomainHyphen */:
                        stateEmailDomainHyphen(stateMachine, char);
                        break;
                    case 27 /* State.EmailDomainDot */:
                        stateEmailDomainDot(stateMachine, char);
                        break;
                    // Hashtag states
                    case 28 /* State.HashtagHashChar */:
                        stateHashtagHashChar(stateMachine, char);
                        break;
                    case 29 /* State.HashtagTextChar */:
                        stateHashtagTextChar(stateMachine, char);
                        break;
                    // Mention states
                    case 30 /* State.MentionAtChar */:
                        stateMentionAtChar(stateMachine, char);
                        break;
                    case 31 /* State.MentionTextChar */:
                        stateMentionTextChar(stateMachine, char);
                        break;
                    // Phone number states
                    case 32 /* State.PhoneNumberOpenParen */:
                        statePhoneNumberOpenParen(stateMachine, char);
                        break;
                    case 33 /* State.PhoneNumberAreaCodeDigit1 */:
                        statePhoneNumberAreaCodeDigit1(stateMachine, char);
                        break;
                    case 34 /* State.PhoneNumberAreaCodeDigit2 */:
                        statePhoneNumberAreaCodeDigit2(stateMachine, char);
                        break;
                    case 35 /* State.PhoneNumberAreaCodeDigit3 */:
                        statePhoneNumberAreaCodeDigit3(stateMachine, char);
                        break;
                    case 36 /* State.PhoneNumberCloseParen */:
                        statePhoneNumberCloseParen(stateMachine, char);
                        break;
                    case 37 /* State.PhoneNumberPlus */:
                        statePhoneNumberPlus(stateMachine, char);
                        break;
                    case 38 /* State.PhoneNumberDigit */:
                        statePhoneNumberDigit(stateMachine, char);
                        break;
                    case 39 /* State.PhoneNumberSeparator */:
                        statePhoneNumberSeparator(stateMachine, char);
                        break;
                    case 40 /* State.PhoneNumberControlChar */:
                        statePhoneNumberControlChar(stateMachine, char);
                        break;
                    case 41 /* State.PhoneNumberPoundChar */:
                        statePhoneNumberPoundChar(stateMachine, char);
                        break;
                    default:
                        (0, utils_1.assertNever)(stateMachine.state);
                }
            }
        }
        // For debugging: search for and uncomment other "For debugging" lines
        // table.push([
        //     charIdx,
        //     char,
        //     stateMachines.map(machine => State[machine.state]).join('\n') || '(none)',
        //     charIdx,
        //     stateMachines.map(m => m.startIdx).join('\n'),
        //     stateMachines.map(m => m.acceptStateReached).join('\n'),
        // ]);
    }
    // Capture any valid match at the end of the string
    // Note: this loop must happen in reverse because
    // captureMatchIfValidAndRemove() removes state machines from the array
    // and we'll end up skipping every other one if we remove while looping
    // forward
    for (var i = stateMachines.length - 1; i >= 0; i--) {
        stateMachines.forEach(function (stateMachine) { return captureMatchIfValidAndRemove(stateMachine); });
    }
    // For debugging: search for and uncomment other "For debugging" lines
    // console.log(`\nRead string:\n  ${text}`);
    // console.log(table.toString());
    return matches;
    // Handles the state when we're not in a URL/email/etc. (i.e. when no state machines exist)
    function stateNoMatch(char) {
        if (char === '#') {
            // Hash char, start a Hashtag match
            stateMachines.push(createHashtagStateMachine(charIdx, 28 /* State.HashtagHashChar */));
        }
        else if (char === '@') {
            // '@' char, start a Mention match
            stateMachines.push(createMentionStateMachine(charIdx, 30 /* State.MentionAtChar */));
        }
        else if (char === '/') {
            // A slash could begin a protocol-relative URL
            stateMachines.push(createTldUrlStateMachine(charIdx, 11 /* State.ProtocolRelativeSlash1 */));
        }
        else if (char === '+') {
            // A '+' char can start a Phone number
            stateMachines.push(createPhoneNumberStateMachine(charIdx, 37 /* State.PhoneNumberPlus */));
        }
        else if (char === '(') {
            stateMachines.push(createPhoneNumberStateMachine(charIdx, 32 /* State.PhoneNumberOpenParen */));
        }
        else {
            if (regex_lib_1.digitRe.test(char)) {
                // A digit could start a phone number
                stateMachines.push(createPhoneNumberStateMachine(charIdx, 38 /* State.PhoneNumberDigit */));
                // A digit could start an IP address
                stateMachines.push(createIpV4UrlStateMachine(charIdx, 13 /* State.IpV4Digit */));
            }
            if ((0, email_utils_1.isEmailLocalPartStartChar)(char)) {
                // Any email local part. An 'm' character in particular could
                // start a 'mailto:' match
                var startState = char.toLowerCase() === 'm' ? 15 /* State.EmailMailto_M */ : 22 /* State.EmailLocalPart */;
                stateMachines.push(createEmailStateMachine(charIdx, startState));
            }
            if ((0, uri_utils_1.isSchemeStartChar)(char)) {
                // An uppercase or lowercase letter may start a scheme match
                stateMachines.push(createSchemeUrlStateMachine(charIdx, 0 /* State.SchemeChar */));
            }
            if (regex_lib_1.alphaNumericAndMarksRe.test(char)) {
                // A unicode alpha character or digit could start a domain name
                // label for a TLD match
                stateMachines.push(createTldUrlStateMachine(charIdx, 5 /* State.DomainLabelChar */));
            }
        }
        // Anything else, remain in the "non-url" state by not creating any
        // state machines
    }
    // Implements ABNF: ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
    function stateSchemeChar(stateMachine, char) {
        if (char === ':') {
            stateMachine.state = 2 /* State.SchemeColon */;
        }
        else if (char === '-') {
            stateMachine.state = 1 /* State.SchemeHyphen */;
        }
        else if ((0, uri_utils_1.isSchemeChar)(char)) {
            // Stay in SchemeChar state
        }
        else {
            // Any other character, not a scheme
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
    }
    function stateSchemeHyphen(stateMachine, char) {
        if (char === '-') {
            // Stay in SchemeHyphen state
            // TODO: Should a colon following a dash be counted as the end of the scheme?
            // } else if (char === ':') {
            //     stateMachine.state = State.SchemeColon;
        }
        else if (char === '/') {
            // Not a valid scheme match, but may be the start of a
            // protocol-relative match (such as //google.com)
            (0, utils_1.remove)(stateMachines, stateMachine);
            stateMachines.push(createTldUrlStateMachine(charIdx, 11 /* State.ProtocolRelativeSlash1 */));
        }
        else if ((0, uri_utils_1.isSchemeChar)(char)) {
            stateMachine.state = 0 /* State.SchemeChar */;
        }
        else {
            // Any other character, not a scheme
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
    }
    function stateSchemeColon(stateMachine, char) {
        if (char === '/') {
            stateMachine.state = 3 /* State.SchemeSlash1 */;
        }
        else if (char === '.') {
            // We've read something like 'hello:.' - don't capture
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
        else if ((0, uri_utils_1.isDomainLabelStartChar)(char)) {
            stateMachine.state = 5 /* State.DomainLabelChar */;
            // It's possible that we read an "introduction" piece of text,
            // and the character after the current colon actually starts an
            // actual scheme. An example of this is:
            //     "The link:http://google.com"
            // Hence, start a new machine to capture this match if so
            if ((0, uri_utils_1.isSchemeStartChar)(char)) {
                stateMachines.push(createSchemeUrlStateMachine(charIdx, 0 /* State.SchemeChar */));
            }
        }
        else {
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
    }
    function stateSchemeSlash1(stateMachine, char) {
        if (char === '/') {
            stateMachine.state = 4 /* State.SchemeSlash2 */;
        }
        else if ((0, uri_utils_1.isPathChar)(char)) {
            stateMachine.state = 10 /* State.Path */;
            stateMachine.acceptStateReached = true;
        }
        else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }
    function stateSchemeSlash2(stateMachine, char) {
        if (char === '/') {
            // 3rd slash, must be an absolute path (path-absolute in the
            // ABNF), such as in a file:///c:/windows/etc. See
            // https://tools.ietf.org/html/rfc3986#appendix-A
            stateMachine.state = 10 /* State.Path */;
        }
        else if ((0, uri_utils_1.isDomainLabelStartChar)(char)) {
            // start of "authority" section - see https://tools.ietf.org/html/rfc3986#appendix-A
            stateMachine.state = 5 /* State.DomainLabelChar */;
            stateMachine.acceptStateReached = true;
        }
        else {
            // not valid
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
    }
    // Handles reading a '/' from the NonUrl state
    function stateProtocolRelativeSlash1(stateMachine, char) {
        if (char === '/') {
            stateMachine.state = 12 /* State.ProtocolRelativeSlash2 */;
        }
        else {
            // Anything else, cannot be the start of a protocol-relative
            // URL.
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
    }
    // Handles reading a second '/', which could start a protocol-relative URL
    function stateProtocolRelativeSlash2(stateMachine, char) {
        if ((0, uri_utils_1.isDomainLabelStartChar)(char)) {
            stateMachine.state = 5 /* State.DomainLabelChar */;
        }
        else {
            // Anything else, not a URL
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
    }
    // Handles when we have read a domain label character
    function stateDomainLabelChar(stateMachine, char) {
        if (char === '.') {
            stateMachine.state = 7 /* State.DomainDot */;
        }
        else if (char === '-') {
            stateMachine.state = 6 /* State.DomainHyphen */;
        }
        else if (char === ':') {
            // Beginning of a port number, end the domain name
            stateMachine.state = 8 /* State.PortColon */;
        }
        else if ((0, uri_utils_1.isUrlSuffixStartChar)(char)) {
            // '/', '?', or '#'
            stateMachine.state = 10 /* State.Path */;
        }
        else if ((0, uri_utils_1.isDomainLabelChar)(char)) {
            // Stay in the DomainLabelChar state
        }
        else {
            // Anything else, end the domain name
            captureMatchIfValidAndRemove(stateMachine);
        }
    }
    function stateDomainHyphen(stateMachine, char) {
        if (char === '-') {
            // Remain in the DomainHyphen state
        }
        else if (char === '.') {
            // Not valid to have a '-.' in a domain label
            captureMatchIfValidAndRemove(stateMachine);
        }
        else if ((0, uri_utils_1.isDomainLabelStartChar)(char)) {
            stateMachine.state = 5 /* State.DomainLabelChar */;
        }
        else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }
    function stateDomainDot(stateMachine, char) {
        if (char === '.') {
            // domain names cannot have multiple '.'s next to each other.
            // It's possible we've already read a valid domain name though,
            // and that the '..' sequence just forms an ellipsis at the end
            // of a sentence
            captureMatchIfValidAndRemove(stateMachine);
        }
        else if ((0, uri_utils_1.isDomainLabelStartChar)(char)) {
            stateMachine.state = 5 /* State.DomainLabelChar */;
            stateMachine.acceptStateReached = true; // after hitting a dot, and then another domain label, we've reached an accept state
        }
        else {
            // Anything else, end the domain name
            captureMatchIfValidAndRemove(stateMachine);
        }
    }
    function stateIpV4Digit(stateMachine, char) {
        if (char === '.') {
            stateMachine.state = 14 /* State.IpV4Dot */;
        }
        else if (char === ':') {
            // Beginning of a port number
            stateMachine.state = 8 /* State.PortColon */;
        }
        else if (regex_lib_1.digitRe.test(char)) {
            // stay in the IPv4 digit state
        }
        else if ((0, uri_utils_1.isUrlSuffixStartChar)(char)) {
            stateMachine.state = 10 /* State.Path */;
        }
        else if (regex_lib_1.alphaNumericAndMarksRe.test(char)) {
            // If we hit an alpha character, must not be an IPv4
            // Example of this: 1.2.3.4abc
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
        else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }
    function stateIPv4Dot(stateMachine, char) {
        if (regex_lib_1.digitRe.test(char)) {
            stateMachine.octetsEncountered++;
            // Once we have encountered 4 octets, it's *potentially* a valid
            // IPv4 address. Our IPv4 regex will confirm the match later
            // though to make sure each octet is in the 0-255 range, and
            // there's exactly 4 octets (not 5 or more)
            if (stateMachine.octetsEncountered === 4) {
                stateMachine.acceptStateReached = true;
            }
            stateMachine.state = 13 /* State.IpV4Digit */;
        }
        else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }
    function statePortColon(stateMachine, char) {
        if (regex_lib_1.digitRe.test(char)) {
            stateMachine.state = 9 /* State.PortNumber */;
        }
        else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }
    function statePortNumber(stateMachine, char) {
        if (regex_lib_1.digitRe.test(char)) {
            // Stay in port number state
        }
        else if ((0, uri_utils_1.isUrlSuffixStartChar)(char)) {
            // '/', '?', or '#'
            stateMachine.state = 10 /* State.Path */;
        }
        else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }
    function statePath(stateMachine, char) {
        if ((0, uri_utils_1.isPathChar)(char)) {
            // Stay in the path state
        }
        else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }
    // Handles if we're reading a 'mailto:' prefix on the string
    function stateEmailMailto_M(stateMachine, char) {
        if (char.toLowerCase() === 'a') {
            stateMachine.state = 16 /* State.EmailMailto_A */;
        }
        else {
            stateEmailLocalPart(stateMachine, char);
        }
    }
    function stateEmailMailto_A(stateMachine, char) {
        if (char.toLowerCase() === 'i') {
            stateMachine.state = 17 /* State.EmailMailto_I */;
        }
        else {
            stateEmailLocalPart(stateMachine, char);
        }
    }
    function stateEmailMailto_I(stateMachine, char) {
        if (char.toLowerCase() === 'l') {
            stateMachine.state = 18 /* State.EmailMailto_L */;
        }
        else {
            stateEmailLocalPart(stateMachine, char);
        }
    }
    function stateEmailMailto_L(stateMachine, char) {
        if (char.toLowerCase() === 't') {
            stateMachine.state = 19 /* State.EmailMailto_T */;
        }
        else {
            stateEmailLocalPart(stateMachine, char);
        }
    }
    function stateEmailMailto_T(stateMachine, char) {
        if (char.toLowerCase() === 'o') {
            stateMachine.state = 20 /* State.EmailMailto_O */;
        }
        else {
            stateEmailLocalPart(stateMachine, char);
        }
    }
    function stateEmailMailto_O(stateMachine, char) {
        if (char.toLowerCase() === ':') {
            stateMachine.state = 21 /* State.EmailMailto_Colon */;
        }
        else {
            stateEmailLocalPart(stateMachine, char);
        }
    }
    function stateEmailMailtoColon(stateMachine, char) {
        if ((0, email_utils_1.isEmailLocalPartChar)(char)) {
            stateMachine.state = 22 /* State.EmailLocalPart */;
        }
        else {
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
    }
    // Handles the state when we're currently in the "local part" of an
    // email address (as opposed to the "domain part")
    function stateEmailLocalPart(stateMachine, char) {
        if (char === '.') {
            stateMachine.state = 23 /* State.EmailLocalPartDot */;
        }
        else if (char === '@') {
            stateMachine.state = 24 /* State.EmailAtSign */;
        }
        else if ((0, email_utils_1.isEmailLocalPartChar)(char)) {
            // stay in the "local part" of the email address
            // Note: because stateEmailLocalPart() is called from the
            // 'mailto' states (when the 'mailto' prefix itself has been
            // broken), make sure to set the state to EmailLocalPart
            stateMachine.state = 22 /* State.EmailLocalPart */;
        }
        else {
            // not an email address character
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
    }
    // Handles the state where we've read
    function stateEmailLocalPartDot(stateMachine, char) {
        if (char === '.') {
            // We read a second '.' in a row, not a valid email address
            // local part
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
        else if (char === '@') {
            // We read the '@' character immediately after a dot ('.'), not
            // an email address
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
        else if ((0, email_utils_1.isEmailLocalPartChar)(char)) {
            stateMachine.state = 22 /* State.EmailLocalPart */;
        }
        else {
            // Anything else, not an email address
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
    }
    function stateEmailAtSign(stateMachine, char) {
        if ((0, uri_utils_1.isDomainLabelStartChar)(char)) {
            stateMachine.state = 25 /* State.EmailDomainChar */;
        }
        else {
            // Anything else, not an email address
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
    }
    function stateEmailDomainChar(stateMachine, char) {
        if (char === '.') {
            stateMachine.state = 27 /* State.EmailDomainDot */;
        }
        else if (char === '-') {
            stateMachine.state = 26 /* State.EmailDomainHyphen */;
        }
        else if ((0, uri_utils_1.isDomainLabelChar)(char)) {
            // Stay in the DomainChar state
        }
        else {
            // Anything else, we potentially matched if the criteria has
            // been met
            captureMatchIfValidAndRemove(stateMachine);
        }
    }
    function stateEmailDomainHyphen(stateMachine, char) {
        if (char === '-' || char === '.') {
            // Not valid to have two hyphens ("--") or hypen+dot ("-.")
            captureMatchIfValidAndRemove(stateMachine);
        }
        else if ((0, uri_utils_1.isDomainLabelChar)(char)) {
            stateMachine.state = 25 /* State.EmailDomainChar */;
        }
        else {
            // Anything else
            captureMatchIfValidAndRemove(stateMachine);
        }
    }
    function stateEmailDomainDot(stateMachine, char) {
        if (char === '.' || char === '-') {
            // not valid to have two dots ("..") or dot+hypen (".-")
            captureMatchIfValidAndRemove(stateMachine);
        }
        else if ((0, uri_utils_1.isDomainLabelStartChar)(char)) {
            stateMachine.state = 25 /* State.EmailDomainChar */;
            // After having read a '.' and then a valid domain character,
            // we now know that the domain part of the email is valid, and
            // we have found at least a partial EmailMatch (however, the
            // email address may have additional characters from this point)
            stateMachine.acceptStateReached = true;
        }
        else {
            // Anything else
            captureMatchIfValidAndRemove(stateMachine);
        }
    }
    // Handles the state when we've just encountered a '#' character
    function stateHashtagHashChar(stateMachine, char) {
        if ((0, hashtag_utils_1.isHashtagTextChar)(char)) {
            // '#' char with valid hash text char following
            stateMachine.state = 29 /* State.HashtagTextChar */;
            stateMachine.acceptStateReached = true;
        }
        else {
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
    }
    // Handles the state when we're currently in the hash tag's text chars
    function stateHashtagTextChar(stateMachine, char) {
        if ((0, hashtag_utils_1.isHashtagTextChar)(char)) {
            // Continue reading characters in the HashtagText state
        }
        else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }
    // Handles the state when we've just encountered a '@' character
    function stateMentionAtChar(stateMachine, char) {
        if ((0, mention_utils_1.isMentionTextChar)(char)) {
            // '@' char with valid mention text char following
            stateMachine.state = 31 /* State.MentionTextChar */;
            stateMachine.acceptStateReached = true;
        }
        else {
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
    }
    // Handles the state when we're currently in the mention's text chars
    function stateMentionTextChar(stateMachine, char) {
        if ((0, mention_utils_1.isMentionTextChar)(char)) {
            // Continue reading characters in the HashtagText state
        }
        else if (regex_lib_1.alphaNumericAndMarksRe.test(char)) {
            // Char is invalid for a mention text char, not a valid match.
            // Note that ascii alphanumeric chars are okay (which are tested
            // in the previous 'if' statement, but others are not)
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
        else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }
    function statePhoneNumberPlus(stateMachine, char) {
        if (regex_lib_1.digitRe.test(char)) {
            stateMachine.state = 38 /* State.PhoneNumberDigit */;
        }
        else {
            (0, utils_1.remove)(stateMachines, stateMachine);
            // This character may start a new match. Add states for it
            stateNoMatch(char);
        }
    }
    function statePhoneNumberOpenParen(stateMachine, char) {
        if (regex_lib_1.digitRe.test(char)) {
            stateMachine.state = 33 /* State.PhoneNumberAreaCodeDigit1 */;
        }
        else {
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
        // It's also possible that the paren was just an open brace for
        // a piece of text. Start other machines
        stateNoMatch(char);
    }
    function statePhoneNumberAreaCodeDigit1(stateMachine, char) {
        if (regex_lib_1.digitRe.test(char)) {
            stateMachine.state = 34 /* State.PhoneNumberAreaCodeDigit2 */;
        }
        else {
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
    }
    function statePhoneNumberAreaCodeDigit2(stateMachine, char) {
        if (regex_lib_1.digitRe.test(char)) {
            stateMachine.state = 35 /* State.PhoneNumberAreaCodeDigit3 */;
        }
        else {
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
    }
    function statePhoneNumberAreaCodeDigit3(stateMachine, char) {
        if (char === ')') {
            stateMachine.state = 36 /* State.PhoneNumberCloseParen */;
        }
        else {
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
    }
    function statePhoneNumberCloseParen(stateMachine, char) {
        if (regex_lib_1.digitRe.test(char)) {
            stateMachine.state = 38 /* State.PhoneNumberDigit */;
        }
        else if ((0, phone_number_utils_1.isPhoneNumberSeparatorChar)(char)) {
            stateMachine.state = 39 /* State.PhoneNumberSeparator */;
        }
        else {
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
    }
    function statePhoneNumberDigit(stateMachine, char) {
        // For now, if we've reached any digits, we'll say that the machine
        // has reached its accept state. The phone regex will confirm the
        // match later.
        // Alternatively, we could count the number of digits to avoid
        // invoking the phone number regex
        stateMachine.acceptStateReached = true;
        if ((0, phone_number_utils_1.isPhoneNumberControlChar)(char)) {
            stateMachine.state = 40 /* State.PhoneNumberControlChar */;
        }
        else if (char === '#') {
            stateMachine.state = 41 /* State.PhoneNumberPoundChar */;
        }
        else if (regex_lib_1.digitRe.test(char)) {
            // Stay in the phone number digit state
        }
        else if (char === '(') {
            stateMachine.state = 32 /* State.PhoneNumberOpenParen */;
        }
        else if ((0, phone_number_utils_1.isPhoneNumberSeparatorChar)(char)) {
            stateMachine.state = 39 /* State.PhoneNumberSeparator */;
        }
        else {
            captureMatchIfValidAndRemove(stateMachine);
            // The transition from a digit character to a letter can be the
            // start of a new scheme URL match
            if ((0, uri_utils_1.isSchemeStartChar)(char)) {
                stateMachines.push(createSchemeUrlStateMachine(charIdx, 0 /* State.SchemeChar */));
            }
        }
    }
    function statePhoneNumberSeparator(stateMachine, char) {
        if (regex_lib_1.digitRe.test(char)) {
            stateMachine.state = 38 /* State.PhoneNumberDigit */;
        }
        else if (char === '(') {
            stateMachine.state = 32 /* State.PhoneNumberOpenParen */;
        }
        else {
            captureMatchIfValidAndRemove(stateMachine);
            // This character may start a new match. Add states for it
            stateNoMatch(char);
        }
    }
    // The ";" characters is "wait" in a phone number
    // The "," characters is "pause" in a phone number
    function statePhoneNumberControlChar(stateMachine, char) {
        if ((0, phone_number_utils_1.isPhoneNumberControlChar)(char)) {
            // Stay in the "control char" state
        }
        else if (char === '#') {
            stateMachine.state = 41 /* State.PhoneNumberPoundChar */;
        }
        else if (regex_lib_1.digitRe.test(char)) {
            stateMachine.state = 38 /* State.PhoneNumberDigit */;
        }
        else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }
    // The "#" characters is "pound" in a phone number
    function statePhoneNumberPoundChar(stateMachine, char) {
        if ((0, phone_number_utils_1.isPhoneNumberControlChar)(char)) {
            stateMachine.state = 40 /* State.PhoneNumberControlChar */;
        }
        else if (regex_lib_1.digitRe.test(char)) {
            // According to some of the older tests, if there's a digit
            // after a '#' sign, the match is invalid. TODO: Revisit if this is true
            (0, utils_1.remove)(stateMachines, stateMachine);
        }
        else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }
    /*
     * Captures a match if it is valid (i.e. has a full domain name for a
     * TLD match). If a match is not valid, it is possible that we want to
     * keep reading characters in order to make a full match.
     */
    function captureMatchIfValidAndRemove(stateMachine) {
        // Remove the state machine first. There are a number of code paths
        // which return out of this function early, so make sure we have
        // this done
        (0, utils_1.remove)(stateMachines, stateMachine);
        // Make sure the state machine being checked has actually reached an
        // "accept" state. If it hasn't reach one, it can't be a match
        if (!stateMachine.acceptStateReached) {
            return;
        }
        var startIdx = stateMachine.startIdx;
        var matchedText = text.slice(stateMachine.startIdx, charIdx);
        // Handle any unbalanced braces (parens, square brackets, or curly
        // brackets) inside the URL. This handles situations like:
        //     The link (google.com)
        // and
        //     Check out this link here (en.wikipedia.org/wiki/IANA_(disambiguation))
        //
        // And also remove any punctuation chars at the end such as:
        //     '?', ',', ':', '.', etc.
        matchedText = excludeUnbalancedTrailingBracesAndPunctuation(matchedText);
        if (stateMachine.type === 'url') {
            // We don't want to accidentally match a URL that is preceded by an
            // '@' character, which would be an email address
            var charBeforeUrlMatch = text.charAt(stateMachine.startIdx - 1);
            if (charBeforeUrlMatch === '@') {
                return;
            }
            // For the purpose of this parser, we've generalized 'www'
            // matches as part of 'tld' matches. However, for backward
            // compatibility, we distinguish beween TLD matches and matches
            // that begin with 'www.' so that users may turn off 'www'
            // matches. As such, we need to correct for that now if the
            // URL begins with 'www.'
            var urlMatchType = stateMachine.matchType;
            if (urlMatchType === 'scheme') {
                // Autolinker accepts many characters in a url's scheme (like `fake://test.com`).
                // However, in cases where a URL is missing whitespace before an obvious link,
                // (for example: `nowhitespacehttp://www.test.com`), we only want the match to start
                // at the http:// part. We will check if the match contains a common scheme and then
                // shift the match to start from there.
                var httpSchemeMatch = uri_utils_1.httpSchemeRe.exec(matchedText);
                if (httpSchemeMatch) {
                    // If we found an overmatched URL, we want to find the index
                    // of where the match should start and shift the match to
                    // start from the beginning of the common scheme
                    startIdx = startIdx + httpSchemeMatch.index;
                    matchedText = matchedText.slice(httpSchemeMatch.index);
                }
                if (!(0, uri_utils_1.isValidSchemeUrl)(matchedText)) {
                    return; // not a valid match
                }
            }
            else if (urlMatchType === 'tld') {
                if (!(0, uri_utils_1.isValidTldMatch)(matchedText)) {
                    return; // not a valid match
                }
            }
            else if (urlMatchType === 'ipV4') {
                if (!(0, uri_utils_1.isValidIpV4Address)(matchedText)) {
                    return; // not a valid match
                }
            }
            else {
                (0, utils_1.assertNever)(urlMatchType);
            }
            matches.push(new url_match_1.UrlMatch({
                tagBuilder: tagBuilder,
                matchedText: matchedText,
                offset: startIdx,
                urlMatchType: urlMatchType,
                url: matchedText,
                protocolRelativeMatch: matchedText.slice(0, 2) === '//',
                // TODO: Do these settings need to be passed to the match,
                // or should we handle them here in UrlMatcher?
                stripPrefix: stripPrefix,
                stripTrailingSlash: stripTrailingSlash,
                decodePercentEncoding: decodePercentEncoding,
            }));
        }
        else if (stateMachine.type === 'email') {
            // if the email address has a valid TLD, add it to the list of matches
            if ((0, email_utils_1.isValidEmail)(matchedText)) {
                matches.push(new email_match_1.EmailMatch({
                    tagBuilder: tagBuilder,
                    matchedText: matchedText,
                    offset: startIdx,
                    email: matchedText.replace(email_utils_1.mailtoSchemePrefixRe, ''),
                }));
            }
        }
        else if (stateMachine.type === 'hashtag') {
            if ((0, hashtag_utils_1.isValidHashtag)(matchedText)) {
                matches.push(new hashtag_match_1.HashtagMatch({
                    tagBuilder: tagBuilder,
                    matchedText: matchedText,
                    offset: startIdx,
                    serviceName: hashtagServiceName,
                    hashtag: matchedText.slice(1),
                }));
            }
        }
        else if (stateMachine.type === 'mention') {
            if ((0, mention_utils_1.isValidMention)(matchedText, mentionServiceName)) {
                matches.push(new mention_match_1.MentionMatch({
                    tagBuilder: tagBuilder,
                    matchedText: matchedText,
                    offset: startIdx,
                    serviceName: mentionServiceName,
                    mention: matchedText.slice(1), // strip off the '@' character at the beginning
                }));
            }
        }
        else if (stateMachine.type === 'phone') {
            // remove any trailing spaces that were considered as "separator"
            // chars by the state machine
            matchedText = matchedText.replace(/ +$/g, '');
            if ((0, phone_number_utils_1.isValidPhoneNumber)(matchedText)) {
                var cleanNumber = matchedText.replace(/[^0-9,;#]/g, ''); // strip out non-digit characters exclude comma semicolon and #
                matches.push(new phone_match_1.PhoneMatch({
                    tagBuilder: tagBuilder,
                    matchedText: matchedText,
                    offset: startIdx,
                    number: cleanNumber,
                    plusSign: matchedText.charAt(0) === '+',
                }));
            }
        }
        else {
            (0, utils_1.assertNever)(stateMachine);
        }
    }
}
exports.parseMatches = parseMatches;
var openBraceRe = /[\(\{\[]/;
var closeBraceRe = /[\)\}\]]/;
var oppositeBrace = {
    ')': '(',
    '}': '{',
    ']': '[',
};
/**
 * Determines if a match found has unmatched closing parenthesis,
 * square brackets or curly brackets. If so, these unbalanced symbol(s) will be
 * removed from the URL match itself.
 *
 * A match may have an extra closing parenthesis/square brackets/curly brackets
 * at the end of the match because these are valid URL path characters. For
 * example, "wikipedia.com/something_(disambiguation)" should be auto-linked.
 *
 * However, an extra parenthesis *will* be included when the URL itself is
 * wrapped in parenthesis, such as in the case of:
 *
 *     "(wikipedia.com/something_(disambiguation))"
 *
 * In this case, the last closing parenthesis should *not* be part of the
 * URL itself, and this method will exclude it from the returned URL.
 *
 * For square brackets in URLs such as in PHP arrays, the same behavior as
 * parenthesis discussed above should happen:
 *
 *     "[http://www.example.com/foo.php?bar[]=1&bar[]=2&bar[]=3]"
 *
 * The very last closing square bracket should not be part of the URL itself,
 * and therefore this method will remove it.
 *
 * @param matchedText The full matched URL/email/hashtag/etc. from the state
 *   machine parser.
 * @return The updated matched text with extraneous suffix characters removed.
 */
function excludeUnbalancedTrailingBracesAndPunctuation(matchedText) {
    var braceCounts = {
        '(': 0,
        '{': 0,
        '[': 0,
    };
    for (var i = 0; i < matchedText.length; i++) {
        var char_1 = matchedText.charAt(i);
        if (openBraceRe.test(char_1)) {
            braceCounts[char_1]++;
        }
        else if (closeBraceRe.test(char_1)) {
            braceCounts[oppositeBrace[char_1]]--;
        }
    }
    var endIdx = matchedText.length - 1;
    var char;
    while (endIdx >= 0) {
        char = matchedText.charAt(endIdx);
        if (closeBraceRe.test(char)) {
            var oppositeBraceChar = oppositeBrace[char];
            if (braceCounts[oppositeBraceChar] < 0) {
                braceCounts[oppositeBraceChar]++;
                endIdx--;
            }
            else {
                break;
            }
        }
        else if (uri_utils_1.urlSuffixedCharsNotAllowedAtEndRe.test(char)) {
            // Walk back a punctuation char like '?', ',', ':', '.', etc.
            endIdx--;
        }
        else {
            break;
        }
    }
    return matchedText.slice(0, endIdx + 1);
}
exports.excludeUnbalancedTrailingBracesAndPunctuation = excludeUnbalancedTrailingBracesAndPunctuation;
function createSchemeUrlStateMachine(startIdx, state) {
    return {
        type: 'url',
        startIdx: startIdx,
        state: state,
        acceptStateReached: false,
        matchType: 'scheme',
    };
}
function createTldUrlStateMachine(startIdx, state) {
    return {
        type: 'url',
        startIdx: startIdx,
        state: state,
        acceptStateReached: false,
        matchType: 'tld',
    };
}
function createIpV4UrlStateMachine(startIdx, state) {
    return {
        type: 'url',
        startIdx: startIdx,
        state: state,
        acceptStateReached: false,
        matchType: 'ipV4',
        octetsEncountered: 1, // starts at 1 because we create this machine when encountering the first octet
    };
}
function createEmailStateMachine(startIdx, state) {
    return {
        type: 'email',
        startIdx: startIdx,
        state: state,
        acceptStateReached: false,
    };
}
function createHashtagStateMachine(startIdx, state) {
    return {
        type: 'hashtag',
        startIdx: startIdx,
        state: state,
        acceptStateReached: false,
    };
}
function createMentionStateMachine(startIdx, state) {
    return {
        type: 'mention',
        startIdx: startIdx,
        state: state,
        acceptStateReached: false,
    };
}
function createPhoneNumberStateMachine(startIdx, state) {
    return {
        type: 'phone',
        startIdx: startIdx,
        state: state,
        acceptStateReached: false,
    };
}
//# sourceMappingURL=parse-matches.js.map