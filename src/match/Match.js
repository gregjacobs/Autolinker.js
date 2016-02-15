/*global Autolinker */
/**
 * @abstract
 * @class Autolinker.match.Match
 *
 * Represents a match found in an input string which should be Autolinked. A Match object is what is provided in a
 * {@link Autolinker#replaceFn replaceFn}, and may be used to query for details about the match.
 *
 * For example:
 *
 *     var input = "...";  // string with URLs, Email Addresses, and Twitter Handles
 *
 *     var linkedText = Autolinker.link( input, {
 *         replaceFn : function( autolinker, match ) {
 *             console.log( "href = ", match.getAnchorHref() );
 *             console.log( "text = ", match.getAnchorText() );
 *
 *             switch( match.getType() ) {
 *                 case 'url' :
 *                     console.log( "url: ", match.getUrl() );
 *
 *                 case 'email' :
 *                     console.log( "email: ", match.getEmail() );
 *
 *                 case 'twitter' :
 *                     console.log( "twitter: ", match.getTwitterHandle() );
 *             }
 *         }
 *     } );
 *
 * See the {@link Autolinker} class for more details on using the {@link Autolinker#replaceFn replaceFn}.
 */
Autolinker.match.Match = Autolinker.Util.extend( Object, {

	/**
	 * @protected
	 * @property {String} matchedText
	 */

	/**
	 * @protected
	 * @property {Number} offset
	 */


	/**
	 * @constructor
	 * @param {String} matchedText The original text that was matched.
	 * @param {Number} offset The offset of where the match was made in the
	 *   input string.
	 */
	constructor : function( matchedText, offset ) {
		// @if DEBUG
		if( matchedText == null ) throw new Error( '`matchedText` arg required' );
		if( offset == null ) throw new Error( '`offset` arg required' );
		// @endif

		this.matchedText = matchedText;
		this.offset = offset;
	},


	/**
	 * Returns a string name for the type of match that this class represents.
	 *
	 * @abstract
	 * @return {String}
	 */
	getType : Autolinker.Util.abstractMethod,


	/**
	 * Returns the original text that was matched.
	 *
	 * @return {String}
	 */
	getMatchedText : function() {
		return this.matchedText;
	},


	/**
	 * Sets the {@link #offset} of where the match was made in the input string.
	 *
	 * A {@link Autolinker.matcher.Matcher} will be fed only HTML text nodes,
	 * and will therefore set an original offset that is relative to the HTML
	 * text node itself. However, we want this offset to be relative to the full
	 * HTML input string, and thus if using {@link Autolinker#parse} (rather
	 * than calling a {@link Autolinker.matcher.Matcher} directly), then this
	 * offset is corrected after the Matcher itself has done its job.
	 *
	 * @param {Number} offset
	 */
	setOffset : function( offset ) {
		this.offset = offset;
	},


	/**
	 * Returns the offset of where the match was made in the input string. This
	 * is the 0-based index of the match.
	 *
	 * @return {Number}
	 */
	getOffset : function() {
		return this.offset;
	},


	/**
	 * Returns the anchor href that should be generated for the match.
	 *
	 * @abstract
	 * @return {String}
	 */
	getAnchorHref : Autolinker.Util.abstractMethod,


	/**
	 * Returns the anchor text that should be generated for the match.
	 *
	 * @abstract
	 * @return {String}
	 */
	getAnchorText : Autolinker.Util.abstractMethod

} );