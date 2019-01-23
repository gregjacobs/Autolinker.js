import { Match, MatchConfig } from "./match";
import { MentionServices } from "../autolinker";

/**
 * @class Autolinker.match.Mention
 * @extends Autolinker.match.Match
 *
 * Represents a Mention match found in an input string which should be Autolinked.
 *
 * See this class's superclass ({@link Autolinker.match.Match}) for more details.
 */
export class MentionMatch extends Match {

	/**
	 * @cfg {String} serviceName
	 *
	 * The service to point mention matches to. See {@link Autolinker#mention}
	 * for available values.
	 */
	private readonly serviceName: MentionServices = 'twitter';  // default value just to get the above doc comment in the ES5 output and documentation generator

	/**
	 * @cfg {String} mention (required)
	 *
	 * The Mention that was matched, without the '@' character.
	 */
	private readonly mention: string = '';  // default value just to get the above doc comment in the ES5 output and documentation generator


	/**
	 * @method constructor
	 * @param {Object} cfg The configuration properties for the Match
	 *   instance, specified in an Object (map).
	 */
	constructor( cfg: MentionMatchConfig ) {
		super( cfg );

		this.mention = cfg.mention;
		this.serviceName = cfg.serviceName;
	}


	/**
	 * Returns a string name for the type of match that this class represents.
	 * For the case of MentionMatch, returns 'mention'.
	 *
	 * @return {String}
	 */
	getType() {
		return 'mention';
	}


	/**
	 * Returns the mention, without the '@' character.
	 *
	 * @return {String}
	 */
	getMention() {
		return this.mention;
	}


	/**
	 * Returns the configured {@link #serviceName} to point the mention to.
	 * Ex: 'instagram', 'twitter', 'soundcloud'.
	 *
	 * @return {String}
	 */
	getServiceName() {
		return this.serviceName;
	}


	/**
	 * Returns the anchor href that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorHref() {
		switch( this.serviceName ) {
			case 'twitter' :
				return 'https://twitter.com/' + this.mention;
			case 'instagram' :
				return 'https://instagram.com/' + this.mention;
			case 'soundcloud' :
				return 'https://soundcloud.com/' + this.mention;

			default :  // Shouldn't happen because Autolinker's constructor should block any invalid values, but just in case.
				throw new Error( 'Unknown service name to point mention to: ' + this.serviceName );
		}
	}


	/**
	 * Returns the anchor text that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorText() {
		return '@' + this.mention;
	}


	/**
	 * Returns the CSS class suffixes that should be used on a tag built with
	 * the match. See {@link Autolinker.match.Match#getCssClassSuffixes} for
	 * details.
	 *
	 * @return {String[]}
	 */
	getCssClassSuffixes() {
		let cssClassSuffixes = super.getCssClassSuffixes(),
		    serviceName = this.getServiceName();

		if( serviceName ) {
			cssClassSuffixes.push( serviceName );
		}
		return cssClassSuffixes;
	}

}

export interface MentionMatchConfig extends MatchConfig {
	serviceName: MentionServices;
	mention: string;
}