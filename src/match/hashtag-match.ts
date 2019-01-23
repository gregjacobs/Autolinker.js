import { Match, MatchConfig } from "./match";

/**
 * @class Autolinker.match.Hashtag
 * @extends Autolinker.match.Match
 *
 * Represents a Hashtag match found in an input string which should be
 * Autolinked.
 *
 * See this class's superclass ({@link Autolinker.match.Match}) for more
 * details.
 */
export class HashtagMatch extends Match {

	/**
	 * @cfg {String} serviceName
	 *
	 * The service to point hashtag matches to. See {@link Autolinker#hashtag}
	 * for available values.
	 */
	private readonly serviceName: string = '';  // default value just to get the above doc comment in the ES5 output and documentation generator

	/**
	 * @cfg {String} hashtag (required)
	 *
	 * The HashtagMatch that was matched, without the '#'.
	 */
	private readonly hashtag: string = '';  // default value just to get the above doc comment in the ES5 output and documentation generator


	/**
	 * @method constructor
	 * @param {Object} cfg The configuration properties for the Match
	 *   instance, specified in an Object (map).
	 */
	constructor( cfg: HashtagMatchConfig ) {
		super( cfg );

		this.serviceName = cfg.serviceName;
		this.hashtag = cfg.hashtag;
	}


	/**
	 * Returns a string name for the type of match that this class represents.
	 * For the case of HashtagMatch, returns 'hashtag'.
	 *
	 * @return {String}
	 */
	getType() {
		return 'hashtag';
	}


	/**
	 * Returns the configured {@link #serviceName} to point the HashtagMatch to.
	 * Ex: 'facebook', 'twitter'.
	 *
	 * @return {String}
	 */
	getServiceName() {
		return this.serviceName;
	}


	/**
	 * Returns the matched hashtag, without the '#' character.
	 *
	 * @return {String}
	 */
	getHashtag() {
		return this.hashtag;
	}


	/**
	 * Returns the anchor href that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorHref() {
		let serviceName = this.serviceName,
		    hashtag = this.hashtag;

		switch( serviceName ) {
			case 'twitter' :
				return 'https://twitter.com/hashtag/' + hashtag;
			case 'facebook' :
				return 'https://www.facebook.com/hashtag/' + hashtag;
			case 'instagram' :
				return 'https://instagram.com/explore/tags/' + hashtag;

			default :  // Shouldn't happen because Autolinker's constructor should block any invalid values, but just in case.
				throw new Error( 'Unknown service name to point hashtag to: ' + serviceName );
		}
	}


	/**
	 * Returns the anchor text that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorText() {
		return '#' + this.hashtag;
	}

}

export interface HashtagMatchConfig extends MatchConfig {
	serviceName: string;
	hashtag: string;
}