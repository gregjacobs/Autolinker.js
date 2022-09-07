import { HtmlTag } from './html-tag';
import { TruncateConfigObj } from './autolinker';
import { truncateSmart } from './truncate/truncate-smart';
import { truncateMiddle } from './truncate/truncate-middle';
import { truncateEnd } from './truncate/truncate-end';
import { AbstractMatch } from './match/abstract-match';

/**
 * @protected
 * @class Autolinker.AnchorTagBuilder
 * @extends Object
 *
 * Builds anchor (&lt;a&gt;) tags for the Autolinker utility when a match is
 * found.
 *
 * Normally this class is instantiated, configured, and used internally by an
 * {@link Autolinker} instance, but may actually be used indirectly in a
 * {@link Autolinker#replaceFn replaceFn} to create {@link Autolinker.HtmlTag HtmlTag}
 * instances which may be modified before returning from the
 * {@link Autolinker#replaceFn replaceFn}. For example:
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
export class AnchorTagBuilder {
    /**
     * @cfg {Boolean} newWindow
     * @inheritdoc Autolinker#newWindow
     */
    private readonly newWindow: boolean = false; // default value just to get the above doc comment in the ES5 output and documentation generator

    /**
     * @cfg {Object} truncate
     * @inheritdoc Autolinker#truncate
     */
    private readonly truncate: TruncateConfigObj = {}; // default value just to get the above doc comment in the ES5 output and documentation generator

    /**
     * @cfg {String} className
     * @inheritdoc Autolinker#className
     */
    private readonly className: string = ''; // default value just to get the above doc comment in the ES5 output and documentation generator

    /**
     * @method constructor
     * @param {Object} [cfg] The configuration options for the AnchorTagBuilder instance, specified in an Object (map).
     */
    constructor(cfg: AnchorTagBuilderCfg = {}) {
        this.newWindow = cfg.newWindow || false;
        this.truncate = cfg.truncate || {};
        this.className = cfg.className || '';
    }

    /**
     * Generates the actual anchor (&lt;a&gt;) tag to use in place of the
     * matched text, via its `match` object.
     *
     * @param match The Match instance to generate an anchor tag from.
     * @return The HtmlTag instance for the anchor tag.
     */
    public build(match: AbstractMatch) {
        return new HtmlTag({
            tagName: 'a',
            attrs: this.createAttrs(match),
            innerHtml: this.processAnchorText(match.getAnchorText()),
        });
    }

    /**
     * Creates the Object (map) of the HTML attributes for the anchor (&lt;a&gt;)
     *   tag being generated.
     *
     * @protected
     * @param match The Match instance to generate an anchor tag from.
     * @return A key/value Object (map) of the anchor tag's attributes.
     */
    protected createAttrs(match: AbstractMatch) {
        let attrs: { [attrName: string]: string } = {
            href: match.getAnchorHref(), // we'll always have the `href` attribute
        };

        let cssClass = this.createCssClass(match);
        if (cssClass) {
            attrs['class'] = cssClass;
        }
        if (this.newWindow) {
            attrs['target'] = '_blank';
            attrs['rel'] = 'noopener noreferrer'; // Issue #149. See https://mathiasbynens.github.io/rel-noopener/
        }

        if (this.truncate) {
            if (this.truncate.length && this.truncate.length < match.getAnchorText().length) {
                attrs['title'] = match.getAnchorHref();
            }
        }

        return attrs;
    }

    /**
     * Creates the CSS class that will be used for a given anchor tag, based on
     * the `matchType` and the {@link #className} config.
     *
     * Example returns:
     *
     * - ""                                      // no {@link #className}
     * - "myLink myLink-url"                     // url match
     * - "myLink myLink-email"                   // email match
     * - "myLink myLink-phone"                   // phone match
     * - "myLink myLink-hashtag"                 // hashtag match
     * - "myLink myLink-mention myLink-twitter"  // mention match with Twitter service
     *
     * @protected
     * @param match The Match instance to generate an
     *   anchor tag from.
     * @return The CSS class string for the link. Example return:
     *   "myLink myLink-url". If no {@link #className} was configured, returns
     *   an empty string.
     */
    protected createCssClass(match: AbstractMatch): string {
        let className = this.className;

        if (!className) {
            return '';
        } else {
            let returnClasses = [className],
                cssClassSuffixes = match.getCssClassSuffixes();

            for (let i = 0, len = cssClassSuffixes.length; i < len; i++) {
                returnClasses.push(className + '-' + cssClassSuffixes[i]);
            }
            return returnClasses.join(' ');
        }
    }

    /**
     * Processes the `anchorText` by truncating the text according to the
     * {@link #truncate} config.
     *
     * @private
     * @param anchorText The anchor tag's text (i.e. what will be
     *   displayed).
     * @return The processed `anchorText`.
     */
    private processAnchorText(anchorText: string): string {
        anchorText = this.doTruncate(anchorText);

        return anchorText;
    }

    /**
     * Performs the truncation of the `anchorText` based on the {@link #truncate}
     * option. If the `anchorText` is longer than the length specified by the
     * {@link #truncate} option, the truncation is performed based on the
     * `location` property. See {@link #truncate} for details.
     *
     * @private
     * @param anchorText The anchor tag's text (i.e. what will be
     *   displayed).
     * @return The truncated anchor text.
     */
    private doTruncate(anchorText: string): string {
        let truncate = this.truncate;
        if (!truncate || !truncate.length) return anchorText;

        let truncateLength = truncate.length,
            truncateLocation = truncate.location;

        if (truncateLocation === 'smart') {
            return truncateSmart(anchorText, truncateLength);
        } else if (truncateLocation === 'middle') {
            return truncateMiddle(anchorText, truncateLength);
        } else {
            return truncateEnd(anchorText, truncateLength);
        }
    }
}

export interface AnchorTagBuilderCfg {
    newWindow?: boolean;
    truncate?: TruncateConfigObj;
    className?: string;
}
