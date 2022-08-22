import { Matcher, MatcherConfig } from './matcher';
import { alphaNumericAndMarksCharRe, alphaNumericAndMarksCharsStr } from '../regex-lib';
import { HashtagMatch } from '../match/hashtag-match';
import { Match } from '../match/match';
import { throwUnhandledCaseError } from '../utils';

// For debugging: search for other "For debugging" lines
// import CliTable from 'cli-table';

const hashtagTextCharRe = new RegExp(`[_${alphaNumericAndMarksCharsStr}]`);

/**
 * @class Autolinker.matcher.Hashtag
 * @extends Autolinker.matcher.Matcher
 *
 * Matcher to find HashtagMatch matches in an input string.
 */
export class HashtagMatcher extends Matcher {
    /**
     * @cfg {String} service
     *
     * A string for the service name to have hashtags (ex: "#myHashtag")
     * auto-linked to. The currently-supported values are:
     *
     * - 'twitter'
     * - 'facebook'
     * - 'instagram'
     * - 'tiktok'
     */
    protected readonly serviceName: HashtagService = 'twitter'; // default value just to get the above doc comment in the ES5 output and documentation generator

    /**
     * @method constructor
     * @param {Object} cfg The configuration properties for the Match instance,
     *   specified in an Object (map).
     */
    constructor(cfg: HashtagMatcherConfig) {
        super(cfg);

        this.serviceName = cfg.serviceName;
    }

    /**
     * @inheritdoc
     */
    parseMatches(text: string) {
        const tagBuilder = this.tagBuilder;
        const serviceName = this.serviceName;

        const matches: Match[] = [];
        const len = text.length;

        let charIdx = 0,
            hashCharIdx = -1,
            state = State.None as State;

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
                case State.None:
                    stateNone(char);
                    break;
                case State.NonHashtagWordChar:
                    stateNonHashtagWordChar(char);
                    break;
                case State.HashtagHashChar:
                    stateHashtagHashChar(char);
                    break;
                case State.HashtagTextChar:
                    stateHashtagTextChar(char);
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
        captureMatchIfValid();

        // For debugging: search for other "For debugging" lines
        //console.log( '\n' + table.toString() );

        return matches;

        // Handles the state when we're not in a hashtag or any word
        function stateNone(char: string) {
            if (char === '#') {
                state = State.HashtagHashChar;
                hashCharIdx = charIdx;
            } else if (alphaNumericAndMarksCharRe.test(char)) {
                state = State.NonHashtagWordChar;
            } else {
                // not a hashtag character ('#') or word char, stay in State.None
            }
        }

        // Handles the state when we've encountered a word character but are not
        // in a hashtag. This is used to distinguish between a standalone
        // hashtag such as '#Stuff' vs a hash char that is part of a word like
        // 'asdf#stuff' (the latter of which would not be a match)
        function stateNonHashtagWordChar(char: string) {
            if (alphaNumericAndMarksCharRe.test(char)) {
                // continue in NonHashtagWordChar state
            } else {
                state = State.None;
            }
        }

        // Handles the state when we've just encountered a '#' character
        function stateHashtagHashChar(char: string) {
            if (hashtagTextCharRe.test(char)) {
                // '#' char with valid hash text char following
                state = State.HashtagTextChar;
            } else if (alphaNumericAndMarksCharRe.test(char)) {
                state = State.NonHashtagWordChar;
            } else {
                state = State.None;
            }
        }

        // Handles the state when we're currently in the hash tag's text chars
        function stateHashtagTextChar(char: string) {
            if (hashtagTextCharRe.test(char)) {
                // Continue reading characters in the HashtagText state
            } else {
                captureMatchIfValid();
                hashCharIdx = -1;

                if (alphaNumericAndMarksCharRe.test(char)) {
                    state = State.NonHashtagWordChar;
                } else {
                    state = State.None;
                }
            }
        }

        /*
         * Captures the current hashtag as a HashtagMatch if it's valid.
         */
        function captureMatchIfValid() {
            if (hashCharIdx > -1 && charIdx - hashCharIdx <= 140) {
                // Max length of 140 for a hashtag ('#' char + 139 word chars)
                let matchedText = text.slice(hashCharIdx, charIdx);

                const match = new HashtagMatch({
                    tagBuilder,
                    matchedText: matchedText,
                    offset: hashCharIdx,
                    serviceName: serviceName,
                    hashtag: matchedText.slice(1),
                });
                matches.push(match);
            }
        }
    }
}

const enum State {
    None = 0,

    NonHashtagWordChar, // A word character that is outside of a hashtag

    HashtagHashChar, // When we've encountered the '#' char
    HashtagTextChar, // Inside a hashtag char
}

export interface HashtagMatcherConfig extends MatcherConfig {
    serviceName: HashtagService;
}

export type HashtagService = 'twitter' | 'facebook' | 'instagram' | 'tiktok';
export type HashtagServices = HashtagService; // backward compatibility with v3
export const hashtagServices: HashtagService[] = ['twitter', 'facebook', 'instagram', 'tiktok'];
