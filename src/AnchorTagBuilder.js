/**
 * @private
 * @class Autolinker.AnchorTagBuilder
 * @extends Object
 * 
 * Builds the anchor (&lt;a&gt;) tags for the Autolinker utility when a match is found.
 * 
 * @constructor
 * @param {Object} [config] The configuration options for the AnchorTagBuilder instance, specified in an Object (map).
 */
Autolinker.AnchorTagBuilder = function( cfg ) {
	// Assign the properties of `cfg` onto the Autolinker instance
	for( var prop in cfg )
		if( cfg.hasOwnProperty( prop ) ) this[ prop ] = cfg[ prop ];
};


Autolinker.AnchorTagBuilder.prototype = {
	constructor : Autolinker.AnchorTagBuilder,
	
	
	/**
	 * @cfg {Boolean} newWindow
	 * 
	 * `true` if the links should open in a new window, `false` otherwise.
	 */
	
	/**
	 * @cfg {Boolean} stripPrefix
	 * 
	 * `true` if 'http://' or 'https://' and/or the 'www.' should be stripped from the beginning of links, `false` otherwise.
	 */
	
	/**
	 * @cfg {Number} truncate
	 * 
	 * A number for how many characters long URLs/emails/twitter handles should be truncated to inside the text of 
	 * a link. If the URL/email/twitter is over this number of characters, it will be truncated to this length by 
	 * adding a two period ellipsis ('..') into the middle of the string.
	 * 
	 * For example: A url like 'http://www.yahoo.com/some/long/path/to/a/file' truncated to 25 characters might look
	 * something like this: 'http://www...th/to/a/file'
	 */
	
	/**
	 * @cfg {String} className
	 * 
	 * A CSS class name to add to the generated links. This class will be added to all links, as well as this class
	 * plus url/email/twitter suffixes for styling url/email/twitter links differently.
	 * 
	 * For example, if this config is provided as "myLink", then:
	 * 
	 * 1) URL links will have the CSS classes: "myLink myLink-url"
	 * 2) Email links will have the CSS classes: "myLink myLink-email", and
	 * 3) Twitter links will have the CSS classes: "myLink myLink-twitter"
	 */
	

	/**
	 * @private
	 * @property {RegExp} urlPrefixRegex
	 * 
	 * A regular expression used to remove the 'http://' or 'https://' and/or the 'www.' from URLs.
	 */
	urlPrefixRegex: /^(https?:\/\/)?(www\.)?/i,
	
	
	/**
	 * Generates the actual anchor (&lt;a&gt;) tag to use in place of a source url/email/twitter link.
	 * 
	 * @param {"url"/"email"/"twitter"} linkType The type of link that an anchor tag is being generated for.
	 * @param {String} anchorHref The href for the anchor tag.
	 * @param {String} anchorText The anchor tag's text (i.e. what will be displayed).
	 * @return {String} The full HTML for the anchor tag.
	 */
	createAnchorTag : function( linkType, anchorHref, anchorText ) {
		var attributesStr = this.createAnchorAttrsStr( linkType, anchorHref );
		anchorText = this.processAnchorText( anchorText );
		
		return '<a ' + attributesStr + '>' + anchorText + '</a>';
	},
	
	
	/**
	 * Creates the string which will be the HTML attributes for the anchor (&lt;a&gt;) tag being generated.
	 * 
	 * @private
	 * @param {"url"/"email"/"twitter"} linkType The type of link that an anchor tag is being generated for.
	 * @param {String} href The href for the anchor tag.
	 * @return {String} The anchor tag's attribute. Ex: `href="http://google.com" class="myLink myLink-url" target="_blank"` 
	 */
	createAnchorAttrsStr : function( linkType, anchorHref ) {
		var attrs = [ 'href="' + anchorHref + '"' ];  // we'll always have the `href` attribute
		
		var cssClass = this.createCssClass( linkType );
		if( cssClass ) {
			attrs.push( 'class="' + cssClass + '"' );
		}
		if( this.newWindow ) {
			attrs.push( 'target="_blank"' );
		}
		
		return attrs.join( " " );
	},
	
	
	/**
	 * Creates the CSS class that will be used for a given anchor tag, based on the `linkType` and the {@link #className}
	 * config.
	 * 
	 * @private
	 * @param {"url"/"email"/"twitter"} linkType The type of link that an anchor tag is being generated for.
	 * @return {String} The CSS class string for the link. Example return: "myLink myLink-url". If no {@link #className}
	 *   was configured, returns an empty string.
	 */
	createCssClass : function( linkType ) {
		var className = this.className;
		
		if( !className ) 
			return "";
		else
			return className + " " + className + "-" + linkType;  // ex: "myLink myLink-url", "myLink myLink-email", or "myLink myLink-twitter"
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
	
};