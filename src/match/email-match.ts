import { Match, MatchConfig } from "./match";

/**
 * @class Autolinker.match.Email
 * @extends Autolinker.match.Match
 *
 * Represents a Email match found in an input string which should be Autolinked.
 *
 * See this class's superclass ({@link Autolinker.match.Match}) for more details.
 */
export class EmailMatch extends Match {

	/**
	 * @cfg {String} email (required)
	 *
	 * The email address that was matched.
	 */
	private readonly email: string = '';  // default value just to get the above doc comment in the ES5 output and documentation generator


	/**
	 * @method constructor
	 * @param {Object} cfg The configuration properties for the Match
	 *   instance, specified in an Object (map).
	 */
	constructor( cfg: EmailMatchConfig ) {
		super( cfg );

		this.email = cfg.email;
	}


	/**
	 * Returns a string name for the type of match that this class represents.
	 * For the case of EmailMatch, returns 'email'.
	 *
	 * @return {String}
	 */
	getType() {
		return 'email';
	}


	/**
	 * Returns the email address that was matched.
	 *
	 * @return {String}
	 */
	getEmail() {
		return this.email;
	}


	/**
	 * Returns the anchor href that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorHref() {
		return 'mailto:' + this.email;
	}


	/**
	 * Returns the anchor text that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorText() {
		return this.email;
	}

}


export interface EmailMatchConfig extends MatchConfig {
	email: string;
}