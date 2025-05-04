import { UrlMatch, UrlMatchType } from '../match/url-match';
import { Match } from '../match/match';
import { assertNever } from '../utils';
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
import { Char } from '../char';
import {
    isAlphaNumericOrMarkChar,
    isCloseBraceChar,
    isAsciiDigitChar,
    isOpenBraceChar,
    isUrlSuffixNotAllowedAsFinalChar,
} from '../char-utils';

// For debugging: search for and uncomment other "For debugging" lines
// import CliTable from 'cli-table';

/**
 * Context object containing all the state needed by the state machine functions.
 *
 * ## Historical note
 *
 * In v4.1.1, we used nested functions to handle the context via closures, but
 * this necessitated re-creating the functions for each call to `parseMatches()`,
 * which made them difficult for v8 to JIT optimize. In v4.1.2, we lifted all of
 * the functions to the top-level scope and passed the context object between
 * them, which allows the functions to be JIT compiled once and reused.
 */
class ParseMatchesContext {
    public charIdx = 0; // Current character index being processed

    public readonly text: string; // The input text being parsed
    public readonly matches: Match[] = []; // Collection of matches found
    public readonly tagBuilder: AnchorTagBuilder; // For building anchor tags
    public readonly stripPrefix: Required<StripPrefixConfigObj>; // Strip prefix configuration
    public readonly stripTrailingSlash: boolean; // Whether to strip trailing slashes
    public readonly decodePercentEncoding: boolean; // Whether to decode percent encoding
    public readonly hashtagServiceName: HashtagService; // Service name for hashtags
    public readonly mentionServiceName: MentionService; // Service name for mentions

    private _stateMachines: StateMachine[] = []; // Array of active state machines
    private schemeUrlMachinesCount = 0; // part of an optimization to remove the need to go into a slow code block when unnecessary. Since it's been so long since the initial implementation, not sure that this can ever go above 1, but keeping it as a counter to be safe

    constructor(text: string, args: ParseMatchesArgs) {
        this.text = text;
        this.tagBuilder = args.tagBuilder;
        this.stripPrefix = args.stripPrefix;
        this.stripTrailingSlash = args.stripTrailingSlash;
        this.decodePercentEncoding = args.decodePercentEncoding;
        this.hashtagServiceName = args.hashtagServiceName;
        this.mentionServiceName = args.mentionServiceName;
    }

    public get stateMachines(): ReadonlyArray<StateMachine> {
        return this._stateMachines;
    }

    public addMachine(stateMachine: StateMachine): void {
        this._stateMachines.push(stateMachine);

        if (isSchemeUrlStateMachine(stateMachine)) {
            this.schemeUrlMachinesCount++;
        }
    }

    public removeMachine(stateMachine: StateMachine): void {
        // Performance note: this was originally implemented with Array.prototype.splice()
        // and mutated the array in place. Switching to filter added ~280ops/sec
        // on the benchmark, although likely at the expense of GC time. Perhaps
        // in the future, we implement a rotating array so we never need to move
        // or clean anything up
        this._stateMachines = this._stateMachines.filter(m => m !== stateMachine);

        // If we've removed the URL state machine, set the flag to false.
        // This flag is a quick test that helps us skip a slow section of
        // code when there is already a URL state machine present.
        if (isSchemeUrlStateMachine(stateMachine)) {
            this.schemeUrlMachinesCount--;
        }
    }

    public hasSchemeUrlMachine(): boolean {
        return this.schemeUrlMachinesCount > 0;
    }
}

/**
 * Parses URL, email, twitter, mention, and hashtag matches from the given
 * `text`.
 */
export function parseMatches(text: string, args: ParseMatchesArgs): Match[] {
    // Create the context object that will be passed to all state functions
    const context = new ParseMatchesContext(text, args);

    // For debugging: search for and uncomment other "For debugging" lines
    // const table = new CliTable({
    //     head: ['charIdx', 'char', 'code', 'type', 'states', 'startIdx', 'reached accept state'],
    // });
    for (; context.charIdx < context.text.length; context.charIdx++) {
        const char = text.charAt(context.charIdx);
        const charCode = text.charCodeAt(context.charIdx);

        if (context.stateMachines.length === 0) {
            stateNoMatch(context, char, charCode);
        } else {
            // Must loop through the state machines backwards for when one
            // is removed
            for (let stateIdx = context.stateMachines.length - 1; stateIdx >= 0; stateIdx--) {
                const stateMachine = context.stateMachines[stateIdx];

                switch (stateMachine.state) {
                    // Protocol-relative URL states
                    case State.ProtocolRelativeSlash1:
                        stateProtocolRelativeSlash1(context, stateMachine, charCode);
                        break;
                    case State.ProtocolRelativeSlash2:
                        stateProtocolRelativeSlash2(context, stateMachine, charCode);
                        break;

                    case State.SchemeChar:
                        stateSchemeChar(context, stateMachine, charCode);
                        break;
                    case State.SchemeHyphen:
                        stateSchemeHyphen(context, stateMachine, charCode);
                        break;
                    case State.SchemeColon:
                        stateSchemeColon(context, stateMachine, charCode);
                        break;
                    case State.SchemeSlash1:
                        stateSchemeSlash1(context, stateMachine, charCode);
                        break;
                    case State.SchemeSlash2:
                        stateSchemeSlash2(context, stateMachine, char, charCode);
                        break;

                    case State.DomainLabelChar:
                        stateDomainLabelChar(context, stateMachine, charCode);
                        break;
                    case State.DomainHyphen:
                        stateDomainHyphen(context, stateMachine, char, charCode);
                        break;
                    case State.DomainDot:
                        stateDomainDot(context, stateMachine, char, charCode);
                        break;

                    case State.IpV4Digit:
                        stateIpV4Digit(context, stateMachine as IpV4UrlStateMachine, charCode);
                        break;
                    case State.IpV4Dot:
                        stateIpV4Dot(context, stateMachine as IpV4UrlStateMachine, charCode);
                        break;

                    case State.PortColon:
                        statePortColon(context, stateMachine, charCode);
                        break;
                    case State.PortNumber:
                        statePortNumber(context, stateMachine, charCode);
                        break;
                    case State.Path:
                        statePath(context, stateMachine, charCode);
                        break;

                    // Email States
                    case State.EmailMailto_M:
                        stateEmailMailto_M(context, stateMachine, char, charCode);
                        break;
                    case State.EmailMailto_A:
                        stateEmailMailto_A(context, stateMachine, char, charCode);
                        break;
                    case State.EmailMailto_I:
                        stateEmailMailto_I(context, stateMachine, char, charCode);
                        break;
                    case State.EmailMailto_L:
                        stateEmailMailto_L(context, stateMachine, char, charCode);
                        break;
                    case State.EmailMailto_T:
                        stateEmailMailto_T(context, stateMachine, char, charCode);
                        break;
                    case State.EmailMailto_O:
                        stateEmailMailto_O(context, stateMachine, charCode);
                        break;
                    case State.EmailMailto_Colon:
                        stateEmailMailtoColon(context, stateMachine, charCode);
                        break;
                    case State.EmailLocalPart:
                        stateEmailLocalPart(context, stateMachine, charCode);
                        break;
                    case State.EmailLocalPartDot:
                        stateEmailLocalPartDot(context, stateMachine, charCode);
                        break;
                    case State.EmailAtSign:
                        stateEmailAtSign(context, stateMachine, charCode);
                        break;
                    case State.EmailDomainChar:
                        stateEmailDomainChar(context, stateMachine, charCode);
                        break;
                    case State.EmailDomainHyphen:
                        stateEmailDomainHyphen(context, stateMachine, charCode);
                        break;
                    case State.EmailDomainDot:
                        stateEmailDomainDot(context, stateMachine, charCode);
                        break;

                    // Hashtag states
                    case State.HashtagHashChar:
                        stateHashtagHashChar(context, stateMachine, charCode);
                        break;
                    case State.HashtagTextChar:
                        stateHashtagTextChar(context, stateMachine, charCode);
                        break;

                    // Mention states
                    case State.MentionAtChar:
                        stateMentionAtChar(context, stateMachine, charCode);
                        break;
                    case State.MentionTextChar:
                        stateMentionTextChar(context, stateMachine, charCode);
                        break;

                    // Phone number states
                    case State.PhoneNumberOpenParen:
                        statePhoneNumberOpenParen(context, stateMachine, char, charCode);
                        break;
                    case State.PhoneNumberAreaCodeDigit1:
                        statePhoneNumberAreaCodeDigit1(context, stateMachine, charCode);
                        break;
                    case State.PhoneNumberAreaCodeDigit2:
                        statePhoneNumberAreaCodeDigit2(context, stateMachine, charCode);
                        break;
                    case State.PhoneNumberAreaCodeDigit3:
                        statePhoneNumberAreaCodeDigit3(context, stateMachine, charCode);
                        break;
                    case State.PhoneNumberCloseParen:
                        statePhoneNumberCloseParen(context, stateMachine, char, charCode);
                        break;
                    case State.PhoneNumberPlus:
                        statePhoneNumberPlus(context, stateMachine, char, charCode);
                        break;
                    case State.PhoneNumberDigit:
                        statePhoneNumberDigit(context, stateMachine, char, charCode);
                        break;
                    case State.PhoneNumberSeparator:
                        statePhoneNumberSeparator(context, stateMachine, char, charCode);
                        break;
                    case State.PhoneNumberControlChar:
                        statePhoneNumberControlChar(context, stateMachine, charCode);
                        break;
                    case State.PhoneNumberPoundChar:
                        statePhoneNumberPoundChar(context, stateMachine, charCode);
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
            //
            // TODO: The addition of this snippet (to fix the bug) in 4.0.1 lost
            // us ~500 ops/sec on the benchmarks. Optimizing it with the
            // hasSchemeUrlMachine() flag and optimizing the isSchemeStartChar()
            // method for 4.1.3 got us back about ~400ops/sec. One potential way
            // to improve this even ore is to add this snippet to individual
            // state handler functions where it can occur to prevent running it
            // on every loop interation.
            if (
                !context.hasSchemeUrlMachine() &&
                context.charIdx > 0 &&
                isSchemeStartChar(charCode)
            ) {
                const prevCharCode = context.text.charCodeAt(context.charIdx - 1);
                if (!isSchemeStartChar(prevCharCode)) {
                    context.addMachine(
                        createSchemeUrlStateMachine(context.charIdx, State.SchemeChar)
                    );
                }
            }
        }

        // For debugging: search for and uncomment other "For debugging" lines
        // table.push([
        //     String(context.charIdx),
        //     char,
        //     `10: ${char.charCodeAt(0)}\n0x: ${char.charCodeAt(0).toString(16)}\nU+${char.codePointAt(0)}`,
        //     context.stateMachines.map(machine => `${StateMachineType[machine.type]}${'matchType' in machine ? ` (${UrlStateMachineMatchType[machine.matchType]})` : ''}`).join('\n') || '(none)',
        //     context.stateMachines.map(machine => State[machine.state]).join('\n') || '(none)',
        //     context.stateMachines.map(m => m.startIdx).join('\n'),
        //     context.stateMachines.map(m => m.acceptStateReached).join('\n'),
        // ]);
    }

    // Capture any valid match at the end of the string
    // Note: this loop must happen in reverse because
    // captureMatchIfValidAndRemove() removes state machines from the array
    // and we'll end up skipping every other one if we remove while looping
    // forward
    for (let i = context.stateMachines.length - 1; i >= 0; i--) {
        context.stateMachines.forEach(stateMachine =>
            captureMatchIfValidAndRemove(context, stateMachine)
        );
    }

    // For debugging: search for and uncomment other "For debugging" lines
    // console.log(`\nRead string:\n  ${text}`);
    // console.log(table.toString());

    return context.matches;
}

/**
 * Handles the state when we're not in a URL/email/etc. (i.e. when no state machines exist)
 */
function stateNoMatch(context: ParseMatchesContext, char: string, charCode: number): void {
    const { charIdx } = context;

    if (charCode === Char.NumberSign /* '#' */) {
        // Hash char, start a Hashtag match
        context.addMachine(createHashtagStateMachine(charIdx, State.HashtagHashChar));
    } else if (charCode === Char.AtSign /* '@' */) {
        // '@' char, start a Mention match
        context.addMachine(createMentionStateMachine(charIdx, State.MentionAtChar));
    } else if (charCode === Char.Slash /* '/' */) {
        // A slash could begin a protocol-relative URL
        context.addMachine(createTldUrlStateMachine(charIdx, State.ProtocolRelativeSlash1));
    } else if (charCode === Char.Plus /* '+' */) {
        // A '+' char can start a Phone number
        context.addMachine(createPhoneNumberStateMachine(charIdx, State.PhoneNumberPlus));
    } else if (charCode === Char.OpenParen /* '(' */) {
        context.addMachine(createPhoneNumberStateMachine(charIdx, State.PhoneNumberOpenParen));
    } else {
        if (isAsciiDigitChar(charCode)) {
            // A digit could start a phone number
            context.addMachine(createPhoneNumberStateMachine(charIdx, State.PhoneNumberDigit));

            // A digit could start an IP address
            context.addMachine(createIpV4UrlStateMachine(charIdx, State.IpV4Digit));
        }

        if (isEmailLocalPartStartChar(charCode)) {
            // Any email local part. An 'm' character in particular could
            // start a 'mailto:' match
            const startState =
                char.toLowerCase() === 'm' ? State.EmailMailto_M : State.EmailLocalPart;
            context.addMachine(createEmailStateMachine(charIdx, startState));
        }

        if (isSchemeStartChar(charCode)) {
            // An uppercase or lowercase letter may start a scheme match
            context.addMachine(createSchemeUrlStateMachine(charIdx, State.SchemeChar));
        }

        if (isAlphaNumericOrMarkChar(charCode)) {
            // A unicode alpha character or digit could start a domain name
            // label for a TLD match
            context.addMachine(createTldUrlStateMachine(charIdx, State.DomainLabelChar));
        }
    }

    // Anything else, remain in the "non-url" state by not creating any
    // state machines
}

// Implements ABNF: ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
function stateSchemeChar(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (charCode === Char.Colon /* ':' */) {
        stateMachine.state = State.SchemeColon;
    } else if (charCode === Char.Dash /* '-' */) {
        stateMachine.state = State.SchemeHyphen;
    } else if (isSchemeChar(charCode)) {
        // Stay in SchemeChar state
    } else {
        // Any other character, not a scheme
        context.removeMachine(stateMachine);
    }
}

function stateSchemeHyphen(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    const { charIdx } = context;

    if (charCode === Char.Dash /* '-' */) {
        // Stay in SchemeHyphen state
        // TODO: Should a colon following a dash be counted as the end of the scheme?
        // } else if (char === ':') {
        //     stateMachine.state = State.SchemeColon;
    } else if (charCode === Char.Slash /* '/' */) {
        // Not a valid scheme match, but may be the start of a
        // protocol-relative match (such as //google.com)
        context.removeMachine(stateMachine);
        context.addMachine(createTldUrlStateMachine(charIdx, State.ProtocolRelativeSlash1));
    } else if (isSchemeChar(charCode)) {
        stateMachine.state = State.SchemeChar;
    } else {
        // Any other character, not a scheme
        context.removeMachine(stateMachine);
    }
}

// https://tools.ietf.org/html/rfc3986#appendix-A
function stateSchemeColon(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    const { charIdx } = context;

    if (charCode === Char.Slash /* '/' */) {
        stateMachine.state = State.SchemeSlash1;
    } else if (charCode === Char.Dot /* '.' */) {
        // We've read something like 'hello:.' - don't capture
        context.removeMachine(stateMachine);
    } else if (isDomainLabelStartChar(charCode)) {
        stateMachine.state = State.DomainLabelChar;

        // It's possible that we read an "introduction" piece of text,
        // and the character after the current colon actually starts an
        // actual scheme. An example of this is:
        //     "The link:http://google.com"
        // Hence, start a new machine to capture this match if so
        if (isSchemeStartChar(charCode)) {
            context.addMachine(createSchemeUrlStateMachine(charIdx, State.SchemeChar));
        }
    } else {
        context.removeMachine(stateMachine);
    }
}

// https://tools.ietf.org/html/rfc3986#appendix-A
function stateSchemeSlash1(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (charCode === Char.Slash /* '/' */) {
        stateMachine.state = State.SchemeSlash2;
    } else if (isPathChar(charCode)) {
        stateMachine.state = State.Path;
        stateMachine.acceptStateReached = true;
    } else {
        captureMatchIfValidAndRemove(context, stateMachine);
    }
}

function stateSchemeSlash2(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    char: string,
    charCode: number
) {
    if (charCode === Char.Slash /* '/' */) {
        // 3rd slash, must be an absolute path (`path-absolute` in the
        // ABNF), such as in "file:///c:/windows/etc". See
        // https://tools.ietf.org/html/rfc3986#appendix-A
        stateMachine.state = State.Path;
        stateMachine.acceptStateReached = true;
    } else if (isDomainLabelStartChar(charCode)) {
        // start of "authority" section - see https://tools.ietf.org/html/rfc3986#appendix-A
        stateMachine.state = State.DomainLabelChar;
        stateMachine.acceptStateReached = true;
    } else {
        // not valid
        context.removeMachine(stateMachine);
    }
}

// Handles after we've read a '/' from the NonUrl state
function stateProtocolRelativeSlash1(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (charCode === Char.Slash /* '/' */) {
        stateMachine.state = State.ProtocolRelativeSlash2;
    } else {
        // Anything else, cannot be the start of a protocol-relative
        // URL.
        context.removeMachine(stateMachine);
    }
}

// Handles after we've read a second '/', which could start a protocol-relative URL
function stateProtocolRelativeSlash2(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (isDomainLabelStartChar(charCode)) {
        stateMachine.state = State.DomainLabelChar;
    } else {
        // Anything else, not a URL
        context.removeMachine(stateMachine);
    }
}

// Handles when we have read a domain label character
function stateDomainLabelChar(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (charCode === Char.Dot /* '.' */) {
        stateMachine.state = State.DomainDot;
    } else if (charCode === Char.Dash /* '-' */) {
        stateMachine.state = State.DomainHyphen;
    } else if (charCode === Char.Colon /* ':' */) {
        // Beginning of a port number, end the domain name
        stateMachine.state = State.PortColon;
    } else if (isUrlSuffixStartChar(charCode)) {
        // '/', '?', or '#'
        stateMachine.state = State.Path;
    } else if (isDomainLabelChar(charCode)) {
        // Stay in the DomainLabelChar state
    } else {
        // Anything else, end the domain name
        captureMatchIfValidAndRemove(context, stateMachine);
    }
}

function stateDomainHyphen(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    char: string,
    charCode: number
) {
    if (charCode === Char.Dash /* '-' */) {
        // Remain in the DomainHyphen state
    } else if (charCode === Char.Dot /* '.' */) {
        // Not valid to have a '-.' in a domain label
        captureMatchIfValidAndRemove(context, stateMachine);
    } else if (isDomainLabelStartChar(charCode)) {
        stateMachine.state = State.DomainLabelChar;
    } else {
        captureMatchIfValidAndRemove(context, stateMachine);
    }
}

function stateDomainDot(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    char: string,
    charCode: number
) {
    if (charCode === Char.Dot /* '.' */) {
        // domain names cannot have multiple '.'s next to each other.
        // It's possible we've already read a valid domain name though,
        // and that the '..' sequence just forms an ellipsis at the end
        // of a sentence
        captureMatchIfValidAndRemove(context, stateMachine);
    } else if (isDomainLabelStartChar(charCode)) {
        stateMachine.state = State.DomainLabelChar;
        stateMachine.acceptStateReached = true; // after hitting a dot, and then another domain label, we've reached an accept state
    } else {
        // Anything else, end the domain name
        captureMatchIfValidAndRemove(context, stateMachine);
    }
}

function stateIpV4Digit(
    context: ParseMatchesContext,
    stateMachine: IpV4UrlStateMachine,
    charCode: number
) {
    if (charCode === Char.Dot /* '.' */) {
        stateMachine.state = State.IpV4Dot;
    } else if (charCode === Char.Colon /* ':' */) {
        // Beginning of a port number
        stateMachine.state = State.PortColon;
    } else if (isAsciiDigitChar(charCode)) {
        // stay in the IPv4 digit state
    } else if (isUrlSuffixStartChar(charCode)) {
        stateMachine.state = State.Path;
    } else if (isAlphaNumericOrMarkChar(charCode)) {
        // If we hit an alpha character, must not be an IPv4
        // Example of this: 1.2.3.4abc
        context.removeMachine(stateMachine);
    } else {
        captureMatchIfValidAndRemove(context, stateMachine);
    }
}

function stateIpV4Dot(
    context: ParseMatchesContext,
    stateMachine: IpV4UrlStateMachine,
    charCode: number
) {
    if (isAsciiDigitChar(charCode)) {
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
        captureMatchIfValidAndRemove(context, stateMachine);
    }
}

function statePortColon(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (isAsciiDigitChar(charCode)) {
        stateMachine.state = State.PortNumber;
    } else {
        captureMatchIfValidAndRemove(context, stateMachine);
    }
}

function statePortNumber(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (isAsciiDigitChar(charCode)) {
        // Stay in port number state
    } else if (isUrlSuffixStartChar(charCode)) {
        // '/', '?', or '#'
        stateMachine.state = State.Path;
    } else {
        captureMatchIfValidAndRemove(context, stateMachine);
    }
}

function statePath(context: ParseMatchesContext, stateMachine: StateMachine, charCode: number) {
    if (isPathChar(charCode)) {
        // Stay in the path state
    } else {
        captureMatchIfValidAndRemove(context, stateMachine);
    }
}

// Handles if we're reading a 'mailto:' prefix on the string
function stateEmailMailto_M(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    char: string,
    charCode: number
) {
    if (char.toLowerCase() === 'a') {
        stateMachine.state = State.EmailMailto_A;
    } else {
        stateEmailLocalPart(context, stateMachine, charCode);
    }
}

function stateEmailMailto_A(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    char: string,
    charCode: number
) {
    if (char.toLowerCase() === 'i') {
        stateMachine.state = State.EmailMailto_I;
    } else {
        stateEmailLocalPart(context, stateMachine, charCode);
    }
}

function stateEmailMailto_I(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    char: string,
    charCode: number
) {
    if (char.toLowerCase() === 'l') {
        stateMachine.state = State.EmailMailto_L;
    } else {
        stateEmailLocalPart(context, stateMachine, charCode);
    }
}

function stateEmailMailto_L(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    char: string,
    charCode: number
) {
    if (char.toLowerCase() === 't') {
        stateMachine.state = State.EmailMailto_T;
    } else {
        stateEmailLocalPart(context, stateMachine, charCode);
    }
}

function stateEmailMailto_T(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    char: string,
    charCode: number
) {
    if (char.toLowerCase() === 'o') {
        stateMachine.state = State.EmailMailto_O;
    } else {
        stateEmailLocalPart(context, stateMachine, charCode);
    }
}

function stateEmailMailto_O(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (charCode === Char.Colon /* ':' */) {
        stateMachine.state = State.EmailMailto_Colon;
    } else {
        stateEmailLocalPart(context, stateMachine, charCode);
    }
}

function stateEmailMailtoColon(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (isEmailLocalPartChar(charCode)) {
        stateMachine.state = State.EmailLocalPart;
    } else {
        context.removeMachine(stateMachine);
    }
}

// Handles the state when we're currently in the "local part" of an
// email address (as opposed to the "domain part")
function stateEmailLocalPart(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (charCode === Char.Dot /* '.' */) {
        stateMachine.state = State.EmailLocalPartDot;
    } else if (charCode === Char.AtSign /* '@' */) {
        stateMachine.state = State.EmailAtSign;
    } else if (isEmailLocalPartChar(charCode)) {
        // stay in the "local part" of the email address
        // Note: because stateEmailLocalPart() is called from the
        // 'mailto' states (when the 'mailto' prefix itself has been
        // broken), make sure to set the state to EmailLocalPart
        stateMachine.state = State.EmailLocalPart;
    } else {
        // not an email address character
        context.removeMachine(stateMachine);
    }
}

// Handles the state where we've read a '.' character in the local part of
// the email address (i.e. the part before the '@' character)
function stateEmailLocalPartDot(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (charCode === Char.Dot /* '.' */) {
        // We read a second '.' in a row, not a valid email address
        // local part
        context.removeMachine(stateMachine);
    } else if (charCode === Char.AtSign /* '@' */) {
        // We read the '@' character immediately after a dot ('.'), not
        // an email address
        context.removeMachine(stateMachine);
    } else if (isEmailLocalPartChar(charCode)) {
        stateMachine.state = State.EmailLocalPart;
    } else {
        // Anything else, not an email address
        context.removeMachine(stateMachine);
    }
}

function stateEmailAtSign(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (isDomainLabelStartChar(charCode)) {
        stateMachine.state = State.EmailDomainChar;
    } else {
        // Anything else, not an email address
        context.removeMachine(stateMachine);
    }
}

function stateEmailDomainChar(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (charCode === Char.Dot /* '.' */) {
        stateMachine.state = State.EmailDomainDot;
    } else if (charCode === Char.Dash /* '-' */) {
        stateMachine.state = State.EmailDomainHyphen;
    } else if (isDomainLabelChar(charCode)) {
        // Stay in the DomainChar state
    } else {
        // Anything else, we potentially matched if the criteria has
        // been met
        captureMatchIfValidAndRemove(context, stateMachine);
    }
}

function stateEmailDomainHyphen(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (charCode === Char.Dash /* '-' */ || charCode === Char.Dot /* '.' */) {
        // Not valid to have two hyphens ("--") or hypen+dot ("-.")
        captureMatchIfValidAndRemove(context, stateMachine);
    } else if (isDomainLabelChar(charCode)) {
        stateMachine.state = State.EmailDomainChar;
    } else {
        // Anything else
        captureMatchIfValidAndRemove(context, stateMachine);
    }
}

function stateEmailDomainDot(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (charCode === Char.Dot /* '.' */ || charCode === Char.Dash /* '-' */) {
        // not valid to have two dots ("..") or dot+hypen (".-")
        captureMatchIfValidAndRemove(context, stateMachine);
    } else if (isDomainLabelStartChar(charCode)) {
        stateMachine.state = State.EmailDomainChar;

        // After having read a '.' and then a valid domain character,
        // we now know that the domain part of the email is valid, and
        // we have found at least a partial EmailMatch (however, the
        // email address may have additional characters from this point)
        stateMachine.acceptStateReached = true;
    } else {
        // Anything else
        captureMatchIfValidAndRemove(context, stateMachine);
    }
}

// Handles the state when we've just encountered a '#' character
function stateHashtagHashChar(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (isHashtagTextChar(charCode)) {
        // '#' char with valid hash text char following
        stateMachine.state = State.HashtagTextChar;
        stateMachine.acceptStateReached = true;
    } else {
        context.removeMachine(stateMachine);
    }
}

// Handles the state when we're currently in the hash tag's text chars
function stateHashtagTextChar(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (isHashtagTextChar(charCode)) {
        // Continue reading characters in the HashtagText state
    } else {
        captureMatchIfValidAndRemove(context, stateMachine);
    }
}

// Handles the state when we've just encountered a '@' character
function stateMentionAtChar(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (isMentionTextChar(charCode)) {
        // '@' char with valid mention text char following
        stateMachine.state = State.MentionTextChar;
        stateMachine.acceptStateReached = true;
    } else {
        context.removeMachine(stateMachine);
    }
}

// Handles the state when we're currently in the mention's text chars
function stateMentionTextChar(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (isMentionTextChar(charCode)) {
        // Continue reading characters in the HashtagText state
    } else if (isAlphaNumericOrMarkChar(charCode)) {
        // Char is invalid for a mention text char, not a valid match.
        // Note that ascii alphanumeric chars are okay (which are tested
        // in the previous 'if' statement, but others are not)
        context.removeMachine(stateMachine);
    } else {
        captureMatchIfValidAndRemove(context, stateMachine);
    }
}

function statePhoneNumberPlus(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    char: string,
    charCode: number
) {
    if (isAsciiDigitChar(charCode)) {
        stateMachine.state = State.PhoneNumberDigit;
    } else {
        context.removeMachine(stateMachine);

        // This character may start a new match. Add states for it
        stateNoMatch(context, char, charCode);
    }
}

function statePhoneNumberOpenParen(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    char: string,
    charCode: number
) {
    if (isAsciiDigitChar(charCode)) {
        stateMachine.state = State.PhoneNumberAreaCodeDigit1;
    } else {
        context.removeMachine(stateMachine);
    }

    // It's also possible that the paren was just an open brace for
    // a piece of text. Start other machines
    stateNoMatch(context, char, charCode);
}

function statePhoneNumberAreaCodeDigit1(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (isAsciiDigitChar(charCode)) {
        stateMachine.state = State.PhoneNumberAreaCodeDigit2;
    } else {
        context.removeMachine(stateMachine);
    }
}

function statePhoneNumberAreaCodeDigit2(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (isAsciiDigitChar(charCode)) {
        stateMachine.state = State.PhoneNumberAreaCodeDigit3;
    } else {
        context.removeMachine(stateMachine);
    }
}

function statePhoneNumberAreaCodeDigit3(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (charCode === Char.CloseParen /* ')' */) {
        stateMachine.state = State.PhoneNumberCloseParen;
    } else {
        context.removeMachine(stateMachine);
    }
}

function statePhoneNumberCloseParen(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    char: string,
    charCode: number
) {
    if (isAsciiDigitChar(charCode)) {
        stateMachine.state = State.PhoneNumberDigit;
    } else if (isPhoneNumberSeparatorChar(charCode)) {
        stateMachine.state = State.PhoneNumberSeparator;
    } else {
        context.removeMachine(stateMachine);
    }
}

function statePhoneNumberDigit(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    char: string,
    charCode: number
) {
    const { charIdx } = context;

    // For now, if we've reached any digits, we'll say that the machine
    // has reached its accept state. The phone regex will confirm the
    // match later.
    // Alternatively, we could count the number of digits to avoid
    // invoking the phone number regex
    stateMachine.acceptStateReached = true;

    if (isPhoneNumberControlChar(charCode)) {
        stateMachine.state = State.PhoneNumberControlChar;
    } else if (charCode === Char.NumberSign /* '#' */) {
        stateMachine.state = State.PhoneNumberPoundChar;
    } else if (isAsciiDigitChar(charCode)) {
        // Stay in the phone number digit state
    } else if (charCode === Char.OpenParen /* '(' */) {
        stateMachine.state = State.PhoneNumberOpenParen;
    } else if (isPhoneNumberSeparatorChar(charCode)) {
        stateMachine.state = State.PhoneNumberSeparator;
    } else {
        captureMatchIfValidAndRemove(context, stateMachine);

        // The transition from a digit character to a letter can be the
        // start of a new scheme URL match
        if (isSchemeStartChar(charCode)) {
            context.addMachine(createSchemeUrlStateMachine(charIdx, State.SchemeChar));
        }
    }
}

function statePhoneNumberSeparator(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    char: string,
    charCode: number
) {
    if (isAsciiDigitChar(charCode)) {
        stateMachine.state = State.PhoneNumberDigit;
    } else if (charCode === Char.OpenParen /* '(' */) {
        stateMachine.state = State.PhoneNumberOpenParen;
    } else {
        captureMatchIfValidAndRemove(context, stateMachine);

        // This character may start a new match. Add states for it
        stateNoMatch(context, char, charCode);
    }
}

// The ";" characters is "wait" in a phone number
// The "," characters is "pause" in a phone number
function statePhoneNumberControlChar(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (isPhoneNumberControlChar(charCode)) {
        // Stay in the "control char" state
    } else if (charCode === Char.NumberSign /* '#' */) {
        stateMachine.state = State.PhoneNumberPoundChar;
    } else if (isAsciiDigitChar(charCode)) {
        stateMachine.state = State.PhoneNumberDigit;
    } else {
        captureMatchIfValidAndRemove(context, stateMachine);
    }
}

// The "#" characters is "pound" in a phone number
function statePhoneNumberPoundChar(
    context: ParseMatchesContext,
    stateMachine: StateMachine,
    charCode: number
) {
    if (isPhoneNumberControlChar(charCode)) {
        stateMachine.state = State.PhoneNumberControlChar;
    } else if (isAsciiDigitChar(charCode)) {
        // According to some of the older tests, if there's a digit
        // after a '#' sign, the match is invalid. TODO: Revisit if this is true
        context.removeMachine(stateMachine);
    } else {
        captureMatchIfValidAndRemove(context, stateMachine);
    }
}

/*
 * Captures a match if it is valid (i.e. has a full domain name for a
 * TLD match). If a match is not valid, it is possible that we want to
 * keep reading characters in order to make a full match.
 */
function captureMatchIfValidAndRemove(context: ParseMatchesContext, stateMachine: StateMachine) {
    const {
        matches,
        text,
        charIdx,
        tagBuilder,
        stripPrefix,
        stripTrailingSlash,
        decodePercentEncoding,
        hashtagServiceName,
        mentionServiceName,
    } = context;

    // Remove the state machine first. There are a number of code paths
    // which return out of this function early, so make sure we have
    // this done
    context.removeMachine(stateMachine);

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

    switch (stateMachine.type) {
        case StateMachineType.Url: {
            // We don't want to accidentally match a URL that is preceded by an
            // '@' character, which would be an email address
            const charBeforeUrlMatch = text.charCodeAt(stateMachine.startIdx - 1);
            if (charBeforeUrlMatch === Char.AtSign /* '@' */) {
                return;
            }

            switch (stateMachine.matchType) {
                case UrlStateMachineMatchType.Scheme: {
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
                    break;
                }

                case UrlStateMachineMatchType.Tld: {
                    if (!isValidTldMatch(matchedText)) {
                        return; // not a valid match
                    }
                    break;
                }

                case UrlStateMachineMatchType.IpV4: {
                    if (!isValidIpV4Address(matchedText)) {
                        return; // not a valid match
                    }
                    break;
                }

                /* istanbul ignore next */
                default:
                    assertNever(stateMachine);
            }

            matches.push(
                new UrlMatch({
                    tagBuilder: tagBuilder,
                    matchedText: matchedText,
                    offset: startIdx,
                    urlMatchType: toUrlMatchType(stateMachine.matchType),
                    url: matchedText,
                    protocolRelativeMatch: matchedText.slice(0, 2) === '//',

                    // TODO: Do these settings need to be passed to the match,
                    // or should we handle them here in UrlMatcher?
                    stripPrefix: stripPrefix,
                    stripTrailingSlash: stripTrailingSlash,
                    decodePercentEncoding: decodePercentEncoding,
                })
            );
            break;
        }

        case StateMachineType.Email: {
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
            break;
        }

        case StateMachineType.Hashtag: {
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
            break;
        }

        case StateMachineType.Mention: {
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
            break;
        }

        case StateMachineType.Phone: {
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
            break;
        }

        /* istanbul ignore next */
        default:
            assertNever(stateMachine);
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

/**
 * Helper function to convert a UrlStateMachineMatchType value to its
 * UrlMatchType equivalent.
 */
function toUrlMatchType(stateMachineMatchType: UrlStateMachineMatchType): UrlMatchType {
    switch (stateMachineMatchType) {
        case UrlStateMachineMatchType.Scheme:
            return 'scheme';
        case UrlStateMachineMatchType.Tld:
            return 'tld';
        case UrlStateMachineMatchType.IpV4:
            return 'ipV4';

        /* istanbul ignore next */
        default:
            assertNever(stateMachineMatchType);
    }
}

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
        const charCode = matchedText.charCodeAt(i);

        if (isOpenBraceChar(charCode)) {
            braceCounts[char]++;
        } else if (isCloseBraceChar(charCode)) {
            braceCounts[oppositeBrace[char]]--;
        }
    }

    let endIdx = matchedText.length - 1;
    while (endIdx >= 0) {
        const char = matchedText.charAt(endIdx);
        const charCode = matchedText.charCodeAt(endIdx);

        if (isCloseBraceChar(charCode)) {
            const oppositeBraceChar = oppositeBrace[char];

            if (braceCounts[oppositeBraceChar] < 0) {
                braceCounts[oppositeBraceChar]++;
                endIdx--;
            } else {
                break;
            }
        } else if (isUrlSuffixNotAllowedAsFinalChar(charCode)) {
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

// The type of state machine
// For debugging: temporarily remove `const` from `const enum`
const enum StateMachineType {
    Url = 0,
    Email,
    Hashtag,
    Mention,
    Phone,
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

// The type of URL state machine
// For debugging: temporarily remove `const` from `const enum`
const enum UrlStateMachineMatchType {
    Scheme = 0, // http://, https://, file://, etc. match
    Tld, // Top-level Domain (TLD)
    IpV4, // 192.168.0.1
}

interface AbstractUrlStateMachine extends AbstractStateMachine {
    readonly type: StateMachineType.Url;
}

type UrlStateMachine = SchemeUrlStateMachine | TldUrlStateMachine | IpV4UrlStateMachine;

/**
 * State machine with metadata for capturing TLD (top-level domain) URLs.
 */
interface SchemeUrlStateMachine extends AbstractUrlStateMachine {
    readonly matchType: UrlStateMachineMatchType.Scheme;
}

/**
 * State machine with metadata for capturing TLD (top-level domain) URLs.
 */
interface TldUrlStateMachine extends AbstractUrlStateMachine {
    readonly matchType: UrlStateMachineMatchType.Tld;
}

/**
 * State machine for capturing IPv4 addresses that are not prefixed with a
 * scheme (such as 'http://').
 */
interface IpV4UrlStateMachine extends AbstractUrlStateMachine {
    readonly matchType: UrlStateMachineMatchType.IpV4;
    octetsEncountered: number; // if we encounter a number of octets other than 4, it's not an IPv4 address
}

/**
 * State machine for capturing email addresses.
 */
interface EmailStateMachine extends AbstractStateMachine {
    readonly type: StateMachineType.Email;
}

/**
 * State machine for capturing hashtags.
 */
interface HashtagStateMachine extends AbstractStateMachine {
    readonly type: StateMachineType.Hashtag;
}

/**
 * State machine for capturing hashtags.
 */
interface MentionStateMachine extends AbstractStateMachine {
    readonly type: StateMachineType.Mention;
}

/**
 * State machine for capturing phone numbers.
 *
 * Note: this doesn't actually capture phone numbers at the moment, but is used
 * to exclude phone number matches from URLs where the URL matcher would
 * otherwise potentially think a phone number is part of a domain label.
 */
interface PhoneNumberStateMachine extends AbstractStateMachine {
    readonly type: StateMachineType.Phone;
}

function createSchemeUrlStateMachine(startIdx: number, state: State): SchemeUrlStateMachine {
    return {
        type: StateMachineType.Url,
        startIdx,
        state,
        acceptStateReached: false,
        matchType: UrlStateMachineMatchType.Scheme,
    };
}

function createTldUrlStateMachine(startIdx: number, state: State): TldUrlStateMachine {
    return {
        type: StateMachineType.Url,
        startIdx,
        state,
        acceptStateReached: false,
        matchType: UrlStateMachineMatchType.Tld,
    };
}

function createIpV4UrlStateMachine(startIdx: number, state: State): IpV4UrlStateMachine {
    return {
        type: StateMachineType.Url,
        startIdx,
        state,
        acceptStateReached: false,
        matchType: UrlStateMachineMatchType.IpV4,
        octetsEncountered: 1, // starts at 1 because we create this machine when encountering the first octet
    };
}

function createEmailStateMachine(startIdx: number, state: State): EmailStateMachine {
    return {
        type: StateMachineType.Email,
        startIdx,
        state,
        acceptStateReached: false,
    };
}

function createHashtagStateMachine(startIdx: number, state: State): HashtagStateMachine {
    return {
        type: StateMachineType.Hashtag,
        startIdx,
        state,
        acceptStateReached: false,
    };
}

function createMentionStateMachine(startIdx: number, state: State): MentionStateMachine {
    return {
        type: StateMachineType.Mention,
        startIdx,
        state,
        acceptStateReached: false,
    };
}

function createPhoneNumberStateMachine(startIdx: number, state: State): PhoneNumberStateMachine {
    return {
        type: StateMachineType.Phone,
        startIdx,
        state,
        acceptStateReached: false,
    };
}

function isSchemeUrlStateMachine(machine: StateMachine): machine is SchemeUrlStateMachine {
    return (
        machine.type === StateMachineType.Url &&
        machine.matchType === UrlStateMachineMatchType.Scheme
    );
}
