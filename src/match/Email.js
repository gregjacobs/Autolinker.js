/*global Autolinker */
/**
 * @class Autolinker.match.Email
 * @extends Autolinker.match.Match
 *
 * Represents a Email match found in an input string which should be Autolinked.
 *
 * See this class's superclass ({@link Autolinker.match.Match}) for more details.
 */
Autolinker.match.Email = Autolinker.Util.extend( Autolinker.match.Match, {

	/**
	 * @protected
	 * @property {String} email (required)
	 *
	 * The email address that was matched.
	 */


	/**
	 * @constructor
	 * @param {String} matchedText The original text that was matched.
	 * @param {Number} offset The offset of where the match was made in the
	 *   input string.
	 * @param {String} email The email address that was matched.
	 */
	constructor : function( matchedText, offset, email ) {
		Autolinker.match.Match.prototype.constructor.call( this, matchedText, offset );

		// @if DEBUG
		if( !email ) throw new Error( '`email` arg required' );
		// @endif

		this.email = email;
	},


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
	getEmail : function() {
		return this.email;
	},


	/**
	 * Returns the anchor href that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorHref : function() {
		return 'mailto:' + this.email;
	},


	/**
	 * Returns the anchor text that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorText : function() {
		return this.email;
	}

} );