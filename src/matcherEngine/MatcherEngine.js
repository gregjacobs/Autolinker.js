/*global Autolinker */
/**
 * @class Autolinker.matcherEngine.MatcherEngine
 * @extends Object
 *
 * Used by Autolinker to parse potential matches, given an input string of text.
 *
 * The MatcherEngine is fed a non-HTML string in order to search for matches.
 * Autolinker first uses the {@link Autolinker.htmlParser.HtmlParser} to "walk
 * around" HTML tags, and then the text around the HTML tags is passed into the
 * MatcherEngine in order to find the actual matches.
 */
Autolinker.matcherEngine.MatcherEngine = Autolinker.Util.extend( Object, {

	/**
	 * The array of Matcher instances to use to find potential string of text to
	 * autolink.
	 *
	 * @cfg {Autolinker.matcherEngine.MatchersRegex}
	 */
	regexCombiner : undefined,


	/**
	 * A regular expression to match all of the opening parenthesis (i.e. '(')
	 * in a match string.
	 *
	 * This is used to handle a parenthesis at the end of a matched string, to
	 * not include it as part of the match if the number of opening parenthesis
	 * is less than the number of closing parenthesis.
	 *
	 * @private
	 * @property {RegExp}
	 */
	openParensRe : /\(/g,

	/**
	 * A regular expression to match all of the closing parenthesis (i.e. ')')
	 * in a match string.
	 *
	 * This is used to handle a parenthesis at the end of a matched string, to
	 * not include it as part of the match if the number of opening parenthesis
	 * is less than the number of closing parenthesis.
	 *
	 * @private
	 * @property {RegExp}
	 */
	closeParensRe : /\)/g,


	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the MatcherEngine
	 *   instance, specified in an Object (map).
	 */
	constructor : function( cfg ) {
		Autolinker.Util.assign( this, cfg );

		// @if DEBUG
		if( !this.regexCombiner ) throw new Error( '`regexCombiner` cfg required' );
		// @endif
	},


	/**
	 * Parses the input `text` to search for matches, and calls the `replaceFn`
	 * to allow replacements of the matches. Returns the `text` with matches
	 * replaced.
	 *
	 * @param {String} text The text to search and replace matches in.
	 * @param {Function} replaceFn The iterator function to handle the
	 *   replacements. The function takes a single argument, a {@link Autolinker.match.Match}
	 *   object, and should return the text that should make the replacement.
	 * @param {Object} [contextObj=window] The context object ("scope") to run
	 *   the `replaceFn` in.
	 * @return {String}
	 */
	replace : function( text, replaceFn, contextObj ) {
		var me = this,  // for closure
			combinedMatchersRegex = this.regexCombiner.getRegex();

		return text.replace( combinedMatchersRegex, function( matchStr ) {
			var capturingGroupMatches = Array.prototype.slice.call( arguments, 1, -2 ),
				matchOffset = arguments[ arguments.length - 2 ],
			    replacementStr = me.processCandidateMatch( matchStr, capturingGroupMatches, matchOffset, replaceFn, contextObj );

			return replacementStr;
		} );
	},


	/**
	 * Processes a candidate match from the {@link #matcherRegex}.
	 *
	 * Not all matches found by the regex are actual URL/Email/Phone/Twitter/Hashtag
	 * matches, as determined by the {@link #matchValidator}. In this case, the
	 * method returns `null`. Otherwise, a valid Object with `prefixStr`,
	 * `match`, and `suffixStr` is returned.
	 *
	 * @private
	 * @param {String} matchStr The full match that was found by the
	 *   {@link #matcherRegex}.
	 * @param {String[]} capturingGroupMatches The matches made in the capturing
	 *   groups of the regex.
	 * @param {Number} matchOffset The offset index in the original input string
	 *   of where the match was made.
	 * @param {Function} replaceFn The iterator function to handle the
	 *   replacements. The function takes a single argument, a {@link Autolinker.match.Match}
	 *   object, and should return the text that should make the replacement.
	 * @param {Object} [contextObj=window] The context object ("scope") to run
	 *   the `replaceFn` in.
	 * @return {String} The string that should replace the `matchStr` in the
	 *   input. If no replacement is to be made, the original `matchStr` will be
	 *   returned.
	 */
	processCandidateMatch : function( matchStr, capturingGroupMatches, matchOffset, replaceFn, contextObj ) {
		// Note: The `matchStr` variable wil be fixed up to remove characters
		// that are no longer needed (which will be added to `prefixStr` and
		// `suffixStr`).
		var fixedMatchStr = matchStr,
		    suffixStr = "";  // A string to suffix the anchor tag that is created. This is used if there is a trailing parenthesis that should not be auto-linked.

		// Handle a closing parenthesis at the end of the match, and exclude it
		// if there is not a matching open parenthesis
		// in the match itself.
		if( this.matchHasUnbalancedClosingParen( matchStr ) ) {
			fixedMatchStr = matchStr.substr( 0, matchStr.length - 1 );  // remove the trailing ")"
			suffixStr = ")";  // this will be added after any generated <a> tag
		}

		var matchDescriptor = this.getDescriptorForMatch( fixedMatchStr, capturingGroupMatches );
		if( !matchDescriptor ) {
			// Return out with no changes for matches that are invalid (false
			// positives from the matcher regex which can't use look-behinds
			// since they are unavailable in JS, or some other reason).
			return matchStr;  // return the original match string

		} else {
			// Generate replacement text for the match from the `replaceFn`
			var replaceStr = replaceFn.call( contextObj, matchDescriptor.match );
			return matchDescriptor.prefixStr + replaceStr + matchDescriptor.suffixStr + suffixStr;
		}
	},


	/**
	 * @private
	 * @param {String} matchStr
	 * @param {String[]} capturingGroupMatches
	 * @return {ReplacementDescriptor} The ReplacementDescriptor, or `null` for
	 *   an invalid match (which will be the case for false positives due to,
	 *   for example, the lack of look-behinds in JavaScript regexes).
	 */
	getDescriptorForMatch : function( matchStr, capturingGroupMatches ) {
		var matcherAndCapturingGroups = this.regexCombiner.getMatcherAndCapturingGroups( capturingGroupMatches ),
			matcher = matcherAndCapturingGroups.matcher,
			matcherCapturingGroups = matcherAndCapturingGroups.capturingGroups;

		return matcher.processCandidateMatch.apply( matcher, [ matchStr ].concat( matcherCapturingGroups ) );
	},


	/**
	 * Determines if a match found has an unmatched closing parenthesis. If so,
	 * this parenthesis will be removed from the match itself, and appended
	 * after the generated anchor tag in {@link #processCandidateMatch}.
	 *
	 * A match may have an extra closing parenthesis at the end of the match
	 * because the regular expression must include parenthesis for URLs such as
	 * "wikipedia.com/something_(disambiguation)", which should be auto-linked.
	 *
	 * However, an extra parenthesis *will* be included when the URL itself is
	 * wrapped in parenthesis, such as in the case of "(wikipedia.com/something_(disambiguation))".
	 * In this case, the last closing parenthesis should *not* be part of the
	 * URL itself, and this method will return `true`.
	 *
	 * @private
	 * @param {String} matchStr The full match string from the {@link #matcherRegex}.
	 * @return {Boolean} `true` if there is an unbalanced closing parenthesis at
	 *   the end of the `matchStr`, `false` otherwise.
	 */
	matchHasUnbalancedClosingParen : function( matchStr ) {
		var lastChar = matchStr.charAt( matchStr.length - 1 );

		if( lastChar === ')' ) {
			var openParensMatch = matchStr.match( this.openParensRe ),
				closeParensMatch = matchStr.match( this.closeParensRe ),
				numOpenParens = ( openParensMatch && openParensMatch.length ) || 0,
				numCloseParens = ( closeParensMatch && closeParensMatch.length ) || 0;

			if( numOpenParens < numCloseParens ) {
				return true;
			}
		}

		return false;
	}

} );