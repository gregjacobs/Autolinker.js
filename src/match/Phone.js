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
	 * @cfg {String} number (required)
	 *
	 * The phone number that was matched, without any delimiter characters.
	 *
	 * Note: This is a string to allow for prefixed 0's.
	 */

	/**
	 * @cfg {Boolean} plusSign (required)
	 *
	 * `true` if the matched phone number started with a '+' sign. We'll include
	 * it in the `tel:` URL if so, as this is needed for international numbers.
	 *
	 * Ex: '+1 (123) 456 7879'
	 */


	// @if DEBUG
	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the Match instance,
	 *   specified in an Object (map).
	 */
	constructor : function() {
		Autolinker.match.Match.prototype.constructor.apply( this, arguments );

		if( !this.number ) throw new Error( '`number` cfg required' );
		if( this.plusSign == null ) throw new Error( '`plusSign` cfg required' );
	},
	// @endif


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
