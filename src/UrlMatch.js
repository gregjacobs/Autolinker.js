/**
 * @private
 * @class Autolinker.TwitterMatch
 * 
 * Represents a Url match found in an input string which should be Autolinked.
 */
Autolinker.UrlMatch = Autolinker.Util.extend( Autolinker.Match, {
	
	/**
	 * @cfg {String} url (required)
	 * 
	 * The url that was matched.
	 */
	
	/**
	 * @cfg {Boolean} protocolRelativeMatch (required)
	 * 
	 * `true` if the URL is a protocol-relative match. A protocol-relative match is a URL that starts with '//',
	 * and will be either http:// or https:// based on the protocol that the site is loaded under.
	 */
	
	
	/**
	 * @private
	 * @property {RegExp} protocolRelativeRegex
	 * 
	 * The regular expression used to remove the protocol-relative '//' from the {@link #url} string, for purposes
	 * of {@link #getAnchorText}. A protocol-relative URL is, for example, "//yahoo.com"
	 */
	protocolRelativeRegex : /^\/\//,
	
	/**
	 * @protected
	 * @property {RegExp} checkForProtocolRegex
	 * 
	 * A regular expression used to check if the {@link #url} is missing a protocol (in which case, 'http://'
	 * will be added).
	 */
	checkForProtocolRegex: /^[A-Za-z]{3,9}:/,
	

	/**
	 * Returns a string name for the type of match that this class represents.
	 * 
	 * @return {String}
	 */
	getType : function() {
		return 'url';
	},
	
	
	/**
	 * Returns the url that was matched, assuming the protocol to be 'http://' if the match
	 * was missing a protocol.
	 * 
	 * @return {String}
	 */
	getUrl : function() {
		var url = this.url;
		
		// if the url string doesn't begin with a protocol, assume http://
		if( !this.protocolRelativeMatch && !this.checkForProtocolRegex.test( url ) ) {
			url = this.url = 'http://' + url;
		}
		
		return url;
	},
	

	/**
	 * Returns the anchor href that should be generated for the match.
	 * 
	 * @return {String}
	 */
	getAnchorHref : function() {
		var url = this.getUrl();
		return url.replace('&amp;', '&');
	},
	
	
	/**
	 * Returns the anchor text that should be generated for the match.
	 * 
	 * @return {String}
	 */
	getAnchorText : function() {
		var url = this.getUrl();
		
		if( this.protocolRelativeMatch ) {
			// Strip off any protocol-relative '//' from the anchor text
			url = url.replace( this.protocolRelativeRegex, '' );
		}
		
		return url;
	}
	
} );