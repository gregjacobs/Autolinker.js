import { Option, OptionCfg } from './Option';

interface CheckboxOptionCfg extends OptionCfg {
    defaultValue?: boolean;
}

/**
 * @class CheckboxOption
 *
 * A checkbox option for the live example.
 */
export class CheckboxOption extends Option {
    /**
     * @cfg {Boolean} [defaultValue=false]
     *
     * `true` to check the checkbox by default.
     */
    private defaultValue: boolean = false;

    private $checkboxEl: JQuery;
    private $valueDisplayEl: JQuery;

    /**
     * @method constructor
     * @param {CheckboxOptionCfg} cfg The configuration options for this
     *   class, specified in an Object (map).
     */
    constructor(cfg: CheckboxOptionCfg) {
        super(cfg);

        this.defaultValue = cfg.defaultValue || false;

        this.$containerEl.html(this.generateHtml());
        this.$checkboxEl = this.$containerEl
            .find(':checkbox')
            .on('change', this.updateDisplayEl.bind(this));
        this.$valueDisplayEl = this.$containerEl.find('#' + this.containerId + '-value');
    }

    /**
     * @private
     * @return {string}
     */
    private generateHtml() {
        const containerId = this.containerId,
            optionDescription = this.optionDescription,
            defaultValue = this.defaultValue,
            checkboxId = containerId + '-checkbox';

        return `
			<input type="checkbox" id="${checkboxId}" ${defaultValue ? 'checked' : ''}>
			<label for="${checkboxId}">${optionDescription}</label>
			(<code>${this.getApiDocAnchor()}: <span id="${containerId}-value">${defaultValue}</span></code>)
		`;
    }

    /**
     * @private
     */
    private updateDisplayEl() {
        this.$valueDisplayEl.html(this.getValue() + '');
        this.fireChange();
    }

    /**
     * @return {Boolean}
     */
    getValue() {
        return this.$checkboxEl.prop('checked');
    }
}
