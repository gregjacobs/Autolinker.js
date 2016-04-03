'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*global $ */

/**
 * @abstract
 * @class Option
 *
 * Base class for options that can be modified in the live example.
 */

var Option = function () {

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

	function Option(cfg) {
		_classCallCheck(this, Option);

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


	_createClass(Option, [{
		key: 'getApiDocAnchor',
		value: function getApiDocAnchor() {
			return '<a href="' + this.getApiDocLink() + '" target="autolinkerDocs">' + this.optionName + '</a>';
		}

		/**
   * @protected
   * @return {String}
   */

	}, {
		key: 'getApiDocLink',
		value: function getApiDocLink() {
			var configName = this.optionName.match(/[^.]+/)[0]; // ex: 'urls.schemeMatches' -> 'urls'

			return 'http://gregjacobs.github.io/Autolinker.js/docs/#!/api/Autolinker-cfg-' + configName;
		}

		/**
   * Retrieves the value for the option.
   *
   * @abstract
   * @return {*}
   */

	}, {
		key: 'getValue',
		value: function getValue() {
			throw new Error('Must implement abstract method `getValue()`');
		}

		/**
   * Registers a callback to call when the option is changed.
   *
   * @param {Function} callbackFn
   * @chainable
   */

	}, {
		key: 'onChange',
		value: function onChange(callbackFn) {
			this.changeCallbacks.push(callbackFn);
			return this;
		}

		/**
   * Calls all 'change' callbacks as a result of the option being changed.
   *
   * @protected
   */

	}, {
		key: 'fireChange',
		value: function fireChange() {
			this.changeCallbacks.forEach(function (cb) {
				return cb();
			}); // call all 'change' callbacks
		}
	}]);

	return Option;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*global $, Option */

/**
 * @class CheckboxOption
 *
 * A checkbox option for the live example.
 */

var CheckboxOption = function (_Option) {
	_inherits(CheckboxOption, _Option);

	/**
  * @cfg {Boolean} [defaultValue=false]
  *
  * `true` to check the checkbox by default.
  */

	/**
  * @constructor
  * @param {Object} cfg The configuration options for this class, specified
  *   in an Object (map).
  */

	function CheckboxOption(cfg) {
		_classCallCheck(this, CheckboxOption);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(CheckboxOption).call(this, cfg));

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


	_createClass(CheckboxOption, [{
		key: 'generateHtml',
		value: function generateHtml() {
			var containerId = this.containerId,
			    optionName = this.optionName,
			    optionDescription = this.optionDescription,
			    defaultValue = this.defaultValue,
			    checkboxId = containerId + '-checkbox';

			return '\n\t\t\t<input type="checkbox" id="' + checkboxId + '" ' + (defaultValue ? 'checked' : '') + '>\n\t\t\t<label for="' + checkboxId + '">' + optionDescription + '</label>\n\t\t\t(<code>' + this.getApiDocAnchor() + ': <span id="' + containerId + '-value">' + defaultValue + '</span></code>)\n\t\t';
		}

		/**
   * @private
   */

	}, {
		key: 'updateDisplayEl',
		value: function updateDisplayEl() {
			this.$valueDisplayEl.html(this.getValue() + '');
			this.fireChange();
		}

		/**
   * @return {Boolean}
   */

	}, {
		key: 'getValue',
		value: function getValue() {
			return this.$checkboxEl.prop('checked');
		}
	}]);

	return CheckboxOption;
}(Option);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*global $, Option */

/**
 * @class RadioOption
 *
 * A radio option for the live example.
 */

var RadioOption = function (_Option) {
	_inherits(RadioOption, _Option);

	/**
  * @cfg {Array} options
  *
  * An array of options for the radio selection. Each string is both the
  * displayed name and value.
  *
  * Any data type may be passed as the elements, and {@link #getValue} will
  * return that value/type.
  */

	/**
  * @cfg {Boolean} [defaultValue=false]
  *
  * `true` to check the checkbox by default.
  */

	/**
  * @constructor
  * @param {Object} cfg The configuration options for this class, specified
  *   in an Object (map).
  */

	function RadioOption(cfg) {
		_classCallCheck(this, RadioOption);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RadioOption).call(this, cfg));

		_this.options = [].concat(cfg.options);
		_this.defaultValue = cfg.defaultValue || false;

		_this.$containerEl.html(_this.generateHtml());
		_this.$valueDisplayEl = _this.$containerEl.find('#' + _this.containerId + '-value');

		_this.$containerEl.find(':radio').on('change', _this.updateDisplayEl.bind(_this));
		return _this;
	}

	/**
  * @private
  * @return {string}
  */


	_createClass(RadioOption, [{
		key: 'generateHtml',
		value: function generateHtml() {
			var containerId = this.containerId,
			    optionName = this.optionName,
			    optionDescription = this.optionDescription,
			    defaultValue = this.defaultValue,
			    radiosHtml = this.createRadiosHtml(this.options, defaultValue);

			return '\n\t\t\t<label>' + optionDescription + ': </label>\n\t\t\t(<code>' + this.getApiDocAnchor() + ': <span id="' + containerId + '-value">' + this.formatValueForDisplay(defaultValue) + '</span></code>)\n\t\t\t<div class="pl10">' + radiosHtml.join('<br>') + '</div>\n\t\t';
		}

		/**
   * Creates an array of '<input type="radio">' HTML tags.
   *
   * @private
   * @param {Array} options
   * @param {*} defaultValue
   * @return {String[]}
   */

	}, {
		key: 'createRadiosHtml',
		value: function createRadiosHtml(options, defaultValue) {
			var _this2 = this;

			return options.map(function (option, idx) {
				return '\n\t\t\t\t<input type="radio" id="' + _this2.containerId + '-radio-' + option + '" name="' + _this2.containerId + '-radio" data-option-idx="' + idx + '" ' + (option === _this2.defaultValue ? 'checked' : '') + '> \n\t\t\t\t<label for="' + _this2.containerId + '-radio-' + option + '">' + option + '</label>\n\t\t\t';
			});
		}

		/**
   * @private
   */

	}, {
		key: 'updateDisplayEl',
		value: function updateDisplayEl() {
			var displayValue = this.formatValueForDisplay(this.getValue());

			this.$valueDisplayEl.html(displayValue);
			this.fireChange();
		}

		/**
   * @return {Boolean}
   */

	}, {
		key: 'getValue',
		value: function getValue() {
			var optionIdx = this.$containerEl.find(':radio:checked').data('option-idx');

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

	}, {
		key: 'formatValueForDisplay',
		value: function formatValueForDisplay(value) {
			return typeof value === 'string' ? '\'' + value + '\'' : value + '';
		}
	}]);

	return RadioOption;
}(Option);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*global $, Option */

/**
 * @class TextOption
 *
 * A text field option for the live example.
 */

var TextOption = function (_Option) {
	_inherits(TextOption, _Option);

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

	function TextOption(cfg) {
		_classCallCheck(this, TextOption);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TextOption).call(this, cfg));

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


	_createClass(TextOption, [{
		key: 'generateHtml',
		value: function generateHtml() {
			var containerId = this.containerId,
			    optionName = this.optionName,
			    optionDescription = this.optionDescription,
			    size = this.size,
			    defaultValue = this.defaultValue,
			    textFieldId = containerId + '-textField';

			return '\n\t\t\t<label for="' + textFieldId + '">' + optionDescription + '</label>\n\t\t\t<input type="text" id="' + textFieldId + '" value="' + defaultValue + '" size="' + size + '" class="textfield">\n\t\t\t(<code>' + this.getApiDocAnchor() + '</code>)\n\t\t';
		}

		/**
   * @return {String}
   */

	}, {
		key: 'getValue',
		value: function getValue() {
			return this.$textEl.val();
		}
	}]);

	return TextOption;
}(Option);
'use strict';

/*global $, Autolinker, CheckboxOption, RadioOption, TextOption */
/*jshint browser:true */

$(document).ready(function () {
	var $inputEl = $('#input'),
	    $outputEl = $('#output'),
	    $optionsOutputEl = $('#options-output'),
	    urlsSchemeOption,
	    urlsWwwOption,
	    urlsTldOption,
	    emailOption,
	    phoneOption,
	    twitterOption,
	    hashtagOption,
	    newWindowOption,
	    stripPrefixOption,
	    truncateLengthOption,
	    truncationLocationOption,
	    classNameOption;

	init();

	function init() {
		urlsSchemeOption = new CheckboxOption({ name: 'urls.schemeMatches', description: 'Scheme:// URLs', defaultValue: true }).onChange(autolink);
		urlsWwwOption = new CheckboxOption({ name: 'urls.wwwMatches', description: '\'www\' URLS', defaultValue: true }).onChange(autolink);
		urlsTldOption = new CheckboxOption({ name: 'urls.tldMatches', description: 'TLD URLs', defaultValue: true }).onChange(autolink);
		emailOption = new CheckboxOption({ name: 'email', description: 'Email Addresses', defaultValue: true }).onChange(autolink);
		phoneOption = new CheckboxOption({ name: 'phone', description: 'Phone Numbers', defaultValue: true }).onChange(autolink);
		twitterOption = new CheckboxOption({ name: 'twitter', description: 'Twitter Handles', defaultValue: true }).onChange(autolink);
		hashtagOption = new RadioOption({ name: 'hashtag', description: 'Hashtags', options: [false, 'twitter', 'facebook', 'instagram'], defaultValue: false }).onChange(autolink);

		newWindowOption = new CheckboxOption({ name: 'newWindow', description: 'Open in new window', defaultValue: true }).onChange(autolink);
		stripPrefixOption = new CheckboxOption({ name: 'stripPrefix', description: 'Strip prefix', defaultValue: true }).onChange(autolink);
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
		var inputText = $inputEl.val().replace(/\n/g, '<br>'),
		    optionsObj = createAutolinkerOptionsObj(),
		    linkedHtml = Autolinker.link(inputText, optionsObj);

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
			twitter: twitterOption.getValue(),
			hashtag: hashtagOption.getValue(),

			newWindow: newWindowOption.getValue(),
			stripPrefix: stripPrefixOption.getValue(),
			className: classNameOption.getValue(),
			truncate: {
				length: +truncateLengthOption.getValue(),
				location: truncationLocationOption.getValue()
			}
		};
	}

	function createCodeSample(optionsObj) {
		return ['var autolinker = new Autolinker( {', '    urls : {', '        schemeMatches : ' + optionsObj.urls.schemeMatches + ',', '        wwwMatches    : ' + optionsObj.urls.wwwMatches + ',', '        tldMatches    : ' + optionsObj.urls.tldMatches, '    },', '    email       : ' + optionsObj.email + ',', '    phone       : ' + optionsObj.phone + ',', '    twitter     : ' + optionsObj.twitter + ',', '    hashtag     : ' + (typeof optionsObj.hashtag === 'string' ? "'" + optionsObj.hashtag + "'" : optionsObj.hashtag) + ',', '', '    stripPrefix : ' + optionsObj.stripPrefix + ',', '    newWindow   : ' + optionsObj.newWindow + ',', '', '    truncate : {', '        length   : ' + optionsObj.truncate.length + ',', '        location : \'' + optionsObj.truncate.location + '\'', '    },', '', '    className : \'' + optionsObj.className + '\'', '} );', '', 'var myLinkedHtml = autolinker.link( myText );'].join('\n');
	}

	function beautifyCode(optionsObj) {
		return {
			urls: {
				schemeMatches: urlsSchemeOption.getValue(),
				wwwMatches: urlsWwwOption.getValue(),
				tldMatches: urlsTldOption.getValue()
			},
			email: emailOption.getValue(),
			phone: phoneOption.getValue(),
			twitter: twitterOption.getValue(),
			hashtag: hashtagOption.getValue(),

			newWindow: newWindowOption.getValue(),
			stripPrefix: stripPrefixOption.getValue(),
			className: classNameOption.getValue(),
			truncate: {
				length: +truncateLengthOption.getValue(),
				location: truncationLocationOption.getValue()
			}
		};
	}

	function syncInputScroll() {
		$inputEl.scrollTop($outputEl.scrollTop());
	}

	function syncOutputScroll() {
		$outputEl.scrollTop($inputEl.scrollTop());
	}
});