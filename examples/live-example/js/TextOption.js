/*global $, Option */

/**
 * @class TextOption
 *
 * A text field option for the live example.
 */
class TextOption extends Option {

	/**
	 * @cfg {Number} [size=10]
	 *
	 * The `size` attribute of the text field.
	 */

	/**
	 * @cfg {Boolean} [defaultValue='']
	 *
	 * The default value for the option.
	 */


	/**
	 * @constructor
	 * @param {Object} cfg The configuration options for this class, specified
	 *   in an Object (map).
	 */
	constructor( cfg ) {
		super( cfg );

		this.size = cfg.size || 10;
		this.defaultValue = cfg.defaultValue || '';

		this.$containerEl.html( this.generateHtml() );
		this.$textEl = this.$containerEl.find( 'input' ).on( 'keyup change', this.fireChange.bind( this ) );
		this.$valueDisplayEl = this.$containerEl.find( '#' + this.containerId + '-value' );
	}


	/**
	 * @private
	 * @return {string}
	 */
	generateHtml() {
		var containerId = this.containerId,
		    optionName = this.optionName,
		    optionDescription = this.optionDescription,
		    size = this.size,
		    defaultValue = this.defaultValue,
		    checkboxId = containerId + '-checkbox';

		return `
			<input type="text" id="${checkboxId}" value="${defaultValue}" size="${size}">
			<label for="${checkboxId}">
				${optionDescription} (<code>${optionName}</code>)
			</label>
		`;
	}


	/**
	 * @return {String}
	 */
	getValue() {
		return this.$textEl.val();
	}

}