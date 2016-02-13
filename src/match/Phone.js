/*global Autolinker */
/**
 * @class Autolinker.match.Phone
 * @extends Autolinker.match.Match
 *
 * Represents a Phone number match found in an input string which should be
 * Autolinked.
 *
 * See this class's superclass ({@link Autolinker.match.Match}) for more
 * details.
 */
Autolinker.match.Phone = Autolinker.Util.extend( Autolinker.match.Match, {

	/**
	 * @protected
	 * @property {String} number (required)
	 *
	 * The phone number that was matched, without any delimiter characters.
	 *
	 * Note: This is a string to allow for prefixed 0's.
	 */

	/**
	 * @protected
	 * @property  {Boolean} plusSign (required)
	 *
	 * `true` if the matched phone number started with a '+' sign. We'll include
	 * it in the `tel:` URL if so, as this is needed for international numbers.
	 *
	 * Ex: '+1 (123) 456 7879'
	 */


	/**
	 * @constructor
	 * @param {String} matchedText The original text that was matched.
	 * @param {Number} offset The offset of where the match was made in the
	 *   input string.
	 * @param {String} number The phone number that was matched, without any
	 *   delimiter characters. See {@link #number} for more details.
	 * @param {Boolean} plusSign `true` if the matched phone number started with
	 *   a '+' sign. See {@link #plusSign} for more details.
	 */
	constructor : function( matchedText, offset, number, plusSign ) {
		Autolinker.match.Match.prototype.constructor.call( this, matchedText, offset );

		// @if DEBUG
		if( !number ) throw new Error( '`number` arg required' );
		if( plusSign == null ) throw new Error( '`plusSign` arg required' );
		// @endif

		this.number = number;
		this.plusSign = plusSign;
	},


	/**
	 * Returns a string name for the type of match that this class represents.
	 *
	 * @return {String}
	 */
	getType : function() {
		return 'phone';
	},


	/**
	 * Returns the phone number that was matched as a string, without any
	 * delimiter characters.
	 *
	 * Note: This is a string to allow for prefixed 0's.
	 *
	 * @return {String}
	 */
	getNumber: function() {
		return this.number;
	},


	/**
	 * Returns the anchor href that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorHref : function() {
		return 'tel:' + ( this.plusSign ? '+' : '' ) + this.number;
	},


	/**
	 * Returns the anchor text that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorText : function() {
		return this.matchedText;
	}

} );
