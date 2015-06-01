/*global Autolinker */
/**
 * @private
 * @class Autolinker.matcherEngine.RegexCombiner
 *
 * Used by Autolinker to build a combined regular expression based on the array
 * of {@link Autolinker.matcher.Matcher Matchers} passed to the constructor.
 *
 * This class also provides accessor methods that given an array of all the
 * capturing group match strings in a given match, it will return the correct
 * {@link Autolinker.matcher.Matcher Matcher} object that the capturing groups
 * belong to, and the array of "sub-capturing groups" that belong to the
 * particular Matcher.
 */
Autolinker.matcherEngine.RegexCombiner = Autolinker.Util.extend( Object, {

	/**
	 * The regular expression which is a combination of all of the individual
	 * {@link #matchers matchers'} regular expressions OR'd together to form a
	 * single regular expression to scan the input string for matches.
	 *
	 * See {@link #buildCombinedRegex} for details.
	 *
	 * @private
	 * @property {RegExp}
	 */
	combinedRegex : undefined,

	/**
	 * An Object (map) which maps the capturing groups of the {@link #combinedRegex}
	 * to {@link Autolinker.matcher.Matcher} instances, and also remembers how
	 * many individual capturing groups ("sub capturing groups" in this context)
	 * the Matcher owns.
	 *
	 * This is used to look up which Matcher a given string match belongs to,
	 * and to call the Matcher to process it as a candidate match. This is
	 * handled by the {@link Autolinker.matcherEngine.MatcherEngine MatcherEngine}
	 * with the help of the {@link #getMatcherAndCapturingGroups} method.
	 *
	 * Example map format:
	 *
	 *     {
	 *         '0' : {
	 *             matcher : ({@link Autolinker.matcher.Twitter} instance),
	 *             numCapturingGroups : 2   // 2 capturing groups just for the Twitter matcher
	 *         },
	 *         '3' : {
	 *             matcher : ({@link Autolinker.matcher.Email} instance),
	 *             numCapturingGroups : 0   // no extra capturing groups for the Email matcher
	 *         },
	 *         '4' : {
	 *             matcher : ({@link Autolinker.matcher.Url} instance),
	 *             numCapturingGroups : 3   // 3 capturing groups for the Url matcher
	 *         }
	 *
	 *         // etc.
	 *     }
	 *
	 * The gaps in the numbers of the map keys mean that the particular Matcher
	 * has its own capturing groups. In the example, capturing groups 1 and 2
	 * will be sent to the {@link Autolinker.matcher.Twitter Twitter} matcher
	 * instance, along with the full matched text itself.
	 *
	 * @private
	 * @property {Object} An Object keyed by capturing group num, and who values
	 *   are Objects which hold `matcher` ({@link Autolinker.matcher.Matcher})
	 *   and `numCapturingGroups` (Number) properties.
	 */
	capturingGroupsMap : undefined,

	/**
	 * A regular expression which is used to check the *source* of the regular
	 * expressions provided by {@link Autolinker.matcher.Matcher Matchers} to
	 * find out how many capturing groups are in the regular expression.
	 *
	 * This regular expression basically checks to find out how many open
	 * parenthesis there are in the regular expression that are not either:
	 *
	 * a. Escaped by a backslash ('\'), nor
	 * b. Followed by '?:' to make them a non-capturing group.
	 *
	 * For example, the following regular expression only has one actual
	 * capturing group:
	 *
	 *     /ab(?:c)de\(fghi(j)kl/
	 *
	 * The one actual capturing group in the above regular expression surrounds
	 * the letter 'j'.
	 *
	 * @private
	 * @property {RegExp} (readonly)
	 */
	capturingGroupsRe : /[^\\]\((?!\?:)/g,  // an open parenthesis not preceded by a '\', and not followed by '?:'


	/**
	 * @constructor
	 * @param {Autolinker.matcher.Matcher[]} matchers The array of Matchers that
	 *   should have their regular expressions combined in order to create a
	 *   single regular expression that will scan an input string.
	 */
	constructor : function( matchers ) {
		this.matchers = matchers;

		this.buildCombinedRegex( matchers );
	},


	/**
	 * Based on the {@link Autolinker.matcher.Matcher Matchers} provided to the
	 * constructor, this methods builds a regular expression that is a
	 * combination of each individual Matchers' regular expression. This
	 * combined regex may then be used to scan an input string for matches.
	 *
	 * For example, if we had 3 Matchers, and these were the regular expressions
	 * returned from their {@link Autolinker.matcher.Matcher#getMatcherRegexStr}
	 * methods:
	 *
	 *     1: /abc/
	 *     2: /d(e)f/
	 *     3: /g(h)(i)/
	 *
	 * Then this method would create a {@link #combinedRegex} of:
	 *
	 *     /(abc)|(d(e)f)|(g(h)(i))/
	 *
	 *
	 * ## Extra Capturing Parenthesis
	 *
	 * Notice that in the above example, an extra set of capturing parenthesis
	 * are added around each individual regular expression. These are so that
	 * the RegexCombiner knows which input {@link Autolinker.matcher.Matcher Matcher}
	 * object to "map" a given string match back to.
	 *
	 * The purpose of this is for the search / replacement process, where a
	 * string match is provided back to the Matcher instance in order to create
	 * an associated {@link Autolinker.match.Match} object. This is handled in
	 * the {@link Autolinker.matcherEngine.MatcherEngine MatcherEngine}, with
	 * the assistance of the {@link #getMatcherAndCapturingGroups}.
	 *
	 *
	 * ## Bookkeeping
	 *
	 * In order to facilitate mapping string matches back to {@link Autolinker.matcher.Matcher}
	 * instances, this method creates the {@link #capturingGroupsMap} in the
	 * process of combining the regex. See {@link #capturingGroupsMap} for
	 * details.
	 *
	 *
	 * @private
	 * @param {Autolinker.matcher.Matcher[]} matchers The array of Matchers that
	 *   should have their regular expressions combined in order to create a
	 *   single regular expression that will scan an input string.
	 */
	buildCombinedRegex : function( matchers ) {
		var reStr = [],
			capturingGroupsMap = {},
			capturingGroupNum = 0;

		for( var i = 0, len = matchers.length; i < len; i++ ) {
			var matcher = matchers[ i ],
				matcherRegexStr = matcher.getMatcherRegexStr(),
				numCapturingGroups = this.getNumCapturingGroups( matcherRegexStr );

			reStr.push( '(' + matcherRegexStr + ')' );  // add a capturing group for the regular expression that the RegexCombiner will use

			// Map the capturing groups to the Matcher instance that they
			// belong to. This includes this implementation's surrounding
			// capturing group (above line), and the gaps in the numbers of the
			// keys of this map relate to the particular matcher's own capturing
			// groups.
			capturingGroupsMap[ capturingGroupNum ] = {
				matcher : matcher,
				numCapturingGroups : numCapturingGroups
			};
			capturingGroupNum += 1 + numCapturingGroups;
		}

		this.combinedRegex = new RegExp( reStr.join( '|' ), 'gi' );
		this.capturingGroupsMap = capturingGroupsMap;
	},


	/**
	 * Determines the number of capturing groups are in the given regular
	 * expression string.
	 *
	 * This is used to find how many capturing groups belong to a particular
	 * {Autolinker.matcher.Matcher Matcher's} regular expression, so we can
	 * provide the correct capturing groups back to the Matcher when a string
	 * match is made for the {@link #combinedRegex}.
	 *
	 * @private
	 * @param {String} regexStr The regular expression, in string form (i.e. the
	 *   source of the regular expression).
	 * @return {Number} The number of capturing groups.
	 */
	getNumCapturingGroups : function( regexStr ) {
		var matches = regexStr.match( this.capturingGroupsRe );

		return ( matches ) ? matches.length : 0;
	},


	/**
	 * Returns the combined regular expression for the {@link Autolinker.matcher.Matcher}
	 * objects provided to the constructor.
	 *
	 * This is the regular expression that will be used to scan an input string
	 * for matches.
	 *
	 * @return {RegExp}
	 */
	getRegex : function() {
		return this.combinedRegex;
	},


	/**
	 * Upon a string match from the {@link #combinedRegex} with an input string,
	 * we need to determine which {@link Autolinker.matcher.Matcher Matcher} the
	 * particular string match relates to.
	 *
	 * For example, say we configured the RegexCombiner with 2 Matchers:
	 *
	 *     1. AbcMatcher, regex: /abc/
	 *     2. DefMatcher, regex: /d(e)f/
	 *
	 * If we then run the combined regular expression (`/(abc)|(d(e)f)/`)
	 * against an input string, and a match for 'abc' comes up, we want to
	 * return the `AbcMatcher`. Similarly, if a match for 'def' comes up, we
	 * want to return the `DefMatcher`.
	 *
	 *
	 * ## Capturing Groups
	 *
	 * Along with finding which {@link Autolinker.matcher.Matcher Matcher} the
	 * string matched for, we also want to know which capturing groups out of
	 * the full list of all "combined" capturing groups belong to the Matcher as
	 * well. Hence, this method also returns the subset of capturing groups that
	 * belong to the Matcher itself.
	 *
	 *
	 * ## Input Provided to this Method
	 *
	 * This method expects an input of all of the capturing groups for a given
	 * string match, starting at capturing group #1 (at array index 0). This
	 * array *excludes* the full match itself, as it is not needed.
	 *
	 *
	 * @param {String[]} allCapturingGroups The capturing groups for the string
	 *   match. See method description of "Input Provided to this Method."
	 * @return {Autolinker.matcherEngine.MatcherAndCapturingGroups} A
	 *   MatcherAndCapturingGroups instance to return both the Matcher and
	 *   string array of capturing groups for the Matcher.
	 */
	getMatcherAndCapturingGroups : function( allCapturingGroups ) {
		// Find out which Matcher object the match belongs to based on the
		// values of all of the capturing groups.
		var capturingGroupsMap = this.capturingGroupsMap;

		for( var capturingGroupNum in capturingGroupsMap ) {
			if( capturingGroupsMap.hasOwnProperty( capturingGroupNum ) ) {

				// If the capturing group for the current Matcher in the loop
				// has text, then the current Matcher must have provided the
				// regular expression for the matched text. Return that, along
				// with the slice of capturing groups that belong to the
				// Matcher.
				if( allCapturingGroups[ capturingGroupNum ] ) {
					capturingGroupNum = +capturingGroupNum;  // convert from string property name to number for convenience with arithmetic related operation

					var matcherMetaObj = capturingGroupsMap[ capturingGroupNum ],
						numCapturingGroups = matcherMetaObj.numCapturingGroups,
						capturingGroupMatches = allCapturingGroups.slice( capturingGroupNum + 1, capturingGroupNum + 1 + numCapturingGroups );

					return new Autolinker.matcherEngine.MatcherAndCapturingGroups(
						matcherMetaObj.matcher,
						capturingGroupMatches
					);
				}

			}
		}

		// If no Matcher was found for the capturing groups provided to the
		// method, then throw an error. This shouldn't happen, but may occur if
		// a custom Matcher incorrectly reports how many capturing groups its
		// regex has, in which case it is a programmer error.
		// @if DEBUG
		throw new Error( "No Matcher was found for the capturing group string matches" );
		// @endif
	}

} );