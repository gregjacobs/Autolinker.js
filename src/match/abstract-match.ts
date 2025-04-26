import { AnchorTagBuilder } from '../anchor-tag-builder';
import { HtmlTag } from '../html-tag';
import { MatchType } from './match';

/**
 * @abstract
 * @class Autolinker.match.AbstractMatch
 *
 * Represents a match found in an input string which should be Autolinked. A Match object is what is provided in a
 * {@link Autolinker#replaceFn replaceFn}, and may be used to query for details about the match.
 *
 * For example:
 *
 *     var input = "...";  // string with URLs, Email Addresses, and Mentions (Twitter, Instagram, Soundcloud)
 *
 *     var linkedText = Autolinker.link( input, {
 *         replaceFn : function( match ) {
 *             console.log( "href = ", match.getAnchorHref() );
 *             console.log( "text = ", match.getAnchorText() );
 *
 *             switch( match.getType() ) {
 *                 case 'url' :
 *                     console.log( "url: ", match.getUrl() );
 *
 *                 case 'email' :
 *                     console.log( "email: ", match.getEmail() );
 *
 *                 case 'mention' :
 *                     console.log( "mention: ", match.getMention() );
 *             }
 *         }
 *     } );
 *
 * See the {@link Autolinker} class for more details on using the {@link Autolinker#replaceFn replaceFn}.
 */
export abstract class AbstractMatch {
    /**
     * @public
     * @property {'url'/'email'/'hashtag'/'mention'/'phone'} type
     *
     * A string name for the type of match that this class represents. Can be
     * used in a TypeScript discriminating union to type-narrow from the
     * `Match` type.
     */
    public abstract readonly type: MatchType;

    /**
     * @cfg {Autolinker.AnchorTagBuilder} tagBuilder (required)
     *
     * Reference to the AnchorTagBuilder instance to use to generate an anchor
     * tag for the Match.
     */
    // @ts-expect-error Property used just to get the above doc comment into the ES5 output and documentation generator
    private _ = null;

    // Actual property for the above jsdoc comment
    private readonly tagBuilder: AnchorTagBuilder;

    /**
     * @cfg {String} matchedText (required)
     *
     * The original text that was matched by the {@link Autolinker.matcher.Matcher}.
     */
    protected readonly matchedText: string = ''; // default value just to get the above doc comment in the ES5 output and documentation generator

    /**
     * @cfg {Number} offset (required)
     *
     * The offset of where the match was made in the input string.
     */
    private offset: number = 0; // default value just to get the above doc comment in the ES5 output and documentation generator

    /**
     * @member Autolinker.match.Match
     * @method constructor
     * @param {Object} cfg The configuration properties for the Match
     *   instance, specified in an Object (map).
     */
    constructor(cfg: AbstractMatchConfig) {
        this.tagBuilder = cfg.tagBuilder;
        this.matchedText = cfg.matchedText;
        this.offset = cfg.offset;
    }

    /**
     * Returns a string name for the type of match that this class represents.
     *
     * @deprecated Use {@link #type} instead which can assist in type-narrowing
     *   for TypeScript.
     * @abstract
     * @return {String}
     */
    public abstract getType(): MatchType;

    /**
     * Returns the original text that was matched.
     *
     * @return {String}
     */
    public getMatchedText(): string {
        return this.matchedText;
    }

    /**
     * Sets the {@link #offset} of where the match was made in the input string.
     *
     * A {@link Autolinker.matcher.Matcher} will be fed only HTML text nodes,
     * and will therefore set an original offset that is relative to the HTML
     * text node itself. However, we want this offset to be relative to the full
     * HTML input string, and thus if using {@link Autolinker#parse} (rather
     * than calling a {@link Autolinker.matcher.Matcher} directly), then this
     * offset is corrected after the Matcher itself has done its job.
     *
     * @private
     * @param {Number} offset
     */
    setOffset(offset: number): void {
        this.offset = offset;
    }

    /**
     * Returns the offset of where the match was made in the input string. This
     * is the 0-based index of the match.
     *
     * @return {Number}
     */
    public getOffset(): number {
        return this.offset;
    }

    /**
     * Returns the anchor href that should be generated for the match.
     *
     * @abstract
     * @return {String}
     */
    public abstract getAnchorHref(): string;

    /**
     * Returns the anchor text that should be generated for the match.
     *
     * @abstract
     * @return {String}
     */
    public abstract getAnchorText(): string;

    /**
     * Returns the CSS class suffix(es) for this match.
     *
     * A CSS class suffix is appended to the {@link Autolinker#className} in
     * the {@link Autolinker.AnchorTagBuilder} when a match is translated into
     * an anchor tag.
     *
     * For example, if {@link Autolinker#className} was configured as 'myLink',
     * and this method returns `[ 'url' ]`, the final class name of the element
     * will become: 'myLink myLink-url'.
     *
     * The match may provide multiple CSS class suffixes to be appended to the
     * {@link Autolinker#className} in order to facilitate better styling
     * options for different match criteria. See {@link Autolinker.match.Mention}
     * for an example.
     *
     * By default, this method returns a single array with the match's
     * {@link #getType type} name, but may be overridden by subclasses.
     *
     * @return {String[]}
     */
    public getCssClassSuffixes(): string[] {
        return [this.type];
    }

    /**
     * Builds and returns an {@link Autolinker.HtmlTag} instance based on the
     * Match.
     *
     * This can be used to easily generate anchor tags from matches, and either
     * return their HTML string, or modify them before doing so.
     *
     * Example Usage:
     *
     *     var tag = match.buildTag();
     *     tag.addClass( 'cordova-link' );
     *     tag.setAttr( 'target', '_system' );
     *
     *     tag.toAnchorString();  // <a href="http://google.com" class="cordova-link" target="_system">Google</a>
     *
     * Example Usage in {@link Autolinker#replaceFn}:
     *
     *     var html = Autolinker.link( "Test google.com", {
     *         replaceFn : function( match ) {
     *             var tag = match.buildTag();  // returns an {@link Autolinker.HtmlTag} instance
     *             tag.setAttr( 'rel', 'nofollow' );
     *
     *             return tag;
     *         }
     *     } );
     *
     *     // generated html:
     *     //   Test <a href="http://google.com" target="_blank" rel="nofollow">google.com</a>
     */
    public buildTag(): HtmlTag {
        return this.tagBuilder.build(this);
    }
}

export interface AbstractMatchConfig {
    tagBuilder: AnchorTagBuilder;
    matchedText: string;
    offset: number;
}
