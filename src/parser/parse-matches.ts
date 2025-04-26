import { alphaNumericAndMarksRe, digitRe } from '../regex-lib';
import { UrlMatch, UrlMatchType } from '../match/url-match';
import { Match } from '../match/match';
import { remove, assertNever } from '../utils';
import {
    httpSchemeRe,
    isDomainLabelChar,
    isDomainLabelStartChar,
    isPathChar,
    isSchemeChar,
    isSchemeStartChar,
    isUrlSuffixStartChar,
    isValidIpV4Address,
    isValidSchemeUrl,
    isValidTldMatch,
    urlSuffixedCharsNotAllowedAtEndRe,
} from './uri-utils';
import {
    isEmailLocalPartChar,
    isEmailLocalPartStartChar,
    isValidEmail,
    mailtoSchemePrefixRe,
} from './email-utils';
import { EmailMatch } from '../match/email-match';
import { HashtagService, isHashtagTextChar, isValidHashtag } from './hashtag-utils';
import { HashtagMatch } from '../match/hashtag-match';
import { isMentionTextChar, isValidMention, MentionService } from './mention-utils';
import { MentionMatch } from '../match/mention-match';
import {
    isPhoneNumberSeparatorChar,
    isPhoneNumberControlChar,
    isValidPhoneNumber,
} from './phone-number-utils';
import { PhoneMatch } from '../match/phone-match';
import { AnchorTagBuilder } from '../anchor-tag-builder';
import type { StripPrefixConfigObj } from '../autolinker';

// For debugging: search for and uncomment other "For debugging" lines
// import CliTable from 'cli-table';

/**
 * Parses URL, email, twitter, mention, and hashtag matches from the given
 * `text`.
 */
export function parseMatches(text: string, args: ParseMatchesArgs): Match[] {
    const tagBuilder = args.tagBuilder;
    const stripPrefix = args.stripPrefix;
    const stripTrailingSlash = args.stripTrailingSlash;
    const decodePercentEncoding = args.decodePercentEncoding;
    const hashtagServiceName = args.hashtagServiceName;
    const mentionServiceName = args.mentionServiceName;

    const matches: Match[] = [];
    const textLen = text.length;

    // An array of all active state machines. Empty array means we're in the
    // "no url" state
    const stateMachines: StateMachine[] = [];

    // For debugging: search for and uncomment other "For debugging" lines
    // const table = new CliTable({
    //     head: ['charIdx', 'char', 'code', 'type', 'states', 'charIdx', 'startIdx', 'reached accept state'],
    // });

    let charIdx = 0;
    for (; charIdx < textLen; charIdx++) {
        const char = text.charAt(charIdx);

        if (stateMachines.length === 0) {
            stateNoMatch(char);
        } else {
            // Must loop through the state machines backwards for when one
            // is removed
            for (let stateIdx = stateMachines.length - 1; stateIdx >= 0; stateIdx--) {
                const stateMachine = stateMachines[stateIdx];

                switch (stateMachine.state) {
                    // Protocol-relative URL states
                    case State.ProtocolRelativeSlash1:
                        stateProtocolRelativeSlash1(stateMachine, char);
                        break;
                    case State.ProtocolRelativeSlash2:
                        stateProtocolRelativeSlash2(stateMachine, char);
                        break;

                    case State.SchemeChar:
                        stateSchemeChar(stateMachine, char);
                        break;
                    case State.SchemeHyphen:
                        stateSchemeHyphen(stateMachine, char);
                        break;
                    case State.SchemeColon:
                        stateSchemeColon(stateMachine, char);
                        break;
                    case State.SchemeSlash1:
                        stateSchemeSlash1(stateMachine, char);
                        break;
                    case State.SchemeSlash2:
                        stateSchemeSlash2(stateMachine, char);
                        break;

                    case State.DomainLabelChar:
                        stateDomainLabelChar(stateMachine, char);
                        break;
                    case State.DomainHyphen:
                        stateDomainHyphen(stateMachine, char);
                        break;
                    case State.DomainDot:
                        stateDomainDot(stateMachine, char);
                        break;

                    case State.IpV4Digit:
                        stateIpV4Digit(stateMachine as IpV4UrlStateMachine, char);
                        break;
                    case State.IpV4Dot:
                        stateIPv4Dot(stateMachine as IpV4UrlStateMachine, char);
                        break;

                    case State.PortColon:
                        statePortColon(stateMachine, char);
                        break;
                    case State.PortNumber:
                        statePortNumber(stateMachine, char);
                        break;
                    case State.Path:
                        statePath(stateMachine, char);
                        break;

                    // Email States
                    case State.EmailMailto_M:
                        stateEmailMailto_M(stateMachine, char);
                        break;
                    case State.EmailMailto_A:
                        stateEmailMailto_A(stateMachine, char);
                        break;
                    case State.EmailMailto_I:
                        stateEmailMailto_I(stateMachine, char);
                        break;
                    case State.EmailMailto_L:
                        stateEmailMailto_L(stateMachine, char);
                        break;
                    case State.EmailMailto_T:
                        stateEmailMailto_T(stateMachine, char);
                        break;
                    case State.EmailMailto_O:
                        stateEmailMailto_O(stateMachine, char);
                        break;
                    case State.EmailMailto_Colon:
                        stateEmailMailtoColon(stateMachine, char);
                        break;
                    case State.EmailLocalPart:
                        stateEmailLocalPart(stateMachine, char);
                        break;
                    case State.EmailLocalPartDot:
                        stateEmailLocalPartDot(stateMachine, char);
                        break;
                    case State.EmailAtSign:
                        stateEmailAtSign(stateMachine, char);
                        break;
                    case State.EmailDomainChar:
                        stateEmailDomainChar(stateMachine, char);
                        break;
                    case State.EmailDomainHyphen:
                        stateEmailDomainHyphen(stateMachine, char);
                        break;
                    case State.EmailDomainDot:
                        stateEmailDomainDot(stateMachine, char);
                        break;

                    // Hashtag states
                    case State.HashtagHashChar:
                        stateHashtagHashChar(stateMachine, char);
                        break;
                    case State.HashtagTextChar:
                        stateHashtagTextChar(stateMachine, char);
                        break;

                    // Mention states
                    case State.MentionAtChar:
                        stateMentionAtChar(stateMachine, char);
                        break;
                    case State.MentionTextChar:
                        stateMentionTextChar(stateMachine, char);
                        break;

                    // Phone number states
                    case State.PhoneNumberOpenParen:
                        statePhoneNumberOpenParen(stateMachine, char);
                        break;
                    case State.PhoneNumberAreaCodeDigit1:
                        statePhoneNumberAreaCodeDigit1(stateMachine, char);
                        break;
                    case State.PhoneNumberAreaCodeDigit2:
                        statePhoneNumberAreaCodeDigit2(stateMachine, char);
                        break;
                    case State.PhoneNumberAreaCodeDigit3:
                        statePhoneNumberAreaCodeDigit3(stateMachine, char);
                        break;
                    case State.PhoneNumberCloseParen:
                        statePhoneNumberCloseParen(stateMachine, char);
                        break;
                    case State.PhoneNumberPlus:
                        statePhoneNumberPlus(stateMachine, char);
                        break;
                    case State.PhoneNumberDigit:
                        statePhoneNumberDigit(stateMachine, char);
                        break;
                    case State.PhoneNumberSeparator:
                        statePhoneNumberSeparator(stateMachine, char);
                        break;
                    case State.PhoneNumberControlChar:
                        statePhoneNumberControlChar(stateMachine, char);
                        break;
                    case State.PhoneNumberPoundChar:
                        statePhoneNumberPoundChar(stateMachine, char);
                        break;

                    /* istanbul ignore next */
                    default:
                        assertNever(stateMachine.state);
                }
            }

            // Special case for handling a colon (or other non-alphanumeric)
            // when preceded by another character, such as in the text:
            //     Link 1:http://google.com
            // In this case, the 'h' character after the colon wouldn't start a
            // new scheme url because we'd be in a ipv4 or tld url and the colon
            // would be interpreted as a port ':' char. Also, only start a new
            // scheme url machine if there isn't currently one so we don't start
            // new ones for colons inside a url
            if (charIdx > 0 && isSchemeStartChar(char)) {
                const prevChar = text.charAt(charIdx - 1);
                if (!isSchemeStartChar(prevChar) && !stateMachines.some(isSchemeUrlStateMachine)) {
                    stateMachines.push(createSchemeUrlStateMachine(charIdx, State.SchemeChar));
                }
            }
        }

        // For debugging: search for and uncomment other "For debugging" lines
        // table.push([
        //     String(charIdx),
        //     char,
        //     `10: ${char.charCodeAt(0)}\n0x: ${char.charCodeAt(0).toString(16)}\nU+${char.codePointAt(0)}`,
        //     stateMachines.map(machine => `${machine.type}${'matchType' in machine ? ` (${machine.matchType})` : ''}`).join('\n') || '(none)',
        //     stateMachines.map(machine => State[machine.state]).join('\n') || '(none)',
        //     String(charIdx),
        //     stateMachines.map(m => m.startIdx).join('\n'),
        //     stateMachines.map(m => m.acceptStateReached).join('\n'),
        // ]);
    }

    // Capture any valid match at the end of the string
    // Note: this loop must happen in reverse because
    // captureMatchIfValidAndRemove() removes state machines from the array
    // and we'll end up skipping every other one if we remove while looping
    // forward
    for (let i = stateMachines.length - 1; i >= 0; i--) {
        stateMachines.forEach(stateMachine => captureMatchIfValidAndRemove(stateMachine));
    }

    // For debugging: search for and uncomment other "For debugging" lines
    // console.log(`\nRead string:\n  ${text}`);
    // console.log(table.toString());

    return matches;

    // Handles the state when we're not in a URL/email/etc. (i.e. when no state machines exist)
    function stateNoMatch(char: string) {
        if (char === '#') {
            // Hash char, start a Hashtag match
            stateMachines.push(createHashtagStateMachine(charIdx, State.HashtagHashChar));
        } else if (char === '@') {
            // '@' char, start a Mention match
            stateMachines.push(createMentionStateMachine(charIdx, State.MentionAtChar));
        } else if (char === '/') {
            // A slash could begin a protocol-relative URL
            stateMachines.push(createTldUrlStateMachine(charIdx, State.ProtocolRelativeSlash1));
        } else if (char === '+') {
            // A '+' char can start a Phone number
            stateMachines.push(createPhoneNumberStateMachine(charIdx, State.PhoneNumberPlus));
        } else if (char === '(') {
            stateMachines.push(createPhoneNumberStateMachine(charIdx, State.PhoneNumberOpenParen));
        } else {
            if (digitRe.test(char)) {
                // A digit could start a phone number
                stateMachines.push(createPhoneNumberStateMachine(charIdx, State.PhoneNumberDigit));

                // A digit could start an IP address
                stateMachines.push(createIpV4UrlStateMachine(charIdx, State.IpV4Digit));
            }

            if (isEmailLocalPartStartChar(char)) {
                // Any email local part. An 'm' character in particular could
                // start a 'mailto:' match
                const startState =
                    char.toLowerCase() === 'm' ? State.EmailMailto_M : State.EmailLocalPart;
                stateMachines.push(createEmailStateMachine(charIdx, startState));
            }

            if (isSchemeStartChar(char)) {
                // An uppercase or lowercase letter may start a scheme match
                stateMachines.push(createSchemeUrlStateMachine(charIdx, State.SchemeChar));
            }

            if (alphaNumericAndMarksRe.test(char)) {
                // A unicode alpha character or digit could start a domain name
                // label for a TLD match
                stateMachines.push(createTldUrlStateMachine(charIdx, State.DomainLabelChar));
            }
        }

        // Anything else, remain in the "non-url" state by not creating any
        // state machines
    }

    // Implements ABNF: ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
    function stateSchemeChar(stateMachine: StateMachine, char: string) {
        if (char === ':') {
            stateMachine.state = State.SchemeColon;
        } else if (char === '-') {
            stateMachine.state = State.SchemeHyphen;
        } else if (isSchemeChar(char)) {
            // Stay in SchemeChar state
        } else {
            // Any other character, not a scheme
            remove(stateMachines, stateMachine);
        }
    }

    function stateSchemeHyphen(stateMachine: StateMachine, char: string) {
        if (char === '-') {
            // Stay in SchemeHyphen state
            // TODO: Should a colon following a dash be counted as the end of the scheme?
            // } else if (char === ':') {
            //     stateMachine.state = State.SchemeColon;
        } else if (char === '/') {
            // Not a valid scheme match, but may be the start of a
            // protocol-relative match (such as //google.com)
            remove(stateMachines, stateMachine);
            stateMachines.push(createTldUrlStateMachine(charIdx, State.ProtocolRelativeSlash1));
        } else if (isSchemeChar(char)) {
            stateMachine.state = State.SchemeChar;
        } else {
            // Any other character, not a scheme
            remove(stateMachines, stateMachine);
        }
    }

    // https://tools.ietf.org/html/rfc3986#appendix-A
    function stateSchemeColon(stateMachine: StateMachine, char: string) {
        if (char === '/') {
            stateMachine.state = State.SchemeSlash1;
        } else if (char === '.') {
            // We've read something like 'hello:.' - don't capture
            remove(stateMachines, stateMachine);
        } else if (isDomainLabelStartChar(char)) {
            stateMachine.state = State.DomainLabelChar;

            // It's possible that we read an "introduction" piece of text,
            // and the character after the current colon actually starts an
            // actual scheme. An example of this is:
            //     "The link:http://google.com"
            // Hence, start a new machine to capture this match if so
            if (isSchemeStartChar(char)) {
                stateMachines.push(createSchemeUrlStateMachine(charIdx, State.SchemeChar));
            }
        } else {
            remove(stateMachines, stateMachine);
        }
    }

    // https://tools.ietf.org/html/rfc3986#appendix-A
    function stateSchemeSlash1(stateMachine: StateMachine, char: string) {
        if (char === '/') {
            stateMachine.state = State.SchemeSlash2;
        } else if (isPathChar(char)) {
            stateMachine.state = State.Path;
            stateMachine.acceptStateReached = true;
        } else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }

    function stateSchemeSlash2(stateMachine: StateMachine, char: string) {
        if (char === '/') {
            // 3rd slash, must be an absolute path (`path-absolute` in the
            // ABNF), such as in "file:///c:/windows/etc". See
            // https://tools.ietf.org/html/rfc3986#appendix-A
            stateMachine.state = State.Path;
            stateMachine.acceptStateReached = true;
        } else if (isDomainLabelStartChar(char)) {
            // start of "authority" section - see https://tools.ietf.org/html/rfc3986#appendix-A
            stateMachine.state = State.DomainLabelChar;
            stateMachine.acceptStateReached = true;
        } else {
            // not valid
            remove(stateMachines, stateMachine);
        }
    }

    // Handles after we've read a '/' from the NonUrl state
    function stateProtocolRelativeSlash1(stateMachine: StateMachine, char: string) {
        if (char === '/') {
            stateMachine.state = State.ProtocolRelativeSlash2;
        } else {
            // Anything else, cannot be the start of a protocol-relative
            // URL.
            remove(stateMachines, stateMachine);
        }
    }

    // Handles after we've read a second '/', which could start a protocol-relative URL
    function stateProtocolRelativeSlash2(stateMachine: StateMachine, char: string) {
        if (isDomainLabelStartChar(char)) {
            stateMachine.state = State.DomainLabelChar;
        } else {
            // Anything else, not a URL
            remove(stateMachines, stateMachine);
        }
    }

    // Handles when we have read a domain label character
    function stateDomainLabelChar(stateMachine: StateMachine, char: string) {
        if (char === '.') {
            stateMachine.state = State.DomainDot;
        } else if (char === '-') {
            stateMachine.state = State.DomainHyphen;
        } else if (char === ':') {
            // Beginning of a port number, end the domain name
            stateMachine.state = State.PortColon;
        } else if (isUrlSuffixStartChar(char)) {
            // '/', '?', or '#'
            stateMachine.state = State.Path;
        } else if (isDomainLabelChar(char)) {
            // Stay in the DomainLabelChar state
        } else {
            // Anything else, end the domain name
            captureMatchIfValidAndRemove(stateMachine);
        }
    }

    function stateDomainHyphen(stateMachine: StateMachine, char: string) {
        if (char === '-') {
            // Remain in the DomainHyphen state
        } else if (char === '.') {
            // Not valid to have a '-.' in a domain label
            captureMatchIfValidAndRemove(stateMachine);
        } else if (isDomainLabelStartChar(char)) {
            stateMachine.state = State.DomainLabelChar;
        } else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }

    function stateDomainDot(stateMachine: StateMachine, char: string) {
        if (char === '.') {
            // domain names cannot have multiple '.'s next to each other.
            // It's possible we've already read a valid domain name though,
            // and that the '..' sequence just forms an ellipsis at the end
            // of a sentence
            captureMatchIfValidAndRemove(stateMachine);
        } else if (isDomainLabelStartChar(char)) {
            stateMachine.state = State.DomainLabelChar;
            stateMachine.acceptStateReached = true; // after hitting a dot, and then another domain label, we've reached an accept state
        } else {
            // Anything else, end the domain name
            captureMatchIfValidAndRemove(stateMachine);
        }
    }

    function stateIpV4Digit(stateMachine: IpV4UrlStateMachine, char: string) {
        if (char === '.') {
            stateMachine.state = State.IpV4Dot;
        } else if (char === ':') {
            // Beginning of a port number
            stateMachine.state = State.PortColon;
        } else if (digitRe.test(char)) {
            // stay in the IPv4 digit state
        } else if (isUrlSuffixStartChar(char)) {
            stateMachine.state = State.Path;
        } else if (alphaNumericAndMarksRe.test(char)) {
            // If we hit an alpha character, must not be an IPv4
            // Example of this: 1.2.3.4abc
            remove(stateMachines, stateMachine);
        } else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }

    function stateIPv4Dot(stateMachine: IpV4UrlStateMachine, char: string) {
        if (digitRe.test(char)) {
            stateMachine.octetsEncountered++;

            // Once we have encountered 4 octets, it's *potentially* a valid
            // IPv4 address. Our IPv4 regex will confirm the match later
            // though to make sure each octet is in the 0-255 range, and
            // there's exactly 4 octets (not 5 or more)
            if (stateMachine.octetsEncountered === 4) {
                stateMachine.acceptStateReached = true;
            }

            stateMachine.state = State.IpV4Digit;
        } else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }

    function statePortColon(stateMachine: StateMachine, char: string) {
        if (digitRe.test(char)) {
            stateMachine.state = State.PortNumber;
        } else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }

    function statePortNumber(stateMachine: StateMachine, char: string) {
        if (digitRe.test(char)) {
            // Stay in port number state
        } else if (isUrlSuffixStartChar(char)) {
            // '/', '?', or '#'
            stateMachine.state = State.Path;
        } else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }

    function statePath(stateMachine: StateMachine, char: string) {
        if (isPathChar(char)) {
            // Stay in the path state
        } else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }

    // Handles if we're reading a 'mailto:' prefix on the string
    function stateEmailMailto_M(stateMachine: StateMachine, char: string) {
        if (char.toLowerCase() === 'a') {
            stateMachine.state = State.EmailMailto_A;
        } else {
            stateEmailLocalPart(stateMachine, char);
        }
    }

    function stateEmailMailto_A(stateMachine: StateMachine, char: string) {
        if (char.toLowerCase() === 'i') {
            stateMachine.state = State.EmailMailto_I;
        } else {
            stateEmailLocalPart(stateMachine, char);
        }
    }

    function stateEmailMailto_I(stateMachine: StateMachine, char: string) {
        if (char.toLowerCase() === 'l') {
            stateMachine.state = State.EmailMailto_L;
        } else {
            stateEmailLocalPart(stateMachine, char);
        }
    }

    function stateEmailMailto_L(stateMachine: StateMachine, char: string) {
        if (char.toLowerCase() === 't') {
            stateMachine.state = State.EmailMailto_T;
        } else {
            stateEmailLocalPart(stateMachine, char);
        }
    }

    function stateEmailMailto_T(stateMachine: StateMachine, char: string) {
        if (char.toLowerCase() === 'o') {
            stateMachine.state = State.EmailMailto_O;
        } else {
            stateEmailLocalPart(stateMachine, char);
        }
    }

    function stateEmailMailto_O(stateMachine: StateMachine, char: string) {
        if (char.toLowerCase() === ':') {
            stateMachine.state = State.EmailMailto_Colon;
        } else {
            stateEmailLocalPart(stateMachine, char);
        }
    }

    function stateEmailMailtoColon(stateMachine: StateMachine, char: string) {
        if (isEmailLocalPartChar(char)) {
            stateMachine.state = State.EmailLocalPart;
        } else {
            remove(stateMachines, stateMachine);
        }
    }

    // Handles the state when we're currently in the "local part" of an
    // email address (as opposed to the "domain part")
    function stateEmailLocalPart(stateMachine: StateMachine, char: string) {
        if (char === '.') {
            stateMachine.state = State.EmailLocalPartDot;
        } else if (char === '@') {
            stateMachine.state = State.EmailAtSign;
        } else if (isEmailLocalPartChar(char)) {
            // stay in the "local part" of the email address
            // Note: because stateEmailLocalPart() is called from the
            // 'mailto' states (when the 'mailto' prefix itself has been
            // broken), make sure to set the state to EmailLocalPart
            stateMachine.state = State.EmailLocalPart;
        } else {
            // not an email address character
            remove(stateMachines, stateMachine);
        }
    }

    // Handles the state where we've read a '.' character in the local part of
    // the email address (i.e. the part before the '@' character)
    function stateEmailLocalPartDot(stateMachine: StateMachine, char: string) {
        if (char === '.') {
            // We read a second '.' in a row, not a valid email address
            // local part
            remove(stateMachines, stateMachine);
        } else if (char === '@') {
            // We read the '@' character immediately after a dot ('.'), not
            // an email address
            remove(stateMachines, stateMachine);
        } else if (isEmailLocalPartChar(char)) {
            stateMachine.state = State.EmailLocalPart;
        } else {
            // Anything else, not an email address
            remove(stateMachines, stateMachine);
        }
    }

    function stateEmailAtSign(stateMachine: StateMachine, char: string) {
        if (isDomainLabelStartChar(char)) {
            stateMachine.state = State.EmailDomainChar;
        } else {
            // Anything else, not an email address
            remove(stateMachines, stateMachine);
        }
    }

    function stateEmailDomainChar(stateMachine: StateMachine, char: string) {
        if (char === '.') {
            stateMachine.state = State.EmailDomainDot;
        } else if (char === '-') {
            stateMachine.state = State.EmailDomainHyphen;
        } else if (isDomainLabelChar(char)) {
            // Stay in the DomainChar state
        } else {
            // Anything else, we potentially matched if the criteria has
            // been met
            captureMatchIfValidAndRemove(stateMachine);
        }
    }

    function stateEmailDomainHyphen(stateMachine: StateMachine, char: string) {
        if (char === '-' || char === '.') {
            // Not valid to have two hyphens ("--") or hypen+dot ("-.")
            captureMatchIfValidAndRemove(stateMachine);
        } else if (isDomainLabelChar(char)) {
            stateMachine.state = State.EmailDomainChar;
        } else {
            // Anything else
            captureMatchIfValidAndRemove(stateMachine);
        }
    }

    function stateEmailDomainDot(stateMachine: StateMachine, char: string) {
        if (char === '.' || char === '-') {
            // not valid to have two dots ("..") or dot+hypen (".-")
            captureMatchIfValidAndRemove(stateMachine);
        } else if (isDomainLabelStartChar(char)) {
            stateMachine.state = State.EmailDomainChar;

            // After having read a '.' and then a valid domain character,
            // we now know that the domain part of the email is valid, and
            // we have found at least a partial EmailMatch (however, the
            // email address may have additional characters from this point)
            stateMachine.acceptStateReached = true;
        } else {
            // Anything else
            captureMatchIfValidAndRemove(stateMachine);
        }
    }

    // Handles the state when we've just encountered a '#' character
    function stateHashtagHashChar(stateMachine: StateMachine, char: string) {
        if (isHashtagTextChar(char)) {
            // '#' char with valid hash text char following
            stateMachine.state = State.HashtagTextChar;
            stateMachine.acceptStateReached = true;
        } else {
            remove(stateMachines, stateMachine);
        }
    }

    // Handles the state when we're currently in the hash tag's text chars
    function stateHashtagTextChar(stateMachine: StateMachine, char: string) {
        if (isHashtagTextChar(char)) {
            // Continue reading characters in the HashtagText state
        } else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }

    // Handles the state when we've just encountered a '@' character
    function stateMentionAtChar(stateMachine: StateMachine, char: string) {
        if (isMentionTextChar(char)) {
            // '@' char with valid mention text char following
            stateMachine.state = State.MentionTextChar;
            stateMachine.acceptStateReached = true;
        } else {
            remove(stateMachines, stateMachine);
        }
    }

    // Handles the state when we're currently in the mention's text chars
    function stateMentionTextChar(stateMachine: StateMachine, char: string) {
        if (isMentionTextChar(char)) {
            // Continue reading characters in the HashtagText state
        } else if (alphaNumericAndMarksRe.test(char)) {
            // Char is invalid for a mention text char, not a valid match.
            // Note that ascii alphanumeric chars are okay (which are tested
            // in the previous 'if' statement, but others are not)
            remove(stateMachines, stateMachine);
        } else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }

    function statePhoneNumberPlus(stateMachine: StateMachine, char: string) {
        if (digitRe.test(char)) {
            stateMachine.state = State.PhoneNumberDigit;
        } else {
            remove(stateMachines, stateMachine);

            // This character may start a new match. Add states for it
            stateNoMatch(char);
        }
    }

    function statePhoneNumberOpenParen(stateMachine: StateMachine, char: string) {
        if (digitRe.test(char)) {
            stateMachine.state = State.PhoneNumberAreaCodeDigit1;
        } else {
            remove(stateMachines, stateMachine);
        }

        // It's also possible that the paren was just an open brace for
        // a piece of text. Start other machines
        stateNoMatch(char);
    }

    function statePhoneNumberAreaCodeDigit1(stateMachine: StateMachine, char: string) {
        if (digitRe.test(char)) {
            stateMachine.state = State.PhoneNumberAreaCodeDigit2;
        } else {
            remove(stateMachines, stateMachine);
        }
    }

    function statePhoneNumberAreaCodeDigit2(stateMachine: StateMachine, char: string) {
        if (digitRe.test(char)) {
            stateMachine.state = State.PhoneNumberAreaCodeDigit3;
        } else {
            remove(stateMachines, stateMachine);
        }
    }

    function statePhoneNumberAreaCodeDigit3(stateMachine: StateMachine, char: string) {
        if (char === ')') {
            stateMachine.state = State.PhoneNumberCloseParen;
        } else {
            remove(stateMachines, stateMachine);
        }
    }

    function statePhoneNumberCloseParen(stateMachine: StateMachine, char: string) {
        if (digitRe.test(char)) {
            stateMachine.state = State.PhoneNumberDigit;
        } else if (isPhoneNumberSeparatorChar(char)) {
            stateMachine.state = State.PhoneNumberSeparator;
        } else {
            remove(stateMachines, stateMachine);
        }
    }

    function statePhoneNumberDigit(stateMachine: StateMachine, char: string) {
        // For now, if we've reached any digits, we'll say that the machine
        // has reached its accept state. The phone regex will confirm the
        // match later.
        // Alternatively, we could count the number of digits to avoid
        // invoking the phone number regex
        stateMachine.acceptStateReached = true;

        if (isPhoneNumberControlChar(char)) {
            stateMachine.state = State.PhoneNumberControlChar;
        } else if (char === '#') {
            stateMachine.state = State.PhoneNumberPoundChar;
        } else if (digitRe.test(char)) {
            // Stay in the phone number digit state
        } else if (char === '(') {
            stateMachine.state = State.PhoneNumberOpenParen;
        } else if (isPhoneNumberSeparatorChar(char)) {
            stateMachine.state = State.PhoneNumberSeparator;
        } else {
            captureMatchIfValidAndRemove(stateMachine);

            // The transition from a digit character to a letter can be the
            // start of a new scheme URL match
            if (isSchemeStartChar(char)) {
                stateMachines.push(createSchemeUrlStateMachine(charIdx, State.SchemeChar));
            }
        }
    }

    function statePhoneNumberSeparator(stateMachine: StateMachine, char: string) {
        if (digitRe.test(char)) {
            stateMachine.state = State.PhoneNumberDigit;
        } else if (char === '(') {
            stateMachine.state = State.PhoneNumberOpenParen;
        } else {
            captureMatchIfValidAndRemove(stateMachine);

            // This character may start a new match. Add states for it
            stateNoMatch(char);
        }
    }

    // The ";" characters is "wait" in a phone number
    // The "," characters is "pause" in a phone number
    function statePhoneNumberControlChar(stateMachine: StateMachine, char: string) {
        if (isPhoneNumberControlChar(char)) {
            // Stay in the "control char" state
        } else if (char === '#') {
            stateMachine.state = State.PhoneNumberPoundChar;
        } else if (digitRe.test(char)) {
            stateMachine.state = State.PhoneNumberDigit;
        } else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }

    // The "#" characters is "pound" in a phone number
    function statePhoneNumberPoundChar(stateMachine: StateMachine, char: string) {
        if (isPhoneNumberControlChar(char)) {
            stateMachine.state = State.PhoneNumberControlChar;
        } else if (digitRe.test(char)) {
            // According to some of the older tests, if there's a digit
            // after a '#' sign, the match is invalid. TODO: Revisit if this is true
            remove(stateMachines, stateMachine);
        } else {
            captureMatchIfValidAndRemove(stateMachine);
        }
    }

    /*
     * Captures a match if it is valid (i.e. has a full domain name for a
     * TLD match). If a match is not valid, it is possible that we want to
     * keep reading characters in order to make a full match.
     */
    function captureMatchIfValidAndRemove(stateMachine: StateMachine) {
        // Remove the state machine first. There are a number of code paths
        // which return out of this function early, so make sure we have
        // this done
        remove(stateMachines, stateMachine);

        // Make sure the state machine being checked has actually reached an
        // "accept" state. If it hasn't reach one, it can't be a match
        if (!stateMachine.acceptStateReached) {
            return;
        }

        let startIdx = stateMachine.startIdx;
        let matchedText = text.slice(stateMachine.startIdx, charIdx);

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
            const charBeforeUrlMatch = text.charAt(stateMachine.startIdx - 1);
            if (charBeforeUrlMatch === '@') {
                return;
            }

            // For the purpose of this parser, we've generalized 'www'
            // matches as part of 'tld' matches. However, for backward
            // compatibility, we distinguish beween TLD matches and matches
            // that begin with 'www.' so that users may turn off 'www'
            // matches. As such, we need to correct for that now if the
            // URL begins with 'www.'
            const urlMatchType: UrlMatchType = stateMachine.matchType;

            if (urlMatchType === 'scheme') {
                // Autolinker accepts many characters in a url's scheme (like `fake://test.com`).
                // However, in cases where a URL is missing whitespace before an obvious link,
                // (for example: `nowhitespacehttp://www.test.com`), we only want the match to start
                // at the http:// part. We will check if the match contains a common scheme and then
                // shift the match to start from there.
                const httpSchemeMatch = httpSchemeRe.exec(matchedText);
                if (httpSchemeMatch) {
                    // If we found an overmatched URL, we want to find the index
                    // of where the match should start and shift the match to
                    // start from the beginning of the common scheme
                    startIdx = startIdx + httpSchemeMatch.index;
                    matchedText = matchedText.slice(httpSchemeMatch.index);
                }

                if (!isValidSchemeUrl(matchedText)) {
                    return; // not a valid match
                }
            } else if (urlMatchType === 'tld') {
                if (!isValidTldMatch(matchedText)) {
                    return; // not a valid match
                }
            } else if (urlMatchType === 'ipV4') {
                if (!isValidIpV4Address(matchedText)) {
                    return; // not a valid match
                }
            } else {
                /* istanbul ignore next */
                assertNever(urlMatchType);
            }

            matches.push(
                new UrlMatch({
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
                })
            );
        } else if (stateMachine.type === 'email') {
            // if the email address has a valid TLD, add it to the list of matches
            if (isValidEmail(matchedText)) {
                matches.push(
                    new EmailMatch({
                        tagBuilder: tagBuilder,
                        matchedText: matchedText,
                        offset: startIdx,
                        email: matchedText.replace(mailtoSchemePrefixRe, ''),
                    })
                );
            }
        } else if (stateMachine.type === 'hashtag') {
            if (isValidHashtag(matchedText)) {
                matches.push(
                    new HashtagMatch({
                        tagBuilder,
                        matchedText: matchedText,
                        offset: startIdx,
                        serviceName: hashtagServiceName,
                        hashtag: matchedText.slice(1),
                    })
                );
            }
        } else if (stateMachine.type === 'mention') {
            if (isValidMention(matchedText, mentionServiceName)) {
                matches.push(
                    new MentionMatch({
                        tagBuilder: tagBuilder,
                        matchedText: matchedText,
                        offset: startIdx,
                        serviceName: mentionServiceName,
                        mention: matchedText.slice(1), // strip off the '@' character at the beginning
                    })
                );
            }
        } else if (stateMachine.type === 'phone') {
            // remove any trailing spaces that were considered as "separator"
            // chars by the state machine
            matchedText = matchedText.replace(/ +$/g, '');

            if (isValidPhoneNumber(matchedText)) {
                const cleanNumber = matchedText.replace(/[^0-9,;#]/g, ''); // strip out non-digit characters exclude comma semicolon and #

                matches.push(
                    new PhoneMatch({
                        tagBuilder: tagBuilder,
                        matchedText: matchedText,
                        offset: startIdx,
                        number: cleanNumber,
                        plusSign: matchedText.charAt(0) === '+',
                    })
                );
            }
        } else {
            /* istanbul ignore next */
            assertNever(stateMachine);
        }
    }
}

export interface ParseMatchesArgs {
    tagBuilder: AnchorTagBuilder;
    stripPrefix: Required<StripPrefixConfigObj>;
    stripTrailingSlash: boolean;
    decodePercentEncoding: boolean;
    hashtagServiceName: HashtagService;
    mentionServiceName: MentionService;
}

const openBraceRe = /[({[]/;
const closeBraceRe = /[)}\]]/;
const oppositeBrace: { [char: string]: string } = {
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
export function excludeUnbalancedTrailingBracesAndPunctuation(matchedText: string): string {
    const braceCounts: { [char: string]: number } = {
        '(': 0,
        '{': 0,
        '[': 0,
    };

    for (let i = 0; i < matchedText.length; i++) {
        const char = matchedText.charAt(i);

        if (openBraceRe.test(char)) {
            braceCounts[char]++;
        } else if (closeBraceRe.test(char)) {
            braceCounts[oppositeBrace[char]]--;
        }
    }

    let endIdx = matchedText.length - 1;
    let char: string;
    while (endIdx >= 0) {
        char = matchedText.charAt(endIdx);

        if (closeBraceRe.test(char)) {
            const oppositeBraceChar = oppositeBrace[char];

            if (braceCounts[oppositeBraceChar] < 0) {
                braceCounts[oppositeBraceChar]++;
                endIdx--;
            } else {
                break;
            }
        } else if (urlSuffixedCharsNotAllowedAtEndRe.test(char)) {
            // Walk back a punctuation char like '?', ',', ':', '.', etc.
            endIdx--;
        } else {
            break;
        }
    }

    return matchedText.slice(0, endIdx + 1);
}

// States for the parser
// For debugging: temporarily remove `const` from `const enum`
const enum State {
    // Scheme states
    SchemeChar = 0, // First char must be an ASCII letter. Subsequent characters can be: ALPHA / DIGIT / "+" / "-" / "."
    SchemeHyphen, // Extra state used to figure out when we can start a new match after (such as if we have '-//' which starts a protocol-relative match)
    SchemeColon, // Once we've reached the colon character after a scheme name
    SchemeSlash1,
    SchemeSlash2,

    DomainLabelChar, // Note: Domain labels must begin with a letter or number (no hyphens), and can include unicode letters
    DomainHyphen,
    DomainDot,
    PortColon,
    PortNumber,
    Path,

    // Protocol-relative URL states
    ProtocolRelativeSlash1,
    ProtocolRelativeSlash2,

    // IPv4 States
    IpV4Digit,
    IpV4Dot,

    // Email Address States
    EmailMailto_M, // if matching a 'mailto:' prefix
    EmailMailto_A, // if matching a 'mailto:' prefix
    EmailMailto_I, // if matching a 'mailto:' prefix
    EmailMailto_L, // if matching a 'mailto:' prefix
    EmailMailto_T, // if matching a 'mailto:' prefix
    EmailMailto_O, // if matching a 'mailto:' prefix
    EmailMailto_Colon,
    EmailLocalPart,
    EmailLocalPartDot,
    EmailAtSign,
    EmailDomainChar,
    EmailDomainHyphen,
    EmailDomainDot,

    // Hashtag States
    HashtagHashChar, // When we've encountered the '#' char
    HashtagTextChar, // Inside a hashtag char

    // Mention State
    MentionAtChar,
    MentionTextChar,

    // Phone Number States
    PhoneNumberOpenParen,
    PhoneNumberAreaCodeDigit1, // a digit inside area code parens, such as the '1' in '(123)456-7890'
    PhoneNumberAreaCodeDigit2, // a digit inside area code parens, such as the '2' in '(123)456-7890'
    PhoneNumberAreaCodeDigit3, // a digit inside area code parens, such as the '3' in '(123)456-7890'
    PhoneNumberCloseParen,
    PhoneNumberPlus,
    PhoneNumberDigit, // a digit outside of area code parens
    PhoneNumberSeparator, // '-', '.' or ' '
    PhoneNumberControlChar, // ',' for 1 second pause, ';' for "wait" for user to take action
    PhoneNumberPoundChar, // '#' for pound character
}

type StateMachine =
    | UrlStateMachine
    | EmailStateMachine
    | MentionStateMachine
    | HashtagStateMachine
    | PhoneNumberStateMachine;

interface AbstractStateMachine {
    startIdx: number; // the index of the first character in the match
    state: State;
    acceptStateReached: boolean;
}

interface AbstractUrlStateMachine extends AbstractStateMachine {
    readonly type: 'url';
}

type UrlStateMachine = SchemeUrlStateMachine | TldUrlStateMachine | IpV4UrlStateMachine;

/**
 * State machine with metadata for capturing TLD (top-level domain) URLs.
 */
interface SchemeUrlStateMachine extends AbstractUrlStateMachine {
    readonly matchType: 'scheme';
}

/**
 * State machine with metadata for capturing TLD (top-level domain) URLs.
 */
interface TldUrlStateMachine extends AbstractUrlStateMachine {
    readonly matchType: 'tld';
}

/**
 * State machine for capturing IPv4 addresses that are not prefixed with a
 * scheme (such as 'http://').
 */
interface IpV4UrlStateMachine extends AbstractUrlStateMachine {
    readonly matchType: 'ipV4';
    octetsEncountered: number; // if we encounter a number of octets other than 4, it's not an IPv4 address
}

/**
 * State machine for capturing email addresses.
 */
interface EmailStateMachine extends AbstractStateMachine {
    readonly type: 'email';
}

/**
 * State machine for capturing hashtags.
 */
interface HashtagStateMachine extends AbstractStateMachine {
    readonly type: 'hashtag';
}

/**
 * State machine for capturing hashtags.
 */
interface MentionStateMachine extends AbstractStateMachine {
    readonly type: 'mention';
}

/**
 * State machine for capturing phone numbers.
 *
 * Note: this doesn't actually capture phone numbers at the moment, but is used
 * to exclude phone number matches from URLs where the URL matcher would
 * otherwise potentially think a phone number is part of a domain label.
 */
interface PhoneNumberStateMachine extends AbstractStateMachine {
    readonly type: 'phone';
}

function createSchemeUrlStateMachine(startIdx: number, state: State): SchemeUrlStateMachine {
    return {
        type: 'url',
        startIdx,
        state,
        acceptStateReached: false,
        matchType: 'scheme',
    };
}

function createTldUrlStateMachine(startIdx: number, state: State): TldUrlStateMachine {
    return {
        type: 'url',
        startIdx,
        state,
        acceptStateReached: false,
        matchType: 'tld',
    };
}

function createIpV4UrlStateMachine(startIdx: number, state: State): IpV4UrlStateMachine {
    return {
        type: 'url',
        startIdx,
        state,
        acceptStateReached: false,
        matchType: 'ipV4',
        octetsEncountered: 1, // starts at 1 because we create this machine when encountering the first octet
    };
}

function createEmailStateMachine(startIdx: number, state: State): EmailStateMachine {
    return {
        type: 'email',
        startIdx,
        state,
        acceptStateReached: false,
    };
}

function createHashtagStateMachine(startIdx: number, state: State): HashtagStateMachine {
    return {
        type: 'hashtag',
        startIdx,
        state,
        acceptStateReached: false,
    };
}

function createMentionStateMachine(startIdx: number, state: State): MentionStateMachine {
    return {
        type: 'mention',
        startIdx,
        state,
        acceptStateReached: false,
    };
}

function createPhoneNumberStateMachine(startIdx: number, state: State): PhoneNumberStateMachine {
    return {
        type: 'phone',
        startIdx,
        state,
        acceptStateReached: false,
    };
}

function isSchemeUrlStateMachine(machine: StateMachine): machine is SchemeUrlStateMachine {
    return machine.type === 'url' && machine.matchType === 'scheme';
}
