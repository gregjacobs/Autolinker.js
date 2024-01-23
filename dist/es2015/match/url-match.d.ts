import { AbstractMatch, AbstractMatchConfig } from './abstract-match';
import type { StripPrefixConfigObj } from '../autolinker';
/**
 * @class Autolinker.match.Url
 * @extends Autolinker.match.AbstractMatch
 *
 * Represents a Url match found in an input string which should be Autolinked.
 *
 * See this class's superclass ({@link Autolinker.match.Match}) for more details.
 */
export declare class UrlMatch extends AbstractMatch {
    /**
     * @public
     * @property {'url'} type
     *
     * A string name for the type of match that this class represents. Can be
     * used in a TypeScript discriminating union to type-narrow from the
     * `Match` type.
     */
    readonly type: 'url';
    /**
     * @cfg {String} url (required)
     *
     * The url that was matched.
     */
    private url;
    /**
     * @cfg {"scheme"/"www"/"tld"} urlMatchType (required)
     *
     * The type of URL match that this class represents. This helps to determine
     * if the match was made in the original text with a prefixed scheme (ex:
     * 'http://www.google.com'), a prefixed 'www' (ex: 'www.google.com'), or
     * was matched by a known top-level domain (ex: 'google.com').
     */
    private readonly urlMatchType;
    /**
     * @cfg {Boolean} protocolRelativeMatch (required)
     *
     * `true` if the URL is a protocol-relative match. A protocol-relative match
     * is a URL that starts with '//', and will be either http:// or https://
     * based on the protocol that the site is loaded under.
     */
    private readonly protocolRelativeMatch;
    /**
     * @cfg {Object} stripPrefix (required)
     *
     * The Object form of {@link Autolinker#cfg-stripPrefix}.
     */
    private readonly stripPrefix;
    /**
     * @cfg {Boolean} stripTrailingSlash (required)
     * @inheritdoc Autolinker#cfg-stripTrailingSlash
     */
    private readonly stripTrailingSlash;
    /**
     * @cfg {Boolean} decodePercentEncoding (required)
     * @inheritdoc Autolinker#cfg-decodePercentEncoding
     */
    private readonly decodePercentEncoding;
    /**
     * @private
     * @property {Boolean} protocolPrepended
     *
     * Will be set to `true` if the 'http://' protocol has been prepended to the {@link #url} (because the
     * {@link #url} did not have a protocol)
     */
    private protocolPrepended;
    /**
     * @method constructor
     * @param {Object} cfg The configuration properties for the Match
     *   instance, specified in an Object (map).
     */
    constructor(cfg: UrlMatchConfig);
    /**
     * Returns a string name for the type of match that this class represents.
     * For the case of UrlMatch, returns 'url'.
     *
     * @return {String}
     */
    getType(): 'url';
    /**
     * Returns a string name for the type of URL match that this class
     * represents.
     *
     * This helps to determine if the match was made in the original text with a
     * prefixed scheme (ex: 'http://www.google.com'), a prefixed 'www' (ex:
     * 'www.google.com'), or was matched by a known top-level domain (ex:
     * 'google.com').
     *
     * @return {"scheme"/"www"/"tld"}
     */
    getUrlMatchType(): UrlMatchType;
    /**
     * Returns the url that was matched, assuming the protocol to be 'http://' if the original
     * match was missing a protocol.
     *
     * @return {String}
     */
    getUrl(): string;
    /**
     * Returns the anchor href that should be generated for the match.
     *
     * @return {String}
     */
    getAnchorHref(): string;
    /**
     * Returns the anchor text that should be generated for the match.
     *
     * @return {String}
     */
    getAnchorText(): string;
}
export interface UrlMatchConfig extends AbstractMatchConfig {
    url: string;
    urlMatchType: UrlMatchType;
    protocolRelativeMatch: boolean;
    stripPrefix: Required<StripPrefixConfigObj>;
    stripTrailingSlash: boolean;
    decodePercentEncoding: boolean;
}
export type UrlMatchType = 'scheme' | 'tld' | 'ipV4';
