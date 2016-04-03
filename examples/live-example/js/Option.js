/*global $ */

/**
 * @abstract
 * @class Option
 *
 * Base class for options that can be modified in the live example.
 */
class Option {

	/**
	 * @cfg {String} name
	 *
	 * The name of the option. This also relates to its element ID in the
	 * live-example.html file.
	 *
	 * Ex: pass 'newWindow' for the element with ID 'option-newWindow'.
	 */

	/**
	 * @cfg {String} description
	 *
	 * The description to display for the option.
	 */


	/**
	 * @protected
	 * @property {String} containerId
	 *
	 * The ID of the container element in live-example.html
	 */

	/**
	 * @protected
	 * @property {jQuery} $containerEl
	 *
	 * A reference to the container element in the live-example.html file.
	 */

	/**
	 * @private
	 * @property {Function[]} changeCallbacks
	 *
	 * The array of 'change' callbacks assigned by {@link #onChange}, and which
	 * are called by {@link #fireChange}.
	 */


	/**
	 * @constructor
	 * @param {Object} cfg The configuration options for this class, specified
	 *   in an Object (map).
	 */
	constructor( cfg ) {
		this.optionName = cfg.name;
		this.optionDescription = cfg.description;

		this.containerId = 'option-' + this.optionName.replace( /\./g, '-' );  // ex: 'truncate.length' -> 'trunctate-length'
		this.$containerEl = $( '#' + this.containerId );

		this.changeCallbacks = [];
	}


	/**
	 * @protected
	 * @return {String}
	 */
	getApiDocAnchor() {
		return `<a href="${ this.getApiDocLink() }" target="autolinkerDocs">${ this.optionName }</a>`;
	}


	/**
	 * @protected
	 * @return {String}
	 */
	getApiDocLink() {
		var configName = this.optionName.match( /[^.]+/ )[ 0 ];  // ex: 'urls.schemeMatches' -> 'urls'

		return `http://gregjacobs.github.io/Autolinker.js/docs/#!/api/Autolinker-cfg-${configName}`;
	}


	/**
	 * Retrieves the value for the option.
	 *
	 * @abstract
	 * @return {*}
	 */
	getValue() {
		throw new Error( 'Must implement abstract method `getValue()`' );
	}


	/**
	 * Registers a callback to call when the option is changed.
	 *
	 * @param {Function} callbackFn
	 * @chainable
	 */
	onChange( callbackFn ) {
		this.changeCallbacks.push( callbackFn );
		return this;
	}


	/**
	 * Calls all 'change' callbacks as a result of the option being changed.
	 *
	 * @protected
	 */
	fireChange() {
		this.changeCallbacks.forEach( cb => cb() );  // call all 'change' callbacks
	}

}