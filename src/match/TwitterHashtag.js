/*global Autolinker */
/**
 * @class Autolinker.match.TwitterHashtag
 * @extends Autolinker.match.Match
 *
 * Represents a Twitter Hashtag match found in an input string which should be
 * Autolinked.
 *
 * See this class's superclass ({@link Autolinker.match.Match}) for more
 * details.
 */
Autolinker.match.TwitterHashtag = Autolinker.Util.extend( Autolinker.match.Match, {

	/**
	 * @cfg {String} hashtag (required)
	 *
	 * The Twitter Hashtag that was matched.
	 */


	/**
	 * Returns the type of match that this class represents.
	 *
	 * @return {String}
	 */
	getType : function() {
		return 'twitterHashtag';
	},


	/**
	 * Returns a string name for the type of match that this class represents.
	 *
	 * @return {String}
	 */
	getHashtag : function() {
		return this.hashtag;
	},


	/**
	 * Returns the anchor href that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorHref : function() {
		return 'https://twitter.com/hashtag/' + this.hashtag;
	},


	/**
	 * Returns the anchor text that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorText : function() {
		return '#' + this.hashtag;
	}

} );