/**
 * @private
 * @class Autolinker.AnchorTagBuilder
 * @extends Object
 * 
 * Builds the anchor (&lt;a&gt;) tags for the Autolinker utility when a match is found.
 */
Autolinker.AnchorTagBuilder = Autolinker.Util.extend( Object, {
	
	/**
	 * @cfg {Boolean} newWindow
	 * 
	 * See {@link Autolinker#newWindow} for details.
	 */
	
	/**
	 * @cfg {Boolean} stripPrefix
	 * 
	 * See {@link Autolinker#stripPrefix} for details.
	 */
	
	/**
	 * @cfg {Number} truncate
	 * 
	 * See {@link Autolinker#truncate} for details.
	 */
	
	/**
	 * @cfg {String} className
	 * 
	 * See {@link Autolinker#className} for details.
	 */
	

	/**
	 * @private
	 * @property {RegExp} urlPrefixRegex
	 * 
	 * A regular expression used to remove the 'http://' or 'https://' and/or the 'www.' from URLs.
	 */
	urlPrefixRegex: /^(https?:\/\/)?(www\.)?/i,
	
	
	/**
	 * @constructor
	 * @param {Object} [cfg] The configuration options for the AnchorTagBuilder instance, specified in an Object (map).
	 */
	constructor : function( cfg ) {
		Autolinker.Util.assign( this, cfg );
	},
	
	
	/**
	 * Generates the actual anchor (&lt;a&gt;) tag to use in place of a source url/email/twitter link.
	 * 
	 * @param {"url"/"email"/"twitter"} matchType The type of match that an anchor tag is being generated for.
	 * @param {String} anchorHref The href for the anchor tag.
	 * @param {String} anchorText The anchor tag's text (i.e. what will be displayed).
	 * @return {String} The full HTML for the anchor tag.
	 */
	createAnchorTag : function( matchType, anchorHref, anchorText ) {
		var attributesStr = this.createAnchorAttrsStr( matchType, anchorHref );
		anchorText = this.processAnchorText( anchorText );
		
		return '<a ' + attributesStr + '>' + anchorText + '</a>';
	},
	
	
	/**
	 * Creates the string which will be the HTML attributes for the anchor (&lt;a&gt;) tag being generated.
	 * 
	 * @private
	 * @param {"url"/"email"/"twitter"} matchType The type of match that an anchor tag is being generated for.
	 * @param {String} href The href for the anchor tag.
	 * @return {String} The anchor tag's attribute. Ex: `href="http://google.com" class="myLink myLink-url" target="_blank"` 
	 */
	createAnchorAttrsStr : function( matchType, anchorHref ) {
		var attrs = [ 'href="' + anchorHref + '"' ];  // we'll always have the `href` attribute
		
		var cssClass = this.createCssClass( matchType );
		if( cssClass ) {
			attrs.push( 'class="' + cssClass + '"' );
		}
		if( this.newWindow ) {
			attrs.push( 'target="_blank"' );
		}
		
		return attrs.join( " " );
	},
	
	
	/**
	 * Creates the CSS class that will be used for a given anchor tag, based on the `matchType` and the {@link #className}
	 * config.
	 * 
	 * @private
	 * @param {"url"/"email"/"twitter"} matchType The type of match that an anchor tag is being generated for.
	 * @return {String} The CSS class string for the link. Example return: "myLink myLink-url". If no {@link #className}
	 *   was configured, returns an empty string.
	 */
	createCssClass : function( matchType ) {
		var className = this.className;
		
		if( !className ) 
			return "";
		else
			return className + " " + className + "-" + matchType;  // ex: "myLink myLink-url", "myLink myLink-email", or "myLink myLink-twitter"
	},
	
	
	/**
	 * Processes the `anchorText` by stripping the URL prefix (if {@link #stripPrefix} is `true`), removing
	 * any trailing slash, and truncating the text according to the {@link #truncate} config.
	 * 
	 * @private
	 * @param {String} anchorText The anchor tag's text (i.e. what will be displayed).
	 * @return {String} The processed `anchorText`.
	 */
	processAnchorText : function( anchorText ) {
		if( this.stripPrefix ) {
			anchorText = this.stripUrlPrefix( anchorText );
		}
		anchorText = this.removeTrailingSlash( anchorText );  // remove trailing slash, if there is one
		anchorText = this.doTruncate( anchorText );
		
		return anchorText;
	},
	
	
	/**
	 * Strips the URL prefix (such as "http://" or "https://") from the given text.
	 * 
	 * @private
	 * @param {String} text The text of the anchor that is being generated, for which to strip off the
	 *   url prefix (such as stripping off "http://")
	 * @return {String} The `anchorText`, with the prefix stripped.
	 */
	stripUrlPrefix : function( text ) {
		return text.replace( this.urlPrefixRegex, '' );
	},
	
	
	/**
	 * Removes any trailing slash from the given `anchorText`, in preparation for the text to be displayed.
	 * 
	 * @private
	 * @param {String} anchorText The text of the anchor that is being generated, for which to remove any trailing
	 *   slash ('/') that may exist.
	 * @return {String} The `anchorText`, with the trailing slash removed.
	 */
	removeTrailingSlash : function( anchorText ) {
		if( anchorText.charAt( anchorText.length - 1 ) === '/' ) {
			anchorText = anchorText.slice( 0, -1 );
		}
		return anchorText;
	},
	
	
	/**
	 * Performs the truncation of the `anchorText`, if the `anchorText` is longer than the {@link #truncate} option.
	 * Truncates the text to 2 characters fewer than the {@link #truncate} option, and adds ".." to the end.
	 * 
	 * @private
	 * @param {String} text The anchor tag's text (i.e. what will be displayed).
	 * @return {String} The truncated anchor text.
	 */
	doTruncate : function( anchorText ) {
		var truncateLen = this.truncate;
		
		// Truncate the anchor text if it is longer than the provided 'truncate' option
		if( truncateLen && anchorText.length > truncateLen ) {
			anchorText = anchorText.substring( 0, truncateLen - 2 ) + '..';
		}
		return anchorText;
	}
	
} );