import { Match, MatchConfig } from "./match";

/**
 * @class Autolinker.match.Phone
 * @extends Autolinker.match.Match
 *
 * Represents a Phone number match found in an input string which should be
 * Autolinked.
 *
 * See this class's superclass ({@link Autolinker.match.Match}) for more
 * details.
 */
export class PhoneMatch extends Match {

	/**
	 * @protected
	 * @property {String} number (required)
	 *
	 * The phone number that was matched, without any delimiter characters.
	 *
	 * Note: This is a string to allow for prefixed 0's.
	 */
	private readonly number: string = '';  // default value just to get the above doc comment in the ES5 output and documentation generator

	/**
	 * @protected
	 * @property  {Boolean} plusSign (required)
	 *
	 * `true` if the matched phone number started with a '+' sign. We'll include
	 * it in the `tel:` URL if so, as this is needed for international numbers.
	 *
	 * Ex: '+1 (123) 456 7879'
	 */
	private readonly plusSign: boolean = false;  // default value just to get the above doc comment in the ES5 output and documentation generator


	/**
	 * @method constructor
	 * @param {Object} cfg The configuration properties for the Match
	 *   instance, specified in an Object (map).
	 */
	constructor( cfg: PhoneMatchConfig ) {
		super( cfg );

		this.number = cfg.number;
		this.plusSign = cfg.plusSign;
	}


	/**
	 * Returns a string name for the type of match that this class represents.
	 * For the case of PhoneMatch, returns 'phone'.
	 *
	 * @return {String}
	 */
	getType() {
		return 'phone';
	}


	/**
	 * Returns the phone number that was matched as a string, without any 
	 * delimiter characters. 
	 *
	 * Note: This is a string to allow for prefixed 0's.
	 *
	 * @return {String}
	 */
	getPhoneNumber() {
		return this.number;
	}


	/**
	 * Alias of {@link #getPhoneNumber}, returns the phone number that was 
	 * matched as a string, without any delimiter characters.
	 *
	 * Note: This is a string to allow for prefixed 0's.
	 *
	 * @return {String}
	 */
	getNumber() {
		return this.getPhoneNumber();
	}


	/**
	 * Returns the anchor href that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorHref() {
		return 'tel:' + ( this.plusSign ? '+' : '' ) + this.number;
	}


	/**
	 * Returns the anchor text that should be generated for the match.
	 *
	 * @return {String}
	 */
	getAnchorText() {
		return this.matchedText;
	}

}


export interface PhoneMatchConfig extends MatchConfig {
	number: string;
	plusSign: boolean;
}