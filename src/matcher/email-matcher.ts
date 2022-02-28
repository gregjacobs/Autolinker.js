import { Matcher } from './matcher';
import { alphaNumericAndMarksCharsStr, domainNameCharRegex } from '../regex-lib';
import { EmailMatch } from '../match/email-match';
import { Match } from '../match/match';
import { throwUnhandledCaseError } from '../utils';
import { tldRegex } from './tld-regex';

// For debugging: search for other "For debugging" lines
// import CliTable from 'cli-table';

// RegExp objects which are shared by all instances of EmailMatcher. These are
// here to avoid re-instantiating the RegExp objects if `Autolinker.link()` is
// called multiple times, thus instantiating EmailMatcher and its RegExp
// objects each time (which is very expensive - see https://github.com/gregjacobs/Autolinker.js/issues/314).
// See descriptions of the properties where they are used for details about them
const localPartCharRegex = new RegExp(`[${alphaNumericAndMarksCharsStr}!#$%&'*+/=?^_\`{|}~-]`);
const strictTldRegex = new RegExp(`^${tldRegex.source}$`);

/**
 * @class Autolinker.matcher.Email
 * @extends Autolinker.matcher.Matcher
 *
 * Matcher to find email matches in an input string.
 *
 * See this class's superclass ({@link Autolinker.matcher.Matcher}) for more details.
 */
export class EmailMatcher extends Matcher {
    /**
     * Valid characters that can be used in the "local" part of an email address,
     * i.e. the "name" part of "name@site.com"
     */
    protected localPartCharRegex = localPartCharRegex;

    /**
     * Stricter TLD regex which adds a beginning and end check to ensure
     * the string is a valid TLD
     */
    protected strictTldRegex = strictTldRegex;

    /**
     * @inheritdoc
     */
    parseMatches(text: string) {
        const tagBuilder = this.tagBuilder,
            localPartCharRegex = this.localPartCharRegex,
            strictTldRegex = this.strictTldRegex,
            matches: Match[] = [],
            len = text.length,
            noCurrentEmailMatch = new CurrentEmailMatch();

        // for matching a 'mailto:' prefix
        const mailtoTransitions = {
            m: 'a',
            a: 'i',
            i: 'l',
            l: 't',
            t: 'o',
            o: ':',
        };

        let charIdx = 0,
            state = State.NonEmailMatch as State,
            currentEmailMatch = noCurrentEmailMatch;

        // For debugging: search for other "For debugging" lines
        // const table = new CliTable( {
        // 	head: [ 'charIdx', 'char', 'state', 'charIdx', 'currentEmailAddress.idx', 'hasDomainDot' ]
        // } );

        while (charIdx < len) {
            const char = text.charAt(charIdx);

            // For debugging: search for other "For debugging" lines
            // table.push(
            // 	[ charIdx, char, State[ state ], charIdx, currentEmailAddress.idx, currentEmailAddress.hasDomainDot ]
            // );

            switch (state) {
                case State.NonEmailMatch:
                    stateNonEmailAddress(char);
                    break;

                case State.Mailto:
                    stateMailTo(text.charAt(charIdx - 1) as MailtoChar, char);
                    break;
                case State.LocalPart:
                    stateLocalPart(char);
                    break;
                case State.LocalPartDot:
                    stateLocalPartDot(char);
                    break;
                case State.AtSign:
                    stateAtSign(char);
                    break;
                case State.DomainChar:
                    stateDomainChar(char);
                    break;
                case State.DomainHyphen:
                    stateDomainHyphen(char);
                    break;
                case State.DomainDot:
                    stateDomainDot(char);
                    break;

                default:
                    throwUnhandledCaseError(state);
            }

            // For debugging: search for other "For debugging" lines
            // table.push(
            // 	[ charIdx, char, State[ state ], charIdx, currentEmailAddress.idx, currentEmailAddress.hasDomainDot ]
            // );

            charIdx++;
        }

        // Capture any valid match at the end of the string
        captureMatchIfValidAndReset();

        // For debugging: search for other "For debugging" lines
        //console.log( '\n' + table.toString() );

        return matches;

        // Handles the state when we're not in an email address
        function stateNonEmailAddress(char: string) {
            if (char === 'm') {
                beginEmailMatch(State.Mailto);
            } else if (localPartCharRegex.test(char)) {
                beginEmailMatch();
            } else {
                // not an email address character, continue
            }
        }

        // Handles if we're reading a 'mailto:' prefix on the string
        function stateMailTo(prevChar: MailtoChar, char: string) {
            if (prevChar === ':') {
                // We've reached the end of the 'mailto:' prefix
                if (localPartCharRegex.test(char)) {
                    state = State.LocalPart;
                    currentEmailMatch = new CurrentEmailMatch({
                        ...currentEmailMatch,
                        hasMailtoPrefix: true,
                    });
                } else {
                    // we've matched 'mailto:' but didn't get anything meaningful
                    // immediately afterwards (for example, we encountered a
                    // space character, or an '@' character which formed 'mailto:@'
                    resetToNonEmailMatchState();
                }
            } else if (mailtoTransitions[prevChar] === char) {
                // We're currently reading the 'mailto:' prefix, stay in
                // Mailto state
            } else if (localPartCharRegex.test(char)) {
                // We we're reading a prefix of 'mailto:', but encountered a
                // different character that didn't continue the prefix
                state = State.LocalPart;
            } else if (char === '.') {
                // We we're reading a prefix of 'mailto:', but encountered a
                // dot character
                state = State.LocalPartDot;
            } else if (char === '@') {
                // We we're reading a prefix of 'mailto:', but encountered a
                // an @ character
                state = State.AtSign;
            } else {
                // not an email address character, return to "NonEmailAddress" state
                resetToNonEmailMatchState();
            }
        }

        // Handles the state when we're currently in the "local part" of an
        // email address (as opposed to the "domain part")
        function stateLocalPart(char: string) {
            if (char === '.') {
                state = State.LocalPartDot;
            } else if (char === '@') {
                state = State.AtSign;
            } else if (localPartCharRegex.test(char)) {
                // stay in the "local part" of the email address
            } else {
                // not an email address character, return to "NonEmailAddress" state
                resetToNonEmailMatchState();
            }
        }

        // Handles the state where we've read
        function stateLocalPartDot(char: string) {
            if (char === '.') {
                // We read a second '.' in a row, not a valid email address
                // local part
                resetToNonEmailMatchState();
            } else if (char === '@') {
                // We read the '@' character immediately after a dot ('.'), not
                // an email address
                resetToNonEmailMatchState();
            } else if (localPartCharRegex.test(char)) {
                state = State.LocalPart;
            } else {
                // Anything else, not an email address
                resetToNonEmailMatchState();
            }
        }

        function stateAtSign(char: string) {
            if (domainNameCharRegex.test(char)) {
                state = State.DomainChar;
            } else {
                // Anything else, not an email address
                resetToNonEmailMatchState();
            }
        }

        function stateDomainChar(char: string) {
            if (char === '.') {
                state = State.DomainDot;
            } else if (char === '-') {
                state = State.DomainHyphen;
            } else if (domainNameCharRegex.test(char)) {
                // Stay in the DomainChar state
            } else {
                // Anything else, we potentially matched if the criteria has
                // been met
                captureMatchIfValidAndReset();
            }
        }

        function stateDomainHyphen(char: string) {
            if (char === '-' || char === '.') {
                // Not valid to have two hyphens ("--") or hypen+dot ("-.")
                captureMatchIfValidAndReset();
            } else if (domainNameCharRegex.test(char)) {
                state = State.DomainChar;
            } else {
                // Anything else
                captureMatchIfValidAndReset();
            }
        }

        function stateDomainDot(char: string) {
            if (char === '.' || char === '-') {
                // not valid to have two dots ("..") or dot+hypen (".-")
                captureMatchIfValidAndReset();
            } else if (domainNameCharRegex.test(char)) {
                state = State.DomainChar;

                // After having read a '.' and then a valid domain character,
                // we now know that the domain part of the email is valid, and
                // we have found at least a partial EmailMatch (however, the
                // email address may have additional characters from this point)
                currentEmailMatch = new CurrentEmailMatch({
                    ...currentEmailMatch,
                    hasDomainDot: true,
                });
            } else {
                // Anything else
                captureMatchIfValidAndReset();
            }
        }

        function beginEmailMatch(newState = State.LocalPart) {
            state = newState;
            currentEmailMatch = new CurrentEmailMatch({ idx: charIdx });
        }

        function resetToNonEmailMatchState() {
            state = State.NonEmailMatch;
            currentEmailMatch = noCurrentEmailMatch;
        }

        /*
         * Captures the current email address as an EmailMatch if it's valid,
         * and resets the state to read another email address.
         */
        function captureMatchIfValidAndReset() {
            if (currentEmailMatch.hasDomainDot) {
                // we need at least one dot in the domain to be considered a valid email address
                let matchedText = text.slice(currentEmailMatch.idx, charIdx);

                // If we read a '.' or '-' char that ended the email address
                // (valid domain name characters, but only valid email address
                // characters if they are followed by something else), strip
                // it off now
                if (/[-.]$/.test(matchedText)) {
                    matchedText = matchedText.slice(0, -1);
                }

                const emailAddress = currentEmailMatch.hasMailtoPrefix
                    ? matchedText.slice('mailto:'.length)
                    : matchedText;

                // if the email address has a valid TLD, add it to the list of matches
                if (doesEmailHaveValidTld(emailAddress)) {
                    matches.push(
                        new EmailMatch({
                            tagBuilder: tagBuilder,
                            matchedText: matchedText,
                            offset: currentEmailMatch.idx,
                            email: emailAddress,
                        })
                    );
                }
            }

            resetToNonEmailMatchState();

            /**
             * Determines if the given email address has a valid TLD or not
             * @param {string} emailAddress - email address
             * @return {Boolean} - true is email have valid TLD, false otherwise
             */
            function doesEmailHaveValidTld(emailAddress: string) {
                const emailAddressTld: string = emailAddress.split('.').pop() || '';
                const emailAddressNormalized = emailAddressTld.toLowerCase();
                const isValidTld = strictTldRegex.test(emailAddressNormalized);

                return isValidTld;
            }
        }
    }
}

type MailtoChar = 'm' | 'a' | 'i' | 'l' | 't' | 'o' | ':';

const enum State {
    NonEmailMatch = 0,

    Mailto, // if matching a 'mailto:' prefix
    LocalPart,
    LocalPartDot,
    AtSign,
    DomainChar,
    DomainHyphen,
    DomainDot,
}

class CurrentEmailMatch {
    readonly idx: number; // the index of the first character in the email address
    readonly hasMailtoPrefix: boolean;
    readonly hasDomainDot: boolean;

    constructor(cfg: Partial<CurrentEmailMatch> = {}) {
        this.idx = cfg.idx !== undefined ? cfg.idx : -1;
        this.hasMailtoPrefix = !!cfg.hasMailtoPrefix;
        this.hasDomainDot = !!cfg.hasDomainDot;
    }
}
