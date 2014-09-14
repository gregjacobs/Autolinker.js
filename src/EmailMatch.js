/**
 * @private
 * @class Autolinker.EmailMatch
 * 
 * Represents a Email match found in an input string which should be Autolinked.
 */
Autolinker.EmailMatch = Autolinker.Util.extend( Autolinker.Match, {
	
	/**
	 * @cfg {String} emailAddress (required)
	 * 
	 * The email address that was matched.
	 */
	

	/**
	 * Returns a string name for the type of match that this class represents.
	 * 
	 * @return {String}
	 */
	getType : function() {
		return 'email';
	},
	
	
	/**
	 * Returns the email address that was matched.
	 * 
	 * @return {String}
	 */
	getEmailAddress : function() {
		return this.emailAddress;
	},
	

	/**
	 * Returns the anchor href that should be generated for the match.
	 * 
	 * @return {String}
	 */
	getAnchorHref : function() {
		return 'mailto:' + this.emailAddress;
	},
	
	
	/**
	 * Returns the anchor text that should be generated for the match.
	 * 
	 * @return {String}
	 */
	getAnchorText : function() {
		return this.emailAddress;
	}
	
} );