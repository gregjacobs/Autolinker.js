import { Match } from '../match/match';
import { HashtagService } from './hashtag-utils';
import { MentionService } from './mention-utils';
import { AnchorTagBuilder } from '../anchor-tag-builder';
import type { StripPrefixConfigObj } from '../autolinker';
/**
 * Parses URL, email, twitter, mention, and hashtag matches from the given
 * `text`.
 */
export declare function parseMatches(text: string, args: ParseMatchesArgs): Match[];
export interface ParseMatchesArgs {
    tagBuilder: AnchorTagBuilder;
    stripPrefix: Required<StripPrefixConfigObj>;
    stripTrailingSlash: boolean;
    decodePercentEncoding: boolean;
    hashtagServiceName: HashtagService;
    mentionServiceName: MentionService;
}
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
export declare function excludeUnbalancedTrailingBracesAndPunctuation(matchedText: string): string;
