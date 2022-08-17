import type { AnchorTagBuilder } from '../anchor-tag-builder';
import type { Match } from '../match/match';

/**
 * @abstract
 * @class Autolinker.matcher.Matcher
 *
 * An abstract class and interface for individual matchers to find matches in
 * an input string with linkified versions of them.
 *
 * Note that Matchers do not take HTML into account - they must be fed the text
 * nodes of any HTML string, which is handled by {@link Autolinker#parse}.
 */
export abstract class Matcher {
    /**
     * @cfg {Autolinker.AnchorTagBuilder} tagBuilder (required)
     *
     * Reference to the AnchorTagBuilder instance to use to generate HTML tags
     * for {@link Autolinker.match.Match Matches}.
     */
    // @ts-ignore
    private __jsduckDummyDocProp = null; // property used just to get the above doc comment into the ES5 output and documentation generator

    // Actual property for the above jsdoc comment
    protected tagBuilder?: AnchorTagBuilder;

    /**
     * @method constructor
     * @param {Object} cfg The configuration properties for the Matcher
     *   instance, specified in an Object.
     */
    constructor(_cfg: MatcherConfig = {}) {}

    /**
     * Because we allow custom Matcher instances to be configured in the
     * Autolinker instance, we don't want to have users need to create their own
     * TagBuilder instance to provide it as part of the Matcher constructor.
     * Hence, we allow the Autolinker instance to assign the TagBuilder instance
     * after-the-fact.
     */
    public setTagBuilder(tagBuilder: AnchorTagBuilder) {
        this.tagBuilder = tagBuilder;
    }

    /**
     * Parses the input `text` and returns the array of {@link Autolinker.match.Match Matches}
     * for the matcher.
     *
     * @abstract
     * @param {String} text The text to scan and replace matches in.
     * @return {Autolinker.match.Match[]}
     */
    abstract parseMatches(text: string): Match[];
}

export interface MatcherConfig {}
