/*global Autolinker */
/**
 * @class Autolinker.matcherEngine.MatcherAndCapturingGroups
 *
 * A simple DTO (data transfer object) that is the return value of
 * {@link Autolinker.matcherEngine.RegexCombiner#getMatcherAndCapturingGroups}.
 * See that method for details.
 */
Autolinker.matcherEngine.MatcherAndCapturingGroups = Autolinker.Util.extend( Object, {

	/**
	 * The Matcher instance provided to the constructor.
	 *
	 * @property {Autolinker.matcher.Matcher} matcher (readonly)
	 */

	/**
	 * The capturing group strings that belong to the {@link #matcher}.
	 *
	 * @property {String[]} capturingGroups (readonly)
	 */


	/**
	 * @constructor
	 * @param {Autolinker.matcher.Matcher} matcher
	 * @param {String[]} capturingGroups
	 */
	constructor : function( matcher, capturingGroups ) {
		this.matcher = matcher;
		this.capturingGroups = capturingGroups;
	}

} );