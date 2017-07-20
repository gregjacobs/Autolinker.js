import { Match, MatchConfig } from "./Match";
import { StripPrefixConfig, UrlMatchTypeOptions } from "../Autolinker";

/**
 * @class Autolinker.match.Url
 * @extends Autolinker.match.Match
 *
 * Represents a Url match found in an input string which should be Autolinked.
 *
 * See this class's superclass ({@link Autolinker.match.Match}) for more details.
 */
export class UrlMatch extends Match {

	/**
	 * @cfg {String} url (required)
	 *
	 * The url that was matched.
	 */
	private url: string;

	/**
	 * @cfg {"scheme"/"www"/"tld"} urlMatchType (required)
	 *
	 * The type of URL match that this class represents. This helps to determine
	 * if the match was made in the original text with a prefixed scheme (ex:
	 * 'http://www.google.com'), a prefixed 'www' (ex: 'www.google.com'), or
	 * was matched by a known top-level domain (ex: 'google.com').
	 */
	private readonly urlMatchType: UrlMatchTypeOptions;

	/**
	 * @cfg {Boolean} protocolUrlMatch (required)
	 *
	 * `true` if the URL is a match which already has a protocol (i.e.
	 * 'http://'), `false` if the match was from a 'www' or known TLD match.
	 */
	private readonly protocolUrlMatch: boolean;

	/**
	 * @cfg {Boolean} protocolRelativeMatch (required)
	 *
	 * `true` if the URL is a protocol-relative match. A protocol-relative match
	 * is a URL that starts with '//', and will be either http:// or https://
	 * based on the protocol that the site is loaded under.
	 */
	private readonly protocolRelativeMatch: boolean;

	/**
	 * @cfg {Object} stripPrefix (required)
	 *
	 * The Object form of {@link Autolinker#cfg-stripPrefix}.
	 */
	private readonly stripPrefix: StripPrefixConfig;

	/**
	 * @cfg {Boolean} stripTrailingSlash (required)
	 * @inheritdoc Autolinker#cfg-stripTrailingSlash
	 */
	private readonly stripTrailingSlash: boolean;

	/**
	 * @private
	 * @property {RegExp} schemePrefixRegex
	 *
	 * A regular expression used to remove the 'http://' or 'https://' from
	 * URLs.
	 */
	schemePrefixRegex = /^(https?:\/\/)?/i;

	/**
	 * @private
	 * @property {RegExp} wwwPrefixRegex
	 *
	 * A regular expression used to remove the 'www.' from URLs.
	 */
	wwwPrefixRegex = /^(https?:\/\/)?(www\.)?/i;

	/**
	 * @private
	 * @property {RegExp} protocolRelativeRegex
	 *
	 * The regular expression used to remove the protocol-relative '//' from the {@link #url} string, for purposes
	 * of {@link #getAnchorText}. A protocol-relative URL is, for example, "//yahoo.com"
	 */
	protocolRelativeRegex = /^\/\//;

	/**
	 * @private
	 * @property {Boolean} protocolPrepended
	 *
	 * Will be set to `true` if the 'http://' protocol has been prepended to the {@link #url} (because the
	 * {@link #url} did not have a protocol)
	 */
	protocolPrepended = false;


	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the Match
	 *   instance, specified in an Object (map).
	 */
	constructor( cfg: UrlMatchConfig ) {
		super( cfg );

		this.urlMatchType = cfg.urlMatchType;
		this.url = cfg.url;
		this.protocolUrlMatch = cfg.protocolUrlMatch;
		this.protocolRelativeMatch = cfg.protocolRelativeMatch;
		this.stripPrefix = cfg.stripPrefix;
		this.stripTrailingSlash = cfg.stripTrailingSlash;
	}


	/**
	 * Returns a string name for the type of match that this class represents.
	 *
	 * @return {String}
	 */
	getType() {
		return 'url';
	}


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
	getUrlMatchType() {
		return this.urlMatchType;
	}


	/**
	 * Returns the url that was matched, assuming the protocol to be 'http://' if the original
	 * match was missing a protocol.
	 *
	 * @return {String}
	 */
	getUrl() {
		let url = this.url;

		// if the url string doesn't begin with a protocol, assume 'http://'
		if( !this.protocolRelativeMatch && !this.protocolUrlMatch && !this.protocolPrepended ) {
			url = this.url = 'http://' + url;

			this.protocolPrepended = true;
		}

		return url;
	}


	/**
	 * Returns the anchor href that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorHref() {
		let url = this.getUrl();

		return url.replace( /&amp;/g, '&' );  // any &amp;'s in the URL should be converted back to '&' if they were displayed as &amp; in the source html
	}


	/**
	 * Returns the anchor text that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorText() {
		let anchorText = this.getMatchedText();

		if( this.protocolRelativeMatch ) {
			// Strip off any protocol-relative '//' from the anchor text
			anchorText = this.stripProtocolRelativePrefix( anchorText );
		}
		if( this.stripPrefix.scheme ) {
			anchorText = this.stripSchemePrefix( anchorText );
		}
		if( this.stripPrefix.www ) {
			anchorText = this.stripWwwPrefix( anchorText );
		}
		if( this.stripTrailingSlash ) {
			anchorText = this.removeTrailingSlash( anchorText );  // remove trailing slash, if there is one
		}

		return anchorText;
	}


	// ---------------------------------------

	// Utility Functionality

	/**
	 * Strips the scheme prefix (such as "http://" or "https://") from the given
	 * `url`.
	 *
	 * @private
	 * @param {String} url The text of the anchor that is being generated, for
	 *   which to strip off the url scheme.
	 * @return {String} The `url`, with the scheme stripped.
	 */
	stripSchemePrefix( url: string ) {
		return url.replace( this.schemePrefixRegex, '' );
	}


	/**
	 * Strips the 'www' prefix from the given `url`.
	 *
	 * @private
	 * @param {String} url The text of the anchor that is being generated, for
	 *   which to strip off the 'www' if it exists.
	 * @return {String} The `url`, with the 'www' stripped.
	 */
	stripWwwPrefix( url: string ) {
		return url.replace( this.wwwPrefixRegex, '$1' );  // leave any scheme ($1), it one exists
	}


	/**
	 * Strips any protocol-relative '//' from the anchor text.
	 *
	 * @private
	 * @param {String} text The text of the anchor that is being generated, for which to strip off the
	 *   protocol-relative prefix (such as stripping off "//")
	 * @return {String} The `anchorText`, with the protocol-relative prefix stripped.
	 */
	stripProtocolRelativePrefix( text: string ) {
		return text.replace( this.protocolRelativeRegex, '' );
	}


	/**
	 * Removes any trailing slash from the given `anchorText`, in preparation for the text to be displayed.
	 *
	 * @private
	 * @param {String} anchorText The text of the anchor that is being generated, for which to remove any trailing
	 *   slash ('/') that may exist.
	 * @return {String} The `anchorText`, with the trailing slash removed.
	 */
	removeTrailingSlash( anchorText: string ) {
		if( anchorText.charAt( anchorText.length - 1 ) === '/' ) {
			anchorText = anchorText.slice( 0, -1 );
		}
		return anchorText;
	}

}


export interface UrlMatchConfig extends MatchConfig {
	url: string;
	urlMatchType: UrlMatchTypeOptions;
	protocolUrlMatch: boolean;
	protocolRelativeMatch: boolean;
	stripPrefix: StripPrefixConfig;
	stripTrailingSlash: boolean;
}