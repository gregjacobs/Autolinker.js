import { Option, OptionCfg } from './Option';

type RadioOptionValue = boolean | string;

interface RadioOptionCfg extends OptionCfg {
    options: RadioOptionValue[];
    defaultValue?: RadioOptionValue;
}

/**
 * @class RadioOption
 *
 * A radio option for the live example.
 */
export class RadioOption extends Option {
    /**
     * @cfg {Array} options
     *
     * An array of options for the radio selection. Each string is both the
     * displayed name and value.
     *
     * Any data type may be passed as the elements, and {@link #getValue} will
     * return that value/type.
     */
    private options: RadioOptionValue[];

    /**
     * @cfg {*} [defaultValue=false]
     *
     * The value in {@link #options} to select by default.
     */
    private defaultValue: RadioOptionValue = false;

    private $valueDisplayEl: JQuery;

    /**
     * @method constructor
     * @param {Object} cfg The configuration options for this class, specified
     *   in an Object (map).
     */
    constructor(cfg: RadioOptionCfg) {
        super(cfg);

        this.options = cfg.options;
        this.defaultValue = cfg.defaultValue || false;

        this.$containerEl.html(this.generateHtml());
        this.$valueDisplayEl = this.$containerEl.find('#' + this.containerId + '-value');

        this.$containerEl.find(':radio').on('change', this.updateDisplayEl.bind(this));
    }

    /**
     * @private
     * @return {string}
     */
    generateHtml() {
        const containerId = this.containerId,
            optionDescription = this.optionDescription,
            defaultValue = this.defaultValue,
            radiosHtml = this.createRadiosHtml(this.options, defaultValue);

        return `
			<label>${optionDescription}: </label>
			(<code>${this.getApiDocAnchor()}: <span id="${containerId}-value">${this.formatValueForDisplay(
                defaultValue
            )}</span></code>)
			<div class="pl10">${radiosHtml.join('<br>')}</div>
		`;
    }

    /**
     * Creates an array of '<input type="radio">' HTML tags.
     *
     * @private
     * @param {Array} options
     * @param {*} defaultValue
     * @return {String[]}
     */
    createRadiosHtml(options: RadioOptionValue[], defaultValue: RadioOptionValue) {
        return options.map((option, idx) => {
            return `
				<input type="radio" id="${this.containerId}-radio-${option}" name="${
                    this.containerId
                }-radio" data-option-idx="${idx}" ${option === defaultValue ? 'checked' : ''}> 
				<label for="${this.containerId}-radio-${option}">${option}</label>
			`;
        });
    }

    /**
     * @private
     */
    updateDisplayEl() {
        const displayValue = this.formatValueForDisplay(this.getValue());

        this.$valueDisplayEl.html(displayValue);
        this.fireChange();
    }

    /**
     * @return {Boolean}
     */
    getValue() {
        const optionIdx = this.$containerEl.find(':radio:checked').data('option-idx');

        return this.options[optionIdx];
    }

    /**
     * Formats an option value for display.
     *
     * Strings are surrounded with quotes, booleans and numbers are returned
     * as strings as-is.
     *
     * @param {*} value
     */
    formatValueForDisplay(value: string | boolean) {
        return typeof value === 'string' ? `'${value}'` : value + '';
    }
}
