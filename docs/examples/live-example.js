(function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    // NOTE: THIS IS A GENERATED FILE - DO NOT MODIFY AS YOUR
    // CHANGES WILL BE OVERWRITTEN!!!

    /**
     * @abstract
     * @class Option
     *
     * Base class for options that can be modified in the live example.
     */
    var Option = /** @class */ (function () {
        /**
         * @method constructor
         * @param {OptionCfg} cfg The configuration options for this class,
         *   specified in an Object (map).
         */
        function Option(cfg) {
            this.optionName = cfg.name;
            this.optionDescription = cfg.description;
            this.containerId = 'option-' + this.optionName.replace(/\./g, '-'); // ex: 'truncate.length' -> 'trunctate-length'
            this.$containerEl = $('#' + this.containerId);
            this.changeCallbacks = [];
        }
        /**
         * @protected
         * @return {String}
         */
        Option.prototype.getApiDocAnchor = function () {
            return "<a href=\"".concat(this.getApiDocLink(), "\" target=\"autolinkerDocs\">").concat(this.optionName, "</a>");
        };
        /**
         * @protected
         * @return {String}
         */
        Option.prototype.getApiDocLink = function () {
            var configName = this.optionName.match(/[^.]+/)[0]; // ex: 'urls.schemeMatches' -> 'urls'
            return "http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker-cfg-".concat(configName);
        };
        /**
         * Registers a callback to call when the option is changed.
         *
         * @param {Function} callbackFn
         * @chainable
         */
        Option.prototype.onChange = function (callbackFn) {
            this.changeCallbacks.push(callbackFn);
            return this;
        };
        /**
         * Calls all 'change' callbacks as a result of the option being changed.
         *
         * @protected
         */
        Option.prototype.fireChange = function () {
            this.changeCallbacks.forEach(function (cb) { return cb(); }); // call all 'change' callbacks
        };
        return Option;
    }());

    // NOTE: THIS IS A GENERATED FILE - DO NOT MODIFY AS YOUR
    /**
     * @class CheckboxOption
     *
     * A checkbox option for the live example.
     */
    var CheckboxOption = /** @class */ (function (_super) {
        __extends(CheckboxOption, _super);
        /**
         * @method constructor
         * @param {CheckboxOptionCfg} cfg The configuration options for this
         *   class, specified in an Object (map).
         */
        function CheckboxOption(cfg) {
            var _this = _super.call(this, cfg) || this;
            /**
             * @cfg {Boolean} [defaultValue=false]
             *
             * `true` to check the checkbox by default.
             */
            _this.defaultValue = false;
            _this.defaultValue = cfg.defaultValue || false;
            _this.$containerEl.html(_this.generateHtml());
            _this.$checkboxEl = _this.$containerEl.find(':checkbox').on('change', _this.updateDisplayEl.bind(_this));
            _this.$valueDisplayEl = _this.$containerEl.find('#' + _this.containerId + '-value');
            return _this;
        }
        /**
         * @private
         * @return {string}
         */
        CheckboxOption.prototype.generateHtml = function () {
            var containerId = this.containerId, optionDescription = this.optionDescription, defaultValue = this.defaultValue, checkboxId = containerId + '-checkbox';
            return "\n\t\t\t<input type=\"checkbox\" id=\"".concat(checkboxId, "\" ").concat(defaultValue ? 'checked' : '', ">\n\t\t\t<label for=\"").concat(checkboxId, "\">").concat(optionDescription, "</label>\n\t\t\t(<code>").concat(this.getApiDocAnchor(), ": <span id=\"").concat(containerId, "-value\">").concat(defaultValue, "</span></code>)\n\t\t");
        };
        /**
         * @private
         */
        CheckboxOption.prototype.updateDisplayEl = function () {
            this.$valueDisplayEl.html(this.getValue() + '');
            this.fireChange();
        };
        /**
         * @return {Boolean}
         */
        CheckboxOption.prototype.getValue = function () {
            return this.$checkboxEl.prop('checked');
        };
        return CheckboxOption;
    }(Option));

    // NOTE: THIS IS A GENERATED FILE - DO NOT MODIFY AS YOUR
    /**
     * @class RadioOption
     *
     * A radio option for the live example.
     */
    var RadioOption = /** @class */ (function (_super) {
        __extends(RadioOption, _super);
        /**
         * @method constructor
         * @param {Object} cfg The configuration options for this class, specified
         *   in an Object (map).
         */
        function RadioOption(cfg) {
            var _this = _super.call(this, cfg) || this;
            /**
             * @cfg {*} [defaultValue=false]
             *
             * The value in {@link #options} to select by default.
             */
            _this.defaultValue = false;
            _this.options = [].concat(cfg.options);
            _this.defaultValue = cfg.defaultValue || false;
            _this.$containerEl.html(_this.generateHtml());
            _this.$valueDisplayEl = _this.$containerEl.find('#' + _this.containerId + '-value');
            _this.$containerEl
                .find(':radio').on('change', _this.updateDisplayEl.bind(_this));
            return _this;
        }
        /**
         * @private
         * @return {string}
         */
        RadioOption.prototype.generateHtml = function () {
            var containerId = this.containerId, optionDescription = this.optionDescription, defaultValue = this.defaultValue, radiosHtml = this.createRadiosHtml(this.options, defaultValue);
            return "\n\t\t\t<label>".concat(optionDescription, ": </label>\n\t\t\t(<code>").concat(this.getApiDocAnchor(), ": <span id=\"").concat(containerId, "-value\">").concat(this.formatValueForDisplay(defaultValue), "</span></code>)\n\t\t\t<div class=\"pl10\">").concat(radiosHtml.join('<br>'), "</div>\n\t\t");
        };
        /**
         * Creates an array of '<input type="radio">' HTML tags.
         *
         * @private
         * @param {Array} options
         * @param {*} defaultValue
         * @return {String[]}
         */
        RadioOption.prototype.createRadiosHtml = function (options, defaultValue) {
            var _this = this;
            return options.map(function (option, idx) {
                return "\n\t\t\t\t<input type=\"radio\" id=\"".concat(_this.containerId, "-radio-").concat(option, "\" name=\"").concat(_this.containerId, "-radio\" data-option-idx=\"").concat(idx, "\" ").concat(option === _this.defaultValue ? 'checked' : '', "> \n\t\t\t\t<label for=\"").concat(_this.containerId, "-radio-").concat(option, "\">").concat(option, "</label>\n\t\t\t");
            });
        };
        /**
         * @private
         */
        RadioOption.prototype.updateDisplayEl = function () {
            var displayValue = this.formatValueForDisplay(this.getValue());
            this.$valueDisplayEl.html(displayValue);
            this.fireChange();
        };
        /**
         * @return {Boolean}
         */
        RadioOption.prototype.getValue = function () {
            var optionIdx = this.$containerEl.find(':radio:checked').data('option-idx');
            return this.options[optionIdx];
        };
        /**
         * Formats an option value for display.
         *
         * Strings are surrounded with quotes, booleans and numbers are returned
         * as strings as-is.
         *
         * @param {*} value
         */
        RadioOption.prototype.formatValueForDisplay = function (value) {
            return (typeof value === 'string') ? "'".concat(value, "'") : (value + '');
        };
        return RadioOption;
    }(Option));

    // NOTE: THIS IS A GENERATED FILE - DO NOT MODIFY AS YOUR
    /**
     * @class TextOption
     *
     * A text field option for the live example.
     */
    var TextOption = /** @class */ (function (_super) {
        __extends(TextOption, _super);
        /**
         * @method constructor
         * @param {TextOptionCfg} cfg The configuration options for this class,
         *   specified in an Object (map).
         */
        function TextOption(cfg) {
            var _this = _super.call(this, cfg) || this;
            /**
             * @cfg {Number} [size=10]
             *
             * The `size` attribute of the text field.
             */
            _this.size = 10;
            /**
             * @cfg {Boolean} [defaultValue='']
             *
             * The default value for the option.
             */
            _this.defaultValue = '';
            _this.size = cfg.size || 10;
            _this.defaultValue = cfg.defaultValue || '';
            _this.$containerEl.html(_this.generateHtml());
            _this.$textEl = _this.$containerEl.find('input').on('keyup change', _this.fireChange.bind(_this));
            _this.$valueDisplayEl = _this.$containerEl.find('#' + _this.containerId + '-value');
            return _this;
        }
        /**
         * @private
         * @return {string}
         */
        TextOption.prototype.generateHtml = function () {
            var containerId = this.containerId, optionDescription = this.optionDescription, size = this.size, defaultValue = this.defaultValue, textFieldId = containerId + '-textField';
            return "\n\t\t\t<label for=\"".concat(textFieldId, "\">").concat(optionDescription, "</label>\n\t\t\t<input type=\"text\" id=\"").concat(textFieldId, "\" value=\"").concat(defaultValue, "\" size=\"").concat(size, "\" class=\"textfield\">\n\t\t\t(<code>").concat(this.getApiDocAnchor(), "</code>)\n\t\t");
        };
        /**
         * @return {String}
         */
        TextOption.prototype.getValue = function () {
            return this.$textEl.val();
        };
        return TextOption;
    }(Option));

    // NOTE: THIS IS A GENERATED FILE - DO NOT MODIFY AS YOUR
    $(document).ready(function () {
        var $inputEl = $('#input'), $outputEl = $('#output'), $optionsOutputEl = $('#options-output'), urlsSchemeOption, urlsWwwOption, urlsTldOption, emailOption, phoneOption, mentionOption, hashtagOption, newWindowOption, stripPrefixOption, stripTrailingSlashOption, truncateLengthOption, truncationLocationOption, classNameOption;
        init();
        function init() {
            urlsSchemeOption = new CheckboxOption({ name: 'urls.schemeMatches', description: 'Scheme:// URLs', defaultValue: true }).onChange(autolink);
            urlsWwwOption = new CheckboxOption({ name: 'urls.wwwMatches', description: '\'www\' URLS', defaultValue: true }).onChange(autolink);
            urlsTldOption = new CheckboxOption({ name: 'urls.tldMatches', description: 'TLD URLs', defaultValue: true }).onChange(autolink);
            emailOption = new CheckboxOption({ name: 'email', description: 'Email Addresses', defaultValue: true }).onChange(autolink);
            phoneOption = new CheckboxOption({ name: 'phone', description: 'Phone Numbers', defaultValue: true }).onChange(autolink);
            mentionOption = new RadioOption({ name: 'mention', description: 'Mentions', options: [false, 'twitter', 'instagram', 'soundcloud', 'tiktok'], defaultValue: false }).onChange(autolink);
            hashtagOption = new RadioOption({ name: 'hashtag', description: 'Hashtags', options: [false, 'twitter', 'facebook', 'instagram', 'tiktok'], defaultValue: false }).onChange(autolink);
            newWindowOption = new CheckboxOption({ name: 'newWindow', description: 'Open in new window', defaultValue: true }).onChange(autolink);
            stripPrefixOption = new CheckboxOption({ name: 'stripPrefix', description: 'Strip prefix', defaultValue: true }).onChange(autolink);
            stripTrailingSlashOption = new CheckboxOption({ name: 'stripTrailingSlash', description: 'Strip trailing slash', defaultValue: true }).onChange(autolink);
            truncateLengthOption = new TextOption({ name: 'truncate.length', description: 'Truncate Length', size: 2, defaultValue: '0' }).onChange(autolink);
            truncationLocationOption = new RadioOption({ name: 'truncate.location', description: 'Truncate Location', options: ['end', 'middle', 'smart'], defaultValue: 'end' }).onChange(autolink);
            classNameOption = new TextOption({ name: 'className', description: 'CSS class(es)', size: 10 }).onChange(autolink);
            $inputEl.on('keyup change', autolink);
            $inputEl.on('scroll', syncOutputScroll);
            $outputEl.on('scroll', syncInputScroll);
            // Perform initial autolinking
            autolink();
        }
        function autolink() {
            var inputText = $inputEl.val().replace(/\n/g, '<br>'), optionsObj = createAutolinkerOptionsObj(), linkedHtml = Autolinker.link(inputText, optionsObj);
            $optionsOutputEl.html(createCodeSample(optionsObj));
            $outputEl.html(linkedHtml);
        }
        function createAutolinkerOptionsObj() {
            return {
                urls: {
                    schemeMatches: urlsSchemeOption.getValue(),
                    wwwMatches: urlsWwwOption.getValue(),
                    tldMatches: urlsTldOption.getValue()
                },
                email: emailOption.getValue(),
                phone: phoneOption.getValue(),
                mention: mentionOption.getValue(),
                hashtag: hashtagOption.getValue(),
                newWindow: newWindowOption.getValue(),
                stripPrefix: stripPrefixOption.getValue(),
                stripTrailingSlash: stripTrailingSlashOption.getValue(),
                className: classNameOption.getValue(),
                truncate: {
                    length: +truncateLengthOption.getValue(),
                    location: truncationLocationOption.getValue()
                }
            };
        }
        function createCodeSample(optionsObj) {
            return [
                "var autolinker = new Autolinker( {",
                "    urls : {",
                "        schemeMatches : ".concat(optionsObj.urls.schemeMatches, ","),
                "        wwwMatches    : ".concat(optionsObj.urls.wwwMatches, ","),
                "        tldMatches    : ".concat(optionsObj.urls.tldMatches),
                "    },",
                "    email       : ".concat(optionsObj.email, ","),
                "    phone       : ".concat(optionsObj.phone, ","),
                "    mention     : ".concat(typeof optionsObj.mention === 'string' ? "'" + optionsObj.mention + "'" : optionsObj.mention, ","),
                "    hashtag     : ".concat(typeof optionsObj.hashtag === 'string' ? "'" + optionsObj.hashtag + "'" : optionsObj.hashtag, ","),
                "",
                "    stripPrefix : ".concat(optionsObj.stripPrefix, ","),
                "    stripTrailingSlash : ".concat(optionsObj.stripTrailingSlash, ","),
                "    newWindow   : ".concat(optionsObj.newWindow, ","),
                "",
                "    truncate : {",
                "        length   : ".concat(optionsObj.truncate.length, ","),
                "        location : '".concat(optionsObj.truncate.location, "'"),
                "    },",
                "",
                "    className : '".concat(optionsObj.className, "'"),
                "} );",
                "",
                "var myLinkedHtml = autolinker.link( myText );"
            ].join('\n');
        }
        function syncInputScroll() {
            $inputEl.scrollTop($outputEl.scrollTop());
        }
        function syncOutputScroll() {
            $outputEl.scrollTop($inputEl.scrollTop());
        }
    });

})();
