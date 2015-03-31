/*global Autolinker */
/**
 * @private
 * @class Autolinker.matcher.MatcherEngine
 * @extends Object
 *
 * Used by Autolinker to parse potential matches, given an input string of text.
 *
 * The MatcherEngine is fed a non-HTML string in order to search for matches.
 * Autolinker first uses the {@link Autolinker.htmlParser.HtmlParser} to "walk
 * around" HTML tags, and then the text around the HTML tags is passed into the
 * MatcherEngine in order to find the actual matches.
 */
Autolinker.matcher.MatcherEngine = Autolinker.Util.extend( Object, {

	/**
	 * The array of Matcher instances to use to find potential string of text to
	 * autolink.
	 *
	 * @cfg {Autolinker.matcher.Matcher[]}
	 */
	matchers : undefined,


	/**
	 * The regular expression which is a combination of all of the individual
	 * {@link #matchers} regular expressions OR'd together to form a single
	 * regular expression to scan the input string for matches.
	 *
	 * @private
	 * @property {RegExp}
	 */
	combinedMatchersRegex : undefined,

	/**
	 * An array which maps capturing group numbers to {@link Autolinker.matcher.Matcher}
	 * instances.
	 *
	 * This is used to find which matcher a piece of text has matched for, and
	 * to call the Matcher to process it as a candidate match.
	 *
	 * Example map:
	 *
	 *     {
	 *         '0' : {
	 *             matcher : ({@link Autolinker.matcher.Twitter} instance),
	 *             length  : 3
	 *         },
	 *         '3' : {
	 *             matcher : ({@link Autolinker.matcher.Email} instance),
	 *             length  : 1
	 *         }
	 *         '4' : {
	 *             matcher : ({@link Autolinker.matcher.Url} instance),
	 *             length  : 3
	 *         }
	 *
	 *         // etc.
	 *     }
	 *
	 * The gaps in the numbers mean that the particular matcher has its own
	 * capturing groups. In the example, capturing groups 0, 1 and 2 will all be
	 * sent to the {@link Autolinker.matcher.Twitter Twitter} matcher instance.
	 *
	 * @private
	 * @property {Object} An Object keyed by capturing group num, and who values
	 *   are Objects which hold `matcher` ({@link Autolinker.matcher.Matcher})
	 *   and `length` (Number) properties.
	 */
	capturingGroupsMap : undefined,


	/**
	 * @constructor
	 * @param {Object} cfg The configuration properties for the MatcherEngine
	 *   instance, specified in an Object (map).
	 */
	constructor : function( cfg ) {
		Autolinker.Util.assign( this, cfg );
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
		    combinedMatchersRegex = this.getCombinedMatchersRegex();

		return text.replace( combinedMatchersRegex, function( matchStr ) {
			var capturingGroupMatches = Array.prototype.slice.call( arguments ),
				matchDescObj = me.processCandidateMatch( matchStr, capturingGroupMatches );  // returned is a "match description" object

			// Return out with no changes for matches that are invalid (false
			// positives from the matcher regex, which can't use look-behinds
			// since they are unavailable in JS).
			if( !matchDescObj ) {
				return matchStr;

			} else {
				// Generate replacement text for the match from the `replaceFn`
				var replaceStr = replaceFn.call( contextObj, matchDescObj.match );
				return matchDescObj.prefixStr + replaceStr + matchDescObj.suffixStr;
			}
		} );
	},


	getCombinedMatchersRegex : function() {
		if( !this.combinedMatchersRegex ) {
			this.buildCombinedMatchersRegex();
		}

		return this.combinedMatchersRegex;
	},


	/**
	 * @private
	 */
	buildCombinedMatchersRegex : function() {
		var reStr = [],
			matchers = this.matchers,
			capturingGroupsMap = {},
			capturingGroupNum = 0;

		for( var i = 0, len = matchers.length; i < len; i++ ) {
			var matcher = matchers[ i ],
				matcherRegexStr = matcher.getMatcherRegexStr(),
				numCapturingGroups = matcher.getNumCapturingGroups();

			reStr.push( '(' + matcherRegexStr + ')' );  // add a capturing group for it

			// Map the capturing groups to the Matcher instance that they
			// belong to. This includes this implementation's surrounding
			// capturing group (above line), and the gaps in the numbers of the
			// keys of this map relate to the particular matcher's own capturing
			// groups.
			capturingGroupsMap[ capturingGroupNum ] = {
				matcher : matcher,
				length  : 1 + numCapturingGroups
			};
			capturingGroupNum += numCapturingGroups;
		}

		this.combinedMatchersRegex = new RegExp( reStr.join( '' ), 'gi' );
		this.capturingGroupsMap = capturingGroupsMap;
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
	 * @param {String[]} capturingGroupMatches
	 *
	 * @return {Object} A "match description object". This will be `null` if the
	 *   match was invalid, or if a match type is disabled. Otherwise, this will
	 *   be an Object (map) with the following properties:
	 * @return {String} return.prefixStr The char(s) that should be prepended to
	 *   the replacement string. These are char(s) that were needed to be
	 *   included from the regex match that were ignored by processing code, and
	 *   should be re-inserted into the replacement stream.
	 * @return {String} return.suffixStr The char(s) that should be appended to
	 *   the replacement string. These are char(s) that were needed to be
	 *   included from the regex match that were ignored by processing code, and
	 *   should be re-inserted into the replacement stream.
	 * @return {Autolinker.match.Match} return.match The Match object that
	 *   represents the match that was found.
	 */
	processCandidateMatch : function( matchStr, capturingGroupMatches ) {
		// Note: The `matchStr` variable wil be fixed up to remove characters
		// that are no longer needed (which will be added to `prefixStr` and
		// `suffixStr`).


		// Find out which Matcher object the match belongs to.
		var capturingGroupsMap = this.capturingGroupsMap;

		for( var capturingGroupNum in capturingGroupsMap ) {
			if( capturingGroupsMap.hasOwnProperty( capturingGroupNum ) ) {

				if( capturingGroupMatches[ capturingGroupNum ] ) {
					capturingGroupNum = +capturingGroupNum;  // convert from string property name to number for convenience with arithmetic related operation

					var matcher = capturingGroupsMap[ capturingGroupNum ].matcher,
					    numCapturingGroups = capturingGroupsMap[ capturingGroupNum ].length,
						args = capturingGroupMatches.slice( capturingGroupNum, capturingGroupNum + numCapturingGroups );

					return matcher.processCandidateMatch.apply( matcher, args );
				}

			}
		}







		var protocolRelativeMatch = wwwProtocolRelativeMatch || tldProtocolRelativeMatch,
			match,  // Will be an Autolinker.match.Match object

			prefixStr = "",  // A string to use to prefix the anchor tag that is created. This is needed for the Twitter and Hashtag matches.
			suffixStr = "";  // A string to suffix the anchor tag that is created. This is used if there is a trailing parenthesis that should not be auto-linked.

		// Return out with `null` for match types that are disabled (url, email,
		// twitter, hashtag), or for matches that are invalid (false positives
		// from the matcherRegex, which can't use look-behinds since they are
		// unavailable in JS).
		if(
			!this.matchValidator.isValidMatch( urlMatch, protocolUrlMatch, protocolRelativeMatch )
		) {
			return null;
		}

		// Handle a closing parenthesis at the end of the match, and exclude it
		// if there is not a matching open parenthesis
		// in the match itself.
		if( this.matchHasUnbalancedClosingParen( matchStr ) ) {
			matchStr = matchStr.substr( 0, matchStr.length - 1 );  // remove the trailing ")"
			suffixStr = ")";  // this will be added after the generated <a> tag
		}

		if( emailAddressMatch ) {
			match = new Autolinker.match.Email( { matchedText: matchStr, email: emailAddressMatch } );

		} else if( twitterMatch ) {
			// fix up the `matchStr` if there was a preceding whitespace char,
			// which was needed to determine the match itself (since there are
			// no look-behinds in JS regexes)
			if( twitterHandlePrefixWhitespaceChar ) {
				prefixStr = twitterHandlePrefixWhitespaceChar;
				matchStr = matchStr.slice( 1 );  // remove the prefixed whitespace char from the match
			}
			match = new Autolinker.match.Twitter( { matchedText: matchStr, twitterHandle: twitterHandle } );

		} else if( phoneMatch ) {
			// remove non-numeric values from phone number string
			var cleanNumber = matchStr.replace( /\D/g, '' );
			match = new Autolinker.match.Phone( { matchedText: matchStr, number: cleanNumber } );

		} else if( hashtagMatch ) {
			// fix up the `matchStr` if there was a preceding whitespace char,
			// which was needed to determine the match itself (since there are
			// no look-behinds in JS regexes)
			if( hashtagPrefixWhitespaceChar ) {
				prefixStr = hashtagPrefixWhitespaceChar;
				matchStr = matchStr.slice( 1 );  // remove the prefixed whitespace char from the match
			}
			match = new Autolinker.match.Hashtag( { matchedText: matchStr, serviceName: this.hashtag, hashtag: hashtag } );

		} else {  // url match
			// If it's a protocol-relative '//' match, remove the character
			// before the '//' (which the matcherRegex needed to match due to
			// the lack of a negative look-behind in JavaScript regular
			// expressions)
			if( protocolRelativeMatch ) {
				var charBeforeMatch = protocolRelativeMatch.match( this.charBeforeProtocolRelMatchRegex )[ 1 ] || "";

				if( charBeforeMatch ) {  // fix up the `matchStr` if there was a preceding char before a protocol-relative match, which was needed to determine the match itself (since there are no look-behinds in JS regexes)
					prefixStr = charBeforeMatch;
					matchStr = matchStr.slice( 1 );  // remove the prefixed char from the match
				}
			}

			match = new Autolinker.match.Url( {
				matchedText : matchStr,
				url : matchStr,
				protocolUrlMatch : !!protocolUrlMatch,
				protocolRelativeMatch : !!protocolRelativeMatch,
				stripPrefix : this.stripPrefix
			} );
		}

		return {
			prefixStr : prefixStr,
			suffixStr : suffixStr,
			match     : match
		};
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
			var openParensMatch = matchStr.match( /\(/g ),
				closeParensMatch = matchStr.match( /\)/g ),
				numOpenParens = ( openParensMatch && openParensMatch.length ) || 0,
				numCloseParens = ( closeParensMatch && closeParensMatch.length ) || 0;

			if( numOpenParens < numCloseParens ) {
				return true;
			}
		}

		return false;
	}

} );