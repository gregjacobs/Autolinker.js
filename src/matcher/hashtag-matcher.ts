import { Matcher, MatcherConfig } from './matcher';
import { alphaNumericAndMarksCharsStr, whitespaceRe } from '../regex-lib';
import { HashtagMatch } from '../match/hashtag-match';
import { Match } from '../match/match';

// RegExp objects which are shared by all instances of HashtagMatcher. These are
// here to avoid re-instantiating the RegExp objects if `Autolinker.link()` is
// called multiple times, thus instantiating HashtagMatcher and its RegExp
// objects each time (which is very expensive - see https://github.com/gregjacobs/Autolinker.js/issues/314).
// See descriptions of the properties where they are used for details about them
const matcherRegex = new RegExp(
    `#[_${alphaNumericAndMarksCharsStr}]{1,139}(?![_${alphaNumericAndMarksCharsStr}])`,
    'g'
); // lookahead used to make sure we don't match something above 139 characters

/*
 * The regular expression to use to check the character before a username match to
 * make sure we didn't accidentally match an email address.
 *
 * For example, the string "asdf@asdf.com" should not match "@asdf" as a username.
 */
const nonWordCharRegex = new RegExp('[^' + alphaNumericAndMarksCharsStr + ']');

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
    protected readonly service: HashtagService = 'twitter'; // default value just to get the above doc comment in the ES5 output and documentation generator

    /**
     * The regular expression to match Hashtags. Example match:
     *
     *     #asdf
     *
     * @protected
     * @property {RegExp} matcherRegex
     */
    protected matcherRegex = matcherRegex;

    /**
     * @method constructor
     * @param {Object} cfg The configuration properties for the Match instance,
     *   specified in an Object (map).
     */
    constructor(cfg: HashtagMatcherConfig = {}) {
        super(cfg);

        // Validate the value of the `service` cfg
        const service = cfg.service || this.service;
        if (hashtagServices.indexOf(service) === -1) {
            throw new Error(`HashtagMatcher: invalid \`service\` cfg '${service}' - see docs`);
        }
        this.service = service;
    }

    /**
     * @inheritdoc
     */
    parseMatches(text: string) {
        let matcherRegex = this.matcherRegex,
            serviceName = this.service,
            tagBuilder = this.tagBuilder,
            matches: Match[] = [],
            match: RegExpExecArray | null;

        while ((match = matcherRegex.exec(text)) !== null) {
            let offset = match.index,
                prevChar = text.charAt(offset - 1);

            // If we found the match at the beginning of the string, or we found the match
            // and there is a whitespace char in front of it (meaning it is not a '#' char
            // in the middle of a word), then it is a hashtag match.
            if (offset === 0 || nonWordCharRegex.test(prevChar)) {
                let matchedText = match[0],
                    hashtag = match[0].slice(1); // strip off the '#' character at the beginning

                matches.push(
                    new HashtagMatch({
                        tagBuilder: tagBuilder!,
                        matchedText: matchedText,
                        offset: offset,
                        serviceName: serviceName,
                        hashtag: hashtag,
                    })
                );
            }
        }

        return matches;
    }
}

export interface HashtagMatcherConfig extends MatcherConfig {
    service?: HashtagService;
}

export type HashtagService = 'twitter' | 'facebook' | 'instagram' | 'tiktok';
export type HashtagServices = HashtagService; // backward compatibility with v3
export const hashtagServices: HashtagService[] = ['twitter', 'facebook', 'instagram', 'tiktok'];
