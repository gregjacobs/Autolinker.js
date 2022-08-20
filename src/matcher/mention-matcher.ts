import { Matcher, MatcherConfig } from './matcher';
import { alphaNumericAndMarksCharsStr } from '../regex-lib';
import { MentionMatch } from '../match/mention-match';
import { Match } from '../match/match';

// RegExp objects which are shared by all instances of MentionMatcher. These are
// here to avoid re-instantiating the RegExp objects if `Autolinker.link()` is
// called multiple times, thus instantiating MentionMatcher and its RegExp
// objects each time (which is very expensive - see https://github.com/gregjacobs/Autolinker.js/issues/314).
// See descriptions of the properties where they are used for details about them

const twitterRegex = new RegExp(
    `@[_${alphaNumericAndMarksCharsStr}]{1,50}(?![_${alphaNumericAndMarksCharsStr}])`,
    'g'
); // lookahead used to make sure we don't match something above 50 characters

const instagramRegex = new RegExp(
    `@[_.${alphaNumericAndMarksCharsStr}]{1,30}(?![_${alphaNumericAndMarksCharsStr}])`,
    'g'
); // lookahead used to make sure we don't match something above 30 characters

const soundcloudRegex = new RegExp(
    `@[-_.${alphaNumericAndMarksCharsStr}]{1,50}(?![-_${alphaNumericAndMarksCharsStr}])`,
    'g'
); // lookahead used to make sure we don't match something above 50 characters

// TikTok usernames are 1-24 characters containing letters, numbers, underscores
// and periods, but cannot end in a period: https://support.tiktok.com/en/getting-started/setting-up-your-profile/changing-your-username
const tiktokRegex = new RegExp(
    `@[_.${alphaNumericAndMarksCharsStr}]{1,23}[_${alphaNumericAndMarksCharsStr}](?![_${alphaNumericAndMarksCharsStr}])`,
    'g'
); // lookahead used to make sure we don't match something above 24 characters

const nonWordCharRegex = new RegExp('[^' + alphaNumericAndMarksCharsStr + ']');

/**
 * @class Autolinker.matcher.Mention
 * @extends Autolinker.matcher.Matcher
 *
 * Matcher to find/replace username matches in an input string.
 */
export class MentionMatcher extends Matcher {
    /**
     * @cfg {'twitter'/'instagram'/'soundcloud'} protected
     *
     * The name of service to link @mentions to.
     *
     * Valid values are:
     *
     * - 'twitter'
     * - 'instagram'
     * - 'soundcloud'
     * - 'tiktok'
     */
    protected service: MentionService = 'twitter'; // default value just to get the above doc comment in the ES5 output and documentation generator

    /**
     * Hash of regular expression to match username handles. Example match:
     *
     *     @asdf
     *
     * @private
     * @property {Object} matcherRegexes
     */
    protected readonly matcherRegexes: { [key: string]: RegExp } = {
        twitter: twitterRegex,
        instagram: instagramRegex,
        soundcloud: soundcloudRegex,
        tiktok: tiktokRegex,
    };

    /**
     * The regular expression to use to check the character before a username match to
     * make sure we didn't accidentally match an email address.
     *
     * For example, the string "asdf@asdf.com" should not match "@asdf" as a username.
     *
     * @private
     * @property {RegExp} nonWordCharRegex
     */
    protected readonly nonWordCharRegex = nonWordCharRegex;

    /**
     * @method constructor
     * @param {Object} cfg The configuration properties for the Match instance,
     *   specified in an Object (map).
     */
    constructor(cfg: MentionMatcherConfig = {}) {
        super(cfg);

        // Validate the value of the `service` cfg
        const service = cfg.service || this.service;
        if (mentionServices.indexOf(service) === -1) {
            throw new Error(`MentionMatcher: invalid \`service\` cfg '${service}' - see docs`);
        }
        this.service = service;
    }

    /**
     * @inheritdoc
     */
    parseMatches(text: string) {
        let serviceName = this.service,
            matcherRegex = this.matcherRegexes[this.service],
            nonWordCharRegex = this.nonWordCharRegex,
            tagBuilder = this.tagBuilder,
            matches: Match[] = [],
            match: RegExpExecArray | null;

        if (!matcherRegex) {
            return matches;
        }

        while ((match = matcherRegex.exec(text)) !== null) {
            let offset = match.index,
                prevChar = text.charAt(offset - 1);

            // If we found the match at the beginning of the string, or we found the match
            // and there is a whitespace char in front of it (meaning it is not an email
            // address), then it is a username match.
            if (offset === 0 || nonWordCharRegex.test(prevChar)) {
                let matchedText = match[0].replace(/\.+$/g, ''), // strip off trailing .
                    mention = matchedText.slice(1); // strip off the '@' character at the beginning

                matches.push(
                    new MentionMatch({
                        tagBuilder: tagBuilder!,
                        matchedText: matchedText,
                        offset: offset,
                        service: serviceName,
                        mention: mention,
                    })
                );
            }
        }

        return matches;
    }
}

export interface MentionMatcherConfig extends MatcherConfig {
    service?: MentionService;
}

export type MentionService = 'twitter' | 'instagram' | 'soundcloud' | 'tiktok';
export type MentionServices = MentionService; // backward compatibility with v3
export const mentionServices: MentionService[] = ['twitter', 'instagram', 'soundcloud', 'tiktok'];
