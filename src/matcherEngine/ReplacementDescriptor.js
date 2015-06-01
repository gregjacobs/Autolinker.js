/*global Autolinker */
/**
 * @class Autolinker.matcher.ReplacementDescriptor
 *
 * An object which describes the replacement that should occur from the
 * {@link Autolinker.matcher.MatcherEngine} matching a piece of text.
 *
 * A {@link Autolinker.match.Match Match} object is used for the replacement
 * itself, but we also sometimes need to reconstruct the surrounding text of a
 * match, so this is what the {@link #prefixStr} and {@link #suffixStr} is for.
 *
 * See {@link Autolinker.matcher.MatcherEngine} for how this class is used.
 */
Autolinker.matcher.ReplacementDescriptor = Autolinker.Util.extend( Object, {

	/**
	 * @property {Autolinker.match.Match} match (readonly)
	 */

	/**
	 * @property {String} prefixStr (readonly)
	 */

	/**
	 * @property {String} suffixStr (readonly)
	 */


	/**
	 * @constructor
	 * @param {Autolinker.match.Match} match
	 * @param {String} [prefixStr=""]
	 * @param {String} [suffixStr=""]
	 */
	constructor : function( match, prefixStr, suffixStr ) {
		this.match = match;
		this.prefixStr = prefixStr || "";
		this.suffixStr = suffixStr || "";
	}

} );