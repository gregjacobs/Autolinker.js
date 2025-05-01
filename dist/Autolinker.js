/*!
 * Autolinker.js
 * v4.1.5
 *
 * Copyright(c) 2025 Gregory Jacobs <greg@greg-jacobs.com>
 * MIT License
 *
 * https://github.com/gregjacobs/Autolinker.js
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Autolinker = factory());
})(this, (function () { 'use strict';

    /******************************************************************************
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
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */

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

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    // Important: this file is generated from the 'build' script and should not be
    // edited directly
    var version = '4.1.5';

    var hasOwnProperty = Object.prototype.hasOwnProperty;
    /**
     * Simpler helper method to check for a boolean type simply for the benefit of
     * gaining better compression when minified by not needing to have multiple
     * `typeof` comparisons in the codebase.
     */
    function isBoolean(value) {
        return typeof value === 'boolean';
    }
    /**
     * Truncates the `str` at `len - ellipsisChars.length`, and adds the `ellipsisChars` to the
     * end of the string (by default, two periods: '..'). If the `str` length does not exceed
     * `len`, the string will be returned unchanged.
     *
     * @param {String} str The string to truncate and add an ellipsis to.
     * @param {Number} truncateLen The length to truncate the string at.
     * @param {String} [ellipsisChars=...] The ellipsis character(s) to add to the end of `str`
     *   when truncated. Defaults to '...'
     */
    function ellipsis(str, truncateLen, ellipsisChars) {
        var ellipsisLength;
        if (str.length > truncateLen) {
            if (ellipsisChars == null) {
                ellipsisChars = '&hellip;';
                ellipsisLength = 3;
            }
            else {
                ellipsisLength = ellipsisChars.length;
            }
            str = str.substring(0, truncateLen - ellipsisLength) + ellipsisChars;
        }
        return str;
    }
    /**
     * Removes array elements based on a filtering function. Mutates the input
     * array.
     *
     * Using this instead of the ES5 Array.prototype.filter() function to prevent
     * creating many new arrays in memory for filtering.
     *
     * @param arr The array to remove elements from. This array is mutated.
     * @param fn The predicate function which should return `true` to remove an
     *   element.
     */
    function removeWithPredicate(arr, fn) {
        for (var i = arr.length - 1; i >= 0; i--) {
            if (fn(arr[i]) === true) {
                arr.splice(i, 1);
            }
        }
    }
    /**
     * Function that should never be called but is used to check that every
     * enum value is handled using TypeScript's 'never' type.
     */
    /* istanbul ignore next */
    function assertNever(theValue) {
        throw new Error("Unhandled case for value: '".concat(theValue, "'"));
    }

    // Regular expression to match whitespace
    var whitespaceRe = /\s+/;
    /**
     * @class Autolinker.HtmlTag
     * @extends Object
     *
     * Represents an HTML tag, which can be used to easily build/modify HTML tags programmatically.
     *
     * Autolinker uses this abstraction to create HTML tags, and then write them out as strings. You may also use
     * this class in your code, especially within a {@link Autolinker#replaceFn replaceFn}.
     *
     * ## Examples
     *
     * Example instantiation:
     *
     *     var tag = new Autolinker.HtmlTag( {
     *         tagName : 'a',
     *         attrs   : { 'href': 'http://google.com', 'class': 'external-link' },
     *         innerHtml : 'Google'
     *     } );
     *
     *     tag.toAnchorString();  // <a href="http://google.com" class="external-link">Google</a>
     *
     *     // Individual accessor methods
     *     tag.getTagName();                 // 'a'
     *     tag.getAttr( 'href' );            // 'http://google.com'
     *     tag.hasClass( 'external-link' );  // true
     *
     *
     * Using mutator methods (which may be used in combination with instantiation config properties):
     *
     *     var tag = new Autolinker.HtmlTag();
     *     tag.setTagName( 'a' );
     *     tag.setAttr( 'href', 'http://google.com' );
     *     tag.addClass( 'external-link' );
     *     tag.setInnerHtml( 'Google' );
     *
     *     tag.getTagName();                 // 'a'
     *     tag.getAttr( 'href' );            // 'http://google.com'
     *     tag.hasClass( 'external-link' );  // true
     *
     *     tag.toAnchorString();  // <a href="http://google.com" class="external-link">Google</a>
     *
     *
     * ## Example use within a {@link Autolinker#replaceFn replaceFn}
     *
     *     var html = Autolinker.link( "Test google.com", {
     *         replaceFn : function( match ) {
     *             var tag = match.buildTag();  // returns an {@link Autolinker.HtmlTag} instance, configured with the Match's href and anchor text
     *             tag.setAttr( 'rel', 'nofollow' );
     *
     *             return tag;
     *         }
     *     } );
     *
     *     // generated html:
     *     //   Test <a href="http://google.com" target="_blank" rel="nofollow">google.com</a>
     *
     *
     * ## Example use with a new tag for the replacement
     *
     *     var html = Autolinker.link( "Test google.com", {
     *         replaceFn : function( match ) {
     *             var tag = new Autolinker.HtmlTag( {
     *                 tagName : 'button',
     *                 attrs   : { 'title': 'Load URL: ' + match.getAnchorHref() },
     *                 innerHtml : 'Load URL: ' + match.getAnchorText()
     *             } );
     *
     *             return tag;
     *         }
     *     } );
     *
     *     // generated html:
     *     //   Test <button title="Load URL: http://google.com">Load URL: google.com</button>
     */
    var HtmlTag = /** @class */ (function () {
        /**
         * @method constructor
         * @param {Object} [cfg] The configuration properties for this class, in an Object (map)
         */
        function HtmlTag(cfg) {
            if (cfg === void 0) { cfg = {}; }
            /**
             * @cfg {String} tagName
             *
             * The tag name. Ex: 'a', 'button', etc.
             *
             * Not required at instantiation time, but should be set using {@link #setTagName} before {@link #toAnchorString}
             * is executed.
             */
            this.tagName = ''; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {Object.<String, String>} attrs
             *
             * An key/value Object (map) of attributes to create the tag with. The keys are the attribute names, and the
             * values are the attribute values.
             */
            this.attrs = {}; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {String} innerHTML
             *
             * The inner HTML for the tag.
             */
            this.innerHTML = ''; // default value just to get the above doc comment in the ES5 output and documentation generator
            this.tagName = cfg.tagName || '';
            this.attrs = cfg.attrs || {};
            this.innerHTML = cfg.innerHtml || cfg.innerHTML || ''; // accept either the camelCased form or the fully capitalized acronym as in the DOM
        }
        /**
         * Sets the tag name that will be used to generate the tag with.
         *
         * @param {String} tagName
         * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
         */
        HtmlTag.prototype.setTagName = function (tagName) {
            this.tagName = tagName;
            return this;
        };
        /**
         * Retrieves the tag name.
         *
         * @return {String}
         */
        HtmlTag.prototype.getTagName = function () {
            return this.tagName;
        };
        /**
         * Sets an attribute on the HtmlTag.
         *
         * @param {String} attrName The attribute name to set.
         * @param {String} attrValue The attribute value to set.
         * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
         */
        HtmlTag.prototype.setAttr = function (attrName, attrValue) {
            var tagAttrs = this.getAttrs();
            tagAttrs[attrName] = attrValue;
            return this;
        };
        /**
         * Retrieves an attribute from the HtmlTag. If the attribute does not exist, returns `undefined`.
         *
         * @param {String} attrName The attribute name to retrieve.
         * @return {String} The attribute's value, or `undefined` if it does not exist on the HtmlTag.
         */
        HtmlTag.prototype.getAttr = function (attrName) {
            return this.getAttrs()[attrName];
        };
        /**
         * Sets one or more attributes on the HtmlTag.
         *
         * @param {Object.<String, String>} attrs A key/value Object (map) of the attributes to set.
         * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
         */
        HtmlTag.prototype.setAttrs = function (attrs) {
            Object.assign(this.getAttrs(), attrs);
            return this;
        };
        /**
         * Retrieves the attributes Object (map) for the HtmlTag.
         *
         * @return {Object.<String, String>} A key/value object of the attributes for the HtmlTag.
         */
        HtmlTag.prototype.getAttrs = function () {
            return this.attrs;
        };
        /**
         * Sets the provided `cssClass`, overwriting any current CSS classes on the HtmlTag.
         *
         * @param {String} cssClass One or more space-separated CSS classes to set (overwrite).
         * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
         */
        HtmlTag.prototype.setClass = function (cssClass) {
            return this.setAttr('class', cssClass);
        };
        /**
         * Convenience method to add one or more CSS classes to the HtmlTag. Will not add duplicate CSS classes.
         *
         * @param {String} cssClass One or more space-separated CSS classes to add.
         * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
         */
        HtmlTag.prototype.addClass = function (cssClass) {
            var classAttr = this.getClass();
            var classes = !classAttr ? [] : classAttr.split(whitespaceRe);
            var newClasses = cssClass.split(whitespaceRe);
            var newClass;
            while ((newClass = newClasses.shift())) {
                if (classes.indexOf(newClass) === -1) {
                    classes.push(newClass);
                }
            }
            this.getAttrs()['class'] = classes.join(' ');
            return this;
        };
        /**
         * Convenience method to remove one or more CSS classes from the HtmlTag.
         *
         * @param {String} cssClass One or more space-separated CSS classes to remove.
         * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
         */
        HtmlTag.prototype.removeClass = function (cssClass) {
            var classAttr = this.getClass();
            var classes = !classAttr ? [] : classAttr.split(whitespaceRe);
            var removeClasses = cssClass.split(whitespaceRe);
            var removeClass;
            while (classes.length && (removeClass = removeClasses.shift())) {
                var idx = classes.indexOf(removeClass);
                if (idx !== -1) {
                    classes.splice(idx, 1);
                }
            }
            this.getAttrs()['class'] = classes.join(' ');
            return this;
        };
        /**
         * Convenience method to retrieve the CSS class(es) for the HtmlTag, which will each be separated by spaces when
         * there are multiple.
         *
         * @return {String}
         */
        HtmlTag.prototype.getClass = function () {
            return this.getAttrs()['class'] || '';
        };
        /**
         * Convenience method to check if the tag has a CSS class or not.
         *
         * @param {String} cssClass The CSS class to check for.
         * @return {Boolean} `true` if the HtmlTag has the CSS class, `false` otherwise.
         */
        HtmlTag.prototype.hasClass = function (cssClass) {
            return (' ' + this.getClass() + ' ').indexOf(' ' + cssClass + ' ') !== -1;
        };
        /**
         * Sets the inner HTML for the tag.
         *
         * @param {String} html The inner HTML to set.
         * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
         */
        HtmlTag.prototype.setInnerHTML = function (html) {
            this.innerHTML = html;
            return this;
        };
        /**
         * Backwards compatibility method name.
         *
         * @param {String} html The inner HTML to set.
         * @return {Autolinker.HtmlTag} This HtmlTag instance, so that method calls may be chained.
         */
        HtmlTag.prototype.setInnerHtml = function (html) {
            return this.setInnerHTML(html);
        };
        /**
         * Retrieves the inner HTML for the tag.
         *
         * @return {String}
         */
        HtmlTag.prototype.getInnerHTML = function () {
            return this.innerHTML || '';
        };
        /**
         * Backward compatibility method name.
         *
         * @return {String}
         */
        HtmlTag.prototype.getInnerHtml = function () {
            return this.getInnerHTML();
        };
        /**
         * Generates the HTML string for the tag.
         *
         * @return {String}
         */
        HtmlTag.prototype.toAnchorString = function () {
            var tagName = this.getTagName();
            var attrsStr = this.buildAttrsStr();
            attrsStr = attrsStr ? ' ' + attrsStr : ''; // prepend a space if there are actually attributes
            return ['<', tagName, attrsStr, '>', this.getInnerHtml(), '</', tagName, '>'].join('');
        };
        /**
         * Support method for {@link #toAnchorString}, returns the string space-separated key="value" pairs, used to populate
         * the stringified HtmlTag.
         *
         * @protected
         * @return {String} Example return: `attr1="value1" attr2="value2"`
         */
        HtmlTag.prototype.buildAttrsStr = function () {
            var attrs = this.getAttrs(), attrsArr = [];
            for (var prop in attrs) {
                if (hasOwnProperty.call(attrs, prop)) {
                    attrsArr.push(prop + '="' + attrs[prop] + '"');
                }
            }
            return attrsArr.join(' ');
        };
        return HtmlTag;
    }());

    /**
     * Date: 2015-10-05
     * Author: Kasper Søfren <soefritz@gmail.com> (https://github.com/kafoso)
     *
     * A truncation feature, where the ellipsis will be placed at a section within
     * the URL making it still somewhat human readable.
     *
     * @param {String} url						 A URL.
     * @param {Number} truncateLen		 The maximum length of the truncated output URL string.
     * @param {String} ellipsisChars	 The characters to place within the url, e.g. "...".
     * @return {String} The truncated URL.
     */
    function truncateSmart(url, truncateLen, ellipsisChars) {
        var ellipsisLengthBeforeParsing;
        var ellipsisLength;
        if (ellipsisChars == null) {
            ellipsisChars = '&hellip;';
            ellipsisLength = 3;
            ellipsisLengthBeforeParsing = 8;
        }
        else {
            ellipsisLength = ellipsisChars.length;
            ellipsisLengthBeforeParsing = ellipsisChars.length;
        }
        // If the URL is shorter than the truncate length, return it as is
        if (url.length <= truncateLen) {
            return url;
        }
        var availableLength = truncateLen - ellipsisLength;
        var urlObj = parseUrl(url);
        // Clean up the URL by removing any malformed query string
        // (e.g. "?foo=bar?ignorethis")
        if (urlObj.query) {
            var matchQuery = urlObj.query.match(/^(.*?)(?=(\?|#))(.*?)$/i);
            if (matchQuery) {
                // Malformed URL; two or more "?". Removed any content behind the 2nd.
                urlObj.query = urlObj.query.substr(0, matchQuery[1].length);
                url = buildUrl(urlObj);
            }
        }
        if (url.length <= truncateLen) {
            return url; // removing a malformed query string brought the URL under the truncateLength
        }
        // Clean up the URL by removing 'www.' from the host if it exists
        if (urlObj.host) {
            urlObj.host = urlObj.host.replace(/^www\./, '');
            url = buildUrl(urlObj);
        }
        if (url.length <= truncateLen) {
            return url; // removing 'www.' brought the URL under the truncateLength
        }
        // Process and build the truncated URL, starting with the hostname
        var truncatedUrl = '';
        if (urlObj.host) {
            truncatedUrl += urlObj.host;
        }
        if (truncatedUrl.length >= availableLength) {
            if (urlObj.host.length === truncateLen) {
                return (urlObj.host.substr(0, truncateLen - ellipsisLength) + ellipsisChars).substr(0, availableLength + ellipsisLengthBeforeParsing);
            }
            return buildSegment(truncatedUrl, availableLength, ellipsisChars).substr(0, availableLength + ellipsisLengthBeforeParsing);
        }
        // If we still have available chars left, add the path and query string
        var pathAndQuery = '';
        if (urlObj.path) {
            pathAndQuery += '/' + urlObj.path;
        }
        if (urlObj.query) {
            pathAndQuery += '?' + urlObj.query;
        }
        if (pathAndQuery) {
            if ((truncatedUrl + pathAndQuery).length >= availableLength) {
                if ((truncatedUrl + pathAndQuery).length == truncateLen) {
                    return (truncatedUrl + pathAndQuery).substr(0, truncateLen);
                }
                var remainingAvailableLength = availableLength - truncatedUrl.length;
                return (truncatedUrl + buildSegment(pathAndQuery, remainingAvailableLength, ellipsisChars)).substr(0, availableLength + ellipsisLengthBeforeParsing);
            }
            else {
                truncatedUrl += pathAndQuery;
            }
        }
        // If we still have available chars left, add the fragment
        if (urlObj.fragment) {
            var fragment = '#' + urlObj.fragment;
            if ((truncatedUrl + fragment).length >= availableLength) {
                if ((truncatedUrl + fragment).length == truncateLen) {
                    return (truncatedUrl + fragment).substr(0, truncateLen);
                }
                var remainingAvailableLength2 = availableLength - truncatedUrl.length;
                return (truncatedUrl + buildSegment(fragment, remainingAvailableLength2, ellipsisChars)).substr(0, availableLength + ellipsisLengthBeforeParsing);
            }
            else {
                truncatedUrl += fragment;
            }
        }
        // If we still have available chars left, add the scheme
        if (urlObj.scheme && urlObj.host) {
            var scheme = urlObj.scheme + '://';
            if ((truncatedUrl + scheme).length < availableLength) {
                return (scheme + truncatedUrl).substr(0, truncateLen);
            }
        }
        if (truncatedUrl.length <= truncateLen) {
            return truncatedUrl;
        }
        var end = '';
        if (availableLength > 0) {
            end = truncatedUrl.substr(-1 * Math.floor(availableLength / 2));
        }
        return (truncatedUrl.substr(0, Math.ceil(availableLength / 2)) + ellipsisChars + end).substr(0, availableLength + ellipsisLengthBeforeParsing);
    }
    /**
     * Parses a URL into its components: scheme, host, path, query, and fragment.
     */
    function parseUrl(url) {
        // Functionality inspired by PHP function of same name
        var urlObj = {};
        var urlSub = url;
        // Parse scheme
        var match = urlSub.match(/^([a-z]+):\/\//i);
        if (match) {
            urlObj.scheme = match[1];
            urlSub = urlSub.slice(match[0].length);
        }
        // Parse host
        match = urlSub.match(/^(.*?)(?=(\?|#|\/|$))/i);
        if (match) {
            urlObj.host = match[1];
            urlSub = urlSub.slice(match[0].length);
        }
        // Parse path
        match = urlSub.match(/^\/(.*?)(?=(\?|#|$))/i);
        if (match) {
            urlObj.path = match[1];
            urlSub = urlSub.slice(match[0].length);
        }
        // Parse query
        match = urlSub.match(/^\?(.*?)(?=(#|$))/i);
        if (match) {
            urlObj.query = match[1];
            urlSub = urlSub.slice(match[0].length);
        }
        // Parse fragment
        match = urlSub.match(/^#(.*?)$/i);
        if (match) {
            urlObj.fragment = match[1];
            //urlSub = urlSub.slice(match[0].length);  -- not used. Uncomment if adding another block.
        }
        return urlObj;
    }
    function buildUrl(urlObj) {
        var url = '';
        if (urlObj.scheme && urlObj.host) {
            url += urlObj.scheme + '://';
        }
        if (urlObj.host) {
            url += urlObj.host;
        }
        if (urlObj.path) {
            url += '/' + urlObj.path;
        }
        if (urlObj.query) {
            url += '?' + urlObj.query;
        }
        if (urlObj.fragment) {
            url += '#' + urlObj.fragment;
        }
        return url;
    }
    function buildSegment(segment, remainingAvailableLength, ellipsisChars) {
        var remainingAvailableLengthHalf = remainingAvailableLength / 2;
        var startOffset = Math.ceil(remainingAvailableLengthHalf);
        var endOffset = -1 * Math.floor(remainingAvailableLengthHalf);
        var end = '';
        if (endOffset < 0) {
            end = segment.substr(endOffset);
        }
        return segment.substr(0, startOffset) + ellipsisChars + end;
    }

    /**
     * Date: 2015-10-05
     * Author: Kasper Søfren <soefritz@gmail.com> (https://github.com/kafoso)
     *
     * A truncation feature, where the ellipsis will be placed in the dead-center of the URL.
     *
     * @param {String} url             A URL.
     * @param {Number} truncateLen     The maximum length of the truncated output URL string.
     * @param {String} ellipsisChars   The characters to place within the url, e.g. "..".
     * @return {String} The truncated URL.
     */
    function truncateMiddle(url, truncateLen, ellipsisChars) {
        if (url.length <= truncateLen) {
            return url;
        }
        var ellipsisLengthBeforeParsing;
        var ellipsisLength;
        if (ellipsisChars == null) {
            ellipsisChars = '&hellip;';
            ellipsisLengthBeforeParsing = 8;
            ellipsisLength = 3;
        }
        else {
            ellipsisLengthBeforeParsing = ellipsisChars.length;
            ellipsisLength = ellipsisChars.length;
        }
        var availableLength = truncateLen - ellipsisLength;
        var end = '';
        if (availableLength > 0) {
            end = url.substr(-1 * Math.floor(availableLength / 2));
        }
        return (url.substr(0, Math.ceil(availableLength / 2)) + ellipsisChars + end).substr(0, availableLength + ellipsisLengthBeforeParsing);
    }

    /**
     * A truncation feature where the ellipsis will be placed at the end of the URL.
     *
     * @param {String} anchorText
     * @param {Number} truncateLen The maximum length of the truncated output URL string.
     * @param {String} ellipsisChars The characters to place within the url, e.g. "..".
     * @return {String} The truncated URL.
     */
    function truncateEnd(anchorText, truncateLen, ellipsisChars) {
        return ellipsis(anchorText, truncateLen, ellipsisChars);
    }

    /**
     * @protected
     * @class Autolinker.AnchorTagBuilder
     * @extends Object
     *
     * Builds anchor (&lt;a&gt;) tags for the Autolinker utility when a match is
     * found.
     *
     * Normally this class is instantiated, configured, and used internally by an
     * {@link Autolinker} instance, but may actually be used indirectly in a
     * {@link Autolinker#replaceFn replaceFn} to create {@link Autolinker.HtmlTag HtmlTag}
     * instances which may be modified before returning from the
     * {@link Autolinker#replaceFn replaceFn}. For example:
     *
     *     var html = Autolinker.link("Test google.com", {
     *         replaceFn: function(match) {
     *             var tag = match.buildTag();  // returns an {@link Autolinker.HtmlTag} instance
     *             tag.setAttr('rel', 'nofollow');
     *
     *             return tag;
     *         }
     *     });
     *
     *     // generated html:
     *     //   Test <a href="http://google.com" target="_blank" rel="nofollow">google.com</a>
     */
    var AnchorTagBuilder = /** @class */ (function () {
        /**
         * @method constructor
         * @param {Object} [cfg] The configuration options for the AnchorTagBuilder instance, specified in an Object (map).
         */
        function AnchorTagBuilder(cfg) {
            if (cfg === void 0) { cfg = {}; }
            /**
             * @cfg {Boolean} newWindow
             * @inheritdoc Autolinker#newWindow
             */
            this.newWindow = false; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {Object} truncate
             * @inheritdoc Autolinker#truncate
             */
            this.truncate = {}; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {String} className
             * @inheritdoc Autolinker#className
             */
            this.className = ''; // default value just to get the above doc comment in the ES5 output and documentation generator
            this.newWindow = cfg.newWindow || false;
            this.truncate = cfg.truncate || {};
            this.className = cfg.className || '';
        }
        /**
         * Generates the actual anchor (&lt;a&gt;) tag to use in place of the
         * matched text, via its `match` object.
         *
         * @param match The Match instance to generate an anchor tag from.
         * @return The HtmlTag instance for the anchor tag.
         */
        AnchorTagBuilder.prototype.build = function (match) {
            return new HtmlTag({
                tagName: 'a',
                attrs: this.createAttrs(match),
                innerHtml: this.processAnchorText(match.getAnchorText()),
            });
        };
        /**
         * Creates the Object (map) of the HTML attributes for the anchor (&lt;a&gt;)
         *   tag being generated.
         *
         * @protected
         * @param match The Match instance to generate an anchor tag from.
         * @return A key/value Object (map) of the anchor tag's attributes.
         */
        AnchorTagBuilder.prototype.createAttrs = function (match) {
            var attrs = {
                href: match.getAnchorHref(), // we'll always have the `href` attribute
            };
            var cssClass = this.createCssClass(match);
            if (cssClass) {
                attrs['class'] = cssClass;
            }
            if (this.newWindow) {
                attrs['target'] = '_blank';
                attrs['rel'] = 'noopener noreferrer'; // Issue #149. See https://mathiasbynens.github.io/rel-noopener/
            }
            if (this.truncate.length && this.truncate.length < match.getAnchorText().length) {
                attrs['title'] = match.getAnchorHref();
            }
            return attrs;
        };
        /**
         * Creates the CSS class that will be used for a given anchor tag, based on
         * the `matchType` and the {@link #className} config.
         *
         * Example returns:
         *
         * - ""                                      // no {@link #className}
         * - "myLink myLink-url"                     // url match
         * - "myLink myLink-email"                   // email match
         * - "myLink myLink-phone"                   // phone match
         * - "myLink myLink-hashtag"                 // hashtag match
         * - "myLink myLink-mention myLink-twitter"  // mention match with Twitter service
         *
         * @protected
         * @param match The Match instance to generate an
         *   anchor tag from.
         * @return The CSS class string for the link. Example return:
         *   "myLink myLink-url". If no {@link #className} was configured, returns
         *   an empty string.
         */
        AnchorTagBuilder.prototype.createCssClass = function (match) {
            var className = this.className;
            if (!className) {
                return '';
            }
            else {
                var returnClasses = [className], cssClassSuffixes = match.getCssClassSuffixes();
                for (var i = 0, len = cssClassSuffixes.length; i < len; i++) {
                    returnClasses.push(className + '-' + cssClassSuffixes[i]);
                }
                return returnClasses.join(' ');
            }
        };
        /**
         * Processes the `anchorText` by truncating the text according to the
         * {@link #truncate} config.
         *
         * @private
         * @param anchorText The anchor tag's text (i.e. what will be
         *   displayed).
         * @return The processed `anchorText`.
         */
        AnchorTagBuilder.prototype.processAnchorText = function (anchorText) {
            anchorText = this.doTruncate(anchorText);
            return anchorText;
        };
        /**
         * Performs the truncation of the `anchorText` based on the {@link #truncate}
         * option. If the `anchorText` is longer than the length specified by the
         * {@link #truncate} option, the truncation is performed based on the
         * `location` property. See {@link #truncate} for details.
         *
         * @private
         * @param anchorText The anchor tag's text (i.e. what will be
         *   displayed).
         * @return The truncated anchor text.
         */
        AnchorTagBuilder.prototype.doTruncate = function (anchorText) {
            var truncate = this.truncate;
            if (!truncate.length)
                return anchorText;
            var truncateLength = truncate.length, truncateLocation = truncate.location;
            if (truncateLocation === 'smart') {
                return truncateSmart(anchorText, truncateLength);
            }
            else if (truncateLocation === 'middle') {
                return truncateMiddle(anchorText, truncateLength);
            }
            else {
                return truncateEnd(anchorText, truncateLength);
            }
        };
        return AnchorTagBuilder;
    }());

    /**
     * @abstract
     * @class Autolinker.match.AbstractMatch
     *
     * Represents a match found in an input string which should be Autolinked. A Match object is what is provided in a
     * {@link Autolinker#replaceFn replaceFn}, and may be used to query for details about the match.
     *
     * For example:
     *
     *     var input = "...";  // string with URLs, Email Addresses, and Mentions (Twitter, Instagram, Soundcloud)
     *
     *     var linkedText = Autolinker.link( input, {
     *         replaceFn : function( match ) {
     *             console.log( "href = ", match.getAnchorHref() );
     *             console.log( "text = ", match.getAnchorText() );
     *
     *             switch( match.getType() ) {
     *                 case 'url' :
     *                     console.log( "url: ", match.getUrl() );
     *
     *                 case 'email' :
     *                     console.log( "email: ", match.getEmail() );
     *
     *                 case 'mention' :
     *                     console.log( "mention: ", match.getMention() );
     *             }
     *         }
     *     } );
     *
     * See the {@link Autolinker} class for more details on using the {@link Autolinker#replaceFn replaceFn}.
     */
    var AbstractMatch = /** @class */ (function () {
        /**
         * @member Autolinker.match.Match
         * @method constructor
         * @param {Object} cfg The configuration properties for the Match
         *   instance, specified in an Object (map).
         */
        function AbstractMatch(cfg) {
            /**
             * @cfg {Autolinker.AnchorTagBuilder} tagBuilder (required)
             *
             * Reference to the AnchorTagBuilder instance to use to generate an anchor
             * tag for the Match.
             */
            // @ts-expect-error Property used just to get the above doc comment into the ES5 output and documentation generator
            this._ = null;
            /**
             * @cfg {String} matchedText (required)
             *
             * The original text that was matched by the {@link Autolinker.matcher.Matcher}.
             */
            this.matchedText = ''; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {Number} offset (required)
             *
             * The offset of where the match was made in the input string.
             */
            this.offset = 0; // default value just to get the above doc comment in the ES5 output and documentation generator
            this.tagBuilder = cfg.tagBuilder;
            this.matchedText = cfg.matchedText;
            this.offset = cfg.offset;
        }
        /**
         * Returns the original text that was matched.
         *
         * @return {String}
         */
        AbstractMatch.prototype.getMatchedText = function () {
            return this.matchedText;
        };
        /**
         * Sets the {@link #offset} of where the match was made in the input string.
         *
         * A {@link Autolinker.matcher.Matcher} will be fed only HTML text nodes,
         * and will therefore set an original offset that is relative to the HTML
         * text node itself. However, we want this offset to be relative to the full
         * HTML input string, and thus if using {@link Autolinker#parse} (rather
         * than calling a {@link Autolinker.matcher.Matcher} directly), then this
         * offset is corrected after the Matcher itself has done its job.
         *
         * @private
         * @param {Number} offset
         */
        AbstractMatch.prototype.setOffset = function (offset) {
            this.offset = offset;
        };
        /**
         * Returns the offset of where the match was made in the input string. This
         * is the 0-based index of the match.
         *
         * @return {Number}
         */
        AbstractMatch.prototype.getOffset = function () {
            return this.offset;
        };
        /**
         * Returns the CSS class suffix(es) for this match.
         *
         * A CSS class suffix is appended to the {@link Autolinker#className} in
         * the {@link Autolinker.AnchorTagBuilder} when a match is translated into
         * an anchor tag.
         *
         * For example, if {@link Autolinker#className} was configured as 'myLink',
         * and this method returns `[ 'url' ]`, the final class name of the element
         * will become: 'myLink myLink-url'.
         *
         * The match may provide multiple CSS class suffixes to be appended to the
         * {@link Autolinker#className} in order to facilitate better styling
         * options for different match criteria. See {@link Autolinker.match.Mention}
         * for an example.
         *
         * By default, this method returns a single array with the match's
         * {@link #getType type} name, but may be overridden by subclasses.
         *
         * @return {String[]}
         */
        AbstractMatch.prototype.getCssClassSuffixes = function () {
            return [this.type];
        };
        /**
         * Builds and returns an {@link Autolinker.HtmlTag} instance based on the
         * Match.
         *
         * This can be used to easily generate anchor tags from matches, and either
         * return their HTML string, or modify them before doing so.
         *
         * Example Usage:
         *
         *     var tag = match.buildTag();
         *     tag.addClass( 'cordova-link' );
         *     tag.setAttr( 'target', '_system' );
         *
         *     tag.toAnchorString();  // <a href="http://google.com" class="cordova-link" target="_system">Google</a>
         *
         * Example Usage in {@link Autolinker#replaceFn}:
         *
         *     var html = Autolinker.link( "Test google.com", {
         *         replaceFn : function( match ) {
         *             var tag = match.buildTag();  // returns an {@link Autolinker.HtmlTag} instance
         *             tag.setAttr( 'rel', 'nofollow' );
         *
         *             return tag;
         *         }
         *     } );
         *
         *     // generated html:
         *     //   Test <a href="http://google.com" target="_blank" rel="nofollow">google.com</a>
         */
        AbstractMatch.prototype.buildTag = function () {
            return this.tagBuilder.build(this);
        };
        return AbstractMatch;
    }());

    // NOTE: THIS FILE IS GENERATED. DO NOT EDIT.
    // INSTEAD, RUN: npm run generate-char-utils
    /**
     * Determines if the given character `c` matches the regular expression /[\x00-\x1F\x7F]/
     * by checking it via character code in a binary search fashion.
     *
     * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test()
     * on the character itself.
     *
     * NOTE: This function is generated. Do not edit manually. To regenerate, run:
     *
     *     npm run generate-char-utils
     */
    function isControlChar(c) {
        return ((c >= 0 && c <= 31) || c == 127);
    }
    /**
     * Determines if the given character `c` matches the regular expression /[A-Za-z]/
     * by checking it via character code in a binary search fashion.
     *
     * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test()
     * on the character itself.
     *
     * NOTE: This function is generated. Do not edit manually. To regenerate, run:
     *
     *     npm run generate-char-utils
     */
    function isAsciiLetterChar(c) {
        return ((c >= 65 && c <= 90) || (c >= 97 && c <= 122));
    }
    /**
     * Determines if the given character `c` matches the regular expression /\d/
     * by checking it via character code in a binary search fashion.
     *
     * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test()
     * on the character itself.
     *
     * NOTE: This function is generated. Do not edit manually. To regenerate, run:
     *
     *     npm run generate-char-utils
     */
    function isDigitChar(c) {
        return (c >= 48 && c <= 57);
    }
    /**
     * Determines if the given character `c` matches the regular expression /['"]/
     * by checking it via character code in a binary search fashion.
     *
     * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test()
     * on the character itself.
     *
     * NOTE: This function is generated. Do not edit manually. To regenerate, run:
     *
     *     npm run generate-char-utils
     */
    function isQuoteChar(c) {
        return (c == 34 || c == 39);
    }
    /**
     * Determines if the given character `c` matches the regular expression /\s/
     * by checking it via character code in a binary search fashion.
     *
     * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test()
     * on the character itself.
     *
     * NOTE: This function is generated. Do not edit manually. To regenerate, run:
     *
     *     npm run generate-char-utils
     */
    function isWhitespaceChar(c) {
        return (c < 8232 ? (c < 160 ? ((c >= 9 && c <= 13) || c == 32) : (c < 5760 ? c == 160 : (c == 5760 || (c >= 8192 && c <= 8202)))) : (c < 8287 ? ((c >= 8232 && c <= 8233) || c == 8239) : (c < 12288 ? c == 8287 : (c == 12288 || c == 65279))));
    }
    /**
     * Determines if the given character `c` matches the regular expression /[A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\u2700-\u27bf\udde6-\uddff\ud800-\udbff\udc00-\udfff\ufe0e\ufe0f\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0\ud83c\udffb-\udfff\u200d\u3299\u3297\u303d\u3030\u24c2\ud83c\udd70-\udd71\udd7e-\udd7f\udd8e\udd91-\udd9a\udde6-\uddff\ude01-\ude02\ude1a\ude2f\ude32-\ude3a\ude50-\ude51\u203c\u2049\u25aa-\u25ab\u25b6\u25c0\u25fb-\u25fe\u00a9\u00ae\u2122\u2139\udc04\u2600-\u26FF\u2b05\u2b06\u2b07\u2b1b\u2b1c\u2b50\u2b55\u231a\u231b\u2328\u23cf\u23e9-\u23f3\u23f8-\u23fa\udccf\u2935\u2934\u2190-\u21ff\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D4-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u192B\u1930-\u193B\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFB-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]/
     * by checking it via character code in a binary search fashion.
     *
     * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test()
     * on the character itself.
     *
     * NOTE: This function is generated. Do not edit manually. To regenerate, run:
     *
     *     npm run generate-char-utils
     */
    function isAlphaNumericOrMarkChar(c) {
        return (c < 4800 ? (c < 2949 ? (c < 2451 ? (c < 1425 ? (c < 768 ? (c < 192 ? (c < 169 ? (c < 65 ? (c >= 48 && c <= 57) : ((c >= 65 && c <= 90) || (c >= 97 && c <= 122))) : (c < 181 ? ((c >= 169 && c <= 170) || c == 174) : (c == 181 || c == 186))) : (c < 710 ? (c < 216 ? (c >= 192 && c <= 214) : ((c >= 216 && c <= 246) || (c >= 248 && c <= 705))) : (c < 748 ? ((c >= 710 && c <= 721) || (c >= 736 && c <= 740)) : (c == 748 || c == 750)))) : (c < 910 ? (c < 895 ? (c < 886 ? (c >= 768 && c <= 884) : ((c >= 886 && c <= 887) || (c >= 890 && c <= 893))) : (c < 904 ? (c == 895 || c == 902) : ((c >= 904 && c <= 906) || c == 908))) : (c < 1155 ? (c < 931 ? (c >= 910 && c <= 929) : ((c >= 931 && c <= 1013) || (c >= 1015 && c <= 1153))) : (c < 1369 ? ((c >= 1155 && c <= 1327) || (c >= 1329 && c <= 1366)) : (c == 1369 || (c >= 1377 && c <= 1415)))))) : (c < 1808 ? (c < 1552 ? (c < 1476 ? (c < 1471 ? (c >= 1425 && c <= 1469) : (c == 1471 || (c >= 1473 && c <= 1474))) : (c < 1488 ? ((c >= 1476 && c <= 1477) || c == 1479) : ((c >= 1488 && c <= 1514) || (c >= 1520 && c <= 1522)))) : (c < 1749 ? (c < 1568 ? (c >= 1552 && c <= 1562) : ((c >= 1568 && c <= 1641) || (c >= 1646 && c <= 1747))) : (c < 1770 ? ((c >= 1749 && c <= 1756) || (c >= 1759 && c <= 1768)) : ((c >= 1770 && c <= 1788) || c == 1791)))) : (c < 2230 ? (c < 2042 ? (c < 1869 ? (c >= 1808 && c <= 1866) : ((c >= 1869 && c <= 1969) || (c >= 1984 && c <= 2037))) : (c < 2112 ? (c == 2042 || (c >= 2048 && c <= 2093)) : ((c >= 2112 && c <= 2139) || (c >= 2208 && c <= 2228)))) : (c < 2406 ? (c < 2260 ? (c >= 2230 && c <= 2237) : ((c >= 2260 && c <= 2273) || (c >= 2275 && c <= 2403))) : (c < 2437 ? ((c >= 2406 && c <= 2415) || (c >= 2417 && c <= 2435)) : ((c >= 2437 && c <= 2444) || (c >= 2447 && c <= 2448))))))) : (c < 2693 ? (c < 2579 ? (c < 2519 ? (c < 2486 ? (c < 2474 ? (c >= 2451 && c <= 2472) : ((c >= 2474 && c <= 2480) || c == 2482)) : (c < 2503 ? ((c >= 2486 && c <= 2489) || (c >= 2492 && c <= 2500)) : ((c >= 2503 && c <= 2504) || (c >= 2507 && c <= 2510)))) : (c < 2534 ? (c < 2524 ? c == 2519 : ((c >= 2524 && c <= 2525) || (c >= 2527 && c <= 2531))) : (c < 2565 ? ((c >= 2534 && c <= 2545) || (c >= 2561 && c <= 2563)) : ((c >= 2565 && c <= 2570) || (c >= 2575 && c <= 2576))))) : (c < 2631 ? (c < 2613 ? (c < 2602 ? (c >= 2579 && c <= 2600) : ((c >= 2602 && c <= 2608) || (c >= 2610 && c <= 2611))) : (c < 2620 ? ((c >= 2613 && c <= 2614) || (c >= 2616 && c <= 2617)) : (c == 2620 || (c >= 2622 && c <= 2626)))) : (c < 2649 ? (c < 2635 ? (c >= 2631 && c <= 2632) : ((c >= 2635 && c <= 2637) || c == 2641)) : (c < 2662 ? ((c >= 2649 && c <= 2652) || c == 2654) : ((c >= 2662 && c <= 2677) || (c >= 2689 && c <= 2691)))))) : (c < 2821 ? (c < 2759 ? (c < 2730 ? (c < 2703 ? (c >= 2693 && c <= 2701) : ((c >= 2703 && c <= 2705) || (c >= 2707 && c <= 2728))) : (c < 2741 ? ((c >= 2730 && c <= 2736) || (c >= 2738 && c <= 2739)) : ((c >= 2741 && c <= 2745) || (c >= 2748 && c <= 2757)))) : (c < 2784 ? (c < 2763 ? (c >= 2759 && c <= 2761) : ((c >= 2763 && c <= 2765) || c == 2768)) : (c < 2809 ? ((c >= 2784 && c <= 2787) || (c >= 2790 && c <= 2799)) : (c == 2809 || (c >= 2817 && c <= 2819))))) : (c < 2887 ? (c < 2858 ? (c < 2831 ? (c >= 2821 && c <= 2828) : ((c >= 2831 && c <= 2832) || (c >= 2835 && c <= 2856))) : (c < 2869 ? ((c >= 2858 && c <= 2864) || (c >= 2866 && c <= 2867)) : ((c >= 2869 && c <= 2873) || (c >= 2876 && c <= 2884)))) : (c < 2911 ? (c < 2902 ? ((c >= 2887 && c <= 2888) || (c >= 2891 && c <= 2893)) : ((c >= 2902 && c <= 2903) || (c >= 2908 && c <= 2909))) : (c < 2929 ? ((c >= 2911 && c <= 2915) || (c >= 2918 && c <= 2927)) : (c == 2929 || (c >= 2946 && c <= 2947)))))))) : (c < 3517 ? (c < 3205 ? (c < 3046 ? (c < 2984 ? (c < 2969 ? (c < 2958 ? (c >= 2949 && c <= 2954) : ((c >= 2958 && c <= 2960) || (c >= 2962 && c <= 2965))) : (c < 2974 ? ((c >= 2969 && c <= 2970) || c == 2972) : ((c >= 2974 && c <= 2975) || (c >= 2979 && c <= 2980)))) : (c < 3014 ? (c < 2990 ? (c >= 2984 && c <= 2986) : ((c >= 2990 && c <= 3001) || (c >= 3006 && c <= 3010))) : (c < 3024 ? ((c >= 3014 && c <= 3016) || (c >= 3018 && c <= 3021)) : (c == 3024 || c == 3031)))) : (c < 3142 ? (c < 3086 ? (c < 3072 ? (c >= 3046 && c <= 3055) : ((c >= 3072 && c <= 3075) || (c >= 3077 && c <= 3084))) : (c < 3114 ? ((c >= 3086 && c <= 3088) || (c >= 3090 && c <= 3112)) : ((c >= 3114 && c <= 3129) || (c >= 3133 && c <= 3140)))) : (c < 3160 ? (c < 3146 ? (c >= 3142 && c <= 3144) : ((c >= 3146 && c <= 3149) || (c >= 3157 && c <= 3158))) : (c < 3174 ? ((c >= 3160 && c <= 3162) || (c >= 3168 && c <= 3171)) : ((c >= 3174 && c <= 3183) || (c >= 3200 && c <= 3203)))))) : (c < 3333 ? (c < 3274 ? (c < 3242 ? (c < 3214 ? (c >= 3205 && c <= 3212) : ((c >= 3214 && c <= 3216) || (c >= 3218 && c <= 3240))) : (c < 3260 ? ((c >= 3242 && c <= 3251) || (c >= 3253 && c <= 3257)) : ((c >= 3260 && c <= 3268) || (c >= 3270 && c <= 3272)))) : (c < 3296 ? (c < 3285 ? (c >= 3274 && c <= 3277) : ((c >= 3285 && c <= 3286) || c == 3294)) : (c < 3313 ? ((c >= 3296 && c <= 3299) || (c >= 3302 && c <= 3311)) : ((c >= 3313 && c <= 3314) || (c >= 3329 && c <= 3331))))) : (c < 3423 ? (c < 3389 ? (c < 3342 ? (c >= 3333 && c <= 3340) : ((c >= 3342 && c <= 3344) || (c >= 3346 && c <= 3386))) : (c < 3402 ? ((c >= 3389 && c <= 3396) || (c >= 3398 && c <= 3400)) : ((c >= 3402 && c <= 3406) || (c >= 3412 && c <= 3415)))) : (c < 3458 ? (c < 3430 ? (c >= 3423 && c <= 3427) : ((c >= 3430 && c <= 3439) || (c >= 3450 && c <= 3455))) : (c < 3482 ? ((c >= 3458 && c <= 3459) || (c >= 3461 && c <= 3478)) : ((c >= 3482 && c <= 3505) || (c >= 3507 && c <= 3515))))))) : (c < 3804 ? (c < 3722 ? (c < 3570 ? (c < 3535 ? (c < 3520 ? c == 3517 : ((c >= 3520 && c <= 3526) || c == 3530)) : (c < 3544 ? ((c >= 3535 && c <= 3540) || c == 3542) : ((c >= 3544 && c <= 3551) || (c >= 3558 && c <= 3567)))) : (c < 3664 ? (c < 3585 ? (c >= 3570 && c <= 3571) : ((c >= 3585 && c <= 3642) || (c >= 3648 && c <= 3662))) : (c < 3716 ? ((c >= 3664 && c <= 3673) || (c >= 3713 && c <= 3714)) : (c == 3716 || (c >= 3719 && c <= 3720))))) : (c < 3754 ? (c < 3737 ? (c < 3725 ? c == 3722 : (c == 3725 || (c >= 3732 && c <= 3735))) : (c < 3749 ? ((c >= 3737 && c <= 3743) || (c >= 3745 && c <= 3747)) : (c == 3749 || c == 3751))) : (c < 3776 ? (c < 3757 ? (c >= 3754 && c <= 3755) : ((c >= 3757 && c <= 3769) || (c >= 3771 && c <= 3773))) : (c < 3784 ? ((c >= 3776 && c <= 3780) || c == 3782) : ((c >= 3784 && c <= 3789) || (c >= 3792 && c <= 3801)))))) : (c < 4176 ? (c < 3902 ? (c < 3872 ? (c < 3840 ? (c >= 3804 && c <= 3807) : (c == 3840 || (c >= 3864 && c <= 3865))) : (c < 3895 ? ((c >= 3872 && c <= 3881) || c == 3893) : (c == 3895 || c == 3897))) : (c < 3974 ? (c < 3913 ? (c >= 3902 && c <= 3911) : ((c >= 3913 && c <= 3948) || (c >= 3953 && c <= 3972))) : (c < 4038 ? ((c >= 3974 && c <= 3991) || (c >= 3993 && c <= 4028)) : (c == 4038 || (c >= 4096 && c <= 4169))))) : (c < 4688 ? (c < 4301 ? (c < 4256 ? (c >= 4176 && c <= 4253) : ((c >= 4256 && c <= 4293) || c == 4295)) : (c < 4348 ? (c == 4301 || (c >= 4304 && c <= 4346)) : ((c >= 4348 && c <= 4680) || (c >= 4682 && c <= 4685)))) : (c < 4746 ? (c < 4698 ? ((c >= 4688 && c <= 4694) || c == 4696) : ((c >= 4698 && c <= 4701) || (c >= 4704 && c <= 4744))) : (c < 4786 ? ((c >= 4746 && c <= 4749) || (c >= 4752 && c <= 4784)) : ((c >= 4786 && c <= 4789) || (c >= 4792 && c <= 4798))))))))) : (c < 11035 ? (c < 7416 ? (c < 6176 ? (c < 5873 ? (c < 4992 ? (c < 4824 ? (c < 4802 ? c == 4800 : ((c >= 4802 && c <= 4805) || (c >= 4808 && c <= 4822))) : (c < 4888 ? ((c >= 4824 && c <= 4880) || (c >= 4882 && c <= 4885)) : ((c >= 4888 && c <= 4954) || (c >= 4957 && c <= 4959)))) : (c < 5121 ? (c < 5024 ? (c >= 4992 && c <= 5007) : ((c >= 5024 && c <= 5109) || (c >= 5112 && c <= 5117))) : (c < 5761 ? ((c >= 5121 && c <= 5740) || (c >= 5743 && c <= 5759)) : ((c >= 5761 && c <= 5786) || (c >= 5792 && c <= 5866))))) : (c < 6002 ? (c < 5920 ? (c < 5888 ? (c >= 5873 && c <= 5880) : ((c >= 5888 && c <= 5900) || (c >= 5902 && c <= 5908))) : (c < 5984 ? ((c >= 5920 && c <= 5940) || (c >= 5952 && c <= 5971)) : ((c >= 5984 && c <= 5996) || (c >= 5998 && c <= 6000)))) : (c < 6108 ? (c < 6016 ? (c >= 6002 && c <= 6003) : ((c >= 6016 && c <= 6099) || c == 6103)) : (c < 6155 ? ((c >= 6108 && c <= 6109) || (c >= 6112 && c <= 6121)) : ((c >= 6155 && c <= 6157) || (c >= 6160 && c <= 6169)))))) : (c < 6783 ? (c < 6512 ? (c < 6400 ? (c < 6272 ? (c >= 6176 && c <= 6263) : ((c >= 6272 && c <= 6314) || (c >= 6320 && c <= 6389))) : (c < 6448 ? ((c >= 6400 && c <= 6430) || (c >= 6432 && c <= 6443)) : ((c >= 6448 && c <= 6459) || (c >= 6470 && c <= 6509)))) : (c < 6608 ? (c < 6528 ? (c >= 6512 && c <= 6516) : ((c >= 6528 && c <= 6571) || (c >= 6576 && c <= 6601))) : (c < 6688 ? ((c >= 6608 && c <= 6617) || (c >= 6656 && c <= 6683)) : ((c >= 6688 && c <= 6750) || (c >= 6752 && c <= 6780))))) : (c < 7040 ? (c < 6832 ? (c < 6800 ? (c >= 6783 && c <= 6793) : ((c >= 6800 && c <= 6809) || c == 6823)) : (c < 6992 ? ((c >= 6832 && c <= 6846) || (c >= 6912 && c <= 6987)) : ((c >= 6992 && c <= 7001) || (c >= 7019 && c <= 7027)))) : (c < 7245 ? (c < 7168 ? (c >= 7040 && c <= 7155) : ((c >= 7168 && c <= 7223) || (c >= 7232 && c <= 7241))) : (c < 7376 ? ((c >= 7245 && c <= 7293) || (c >= 7296 && c <= 7304)) : ((c >= 7376 && c <= 7378) || (c >= 7380 && c <= 7414))))))) : (c < 8450 ? (c < 8130 ? (c < 8025 ? (c < 7960 ? (c < 7424 ? (c >= 7416 && c <= 7417) : ((c >= 7424 && c <= 7669) || (c >= 7675 && c <= 7957))) : (c < 8008 ? ((c >= 7960 && c <= 7965) || (c >= 7968 && c <= 8005)) : ((c >= 8008 && c <= 8013) || (c >= 8016 && c <= 8023)))) : (c < 8031 ? (c < 8027 ? c == 8025 : (c == 8027 || c == 8029)) : (c < 8118 ? ((c >= 8031 && c <= 8061) || (c >= 8064 && c <= 8116)) : ((c >= 8118 && c <= 8124) || c == 8126)))) : (c < 8205 ? (c < 8150 ? (c < 8134 ? (c >= 8130 && c <= 8132) : ((c >= 8134 && c <= 8140) || (c >= 8144 && c <= 8147))) : (c < 8178 ? ((c >= 8150 && c <= 8155) || (c >= 8160 && c <= 8172)) : ((c >= 8178 && c <= 8180) || (c >= 8182 && c <= 8188)))) : (c < 8305 ? (c < 8252 ? c == 8205 : (c == 8252 || c == 8265)) : (c < 8336 ? (c == 8305 || c == 8319) : ((c >= 8336 && c <= 8348) || (c >= 8400 && c <= 8432)))))) : (c < 8579 ? (c < 8486 ? (c < 8469 ? (c < 8455 ? c == 8450 : (c == 8455 || (c >= 8458 && c <= 8467))) : (c < 8482 ? (c == 8469 || (c >= 8473 && c <= 8477)) : (c == 8482 || c == 8484))) : (c < 8495 ? (c < 8488 ? c == 8486 : (c == 8488 || (c >= 8490 && c <= 8493))) : (c < 8517 ? ((c >= 8495 && c <= 8505) || (c >= 8508 && c <= 8511)) : ((c >= 8517 && c <= 8521) || c == 8526)))) : (c < 9410 ? (c < 9000 ? (c < 8592 ? (c >= 8579 && c <= 8580) : ((c >= 8592 && c <= 8703) || (c >= 8986 && c <= 8987))) : (c < 9193 ? (c == 9000 || c == 9167) : ((c >= 9193 && c <= 9203) || (c >= 9208 && c <= 9210)))) : (c < 9723 ? (c < 9654 ? (c == 9410 || (c >= 9642 && c <= 9643)) : (c == 9654 || c == 9664)) : (c < 10548 ? ((c >= 9723 && c <= 9726) || (c >= 9728 && c <= 10175)) : ((c >= 10548 && c <= 10549) || (c >= 11013 && c <= 11015)))))))) : (c < 43259 ? (c < 12445 ? (c < 11688 ? (c < 11520 ? (c < 11264 ? (c < 11088 ? (c >= 11035 && c <= 11036) : (c == 11088 || c == 11093)) : (c < 11360 ? ((c >= 11264 && c <= 11310) || (c >= 11312 && c <= 11358)) : ((c >= 11360 && c <= 11492) || (c >= 11499 && c <= 11507)))) : (c < 11568 ? (c < 11559 ? (c >= 11520 && c <= 11557) : (c == 11559 || c == 11565)) : (c < 11647 ? ((c >= 11568 && c <= 11623) || c == 11631) : ((c >= 11647 && c <= 11670) || (c >= 11680 && c <= 11686))))) : (c < 11744 ? (c < 11712 ? (c < 11696 ? (c >= 11688 && c <= 11694) : ((c >= 11696 && c <= 11702) || (c >= 11704 && c <= 11710))) : (c < 11728 ? ((c >= 11712 && c <= 11718) || (c >= 11720 && c <= 11726)) : ((c >= 11728 && c <= 11734) || (c >= 11736 && c <= 11742)))) : (c < 12330 ? (c < 11823 ? (c >= 11744 && c <= 11775) : (c == 11823 || (c >= 12293 && c <= 12294))) : (c < 12353 ? ((c >= 12330 && c <= 12341) || (c >= 12347 && c <= 12349)) : ((c >= 12353 && c <= 12438) || (c >= 12441 && c <= 12442)))))) : (c < 42512 ? (c < 12951 ? (c < 12549 ? (c < 12449 ? (c >= 12445 && c <= 12447) : ((c >= 12449 && c <= 12538) || (c >= 12540 && c <= 12543))) : (c < 12704 ? ((c >= 12549 && c <= 12589) || (c >= 12593 && c <= 12686)) : ((c >= 12704 && c <= 12730) || (c >= 12784 && c <= 12799)))) : (c < 19968 ? (c < 12953 ? c == 12951 : (c == 12953 || (c >= 13312 && c <= 19893))) : (c < 42192 ? ((c >= 19968 && c <= 40917) || (c >= 40960 && c <= 42124)) : ((c >= 42192 && c <= 42237) || (c >= 42240 && c <= 42508))))) : (c < 42891 ? (c < 42623 ? (c < 42560 ? (c >= 42512 && c <= 42539) : ((c >= 42560 && c <= 42610) || (c >= 42612 && c <= 42621))) : (c < 42775 ? ((c >= 42623 && c <= 42725) || (c >= 42736 && c <= 42737)) : ((c >= 42775 && c <= 42783) || (c >= 42786 && c <= 42888)))) : (c < 43072 ? (c < 42928 ? (c >= 42891 && c <= 42926) : ((c >= 42928 && c <= 42935) || (c >= 42999 && c <= 43047))) : (c < 43216 ? ((c >= 43072 && c <= 43123) || (c >= 43136 && c <= 43205)) : ((c >= 43216 && c <= 43225) || (c >= 43232 && c <= 43255))))))) : (c < 55243 ? (c < 43744 ? (c < 43488 ? (c < 43312 ? (c < 43261 ? c == 43259 : (c == 43261 || (c >= 43264 && c <= 43309))) : (c < 43392 ? ((c >= 43312 && c <= 43347) || (c >= 43360 && c <= 43388)) : ((c >= 43392 && c <= 43456) || (c >= 43471 && c <= 43481)))) : (c < 43600 ? (c < 43520 ? (c >= 43488 && c <= 43518) : ((c >= 43520 && c <= 43574) || (c >= 43584 && c <= 43597))) : (c < 43642 ? ((c >= 43600 && c <= 43609) || (c >= 43616 && c <= 43638)) : ((c >= 43642 && c <= 43714) || (c >= 43739 && c <= 43741))))) : (c < 43824 ? (c < 43785 ? (c < 43762 ? (c >= 43744 && c <= 43759) : ((c >= 43762 && c <= 43766) || (c >= 43777 && c <= 43782))) : (c < 43808 ? ((c >= 43785 && c <= 43790) || (c >= 43793 && c <= 43798)) : ((c >= 43808 && c <= 43814) || (c >= 43816 && c <= 43822)))) : (c < 44012 ? (c < 43868 ? (c >= 43824 && c <= 43866) : ((c >= 43868 && c <= 43877) || (c >= 43888 && c <= 44010))) : (c < 44032 ? ((c >= 44012 && c <= 44013) || (c >= 44016 && c <= 44025)) : ((c >= 44032 && c <= 55203) || (c >= 55216 && c <= 55238)))))) : (c < 64848 ? (c < 64298 ? (c < 64112 ? (c < 55296 ? (c >= 55243 && c <= 55291) : ((c >= 55296 && c <= 57343) || (c >= 63744 && c <= 64109))) : (c < 64275 ? ((c >= 64112 && c <= 64217) || (c >= 64256 && c <= 64262)) : ((c >= 64275 && c <= 64279) || (c >= 64285 && c <= 64296)))) : (c < 64320 ? (c < 64312 ? (c >= 64298 && c <= 64310) : ((c >= 64312 && c <= 64316) || c == 64318)) : (c < 64326 ? ((c >= 64320 && c <= 64321) || (c >= 64323 && c <= 64324)) : ((c >= 64326 && c <= 64433) || (c >= 64467 && c <= 64829))))) : (c < 65296 ? (c < 65024 ? (c < 64914 ? (c >= 64848 && c <= 64911) : ((c >= 64914 && c <= 64967) || (c >= 65008 && c <= 65019))) : (c < 65136 ? ((c >= 65024 && c <= 65039) || (c >= 65056 && c <= 65071)) : ((c >= 65136 && c <= 65140) || (c >= 65142 && c <= 65276)))) : (c < 65474 ? (c < 65345 ? ((c >= 65296 && c <= 65305) || (c >= 65313 && c <= 65338)) : ((c >= 65345 && c <= 65370) || (c >= 65382 && c <= 65470))) : (c < 65490 ? ((c >= 65474 && c <= 65479) || (c >= 65482 && c <= 65487)) : ((c >= 65490 && c <= 65495) || (c >= 65498 && c <= 65500))))))))));
    }
    /**
     * Determines if the given character `c` matches the regular expression /[!#$%&'*+/=?^_`{|}~-]/
     * by checking it via character code in a binary search fashion.
     *
     * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test()
     * on the character itself.
     *
     * NOTE: This function is generated. Do not edit manually. To regenerate, run:
     *
     *     npm run generate-char-utils
     */
    function isValidEmailLocalPartSpecialChar(c) {
        return (c < 47 ? (c < 42 ? (c == 33 || (c >= 35 && c <= 39)) : ((c >= 42 && c <= 43) || c == 45)) : (c < 63 ? (c == 47 || c == 61) : (c < 94 ? c == 63 : ((c >= 94 && c <= 96) || (c >= 123 && c <= 126)))));
    }
    /**
     * Determines if the given character `c` matches the regular expression /[-+&@#/%=~_()|'$*[\]{}\u2713]/
     * by checking it via character code in a binary search fashion.
     *
     * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test()
     * on the character itself.
     *
     * NOTE: This function is generated. Do not edit manually. To regenerate, run:
     *
     *     npm run generate-char-utils
     */
    function isUrlSuffixAllowedSpecialChar(c) {
        return (c < 91 ? (c < 47 ? ((c >= 35 && c <= 43) || c == 45) : (c < 61 ? c == 47 : (c == 61 || c == 64))) : (c < 95 ? (c == 91 || c == 93) : (c < 123 ? c == 95 : ((c >= 123 && c <= 126) || c == 10003))));
    }
    /**
     * Determines if the given character `c` matches the regular expression /[?!:,.;^]/
     * by checking it via character code in a binary search fashion.
     *
     * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test()
     * on the character itself.
     *
     * NOTE: This function is generated. Do not edit manually. To regenerate, run:
     *
     *     npm run generate-char-utils
     */
    function isUrlSuffixNotAllowedAsFinalChar(c) {
        return (c < 58 ? (c < 44 ? c == 33 : (c == 44 || c == 46)) : (c < 63 ? (c >= 58 && c <= 59) : (c == 63 || c == 94)));
    }
    /**
     * Determines if the given character `c` matches the regular expression /[({[]/
     * by checking it via character code in a binary search fashion.
     *
     * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test()
     * on the character itself.
     *
     * NOTE: This function is generated. Do not edit manually. To regenerate, run:
     *
     *     npm run generate-char-utils
     */
    function isOpenBraceChar(c) {
        return (c < 91 ? c == 40 : (c == 91 || c == 123));
    }
    /**
     * Determines if the given character `c` matches the regular expression /[)}\]]/
     * by checking it via character code in a binary search fashion.
     *
     * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test()
     * on the character itself.
     *
     * NOTE: This function is generated. Do not edit manually. To regenerate, run:
     *
     *     npm run generate-char-utils
     */
    function isCloseBraceChar(c) {
        return (c < 93 ? c == 41 : (c == 93 || c == 125));
    }

    // NOTE: THIS IS A GENERATED FILE
    // To update with the latest TLD list, run `npm run update-known-tlds`
    var tldRegex = /^(?:xn--vermgensberatung-pwb|xn--vermgensberater-ctb|xn--clchc0ea0b2g2a9gcd|xn--w4r85el8fhu5dnra|travelersinsurance|vermögensberatung|xn--5su34j936bgsg|xn--bck1b9a5dre4c|xn--mgbah1a3hjkrd|xn--mgbai9azgqp6j|xn--mgberp4a5d4ar|xn--xkc2dl3a5ee0h|vermögensberater|xn--fzys8d69uvgm|xn--mgba7c0bbn0a|xn--mgbcpq6gpa1a|xn--xkc2al3hye2a|americanexpress|kerryproperties|sandvikcoromant|xn--i1b6b1a6a2e|xn--kcrx77d1x4a|xn--lgbbat1ad8j|xn--mgba3a4f16a|xn--mgbc0a9azcg|xn--nqv7fs00ema|americanfamily|weatherchannel|xn--54b7fta0cc|xn--6qq986b3xl|xn--80aqecdr1a|xn--b4w605ferd|xn--fiq228c5hs|xn--h2breg3eve|xn--jlq480n2rg|xn--mgba3a3ejt|xn--mgbaam7a8h|xn--mgbayh7gpa|xn--mgbbh1a71e|xn--mgbca7dzdo|xn--mgbi4ecexp|xn--mgbx4cd0ab|xn--rvc1e0am3e|international|lifeinsurance|wolterskluwer|xn--cckwcxetd|xn--eckvdtc9d|xn--fpcrj9c3d|xn--fzc2c9e2c|xn--h2brj9c8c|xn--tiq49xqyj|xn--yfro4i67o|xn--ygbi2ammx|construction|lplfinancial|scholarships|versicherung|xn--3e0b707e|xn--45br5cyl|xn--4dbrk0ce|xn--80adxhks|xn--80asehdb|xn--8y0a063a|xn--gckr3f0f|xn--mgb9awbf|xn--mgbab2bd|xn--mgbgu82a|xn--mgbpl2fh|xn--mgbt3dhd|xn--mk1bu44c|xn--ngbc5azd|xn--ngbe9e0a|xn--ogbpf8fl|xn--qcka1pmc|accountants|barclaycard|blackfriday|blockbuster|bridgestone|calvinklein|contractors|creditunion|engineering|enterprises|investments|kerryhotels|lamborghini|motorcycles|olayangroup|photography|playstation|productions|progressive|redumbrella|williamhill|xn--11b4c3d|xn--1ck2e1b|xn--1qqw23a|xn--2scrj9c|xn--3bst00m|xn--3ds443g|xn--3hcrj9c|xn--42c2d9a|xn--45brj9c|xn--55qw42g|xn--6frz82g|xn--80ao21a|xn--9krt00a|xn--cck2b3b|xn--czr694b|xn--d1acj3b|xn--efvy88h|xn--fct429k|xn--fjq720a|xn--flw351e|xn--g2xx48c|xn--gecrj9c|xn--gk3at1e|xn--h2brj9c|xn--hxt814e|xn--imr513n|xn--j6w193g|xn--jvr189m|xn--kprw13d|xn--kpry57d|xn--mgbbh1a|xn--mgbtx2b|xn--mix891f|xn--nyqy26a|xn--otu796d|xn--pgbs0dh|xn--q9jyb4c|xn--rhqv96g|xn--rovu88b|xn--s9brj9c|xn--ses554g|xn--t60b56a|xn--vuq861b|xn--w4rs40l|xn--xhq521b|xn--zfr164b|சிங்கப்பூர்|accountant|apartments|associates|basketball|bnpparibas|boehringer|capitalone|consulting|creditcard|cuisinella|eurovision|extraspace|foundation|healthcare|immobilien|industries|management|mitsubishi|nextdirect|properties|protection|prudential|realestate|republican|restaurant|schaeffler|tatamotors|technology|university|vlaanderen|xn--30rr7y|xn--3pxu8k|xn--45q11c|xn--4gbrim|xn--55qx5d|xn--5tzm5g|xn--80aswg|xn--90a3ac|xn--9dbq2a|xn--9et52u|xn--c2br7g|xn--cg4bki|xn--czrs0t|xn--czru2d|xn--fiq64b|xn--fiqs8s|xn--fiqz9s|xn--io0a7i|xn--kput3i|xn--mxtq1m|xn--o3cw4h|xn--pssy2u|xn--q7ce6a|xn--unup4y|xn--wgbh1c|xn--wgbl6a|xn--y9a3aq|accenture|allfinanz|amsterdam|analytics|aquarelle|barcelona|bloomberg|christmas|community|directory|education|equipment|fairwinds|financial|firestone|fresenius|furniture|goldpoint|hisamitsu|homedepot|homegoods|homesense|institute|insurance|kuokgroup|landrover|lifestyle|marketing|marshalls|melbourne|microsoft|panasonic|pramerica|richardli|shangrila|solutions|statebank|statefarm|stockholm|travelers|vacations|xn--90ais|xn--c1avg|xn--d1alf|xn--e1a4c|xn--fhbei|xn--j1aef|xn--j1amh|xn--l1acc|xn--ngbrx|xn--nqv7f|xn--p1acf|xn--qxa6a|xn--tckwe|xn--vhquv|yodobashi|موريتانيا|abudhabi|airforce|allstate|attorney|barclays|barefoot|bargains|baseball|boutique|bradesco|broadway|brussels|builders|business|capetown|catering|catholic|cipriani|cleaning|clinique|clothing|commbank|computer|delivery|deloitte|democrat|diamonds|discount|discover|download|engineer|ericsson|exchange|feedback|fidelity|firmdale|football|frontier|goodyear|grainger|graphics|hdfcbank|helsinki|holdings|hospital|infiniti|ipiranga|istanbul|jpmorgan|lighting|lundbeck|marriott|mckinsey|memorial|merckmsd|mortgage|observer|partners|pharmacy|pictures|plumbing|property|redstone|reliance|saarland|samsclub|security|services|shopping|softbank|software|stcgroup|supplies|training|vanguard|ventures|verisign|woodside|xn--90ae|xn--node|xn--p1ai|xn--qxam|yokohama|السعودية|abogado|academy|agakhan|alibaba|android|athleta|auction|audible|auspost|banamex|bauhaus|bestbuy|booking|brother|capital|caravan|careers|channel|charity|chintai|citadel|clubmed|college|cologne|company|compare|contact|cooking|corsica|country|coupons|courses|cricket|cruises|dentist|digital|domains|exposed|express|farmers|fashion|ferrari|ferrero|finance|fishing|fitness|flights|florist|flowers|forsale|frogans|fujitsu|gallery|genting|godaddy|grocery|guitars|hamburg|hangout|hitachi|holiday|hosting|hotmail|hyundai|ismaili|jewelry|juniper|kitchen|komatsu|lacaixa|lanxess|lasalle|latrobe|leclerc|limited|lincoln|markets|monster|netbank|netflix|network|neustar|okinawa|organic|origins|philips|pioneer|politie|realtor|recipes|rentals|reviews|rexroth|samsung|sandvik|schmidt|schwarz|science|shiksha|singles|staples|storage|support|surgery|systems|temasek|theater|theatre|tickets|toshiba|trading|walmart|wanggou|watches|weather|website|wedding|whoswho|windows|winners|yamaxun|youtube|zuerich|католик|البحرين|الجزائر|العليان|پاکستان|كاثوليك|இந்தியா|abbott|abbvie|africa|agency|airbus|airtel|alipay|alsace|alstom|amazon|anquan|aramco|author|bayern|beauty|berlin|bharti|bostik|boston|broker|camera|career|casino|center|chanel|chrome|church|circle|claims|clinic|coffee|comsec|condos|coupon|credit|cruise|dating|datsun|dealer|degree|dental|design|direct|doctor|dunlop|dupont|durban|emerck|energy|estate|events|expert|family|flickr|futbol|gallup|garden|george|giving|global|google|gratis|health|hermes|hiphop|hockey|hotels|hughes|imamat|insure|intuit|jaguar|joburg|juegos|kaufen|kindle|kosher|latino|lawyer|lefrak|living|locker|london|luxury|madrid|maison|makeup|market|mattel|mobile|monash|mormon|moscow|museum|nagoya|nissan|nissay|norton|nowruz|office|olayan|online|oracle|orange|otsuka|pfizer|photos|physio|pictet|quebec|racing|realty|reisen|repair|report|review|rogers|ryukyu|safety|sakura|sanofi|school|schule|search|secure|select|shouji|soccer|social|stream|studio|supply|suzuki|swatch|sydney|taipei|taobao|target|tattoo|tennis|tienda|tjmaxx|tkmaxx|toyota|travel|unicom|viajes|viking|villas|virgin|vision|voting|voyage|walter|webcam|xihuan|yachts|yandex|zappos|москва|онлайн|ابوظبي|ارامكو|الاردن|المغرب|امارات|فلسطين|مليسيا|भारतम्|இலங்கை|ファッション|actor|adult|aetna|amfam|amica|apple|archi|audio|autos|azure|baidu|beats|bible|bingo|black|boats|bosch|build|canon|cards|chase|cheap|cisco|citic|click|cloud|coach|codes|crown|cymru|dance|deals|delta|drive|dubai|earth|edeka|email|epson|faith|fedex|final|forex|forum|gallo|games|gifts|gives|glass|globo|gmail|green|gripe|group|gucci|guide|homes|honda|horse|house|hyatt|ikano|irish|jetzt|koeln|kyoto|lamer|lease|legal|lexus|lilly|loans|locus|lotte|lotto|mango|media|miami|money|movie|music|nexus|nikon|ninja|nokia|nowtv|omega|osaka|paris|parts|party|phone|photo|pizza|place|poker|praxi|press|prime|promo|quest|radio|rehab|reise|ricoh|rocks|rodeo|rugby|salon|sener|seven|sharp|shell|shoes|skype|sling|smart|smile|solar|space|sport|stada|store|study|style|sucks|swiss|tatar|tires|tirol|tmall|today|tokyo|tools|toray|total|tours|trade|trust|tunes|tushu|ubank|vegas|video|vodka|volvo|wales|watch|weber|weibo|works|world|xerox|yahoo|ישראל|ایران|بازار|بھارت|سودان|سورية|همراه|भारोत|संगठन|বাংলা|భారత్|ഭാരതം|嘉里大酒店|aarp|able|aero|akdn|ally|amex|arab|army|arpa|arte|asda|asia|audi|auto|baby|band|bank|bbva|beer|best|bike|bing|blog|blue|bofa|bond|book|buzz|cafe|call|camp|care|cars|casa|case|cash|cbre|cern|chat|citi|city|club|cool|coop|cyou|data|date|dclk|deal|dell|desi|diet|dish|docs|dvag|erni|fage|fail|fans|farm|fast|fido|film|fire|fish|flir|food|ford|free|fund|game|gbiz|gent|ggee|gift|gmbh|gold|golf|goog|guge|guru|hair|haus|hdfc|help|here|host|hsbc|icbc|ieee|imdb|immo|info|itau|java|jeep|jobs|jprs|kddi|kids|kiwi|kpmg|kred|land|lego|lgbt|lidl|life|like|limo|link|live|loan|love|ltda|luxe|maif|meet|meme|menu|mini|mint|mobi|moda|moto|name|navy|news|next|nico|nike|ollo|open|page|pars|pccw|pics|ping|pink|play|plus|pohl|porn|post|prod|prof|qpon|read|reit|rent|rest|rich|room|rsvp|ruhr|safe|sale|sarl|save|saxo|scot|seat|seek|sexy|shia|shop|show|silk|sina|site|skin|sncf|sohu|song|sony|spot|star|surf|talk|taxi|team|tech|teva|tiaa|tips|town|toys|tube|vana|visa|viva|vivo|vote|voto|wang|weir|wien|wiki|wine|work|xbox|yoga|zara|zero|zone|дети|сайт|بارت|بيتك|ڀارت|تونس|شبكة|عراق|عمان|موقع|भारत|ভারত|ভাৰত|ਭਾਰਤ|ભારત|ଭାରତ|ಭಾರತ|ලංකා|アマゾン|グーグル|クラウド|ポイント|组织机构|電訊盈科|香格里拉|aaa|abb|abc|aco|ads|aeg|afl|aig|anz|aol|app|art|aws|axa|bar|bbc|bbt|bcg|bcn|bet|bid|bio|biz|bms|bmw|bom|boo|bot|box|buy|bzh|cab|cal|cam|car|cat|cba|cbn|ceo|cfa|cfd|com|cpa|crs|dad|day|dds|dev|dhl|diy|dnp|dog|dot|dtv|dvr|eat|eco|edu|esq|eus|fan|fit|fly|foo|fox|frl|ftr|fun|fyi|gal|gap|gay|gdn|gea|gle|gmo|gmx|goo|gop|got|gov|hbo|hiv|hkt|hot|how|ibm|ice|icu|ifm|inc|ing|ink|int|ist|itv|jcb|jio|jll|jmp|jnj|jot|joy|kfh|kia|kim|kpn|krd|lat|law|lds|llc|llp|lol|lpl|ltd|man|map|mba|med|men|mil|mit|mlb|mls|mma|moe|moi|mom|mov|msd|mtn|mtr|nab|nba|nec|net|new|nfl|ngo|nhk|now|nra|nrw|ntt|nyc|obi|one|ong|onl|ooo|org|ott|ovh|pay|pet|phd|pid|pin|pnc|pro|pru|pub|pwc|red|ren|ril|rio|rip|run|rwe|sap|sas|sbi|sbs|scb|sew|sex|sfr|ski|sky|soy|spa|srl|stc|tab|tax|tci|tdk|tel|thd|tjx|top|trv|tui|tvs|ubs|uno|uol|ups|vet|vig|vin|vip|wed|win|wme|wow|wtc|wtf|xin|xxx|xyz|you|yun|zip|бел|ком|қаз|мкд|мон|орг|рус|срб|укр|հայ|קום|عرب|قطر|كوم|مصر|कॉम|नेट|คอม|ไทย|ລາວ|ストア|セール|みんな|中文网|亚马逊|天主教|我爱你|新加坡|淡马锡|飞利浦|ac|ad|ae|af|ag|ai|al|am|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|ss|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw|ελ|ευ|бг|ею|рф|გე|닷넷|닷컴|삼성|한국|コム|世界|中信|中国|中國|企业|佛山|信息|健康|八卦|公司|公益|台湾|台灣|商城|商店|商标|嘉里|在线|大拿|娱乐|家電|广东|微博|慈善|手机|招聘|政务|政府|新闻|时尚|書籍|机构|游戏|澳門|点看|移动|网址|网店|网站|网络|联通|谷歌|购物|通販|集团|食品|餐厅|香港)$/;

    /**
     * Regular expression to match an http:// or https:// scheme.
     */
    var httpSchemeRe = /https?:\/\//i;
    /**
     * Regular expression to match an http:// or https:// scheme as the prefix of
     * a string.
     */
    var httpSchemePrefixRe = new RegExp('^' + httpSchemeRe.source, 'i');
    /**
     * A regular expression used to determine the schemes we should not autolink
     */
    var invalidSchemeRe = /^(javascript|vbscript):/i;
    // A regular expression used to determine if the URL is a scheme match (such as
    // 'http://google.com', and as opposed to a "TLD match"). This regular
    // expression is used to parse out the host along with if the URL has an
    // authority component (i.e. '//')
    //
    // Capturing groups:
    //    1. '//' if the URL has an authority component, empty string otherwise
    //    2. The host (if one exists). Ex: 'google.com'
    //
    // See https://www.rfc-editor.org/rfc/rfc3986#appendix-A for terminology
    var schemeUrlRe = /^[A-Za-z][-.+A-Za-z0-9]*:(\/\/)?([^:/]*)/;
    // A regular expression used to determine if the URL is a TLD match (such as
    // 'google.com', and as opposed to a "scheme match"). This regular
    // expression is used to help parse out the TLD (top-level domain) of the host.
    //
    // See https://www.rfc-editor.org/rfc/rfc3986#appendix-A for terminology
    var tldUrlHostRe = /^(?:\/\/)?([^/#?:]+)/; // optionally prefixed with protocol-relative '//' chars
    /**
     * Determines if the given character code represents a character that may start
     * a scheme (ex: the 'h' in 'http')
     */
    var isSchemeStartChar = isAsciiLetterChar; // Equivalent to checking the RegExp `/[A-Za-z]/`, but aliased for clarity and maintainability
    /**
     * Determines if the given character is a valid character in a scheme (such as
     * 'http' or 'ssh+git'), but only after the start char (which is handled by
     * {@link isSchemeStartChar}.
     */
    function isSchemeChar(charCode) {
        return (isAsciiLetterChar(charCode) ||
            isDigitChar(charCode) ||
            charCode === 43 /* Char.Plus */ || // '+'
            charCode === 45 /* Char.Dash */ || // '-'
            charCode === 46 /* Char.Dot */ // '.'
        );
    }
    /**
     * Determines if the character can begin a domain label, which must be an
     * alphanumeric character and not an underscore or dash.
     *
     * A domain label is a segment of a hostname such as subdomain.google.com.
     */
    var isDomainLabelStartChar = isAlphaNumericOrMarkChar; // alias function for clarity
    /**
     * Determines if the character is part of a domain label (but not a domain label
     * start character).
     *
     * A domain label is a segment of a hostname such as subdomain.google.com.
     */
    function isDomainLabelChar(charCode) {
        return charCode === 95 /* Char.Underscore */ || isDomainLabelStartChar(charCode);
    }
    /**
     * Determines if the character is a path character ("pchar") as defined by
     * https://tools.ietf.org/html/rfc3986#appendix-A
     *
     *     pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
     *
     *     unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
     *     pct-encoded   = "%" HEXDIG HEXDIG
     *     sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
     *                   / "*" / "+" / "," / ";" / "="
     *
     * Note that this implementation doesn't follow the spec exactly, but rather
     * follows URL path characters found out in the wild (spec might be out of date?)
     */
    function isPathChar(charCode) {
        return (isAlphaNumericOrMarkChar(charCode) ||
            isUrlSuffixAllowedSpecialChar(charCode) ||
            isUrlSuffixNotAllowedAsFinalChar(charCode) // characters in addition to those allowed by isUrlSuffixAllowedSpecialChar()
        );
    }
    /**
     * Determines if the character given may begin the "URL Suffix" section of a
     * URI (i.e. the path, query, or hash section). These are the '/', '?' and '#'
     * characters.
     *
     * See https://tools.ietf.org/html/rfc3986#appendix-A
     */
    function isUrlSuffixStartChar(charCode) {
        return (charCode === 47 /* Char.Slash */ || // '/'
            charCode === 63 /* Char.Question */ || // '?'
            charCode === 35 /* Char.NumberSign */ // '#'
        );
    }
    /**
     * Determines if the top-level domain (TLD) read in the host is a known TLD.
     *
     * Example: 'com' would be a known TLD (for a host of 'google.com'), but
     * 'local' would not (for a domain name of 'my-computer.local').
     */
    function isKnownTld(tld) {
        return tldRegex.test(tld.toLowerCase()); // make sure the tld is lowercase for the regex
    }
    /**
     * Determines if the given `url` is a valid scheme-prefixed URL.
     */
    function isValidSchemeUrl(url) {
        // If the scheme is 'javascript:' or 'vbscript:', these link
        // types can be dangerous. Don't link them.
        if (invalidSchemeRe.test(url)) {
            return false;
        }
        var schemeMatch = url.match(schemeUrlRe);
        if (!schemeMatch) {
            return false;
        }
        var isAuthorityMatch = !!schemeMatch[1];
        var host = schemeMatch[2];
        if (isAuthorityMatch) {
            // Any match that has an authority ('//' chars) after the scheme is
            // valid, such as 'http://anything'
            return true;
        }
        // If there's no authority ('//' chars), check that we have a hostname
        // that looks valid.
        //
        // The host must contain at least one '.' char and have a domain label
        // with at least one letter to be considered valid.
        //
        // Accept:
        //   - git:domain.com (scheme followed by a host
        // Do not accept:
        //   - git:something ('something' doesn't look like a host)
        //   - version:1.0   ('1.0' doesn't look like a host)
        if (host.indexOf('.') === -1 || !/[A-Za-z]/.test(host)) {
            // `letterRe` RegExp checks for a letter anywhere in the host string
            return false;
        }
        return true;
    }
    /**
     * Determines if the given `url` is a match with a valid TLD.
     */
    function isValidTldMatch(url) {
        // TLD URL such as 'google.com', we need to confirm that we have a valid
        // top-level domain
        var tldUrlHostMatch = url.match(tldUrlHostRe);
        if (!tldUrlHostMatch) {
            // At this point, if the URL didn't match our TLD re, it must be invalid
            // (highly unlikely to happen, but just in case)
            return false;
        }
        var host = tldUrlHostMatch[0];
        var hostLabels = host.split('.');
        if (hostLabels.length < 2) {
            // 0 or 1 host label, there's no TLD. Ex: 'localhost'
            return false;
        }
        var tld = hostLabels[hostLabels.length - 1];
        if (!isKnownTld(tld)) {
            return false;
        }
        // TODO: Implement these conditions for TLD matcher:
        // (
        //     this.longestDomainLabelLength <= 63 &&
        //     this.domainNameLength <= 255
        // );
        return true;
    }
    // Regular expression to confirm a valid IPv4 address (ex: '192.168.0.1')
    // TODO: encode this into the state machine so that we don't need to run this
    //       regexp separately to confirm the match
    var ipV4Re = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    // Regular expression used to split the IPv4 address itself from any port/path/query/hash
    var ipV4PartRe = /[:/?#]/;
    /**
     * Determines if the given URL is a valid IPv4-prefixed URL.
     */
    function isValidIpV4Address(url) {
        // Grab just the IP address
        var ipV4Part = url.split(ipV4PartRe, 1)[0]; // only 1 result needed
        return ipV4Re.test(ipV4Part);
    }

    /**
     * A regular expression used to remove the 'www.' from URLs.
     */
    var wwwPrefixRegex = /^(https?:\/\/)?(?:www\.)?/i;
    /**
     * The regular expression used to remove the protocol-relative '//' from a URL
     * string, for purposes of formatting the anchor text. A protocol-relative URL
     * is, for example, "//yahoo.com"
     */
    var protocolRelativeRegex = /^\/\//;
    /**
     * @class Autolinker.match.Url
     * @extends Autolinker.match.AbstractMatch
     *
     * Represents a Url match found in an input string which should be Autolinked.
     *
     * See this class's superclass ({@link Autolinker.match.Match}) for more details.
     */
    var UrlMatch = /** @class */ (function (_super) {
        __extends(UrlMatch, _super);
        /**
         * @method constructor
         * @param {Object} cfg The configuration properties for the Match
         *   instance, specified in an Object (map).
         */
        function UrlMatch(cfg) {
            var _this = _super.call(this, cfg) || this;
            /**
             * @public
             * @property {'url'} type
             *
             * A string name for the type of match that this class represents. Can be
             * used in a TypeScript discriminating union to type-narrow from the
             * `Match` type.
             */
            _this.type = 'url';
            /**
             * @cfg {String} url (required)
             *
             * The url that was matched.
             */
            _this.url = ''; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {"scheme"/"www"/"tld"} urlMatchType (required)
             *
             * The type of URL match that this class represents. This helps to determine
             * if the match was made in the original text with a prefixed scheme (ex:
             * 'http://www.google.com'), a prefixed 'www' (ex: 'www.google.com'), or
             * was matched by a known top-level domain (ex: 'google.com').
             */
            _this.urlMatchType = 'scheme'; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {Boolean} protocolRelativeMatch (required)
             *
             * `true` if the URL is a protocol-relative match. A protocol-relative match
             * is a URL that starts with '//', and will be either http:// or https://
             * based on the protocol that the site is loaded under.
             */
            _this.protocolRelativeMatch = false; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {Object} stripPrefix (required)
             *
             * The Object form of {@link Autolinker#cfg-stripPrefix}.
             */
            _this.stripPrefix = {
                scheme: true,
                www: true,
            }; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {Boolean} stripTrailingSlash (required)
             * @inheritdoc Autolinker#cfg-stripTrailingSlash
             */
            _this.stripTrailingSlash = true; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {Boolean} decodePercentEncoding (required)
             * @inheritdoc Autolinker#cfg-decodePercentEncoding
             */
            _this.decodePercentEncoding = true; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @private
             * @property {Boolean} protocolPrepended
             *
             * Will be set to `true` if the 'http://' protocol has been prepended to the {@link #url} (because the
             * {@link #url} did not have a protocol)
             */
            _this.protocolPrepended = false;
            _this.urlMatchType = cfg.urlMatchType;
            _this.url = cfg.url;
            _this.protocolRelativeMatch = cfg.protocolRelativeMatch;
            _this.stripPrefix = cfg.stripPrefix;
            _this.stripTrailingSlash = cfg.stripTrailingSlash;
            _this.decodePercentEncoding = cfg.decodePercentEncoding;
            return _this;
        }
        /**
         * Returns a string name for the type of match that this class represents.
         * For the case of UrlMatch, returns 'url'.
         *
         * @return {String}
         */
        UrlMatch.prototype.getType = function () {
            return 'url';
        };
        /**
         * Returns a string name for the type of URL match that this class
         * represents.
         *
         * This helps to determine if the match was made in the original text with a
         * prefixed scheme (ex: 'http://www.google.com'), a prefixed 'www' (ex:
         * 'www.google.com'), or was matched by a known top-level domain (ex:
         * 'google.com').
         *
         * @return {"scheme"/"www"/"tld"}
         */
        UrlMatch.prototype.getUrlMatchType = function () {
            return this.urlMatchType;
        };
        /**
         * Returns the url that was matched, assuming the protocol to be 'http://' if the original
         * match was missing a protocol.
         *
         * @return {String}
         */
        UrlMatch.prototype.getUrl = function () {
            var url = this.url;
            // if the url string doesn't begin with a scheme, assume 'http://'
            if (!this.protocolRelativeMatch &&
                this.urlMatchType !== 'scheme' &&
                !this.protocolPrepended) {
                url = this.url = 'http://' + url;
                this.protocolPrepended = true;
            }
            return url;
        };
        /**
         * Returns the anchor href that should be generated for the match.
         *
         * @return {String}
         */
        UrlMatch.prototype.getAnchorHref = function () {
            var url = this.getUrl();
            return url.replace(/&amp;/g, '&'); // any &amp;'s in the URL should be converted back to '&' if they were displayed as &amp; in the source html
        };
        /**
         * Returns the anchor text that should be generated for the match.
         *
         * @return {String}
         */
        UrlMatch.prototype.getAnchorText = function () {
            var anchorText = this.getMatchedText();
            if (this.protocolRelativeMatch) {
                // Strip off any protocol-relative '//' from the anchor text
                anchorText = stripProtocolRelativePrefix(anchorText);
            }
            if (this.stripPrefix.scheme) {
                anchorText = stripSchemePrefix(anchorText);
            }
            if (this.stripPrefix.www) {
                anchorText = stripWwwPrefix(anchorText);
            }
            if (this.stripTrailingSlash) {
                anchorText = removeTrailingSlash(anchorText); // remove trailing slash, if there is one
            }
            if (this.decodePercentEncoding) {
                anchorText = removePercentEncoding(anchorText);
            }
            return anchorText;
        };
        return UrlMatch;
    }(AbstractMatch));
    // Utility Functionality
    /**
     * Strips the scheme prefix (such as "http://" or "https://") from the given
     * `url`.
     *
     * @private
     * @param {String} url The text of the anchor that is being generated, for
     *   which to strip off the url scheme.
     * @return {String} The `url`, with the scheme stripped.
     */
    function stripSchemePrefix(url) {
        return url.replace(httpSchemePrefixRe, '');
    }
    /**
     * Strips the 'www' prefix from the given `url`.
     *
     * @private
     * @param {String} url The text of the anchor that is being generated, for
     *   which to strip off the 'www' if it exists.
     * @return {String} The `url`, with the 'www' stripped.
     */
    function stripWwwPrefix(url) {
        // If the URL doesn't actually include 'www.' in it, skip running the
        // .replace() regexp on it, which is fairly slow even just to check the
        // string for the 'www.'s existence. Most URLs these days do not have 'www.'
        // in it, so most of the time we skip running the .replace(). One other
        // option in the future is to run a state machine on the `url` string
        if (!url.includes('www.')) {
            return url;
        }
        else {
            return url.replace(wwwPrefixRegex, '$1'); // leave any scheme ($1), it one exists
        }
    }
    /**
     * Strips any protocol-relative '//' from the anchor text.
     *
     * @private
     * @param {String} text The text of the anchor that is being generated, for which to strip off the
     *   protocol-relative prefix (such as stripping off "//")
     * @return {String} The `anchorText`, with the protocol-relative prefix stripped.
     */
    function stripProtocolRelativePrefix(text) {
        return text.replace(protocolRelativeRegex, '');
    }
    /**
     * Removes any trailing slash from the given `anchorText`, in preparation for the text to be displayed.
     *
     * @private
     * @param {String} anchorText The text of the anchor that is being generated, for which to remove any trailing
     *   slash ('/') that may exist.
     * @return {String} The `anchorText`, with the trailing slash removed.
     */
    function removeTrailingSlash(anchorText) {
        if (anchorText.charAt(anchorText.length - 1) === '/') {
            anchorText = anchorText.slice(0, -1);
        }
        return anchorText;
    }
    /**
     * Decodes percent-encoded characters from the given `anchorText`, in
     * preparation for the text to be displayed.
     *
     * @private
     * @param {String} anchorText The text of the anchor that is being
     *   generated, for which to decode any percent-encoded characters.
     * @return {String} The `anchorText`, with the percent-encoded characters
     *   decoded.
     */
    function removePercentEncoding(anchorText) {
        // First, convert a few of the known % encodings to the corresponding
        // HTML entities that could accidentally be interpretted as special
        // HTML characters
        // NOTE: This used to be written as 5 separate .replace() calls, but that
        //       was 25% slower than the current form below according to jsperf
        var preProcessedEntityAnchorText = anchorText.replace(/%(?:22|26|27|3C|3E)/gi, function (match) {
            if (match === '%22')
                return '&quot;'; // %22: '"' char
            if (match === '%26')
                return '&amp;'; // %26: '&' char
            if (match === '%27')
                return '&#39;'; // %27: "'" char
            if (match === '%3C' || match === '%3c')
                return '&lt;'; // %3C: '<' char
            /*if (match === '%3E' || match === '%3e')*/ return '&gt;'; // %3E: '>' char
        });
        // Now attempt to URL-decode the rest of the anchor text. However,
        // decodeURIComponent() is a slow function. Only call it if we have
        // remaining %-encoded entities. Adding this check added ~300 ops/sec to
        // benchmark
        if (preProcessedEntityAnchorText.includes('%')) {
            try {
                return decodeURIComponent(preProcessedEntityAnchorText);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            }
            catch (error) {
                // Invalid % escape sequence in the anchor text, we'll simply return
                // the preProcessedEntityAnchorText below
            }
        }
        return preProcessedEntityAnchorText;
    }

    /**
     * A regular expression to match a 'mailto:' prefix on an email address.
     */
    var mailtoSchemePrefixRe = /^mailto:/i;
    /**
     * Determines if the given character may start the "local part" of an email
     * address. The local part is the part to the left of the '@' sign.
     *
     * Technically according to the email spec, any of the characters in the
     * {@link emailLocalPartCharRegex} can start an email address (including any of
     * the special characters), but this is so rare in the wild and the
     * implementation is much simpler by only starting an email address with a word
     * character. This is especially important when matching the '{' character which
     * generally starts a brace that isn't part of the email address.
     */
    var isEmailLocalPartStartChar = isAlphaNumericOrMarkChar; // alias for clarity
    /**
     * Determines if the given character can be part of the "local part" of an email
     * address. The local part is the part to the left of the '@' sign.
     *
     * Checking for an email address's start char is handled with {@link #isEmailLocalPartStartChar}
     */
    function isEmailLocalPartChar(charCode) {
        return isEmailLocalPartStartChar(charCode) || isValidEmailLocalPartSpecialChar(charCode);
    }
    /**
     * Determines if the given email address is valid. We consider it valid if it
     * has a valid TLD in its host.
     *
     * @param emailAddress email address
     * @return true is email have valid TLD, false otherwise
     */
    function isValidEmail(emailAddress) {
        var emailAddressTld = emailAddress.split('.').pop(); // as long as we have a valid string (as opposed to null or undefined), we will always get at least one element in the .split('.') array
        return isKnownTld(emailAddressTld);
    }

    /**
     * @class Autolinker.match.Email
     * @extends Autolinker.match.AbstractMatch
     *
     * Represents a Email match found in an input string which should be Autolinked.
     *
     * See this class's superclass ({@link Autolinker.match.Match}) for more details.
     */
    var EmailMatch = /** @class */ (function (_super) {
        __extends(EmailMatch, _super);
        /**
         * @method constructor
         * @param {Object} cfg The configuration properties for the Match
         *   instance, specified in an Object (map).
         */
        function EmailMatch(cfg) {
            var _this = _super.call(this, cfg) || this;
            /**
             * @public
             * @property {'email'} type
             *
             * A string name for the type of match that this class represents. Can be
             * used in a TypeScript discriminating union to type-narrow from the
             * `Match` type.
             */
            _this.type = 'email';
            /**
             * @cfg {String} email (required)
             *
             * The email address that was matched.
             */
            _this.email = ''; // default value just to get the above doc comment in the ES5 output and documentation generator
            _this.email = cfg.email;
            return _this;
        }
        /**
         * Returns a string name for the type of match that this class represents.
         * For the case of EmailMatch, returns 'email'.
         *
         * @return {String}
         */
        EmailMatch.prototype.getType = function () {
            return 'email';
        };
        /**
         * Returns the email address that was matched.
         *
         * @return {String}
         */
        EmailMatch.prototype.getEmail = function () {
            return this.email;
        };
        /**
         * Returns the anchor href that should be generated for the match.
         *
         * @return {String}
         */
        EmailMatch.prototype.getAnchorHref = function () {
            return 'mailto:' + this.email;
        };
        /**
         * Returns the anchor text that should be generated for the match.
         *
         * @return {String}
         */
        EmailMatch.prototype.getAnchorText = function () {
            return this.email;
        };
        return EmailMatch;
    }(AbstractMatch));

    /**
     * Determines if the given `char` is a an allowed character in a hashtag. These
     * are underscores or any alphanumeric char.
     */
    function isHashtagTextChar(charCode) {
        return charCode === 95 /* Char.Underscore */ || isAlphaNumericOrMarkChar(charCode);
    }
    /**
     * Determines if a hashtag match is valid.
     */
    function isValidHashtag(hashtag) {
        // Max length of 140 for a hashtag ('#' char + 139 word chars)
        return hashtag.length <= 140;
    }
    var hashtagServices = [
        'twitter',
        'facebook',
        'instagram',
        'tiktok',
        'youtube',
    ];

    /**
     * @class Autolinker.match.Hashtag
     * @extends Autolinker.match.AbstractMatch
     *
     * Represents a Hashtag match found in an input string which should be
     * Autolinked.
     *
     * See this class's superclass ({@link Autolinker.match.Match}) for more
     * details.
     */
    var HashtagMatch = /** @class */ (function (_super) {
        __extends(HashtagMatch, _super);
        /**
         * @method constructor
         * @param {Object} cfg The configuration properties for the Match
         *   instance, specified in an Object (map).
         */
        function HashtagMatch(cfg) {
            var _this = _super.call(this, cfg) || this;
            /**
             * @public
             * @property {'hashtag'} type
             *
             * A string name for the type of match that this class represents. Can be
             * used in a TypeScript discriminating union to type-narrow from the
             * `Match` type.
             */
            _this.type = 'hashtag';
            /**
             * @cfg {String} serviceName
             *
             * The service to point hashtag matches to. See {@link Autolinker#hashtag}
             * for available values.
             */
            _this.serviceName = 'twitter'; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {String} hashtag (required)
             *
             * The HashtagMatch that was matched, without the '#'.
             */
            _this.hashtag = ''; // default value just to get the above doc comment in the ES5 output and documentation generator
            _this.serviceName = cfg.serviceName;
            _this.hashtag = cfg.hashtag;
            return _this;
        }
        /**
         * Returns a string name for the type of match that this class represents.
         * For the case of HashtagMatch, returns 'hashtag'.
         *
         * @return {String}
         */
        HashtagMatch.prototype.getType = function () {
            return 'hashtag';
        };
        /**
         * Returns the configured {@link #serviceName} to point the HashtagMatch to.
         * Ex: 'facebook', 'twitter'.
         *
         * @return {String}
         */
        HashtagMatch.prototype.getServiceName = function () {
            return this.serviceName;
        };
        /**
         * Returns the matched hashtag, without the '#' character.
         *
         * @return {String}
         */
        HashtagMatch.prototype.getHashtag = function () {
            return this.hashtag;
        };
        /**
         * Returns the anchor href that should be generated for the match.
         *
         * @return {String}
         */
        HashtagMatch.prototype.getAnchorHref = function () {
            var serviceName = this.serviceName, hashtag = this.hashtag;
            switch (serviceName) {
                case 'twitter':
                    return 'https://twitter.com/hashtag/' + hashtag;
                case 'facebook':
                    return 'https://www.facebook.com/hashtag/' + hashtag;
                case 'instagram':
                    return 'https://instagram.com/explore/tags/' + hashtag;
                case 'tiktok':
                    return 'https://www.tiktok.com/tag/' + hashtag;
                case 'youtube':
                    return 'https://youtube.com/hashtag/' + hashtag;
                /* istanbul ignore next */
                default:
                    // Should never happen because Autolinker's constructor should block any invalid values, but just in case
                    assertNever(serviceName);
            }
        };
        /**
         * Returns the anchor text that should be generated for the match.
         *
         * @return {String}
         */
        HashtagMatch.prototype.getAnchorText = function () {
            return '#' + this.hashtag;
        };
        /**
         * Returns the CSS class suffixes that should be used on a tag built with
         * the match. See {@link Autolinker.match.Match#getCssClassSuffixes} for
         * details.
         *
         * @return {String[]}
         */
        HashtagMatch.prototype.getCssClassSuffixes = function () {
            var cssClassSuffixes = _super.prototype.getCssClassSuffixes.call(this), serviceName = this.getServiceName();
            if (serviceName) {
                cssClassSuffixes.push(serviceName);
            }
            return cssClassSuffixes;
        };
        return HashtagMatch;
    }(AbstractMatch));

    var mentionRegexes = {
        twitter: /^@\w{1,15}$/,
        instagram: /^@[_\w]{1,30}$/,
        soundcloud: /^@[-a-z0-9_]{3,25}$/,
        // TikTok usernames are 1-24 characters containing letters, numbers, underscores
        // and periods, but cannot end in a period: https://support.tiktok.com/en/getting-started/setting-up-your-profile/changing-your-username
        tiktok: /^@[.\w]{1,23}[\w]$/,
        // Youtube usernames are 3-30 characters containing letters, numbers, underscores,
        // dashes, or latin middle dots ('·').
        // https://support.google.com/youtube/answer/11585688?hl=en&co=GENIE.Platform%3DAndroid#tns
        youtube: /^@[-.·\w]{3,30}$/,
    };
    /**
     * Determines if the given character can be part of a mention's text characters.
     *
     * Accepts characters that match the RegExp `/[-\w.]/`, which are the possible
     * mention characters for any service.
     *
     * We'll confirm the match based on the user-configured service name after the
     * match is found.
     */
    function isMentionTextChar(charCode) {
        return (charCode === 45 /* Char.Dash */ || // '-'
            charCode === 46 /* Char.Dot */ || // '.'
            charCode === 95 /* Char.Underscore */ || // '_'
            isAsciiLetterChar(charCode) ||
            isDigitChar(charCode));
    }
    /**
     * Determines if the given `mention` text is valid.
     */
    function isValidMention(mention, serviceName) {
        var re = mentionRegexes[serviceName];
        return re.test(mention);
    }
    var mentionServices = [
        'twitter',
        'instagram',
        'soundcloud',
        'tiktok',
        'youtube',
    ];

    /**
     * @class Autolinker.match.Mention
     * @extends Autolinker.match.AbstractMatch
     *
     * Represents a Mention match found in an input string which should be Autolinked.
     *
     * See this class's superclass ({@link Autolinker.match.Match}) for more details.
     */
    var MentionMatch = /** @class */ (function (_super) {
        __extends(MentionMatch, _super);
        /**
         * @method constructor
         * @param {Object} cfg The configuration properties for the Match
         *   instance, specified in an Object (map).
         */
        function MentionMatch(cfg) {
            var _this = _super.call(this, cfg) || this;
            /**
             * @public
             * @property {'mention'} type
             *
             * A string name for the type of match that this class represents. Can be
             * used in a TypeScript discriminating union to type-narrow from the
             * `Match` type.
             */
            _this.type = 'mention';
            /**
             * @cfg {String} serviceName
             *
             * The service to point mention matches to. See {@link Autolinker#mention}
             * for available values.
             */
            _this.serviceName = 'twitter'; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {String} mention (required)
             *
             * The Mention that was matched, without the '@' character.
             */
            _this.mention = ''; // default value just to get the above doc comment in the ES5 output and documentation generator
            _this.mention = cfg.mention;
            _this.serviceName = cfg.serviceName;
            return _this;
        }
        /**
         * Returns a string name for the type of match that this class represents.
         * For the case of MentionMatch, returns 'mention'.
         *
         * @return {String}
         */
        MentionMatch.prototype.getType = function () {
            return 'mention';
        };
        /**
         * Returns the mention, without the '@' character.
         *
         * @return {String}
         */
        MentionMatch.prototype.getMention = function () {
            return this.mention;
        };
        /**
         * Returns the configured {@link #serviceName} to point the mention to.
         * Ex: 'instagram', 'twitter', 'soundcloud'.
         *
         * @return {String}
         */
        MentionMatch.prototype.getServiceName = function () {
            return this.serviceName;
        };
        /**
         * Returns the anchor href that should be generated for the match.
         *
         * @return {String}
         */
        MentionMatch.prototype.getAnchorHref = function () {
            switch (this.serviceName) {
                case 'twitter':
                    return 'https://twitter.com/' + this.mention;
                case 'instagram':
                    return 'https://instagram.com/' + this.mention;
                case 'soundcloud':
                    return 'https://soundcloud.com/' + this.mention;
                case 'tiktok':
                    return 'https://www.tiktok.com/@' + this.mention;
                case 'youtube':
                    return 'https://youtube.com/@' + this.mention;
                /* istanbul ignore next */
                default:
                    // Should never happen because Autolinker's constructor should block any invalid values, but just in case.
                    assertNever(this.serviceName);
            }
        };
        /**
         * Returns the anchor text that should be generated for the match.
         *
         * @return {String}
         */
        MentionMatch.prototype.getAnchorText = function () {
            return '@' + this.mention;
        };
        /**
         * Returns the CSS class suffixes that should be used on a tag built with
         * the match. See {@link Autolinker.match.Match#getCssClassSuffixes} for
         * details.
         *
         * @return {String[]}
         */
        MentionMatch.prototype.getCssClassSuffixes = function () {
            var cssClassSuffixes = _super.prototype.getCssClassSuffixes.call(this), serviceName = this.getServiceName();
            if (serviceName) {
                cssClassSuffixes.push(serviceName);
            }
            return cssClassSuffixes;
        };
        return MentionMatch;
    }(AbstractMatch));

    // Regex that specifies any delimiter char that allows us to treat the number as
    // a phone number rather than just any other number that could appear in text.
    var hasDelimCharsRe = /[-. ()]/;
    // Over the years, many people have added to this regex, but it should have been
    // split up by country. Maybe one day we can break this down.
    var mostPhoneNumbers = /(?:(?:(?:(\+)?\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4})|(?:(\+)(?:9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)[-. ]?(?:\d[-. ]?){6,12}\d+))([,;]+[0-9]+#?)*/;
    // Regex for Japanese phone numbers
    var japanesePhoneRe = /(0([1-9]-?[1-9]\d{3}|[1-9]{2}-?\d{3}|[1-9]{2}\d{1}-?\d{2}|[1-9]{2}\d{2}-?\d{1})-?\d{4}|0[789]0-?\d{4}-?\d{4}|050-?\d{4}-?\d{4})/;
    // Combined regex
    var validPhoneNumberRe = new RegExp("^".concat(mostPhoneNumbers.source, "|").concat(japanesePhoneRe.source, "$"));
    /**
     * Determines if the character is a phone number separator character (i.e.
     * '-', '.', or ' ' (space))
     */
    function isPhoneNumberSeparatorChar(charCode) {
        return (charCode === 45 /* Char.Dash */ || // '-'
            charCode === 46 /* Char.Dot */ || // '.'
            charCode === 32 /* Char.Space */ // ' '
        );
    }
    /**
     * Determines if the character is a control character in a phone number. Control
     * characters are as follows:
     *
     * - ',': A 1 second pause. Useful for dialing extensions once the main phone number has been reached
     * - ';': A "wait" that waits for the user to take action (tap something, for instance on a smart phone)
     */
    function isPhoneNumberControlChar(charCode) {
        return (charCode === 44 /* Char.Comma */ || // ','
            charCode === 59 /* Char.SemiColon */ // ';'
        );
    }
    /**
     * Determines if the given phone number text found in a string is a valid phone
     * number.
     *
     * Our state machine parser is simplified to grab anything that looks like a
     * phone number, and this function confirms the match.
     */
    function isValidPhoneNumber(phoneNumberText) {
        // We'll only consider the match as a phone number if there is some kind of
        // delimiter character (a prefixed '+' sign, or separator chars).
        //
        // Accepts:
        //     (123) 456-7890
        //     +38755233976
        // Does not accept:
        //     1234567890  (no delimiter chars - may just be a random number that's not a phone number)
        var hasDelimiters = phoneNumberText.charAt(0) === '+' || hasDelimCharsRe.test(phoneNumberText);
        return hasDelimiters && validPhoneNumberRe.test(phoneNumberText);
    }

    /**
     * @class Autolinker.match.Phone
     * @extends Autolinker.match.AbstractMatch
     *
     * Represents a Phone number match found in an input string which should be
     * Autolinked.
     *
     * See this class's superclass ({@link Autolinker.match.Match}) for more
     * details.
     */
    var PhoneMatch = /** @class */ (function (_super) {
        __extends(PhoneMatch, _super);
        /**
         * @method constructor
         * @param {Object} cfg The configuration properties for the Match
         *   instance, specified in an Object (map).
         */
        function PhoneMatch(cfg) {
            var _this = _super.call(this, cfg) || this;
            /**
             * @public
             * @property {'phone'} type
             *
             * A string name for the type of match that this class represents. Can be
             * used in a TypeScript discriminating union to type-narrow from the
             * `Match` type.
             */
            _this.type = 'phone';
            /**
             * @protected
             * @property {String} number (required)
             *
             * The phone number that was matched, without any delimiter characters.
             *
             * Note: This is a string to allow for prefixed 0's.
             */
            _this.number = ''; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @protected
             * @property  {Boolean} plusSign (required)
             *
             * `true` if the matched phone number started with a '+' sign. We'll include
             * it in the `tel:` URL if so, as this is needed for international numbers.
             *
             * Ex: '+1 (123) 456 7879'
             */
            _this.plusSign = false; // default value just to get the above doc comment in the ES5 output and documentation generator
            _this.number = cfg.number;
            _this.plusSign = cfg.plusSign;
            return _this;
        }
        /**
         * Returns a string name for the type of match that this class represents.
         * For the case of PhoneMatch, returns 'phone'.
         *
         * @return {String}
         */
        PhoneMatch.prototype.getType = function () {
            return 'phone';
        };
        /**
         * Returns the phone number that was matched as a string, without any
         * delimiter characters.
         *
         * Note: This is a string to allow for prefixed 0's.
         *
         * @return {String}
         */
        PhoneMatch.prototype.getPhoneNumber = function () {
            return this.number;
        };
        /**
         * Alias of {@link #getPhoneNumber}, returns the phone number that was
         * matched as a string, without any delimiter characters.
         *
         * Note: This is a string to allow for prefixed 0's.
         *
         * @return {String}
         */
        PhoneMatch.prototype.getNumber = function () {
            return this.getPhoneNumber();
        };
        /**
         * Returns the anchor href that should be generated for the match.
         *
         * @return {String}
         */
        PhoneMatch.prototype.getAnchorHref = function () {
            return 'tel:' + (this.plusSign ? '+' : '') + this.number;
        };
        /**
         * Returns the anchor text that should be generated for the match.
         *
         * @return {String}
         */
        PhoneMatch.prototype.getAnchorText = function () {
            return this.matchedText;
        };
        return PhoneMatch;
    }(AbstractMatch));

    // For debugging: search for and uncomment other "For debugging" lines
    // import CliTable from 'cli-table';
    /**
     * Context object containing all the state needed by the state machine functions.
     *
     * ## Historical note
     *
     * In v4.1.1, we used nested functions to handle the context via closures, but
     * this necessitated re-creating the functions for each call to `parseMatches()`,
     * which made them difficult for v8 to JIT optimize. In v4.1.2, we lifted all of
     * the functions to the top-level scope and passed the context object between
     * them, which allows the functions to be JIT compiled once and reused.
     */
    var ParseMatchesContext = /** @class */ (function () {
        function ParseMatchesContext(text, args) {
            this.charIdx = 0; // Current character index being processed
            this.matches = []; // Collection of matches found
            this._stateMachines = []; // Array of active state machines
            this.schemeUrlMachinesCount = 0; // part of an optimization to remove the need to go into a slow code block when unnecessary. Since it's been so long since the initial implementation, not sure that this can ever go above 1, but keeping it as a counter to be safe
            this.text = text;
            this.tagBuilder = args.tagBuilder;
            this.stripPrefix = args.stripPrefix;
            this.stripTrailingSlash = args.stripTrailingSlash;
            this.decodePercentEncoding = args.decodePercentEncoding;
            this.hashtagServiceName = args.hashtagServiceName;
            this.mentionServiceName = args.mentionServiceName;
        }
        Object.defineProperty(ParseMatchesContext.prototype, "stateMachines", {
            get: function () {
                return this._stateMachines;
            },
            enumerable: false,
            configurable: true
        });
        ParseMatchesContext.prototype.addMachine = function (stateMachine) {
            this._stateMachines.push(stateMachine);
            if (isSchemeUrlStateMachine(stateMachine)) {
                this.schemeUrlMachinesCount++;
            }
        };
        ParseMatchesContext.prototype.removeMachine = function (stateMachine) {
            // Performance note: this was originally implemented with Array.prototype.splice()
            // and mutated the array in place. Switching to filter added ~280ops/sec
            // on the benchmark, although likely at the expense of GC time. Perhaps
            // in the future, we implement a rotating array so we never need to move
            // or clean anything up
            this._stateMachines = this._stateMachines.filter(function (m) { return m !== stateMachine; });
            // If we've removed the URL state machine, set the flag to false.
            // This flag is a quick test that helps us skip a slow section of
            // code when there is already a URL state machine present.
            if (isSchemeUrlStateMachine(stateMachine)) {
                this.schemeUrlMachinesCount--;
            }
        };
        ParseMatchesContext.prototype.hasSchemeUrlMachine = function () {
            return this.schemeUrlMachinesCount > 0;
        };
        return ParseMatchesContext;
    }());
    /**
     * Parses URL, email, twitter, mention, and hashtag matches from the given
     * `text`.
     */
    function parseMatches(text, args) {
        // Create the context object that will be passed to all state functions
        var context = new ParseMatchesContext(text, args);
        // For debugging: search for and uncomment other "For debugging" lines
        // const table = new CliTable({
        //     head: ['charIdx', 'char', 'code', 'type', 'states', 'startIdx', 'reached accept state'],
        // });
        for (; context.charIdx < context.text.length; context.charIdx++) {
            var char = text.charAt(context.charIdx);
            var charCode = text.charCodeAt(context.charIdx);
            if (context.stateMachines.length === 0) {
                stateNoMatch(context, char, charCode);
            }
            else {
                // Must loop through the state machines backwards for when one
                // is removed
                for (var stateIdx = context.stateMachines.length - 1; stateIdx >= 0; stateIdx--) {
                    var stateMachine = context.stateMachines[stateIdx];
                    switch (stateMachine.state) {
                        // Protocol-relative URL states
                        case 11 /* State.ProtocolRelativeSlash1 */:
                            stateProtocolRelativeSlash1(context, stateMachine, charCode);
                            break;
                        case 12 /* State.ProtocolRelativeSlash2 */:
                            stateProtocolRelativeSlash2(context, stateMachine, charCode);
                            break;
                        case 0 /* State.SchemeChar */:
                            stateSchemeChar(context, stateMachine, charCode);
                            break;
                        case 1 /* State.SchemeHyphen */:
                            stateSchemeHyphen(context, stateMachine, charCode);
                            break;
                        case 2 /* State.SchemeColon */:
                            stateSchemeColon(context, stateMachine, charCode);
                            break;
                        case 3 /* State.SchemeSlash1 */:
                            stateSchemeSlash1(context, stateMachine, charCode);
                            break;
                        case 4 /* State.SchemeSlash2 */:
                            stateSchemeSlash2(context, stateMachine, char, charCode);
                            break;
                        case 5 /* State.DomainLabelChar */:
                            stateDomainLabelChar(context, stateMachine, charCode);
                            break;
                        case 6 /* State.DomainHyphen */:
                            stateDomainHyphen(context, stateMachine, char, charCode);
                            break;
                        case 7 /* State.DomainDot */:
                            stateDomainDot(context, stateMachine, char, charCode);
                            break;
                        case 13 /* State.IpV4Digit */:
                            stateIpV4Digit(context, stateMachine, charCode);
                            break;
                        case 14 /* State.IpV4Dot */:
                            stateIpV4Dot(context, stateMachine, charCode);
                            break;
                        case 8 /* State.PortColon */:
                            statePortColon(context, stateMachine, charCode);
                            break;
                        case 9 /* State.PortNumber */:
                            statePortNumber(context, stateMachine, charCode);
                            break;
                        case 10 /* State.Path */:
                            statePath(context, stateMachine, charCode);
                            break;
                        // Email States
                        case 15 /* State.EmailMailto_M */:
                            stateEmailMailto_M(context, stateMachine, char, charCode);
                            break;
                        case 16 /* State.EmailMailto_A */:
                            stateEmailMailto_A(context, stateMachine, char, charCode);
                            break;
                        case 17 /* State.EmailMailto_I */:
                            stateEmailMailto_I(context, stateMachine, char, charCode);
                            break;
                        case 18 /* State.EmailMailto_L */:
                            stateEmailMailto_L(context, stateMachine, char, charCode);
                            break;
                        case 19 /* State.EmailMailto_T */:
                            stateEmailMailto_T(context, stateMachine, char, charCode);
                            break;
                        case 20 /* State.EmailMailto_O */:
                            stateEmailMailto_O(context, stateMachine, charCode);
                            break;
                        case 21 /* State.EmailMailto_Colon */:
                            stateEmailMailtoColon(context, stateMachine, charCode);
                            break;
                        case 22 /* State.EmailLocalPart */:
                            stateEmailLocalPart(context, stateMachine, charCode);
                            break;
                        case 23 /* State.EmailLocalPartDot */:
                            stateEmailLocalPartDot(context, stateMachine, charCode);
                            break;
                        case 24 /* State.EmailAtSign */:
                            stateEmailAtSign(context, stateMachine, charCode);
                            break;
                        case 25 /* State.EmailDomainChar */:
                            stateEmailDomainChar(context, stateMachine, charCode);
                            break;
                        case 26 /* State.EmailDomainHyphen */:
                            stateEmailDomainHyphen(context, stateMachine, charCode);
                            break;
                        case 27 /* State.EmailDomainDot */:
                            stateEmailDomainDot(context, stateMachine, charCode);
                            break;
                        // Hashtag states
                        case 28 /* State.HashtagHashChar */:
                            stateHashtagHashChar(context, stateMachine, charCode);
                            break;
                        case 29 /* State.HashtagTextChar */:
                            stateHashtagTextChar(context, stateMachine, charCode);
                            break;
                        // Mention states
                        case 30 /* State.MentionAtChar */:
                            stateMentionAtChar(context, stateMachine, charCode);
                            break;
                        case 31 /* State.MentionTextChar */:
                            stateMentionTextChar(context, stateMachine, charCode);
                            break;
                        // Phone number states
                        case 32 /* State.PhoneNumberOpenParen */:
                            statePhoneNumberOpenParen(context, stateMachine, char, charCode);
                            break;
                        case 33 /* State.PhoneNumberAreaCodeDigit1 */:
                            statePhoneNumberAreaCodeDigit1(context, stateMachine, charCode);
                            break;
                        case 34 /* State.PhoneNumberAreaCodeDigit2 */:
                            statePhoneNumberAreaCodeDigit2(context, stateMachine, charCode);
                            break;
                        case 35 /* State.PhoneNumberAreaCodeDigit3 */:
                            statePhoneNumberAreaCodeDigit3(context, stateMachine, charCode);
                            break;
                        case 36 /* State.PhoneNumberCloseParen */:
                            statePhoneNumberCloseParen(context, stateMachine, char, charCode);
                            break;
                        case 37 /* State.PhoneNumberPlus */:
                            statePhoneNumberPlus(context, stateMachine, char, charCode);
                            break;
                        case 38 /* State.PhoneNumberDigit */:
                            statePhoneNumberDigit(context, stateMachine, char, charCode);
                            break;
                        case 39 /* State.PhoneNumberSeparator */:
                            statePhoneNumberSeparator(context, stateMachine, char, charCode);
                            break;
                        case 40 /* State.PhoneNumberControlChar */:
                            statePhoneNumberControlChar(context, stateMachine, charCode);
                            break;
                        case 41 /* State.PhoneNumberPoundChar */:
                            statePhoneNumberPoundChar(context, stateMachine, charCode);
                            break;
                        /* istanbul ignore next */
                        default:
                            assertNever(stateMachine.state);
                    }
                }
                // Special case for handling a colon (or other non-alphanumeric)
                // when preceded by another character, such as in the text:
                //     Link 1:http://google.com
                // In this case, the 'h' character after the colon wouldn't start a
                // new scheme url because we'd be in a ipv4 or tld url and the colon
                // would be interpreted as a port ':' char. Also, only start a new
                // scheme url machine if there isn't currently one so we don't start
                // new ones for colons inside a url
                //
                // TODO: The addition of this snippet (to fix the bug) in 4.0.1 lost
                // us ~500 ops/sec on the benchmarks. Optimizing it with the
                // hasSchemeUrlMachine() flag and optimizing the isSchemeStartChar()
                // method for 4.1.3 got us back about ~400ops/sec. One potential way
                // to improve this even ore is to add this snippet to individual
                // state handler functions where it can occur to prevent running it
                // on every loop interation.
                if (!context.hasSchemeUrlMachine() &&
                    context.charIdx > 0 &&
                    isSchemeStartChar(charCode)) {
                    var prevCharCode = context.text.charCodeAt(context.charIdx - 1);
                    if (!isSchemeStartChar(prevCharCode)) {
                        context.addMachine(createSchemeUrlStateMachine(context.charIdx, 0 /* State.SchemeChar */));
                    }
                }
            }
            // For debugging: search for and uncomment other "For debugging" lines
            // table.push([
            //     String(context.charIdx),
            //     char,
            //     `10: ${char.charCodeAt(0)}\n0x: ${char.charCodeAt(0).toString(16)}\nU+${char.codePointAt(0)}`,
            //     context.stateMachines.map(machine => `${StateMachineType[machine.type]}${'matchType' in machine ? ` (${UrlStateMachineMatchType[machine.matchType]})` : ''}`).join('\n') || '(none)',
            //     context.stateMachines.map(machine => State[machine.state]).join('\n') || '(none)',
            //     context.stateMachines.map(m => m.startIdx).join('\n'),
            //     context.stateMachines.map(m => m.acceptStateReached).join('\n'),
            // ]);
        }
        // Capture any valid match at the end of the string
        // Note: this loop must happen in reverse because
        // captureMatchIfValidAndRemove() removes state machines from the array
        // and we'll end up skipping every other one if we remove while looping
        // forward
        for (var i = context.stateMachines.length - 1; i >= 0; i--) {
            context.stateMachines.forEach(function (stateMachine) {
                return captureMatchIfValidAndRemove(context, stateMachine);
            });
        }
        // For debugging: search for and uncomment other "For debugging" lines
        // console.log(`\nRead string:\n  ${text}`);
        // console.log(table.toString());
        return context.matches;
    }
    /**
     * Handles the state when we're not in a URL/email/etc. (i.e. when no state machines exist)
     */
    function stateNoMatch(context, char, charCode) {
        var charIdx = context.charIdx;
        if (charCode === 35 /* Char.NumberSign */ /* '#' */) {
            // Hash char, start a Hashtag match
            context.addMachine(createHashtagStateMachine(charIdx, 28 /* State.HashtagHashChar */));
        }
        else if (charCode === 64 /* Char.AtSign */ /* '@' */) {
            // '@' char, start a Mention match
            context.addMachine(createMentionStateMachine(charIdx, 30 /* State.MentionAtChar */));
        }
        else if (charCode === 47 /* Char.Slash */ /* '/' */) {
            // A slash could begin a protocol-relative URL
            context.addMachine(createTldUrlStateMachine(charIdx, 11 /* State.ProtocolRelativeSlash1 */));
        }
        else if (charCode === 43 /* Char.Plus */ /* '+' */) {
            // A '+' char can start a Phone number
            context.addMachine(createPhoneNumberStateMachine(charIdx, 37 /* State.PhoneNumberPlus */));
        }
        else if (charCode === 40 /* Char.OpenParen */ /* '(' */) {
            context.addMachine(createPhoneNumberStateMachine(charIdx, 32 /* State.PhoneNumberOpenParen */));
        }
        else {
            if (isDigitChar(charCode)) {
                // A digit could start a phone number
                context.addMachine(createPhoneNumberStateMachine(charIdx, 38 /* State.PhoneNumberDigit */));
                // A digit could start an IP address
                context.addMachine(createIpV4UrlStateMachine(charIdx, 13 /* State.IpV4Digit */));
            }
            if (isEmailLocalPartStartChar(charCode)) {
                // Any email local part. An 'm' character in particular could
                // start a 'mailto:' match
                var startState = char.toLowerCase() === 'm' ? 15 /* State.EmailMailto_M */ : 22 /* State.EmailLocalPart */;
                context.addMachine(createEmailStateMachine(charIdx, startState));
            }
            if (isSchemeStartChar(charCode)) {
                // An uppercase or lowercase letter may start a scheme match
                context.addMachine(createSchemeUrlStateMachine(charIdx, 0 /* State.SchemeChar */));
            }
            if (isAlphaNumericOrMarkChar(charCode)) {
                // A unicode alpha character or digit could start a domain name
                // label for a TLD match
                context.addMachine(createTldUrlStateMachine(charIdx, 5 /* State.DomainLabelChar */));
            }
        }
        // Anything else, remain in the "non-url" state by not creating any
        // state machines
    }
    // Implements ABNF: ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
    function stateSchemeChar(context, stateMachine, charCode) {
        if (charCode === 58 /* Char.Colon */ /* ':' */) {
            stateMachine.state = 2 /* State.SchemeColon */;
        }
        else if (charCode === 45 /* Char.Dash */ /* '-' */) {
            stateMachine.state = 1 /* State.SchemeHyphen */;
        }
        else if (isSchemeChar(charCode)) ;
        else {
            // Any other character, not a scheme
            context.removeMachine(stateMachine);
        }
    }
    function stateSchemeHyphen(context, stateMachine, charCode) {
        var charIdx = context.charIdx;
        if (charCode === 45 /* Char.Dash */ /* '-' */) ;
        else if (charCode === 47 /* Char.Slash */ /* '/' */) {
            // Not a valid scheme match, but may be the start of a
            // protocol-relative match (such as //google.com)
            context.removeMachine(stateMachine);
            context.addMachine(createTldUrlStateMachine(charIdx, 11 /* State.ProtocolRelativeSlash1 */));
        }
        else if (isSchemeChar(charCode)) {
            stateMachine.state = 0 /* State.SchemeChar */;
        }
        else {
            // Any other character, not a scheme
            context.removeMachine(stateMachine);
        }
    }
    // https://tools.ietf.org/html/rfc3986#appendix-A
    function stateSchemeColon(context, stateMachine, charCode) {
        var charIdx = context.charIdx;
        if (charCode === 47 /* Char.Slash */ /* '/' */) {
            stateMachine.state = 3 /* State.SchemeSlash1 */;
        }
        else if (charCode === 46 /* Char.Dot */ /* '.' */) {
            // We've read something like 'hello:.' - don't capture
            context.removeMachine(stateMachine);
        }
        else if (isDomainLabelStartChar(charCode)) {
            stateMachine.state = 5 /* State.DomainLabelChar */;
            // It's possible that we read an "introduction" piece of text,
            // and the character after the current colon actually starts an
            // actual scheme. An example of this is:
            //     "The link:http://google.com"
            // Hence, start a new machine to capture this match if so
            if (isSchemeStartChar(charCode)) {
                context.addMachine(createSchemeUrlStateMachine(charIdx, 0 /* State.SchemeChar */));
            }
        }
        else {
            context.removeMachine(stateMachine);
        }
    }
    // https://tools.ietf.org/html/rfc3986#appendix-A
    function stateSchemeSlash1(context, stateMachine, charCode) {
        if (charCode === 47 /* Char.Slash */ /* '/' */) {
            stateMachine.state = 4 /* State.SchemeSlash2 */;
        }
        else if (isPathChar(charCode)) {
            stateMachine.state = 10 /* State.Path */;
            stateMachine.acceptStateReached = true;
        }
        else {
            captureMatchIfValidAndRemove(context, stateMachine);
        }
    }
    function stateSchemeSlash2(context, stateMachine, char, charCode) {
        if (charCode === 47 /* Char.Slash */ /* '/' */) {
            // 3rd slash, must be an absolute path (`path-absolute` in the
            // ABNF), such as in "file:///c:/windows/etc". See
            // https://tools.ietf.org/html/rfc3986#appendix-A
            stateMachine.state = 10 /* State.Path */;
            stateMachine.acceptStateReached = true;
        }
        else if (isDomainLabelStartChar(charCode)) {
            // start of "authority" section - see https://tools.ietf.org/html/rfc3986#appendix-A
            stateMachine.state = 5 /* State.DomainLabelChar */;
            stateMachine.acceptStateReached = true;
        }
        else {
            // not valid
            context.removeMachine(stateMachine);
        }
    }
    // Handles after we've read a '/' from the NonUrl state
    function stateProtocolRelativeSlash1(context, stateMachine, charCode) {
        if (charCode === 47 /* Char.Slash */ /* '/' */) {
            stateMachine.state = 12 /* State.ProtocolRelativeSlash2 */;
        }
        else {
            // Anything else, cannot be the start of a protocol-relative
            // URL.
            context.removeMachine(stateMachine);
        }
    }
    // Handles after we've read a second '/', which could start a protocol-relative URL
    function stateProtocolRelativeSlash2(context, stateMachine, charCode) {
        if (isDomainLabelStartChar(charCode)) {
            stateMachine.state = 5 /* State.DomainLabelChar */;
        }
        else {
            // Anything else, not a URL
            context.removeMachine(stateMachine);
        }
    }
    // Handles when we have read a domain label character
    function stateDomainLabelChar(context, stateMachine, charCode) {
        if (charCode === 46 /* Char.Dot */ /* '.' */) {
            stateMachine.state = 7 /* State.DomainDot */;
        }
        else if (charCode === 45 /* Char.Dash */ /* '-' */) {
            stateMachine.state = 6 /* State.DomainHyphen */;
        }
        else if (charCode === 58 /* Char.Colon */ /* ':' */) {
            // Beginning of a port number, end the domain name
            stateMachine.state = 8 /* State.PortColon */;
        }
        else if (isUrlSuffixStartChar(charCode)) {
            // '/', '?', or '#'
            stateMachine.state = 10 /* State.Path */;
        }
        else if (isDomainLabelChar(charCode)) ;
        else {
            // Anything else, end the domain name
            captureMatchIfValidAndRemove(context, stateMachine);
        }
    }
    function stateDomainHyphen(context, stateMachine, char, charCode) {
        if (charCode === 45 /* Char.Dash */ /* '-' */) ;
        else if (charCode === 46 /* Char.Dot */ /* '.' */) {
            // Not valid to have a '-.' in a domain label
            captureMatchIfValidAndRemove(context, stateMachine);
        }
        else if (isDomainLabelStartChar(charCode)) {
            stateMachine.state = 5 /* State.DomainLabelChar */;
        }
        else {
            captureMatchIfValidAndRemove(context, stateMachine);
        }
    }
    function stateDomainDot(context, stateMachine, char, charCode) {
        if (charCode === 46 /* Char.Dot */ /* '.' */) {
            // domain names cannot have multiple '.'s next to each other.
            // It's possible we've already read a valid domain name though,
            // and that the '..' sequence just forms an ellipsis at the end
            // of a sentence
            captureMatchIfValidAndRemove(context, stateMachine);
        }
        else if (isDomainLabelStartChar(charCode)) {
            stateMachine.state = 5 /* State.DomainLabelChar */;
            stateMachine.acceptStateReached = true; // after hitting a dot, and then another domain label, we've reached an accept state
        }
        else {
            // Anything else, end the domain name
            captureMatchIfValidAndRemove(context, stateMachine);
        }
    }
    function stateIpV4Digit(context, stateMachine, charCode) {
        if (charCode === 46 /* Char.Dot */ /* '.' */) {
            stateMachine.state = 14 /* State.IpV4Dot */;
        }
        else if (charCode === 58 /* Char.Colon */ /* ':' */) {
            // Beginning of a port number
            stateMachine.state = 8 /* State.PortColon */;
        }
        else if (isDigitChar(charCode)) ;
        else if (isUrlSuffixStartChar(charCode)) {
            stateMachine.state = 10 /* State.Path */;
        }
        else if (isAlphaNumericOrMarkChar(charCode)) {
            // If we hit an alpha character, must not be an IPv4
            // Example of this: 1.2.3.4abc
            context.removeMachine(stateMachine);
        }
        else {
            captureMatchIfValidAndRemove(context, stateMachine);
        }
    }
    function stateIpV4Dot(context, stateMachine, charCode) {
        if (isDigitChar(charCode)) {
            stateMachine.octetsEncountered++;
            // Once we have encountered 4 octets, it's *potentially* a valid
            // IPv4 address. Our IPv4 regex will confirm the match later
            // though to make sure each octet is in the 0-255 range, and
            // there's exactly 4 octets (not 5 or more)
            if (stateMachine.octetsEncountered === 4) {
                stateMachine.acceptStateReached = true;
            }
            stateMachine.state = 13 /* State.IpV4Digit */;
        }
        else {
            captureMatchIfValidAndRemove(context, stateMachine);
        }
    }
    function statePortColon(context, stateMachine, charCode) {
        if (isDigitChar(charCode)) {
            stateMachine.state = 9 /* State.PortNumber */;
        }
        else {
            captureMatchIfValidAndRemove(context, stateMachine);
        }
    }
    function statePortNumber(context, stateMachine, charCode) {
        if (isDigitChar(charCode)) ;
        else if (isUrlSuffixStartChar(charCode)) {
            // '/', '?', or '#'
            stateMachine.state = 10 /* State.Path */;
        }
        else {
            captureMatchIfValidAndRemove(context, stateMachine);
        }
    }
    function statePath(context, stateMachine, charCode) {
        if (isPathChar(charCode)) ;
        else {
            captureMatchIfValidAndRemove(context, stateMachine);
        }
    }
    // Handles if we're reading a 'mailto:' prefix on the string
    function stateEmailMailto_M(context, stateMachine, char, charCode) {
        if (char.toLowerCase() === 'a') {
            stateMachine.state = 16 /* State.EmailMailto_A */;
        }
        else {
            stateEmailLocalPart(context, stateMachine, charCode);
        }
    }
    function stateEmailMailto_A(context, stateMachine, char, charCode) {
        if (char.toLowerCase() === 'i') {
            stateMachine.state = 17 /* State.EmailMailto_I */;
        }
        else {
            stateEmailLocalPart(context, stateMachine, charCode);
        }
    }
    function stateEmailMailto_I(context, stateMachine, char, charCode) {
        if (char.toLowerCase() === 'l') {
            stateMachine.state = 18 /* State.EmailMailto_L */;
        }
        else {
            stateEmailLocalPart(context, stateMachine, charCode);
        }
    }
    function stateEmailMailto_L(context, stateMachine, char, charCode) {
        if (char.toLowerCase() === 't') {
            stateMachine.state = 19 /* State.EmailMailto_T */;
        }
        else {
            stateEmailLocalPart(context, stateMachine, charCode);
        }
    }
    function stateEmailMailto_T(context, stateMachine, char, charCode) {
        if (char.toLowerCase() === 'o') {
            stateMachine.state = 20 /* State.EmailMailto_O */;
        }
        else {
            stateEmailLocalPart(context, stateMachine, charCode);
        }
    }
    function stateEmailMailto_O(context, stateMachine, charCode) {
        if (charCode === 58 /* Char.Colon */ /* ':' */) {
            stateMachine.state = 21 /* State.EmailMailto_Colon */;
        }
        else {
            stateEmailLocalPart(context, stateMachine, charCode);
        }
    }
    function stateEmailMailtoColon(context, stateMachine, charCode) {
        if (isEmailLocalPartChar(charCode)) {
            stateMachine.state = 22 /* State.EmailLocalPart */;
        }
        else {
            context.removeMachine(stateMachine);
        }
    }
    // Handles the state when we're currently in the "local part" of an
    // email address (as opposed to the "domain part")
    function stateEmailLocalPart(context, stateMachine, charCode) {
        if (charCode === 46 /* Char.Dot */ /* '.' */) {
            stateMachine.state = 23 /* State.EmailLocalPartDot */;
        }
        else if (charCode === 64 /* Char.AtSign */ /* '@' */) {
            stateMachine.state = 24 /* State.EmailAtSign */;
        }
        else if (isEmailLocalPartChar(charCode)) {
            // stay in the "local part" of the email address
            // Note: because stateEmailLocalPart() is called from the
            // 'mailto' states (when the 'mailto' prefix itself has been
            // broken), make sure to set the state to EmailLocalPart
            stateMachine.state = 22 /* State.EmailLocalPart */;
        }
        else {
            // not an email address character
            context.removeMachine(stateMachine);
        }
    }
    // Handles the state where we've read a '.' character in the local part of
    // the email address (i.e. the part before the '@' character)
    function stateEmailLocalPartDot(context, stateMachine, charCode) {
        if (charCode === 46 /* Char.Dot */ /* '.' */) {
            // We read a second '.' in a row, not a valid email address
            // local part
            context.removeMachine(stateMachine);
        }
        else if (charCode === 64 /* Char.AtSign */ /* '@' */) {
            // We read the '@' character immediately after a dot ('.'), not
            // an email address
            context.removeMachine(stateMachine);
        }
        else if (isEmailLocalPartChar(charCode)) {
            stateMachine.state = 22 /* State.EmailLocalPart */;
        }
        else {
            // Anything else, not an email address
            context.removeMachine(stateMachine);
        }
    }
    function stateEmailAtSign(context, stateMachine, charCode) {
        if (isDomainLabelStartChar(charCode)) {
            stateMachine.state = 25 /* State.EmailDomainChar */;
        }
        else {
            // Anything else, not an email address
            context.removeMachine(stateMachine);
        }
    }
    function stateEmailDomainChar(context, stateMachine, charCode) {
        if (charCode === 46 /* Char.Dot */ /* '.' */) {
            stateMachine.state = 27 /* State.EmailDomainDot */;
        }
        else if (charCode === 45 /* Char.Dash */ /* '-' */) {
            stateMachine.state = 26 /* State.EmailDomainHyphen */;
        }
        else if (isDomainLabelChar(charCode)) ;
        else {
            // Anything else, we potentially matched if the criteria has
            // been met
            captureMatchIfValidAndRemove(context, stateMachine);
        }
    }
    function stateEmailDomainHyphen(context, stateMachine, charCode) {
        if (charCode === 45 /* Char.Dash */ /* '-' */ || charCode === 46 /* Char.Dot */ /* '.' */) {
            // Not valid to have two hyphens ("--") or hypen+dot ("-.")
            captureMatchIfValidAndRemove(context, stateMachine);
        }
        else if (isDomainLabelChar(charCode)) {
            stateMachine.state = 25 /* State.EmailDomainChar */;
        }
        else {
            // Anything else
            captureMatchIfValidAndRemove(context, stateMachine);
        }
    }
    function stateEmailDomainDot(context, stateMachine, charCode) {
        if (charCode === 46 /* Char.Dot */ /* '.' */ || charCode === 45 /* Char.Dash */ /* '-' */) {
            // not valid to have two dots ("..") or dot+hypen (".-")
            captureMatchIfValidAndRemove(context, stateMachine);
        }
        else if (isDomainLabelStartChar(charCode)) {
            stateMachine.state = 25 /* State.EmailDomainChar */;
            // After having read a '.' and then a valid domain character,
            // we now know that the domain part of the email is valid, and
            // we have found at least a partial EmailMatch (however, the
            // email address may have additional characters from this point)
            stateMachine.acceptStateReached = true;
        }
        else {
            // Anything else
            captureMatchIfValidAndRemove(context, stateMachine);
        }
    }
    // Handles the state when we've just encountered a '#' character
    function stateHashtagHashChar(context, stateMachine, charCode) {
        if (isHashtagTextChar(charCode)) {
            // '#' char with valid hash text char following
            stateMachine.state = 29 /* State.HashtagTextChar */;
            stateMachine.acceptStateReached = true;
        }
        else {
            context.removeMachine(stateMachine);
        }
    }
    // Handles the state when we're currently in the hash tag's text chars
    function stateHashtagTextChar(context, stateMachine, charCode) {
        if (isHashtagTextChar(charCode)) ;
        else {
            captureMatchIfValidAndRemove(context, stateMachine);
        }
    }
    // Handles the state when we've just encountered a '@' character
    function stateMentionAtChar(context, stateMachine, charCode) {
        if (isMentionTextChar(charCode)) {
            // '@' char with valid mention text char following
            stateMachine.state = 31 /* State.MentionTextChar */;
            stateMachine.acceptStateReached = true;
        }
        else {
            context.removeMachine(stateMachine);
        }
    }
    // Handles the state when we're currently in the mention's text chars
    function stateMentionTextChar(context, stateMachine, charCode) {
        if (isMentionTextChar(charCode)) ;
        else if (isAlphaNumericOrMarkChar(charCode)) {
            // Char is invalid for a mention text char, not a valid match.
            // Note that ascii alphanumeric chars are okay (which are tested
            // in the previous 'if' statement, but others are not)
            context.removeMachine(stateMachine);
        }
        else {
            captureMatchIfValidAndRemove(context, stateMachine);
        }
    }
    function statePhoneNumberPlus(context, stateMachine, char, charCode) {
        if (isDigitChar(charCode)) {
            stateMachine.state = 38 /* State.PhoneNumberDigit */;
        }
        else {
            context.removeMachine(stateMachine);
            // This character may start a new match. Add states for it
            stateNoMatch(context, char, charCode);
        }
    }
    function statePhoneNumberOpenParen(context, stateMachine, char, charCode) {
        if (isDigitChar(charCode)) {
            stateMachine.state = 33 /* State.PhoneNumberAreaCodeDigit1 */;
        }
        else {
            context.removeMachine(stateMachine);
        }
        // It's also possible that the paren was just an open brace for
        // a piece of text. Start other machines
        stateNoMatch(context, char, charCode);
    }
    function statePhoneNumberAreaCodeDigit1(context, stateMachine, charCode) {
        if (isDigitChar(charCode)) {
            stateMachine.state = 34 /* State.PhoneNumberAreaCodeDigit2 */;
        }
        else {
            context.removeMachine(stateMachine);
        }
    }
    function statePhoneNumberAreaCodeDigit2(context, stateMachine, charCode) {
        if (isDigitChar(charCode)) {
            stateMachine.state = 35 /* State.PhoneNumberAreaCodeDigit3 */;
        }
        else {
            context.removeMachine(stateMachine);
        }
    }
    function statePhoneNumberAreaCodeDigit3(context, stateMachine, charCode) {
        if (charCode === 41 /* Char.CloseParen */ /* ')' */) {
            stateMachine.state = 36 /* State.PhoneNumberCloseParen */;
        }
        else {
            context.removeMachine(stateMachine);
        }
    }
    function statePhoneNumberCloseParen(context, stateMachine, char, charCode) {
        if (isDigitChar(charCode)) {
            stateMachine.state = 38 /* State.PhoneNumberDigit */;
        }
        else if (isPhoneNumberSeparatorChar(charCode)) {
            stateMachine.state = 39 /* State.PhoneNumberSeparator */;
        }
        else {
            context.removeMachine(stateMachine);
        }
    }
    function statePhoneNumberDigit(context, stateMachine, char, charCode) {
        var charIdx = context.charIdx;
        // For now, if we've reached any digits, we'll say that the machine
        // has reached its accept state. The phone regex will confirm the
        // match later.
        // Alternatively, we could count the number of digits to avoid
        // invoking the phone number regex
        stateMachine.acceptStateReached = true;
        if (isPhoneNumberControlChar(charCode)) {
            stateMachine.state = 40 /* State.PhoneNumberControlChar */;
        }
        else if (charCode === 35 /* Char.NumberSign */ /* '#' */) {
            stateMachine.state = 41 /* State.PhoneNumberPoundChar */;
        }
        else if (isDigitChar(charCode)) ;
        else if (charCode === 40 /* Char.OpenParen */ /* '(' */) {
            stateMachine.state = 32 /* State.PhoneNumberOpenParen */;
        }
        else if (isPhoneNumberSeparatorChar(charCode)) {
            stateMachine.state = 39 /* State.PhoneNumberSeparator */;
        }
        else {
            captureMatchIfValidAndRemove(context, stateMachine);
            // The transition from a digit character to a letter can be the
            // start of a new scheme URL match
            if (isSchemeStartChar(charCode)) {
                context.addMachine(createSchemeUrlStateMachine(charIdx, 0 /* State.SchemeChar */));
            }
        }
    }
    function statePhoneNumberSeparator(context, stateMachine, char, charCode) {
        if (isDigitChar(charCode)) {
            stateMachine.state = 38 /* State.PhoneNumberDigit */;
        }
        else if (charCode === 40 /* Char.OpenParen */ /* '(' */) {
            stateMachine.state = 32 /* State.PhoneNumberOpenParen */;
        }
        else {
            captureMatchIfValidAndRemove(context, stateMachine);
            // This character may start a new match. Add states for it
            stateNoMatch(context, char, charCode);
        }
    }
    // The ";" characters is "wait" in a phone number
    // The "," characters is "pause" in a phone number
    function statePhoneNumberControlChar(context, stateMachine, charCode) {
        if (isPhoneNumberControlChar(charCode)) ;
        else if (charCode === 35 /* Char.NumberSign */ /* '#' */) {
            stateMachine.state = 41 /* State.PhoneNumberPoundChar */;
        }
        else if (isDigitChar(charCode)) {
            stateMachine.state = 38 /* State.PhoneNumberDigit */;
        }
        else {
            captureMatchIfValidAndRemove(context, stateMachine);
        }
    }
    // The "#" characters is "pound" in a phone number
    function statePhoneNumberPoundChar(context, stateMachine, charCode) {
        if (isPhoneNumberControlChar(charCode)) {
            stateMachine.state = 40 /* State.PhoneNumberControlChar */;
        }
        else if (isDigitChar(charCode)) {
            // According to some of the older tests, if there's a digit
            // after a '#' sign, the match is invalid. TODO: Revisit if this is true
            context.removeMachine(stateMachine);
        }
        else {
            captureMatchIfValidAndRemove(context, stateMachine);
        }
    }
    /*
     * Captures a match if it is valid (i.e. has a full domain name for a
     * TLD match). If a match is not valid, it is possible that we want to
     * keep reading characters in order to make a full match.
     */
    function captureMatchIfValidAndRemove(context, stateMachine) {
        var matches = context.matches, text = context.text, charIdx = context.charIdx, tagBuilder = context.tagBuilder, stripPrefix = context.stripPrefix, stripTrailingSlash = context.stripTrailingSlash, decodePercentEncoding = context.decodePercentEncoding, hashtagServiceName = context.hashtagServiceName, mentionServiceName = context.mentionServiceName;
        // Remove the state machine first. There are a number of code paths
        // which return out of this function early, so make sure we have
        // this done
        context.removeMachine(stateMachine);
        // Make sure the state machine being checked has actually reached an
        // "accept" state. If it hasn't reach one, it can't be a match
        if (!stateMachine.acceptStateReached) {
            return;
        }
        var startIdx = stateMachine.startIdx;
        var matchedText = text.slice(stateMachine.startIdx, charIdx);
        // Handle any unbalanced braces (parens, square brackets, or curly
        // brackets) inside the URL. This handles situations like:
        //     The link (google.com)
        // and
        //     Check out this link here (en.wikipedia.org/wiki/IANA_(disambiguation))
        //
        // And also remove any punctuation chars at the end such as:
        //     '?', ',', ':', '.', etc.
        matchedText = excludeUnbalancedTrailingBracesAndPunctuation(matchedText);
        switch (stateMachine.type) {
            case 0 /* StateMachineType.Url */: {
                // We don't want to accidentally match a URL that is preceded by an
                // '@' character, which would be an email address
                var charBeforeUrlMatch = text.charCodeAt(stateMachine.startIdx - 1);
                if (charBeforeUrlMatch === 64 /* Char.AtSign */ /* '@' */) {
                    return;
                }
                switch (stateMachine.matchType) {
                    case 0 /* UrlStateMachineMatchType.Scheme */: {
                        // Autolinker accepts many characters in a url's scheme (like `fake://test.com`).
                        // However, in cases where a URL is missing whitespace before an obvious link,
                        // (for example: `nowhitespacehttp://www.test.com`), we only want the match to start
                        // at the http:// part. We will check if the match contains a common scheme and then
                        // shift the match to start from there.
                        var httpSchemeMatch = httpSchemeRe.exec(matchedText);
                        if (httpSchemeMatch) {
                            // If we found an overmatched URL, we want to find the index
                            // of where the match should start and shift the match to
                            // start from the beginning of the common scheme
                            startIdx = startIdx + httpSchemeMatch.index;
                            matchedText = matchedText.slice(httpSchemeMatch.index);
                        }
                        if (!isValidSchemeUrl(matchedText)) {
                            return; // not a valid match
                        }
                        break;
                    }
                    case 1 /* UrlStateMachineMatchType.Tld */: {
                        if (!isValidTldMatch(matchedText)) {
                            return; // not a valid match
                        }
                        break;
                    }
                    case 2 /* UrlStateMachineMatchType.IpV4 */: {
                        if (!isValidIpV4Address(matchedText)) {
                            return; // not a valid match
                        }
                        break;
                    }
                    /* istanbul ignore next */
                    default:
                        assertNever(stateMachine);
                }
                matches.push(new UrlMatch({
                    tagBuilder: tagBuilder,
                    matchedText: matchedText,
                    offset: startIdx,
                    urlMatchType: toUrlMatchType(stateMachine.matchType),
                    url: matchedText,
                    protocolRelativeMatch: matchedText.slice(0, 2) === '//',
                    // TODO: Do these settings need to be passed to the match,
                    // or should we handle them here in UrlMatcher?
                    stripPrefix: stripPrefix,
                    stripTrailingSlash: stripTrailingSlash,
                    decodePercentEncoding: decodePercentEncoding,
                }));
                break;
            }
            case 1 /* StateMachineType.Email */: {
                // if the email address has a valid TLD, add it to the list of matches
                if (isValidEmail(matchedText)) {
                    matches.push(new EmailMatch({
                        tagBuilder: tagBuilder,
                        matchedText: matchedText,
                        offset: startIdx,
                        email: matchedText.replace(mailtoSchemePrefixRe, ''),
                    }));
                }
                break;
            }
            case 2 /* StateMachineType.Hashtag */: {
                if (isValidHashtag(matchedText)) {
                    matches.push(new HashtagMatch({
                        tagBuilder: tagBuilder,
                        matchedText: matchedText,
                        offset: startIdx,
                        serviceName: hashtagServiceName,
                        hashtag: matchedText.slice(1),
                    }));
                }
                break;
            }
            case 3 /* StateMachineType.Mention */: {
                if (isValidMention(matchedText, mentionServiceName)) {
                    matches.push(new MentionMatch({
                        tagBuilder: tagBuilder,
                        matchedText: matchedText,
                        offset: startIdx,
                        serviceName: mentionServiceName,
                        mention: matchedText.slice(1), // strip off the '@' character at the beginning
                    }));
                }
                break;
            }
            case 4 /* StateMachineType.Phone */: {
                // remove any trailing spaces that were considered as "separator"
                // chars by the state machine
                matchedText = matchedText.replace(/ +$/g, '');
                if (isValidPhoneNumber(matchedText)) {
                    var cleanNumber = matchedText.replace(/[^0-9,;#]/g, ''); // strip out non-digit characters exclude comma semicolon and #
                    matches.push(new PhoneMatch({
                        tagBuilder: tagBuilder,
                        matchedText: matchedText,
                        offset: startIdx,
                        number: cleanNumber,
                        plusSign: matchedText.charAt(0) === '+',
                    }));
                }
                break;
            }
            /* istanbul ignore next */
            default:
                assertNever(stateMachine);
        }
    }
    /**
     * Helper function to convert a UrlStateMachineMatchType value to its
     * UrlMatchType equivalent.
     */
    function toUrlMatchType(stateMachineMatchType) {
        switch (stateMachineMatchType) {
            case 0 /* UrlStateMachineMatchType.Scheme */:
                return 'scheme';
            case 1 /* UrlStateMachineMatchType.Tld */:
                return 'tld';
            case 2 /* UrlStateMachineMatchType.IpV4 */:
                return 'ipV4';
            /* istanbul ignore next */
            default:
                assertNever(stateMachineMatchType);
        }
    }
    var oppositeBrace = {
        ')': '(',
        '}': '{',
        ']': '[',
    };
    /**
     * Determines if a match found has unmatched closing parenthesis,
     * square brackets or curly brackets. If so, these unbalanced symbol(s) will be
     * removed from the URL match itself.
     *
     * A match may have an extra closing parenthesis/square brackets/curly brackets
     * at the end of the match because these are valid URL path characters. For
     * example, "wikipedia.com/something_(disambiguation)" should be auto-linked.
     *
     * However, an extra parenthesis *will* be included when the URL itself is
     * wrapped in parenthesis, such as in the case of:
     *
     *     "(wikipedia.com/something_(disambiguation))"
     *
     * In this case, the last closing parenthesis should *not* be part of the
     * URL itself, and this method will exclude it from the returned URL.
     *
     * For square brackets in URLs such as in PHP arrays, the same behavior as
     * parenthesis discussed above should happen:
     *
     *     "[http://www.example.com/foo.php?bar[]=1&bar[]=2&bar[]=3]"
     *
     * The very last closing square bracket should not be part of the URL itself,
     * and therefore this method will remove it.
     *
     * @param matchedText The full matched URL/email/hashtag/etc. from the state
     *   machine parser.
     * @return The updated matched text with extraneous suffix characters removed.
     */
    function excludeUnbalancedTrailingBracesAndPunctuation(matchedText) {
        var braceCounts = {
            '(': 0,
            '{': 0,
            '[': 0,
        };
        for (var i = 0; i < matchedText.length; i++) {
            var char = matchedText.charAt(i);
            var charCode = matchedText.charCodeAt(i);
            if (isOpenBraceChar(charCode)) {
                braceCounts[char]++;
            }
            else if (isCloseBraceChar(charCode)) {
                braceCounts[oppositeBrace[char]]--;
            }
        }
        var endIdx = matchedText.length - 1;
        while (endIdx >= 0) {
            var char = matchedText.charAt(endIdx);
            var charCode = matchedText.charCodeAt(endIdx);
            if (isCloseBraceChar(charCode)) {
                var oppositeBraceChar = oppositeBrace[char];
                if (braceCounts[oppositeBraceChar] < 0) {
                    braceCounts[oppositeBraceChar]++;
                    endIdx--;
                }
                else {
                    break;
                }
            }
            else if (isUrlSuffixNotAllowedAsFinalChar(charCode)) {
                // Walk back a punctuation char like '?', ',', ':', '.', etc.
                endIdx--;
            }
            else {
                break;
            }
        }
        return matchedText.slice(0, endIdx + 1);
    }
    function createSchemeUrlStateMachine(startIdx, state) {
        return {
            type: 0 /* StateMachineType.Url */,
            startIdx: startIdx,
            state: state,
            acceptStateReached: false,
            matchType: 0 /* UrlStateMachineMatchType.Scheme */,
        };
    }
    function createTldUrlStateMachine(startIdx, state) {
        return {
            type: 0 /* StateMachineType.Url */,
            startIdx: startIdx,
            state: state,
            acceptStateReached: false,
            matchType: 1 /* UrlStateMachineMatchType.Tld */,
        };
    }
    function createIpV4UrlStateMachine(startIdx, state) {
        return {
            type: 0 /* StateMachineType.Url */,
            startIdx: startIdx,
            state: state,
            acceptStateReached: false,
            matchType: 2 /* UrlStateMachineMatchType.IpV4 */,
            octetsEncountered: 1, // starts at 1 because we create this machine when encountering the first octet
        };
    }
    function createEmailStateMachine(startIdx, state) {
        return {
            type: 1 /* StateMachineType.Email */,
            startIdx: startIdx,
            state: state,
            acceptStateReached: false,
        };
    }
    function createHashtagStateMachine(startIdx, state) {
        return {
            type: 2 /* StateMachineType.Hashtag */,
            startIdx: startIdx,
            state: state,
            acceptStateReached: false,
        };
    }
    function createMentionStateMachine(startIdx, state) {
        return {
            type: 3 /* StateMachineType.Mention */,
            startIdx: startIdx,
            state: state,
            acceptStateReached: false,
        };
    }
    function createPhoneNumberStateMachine(startIdx, state) {
        return {
            type: 4 /* StateMachineType.Phone */,
            startIdx: startIdx,
            state: state,
            acceptStateReached: false,
        };
    }
    function isSchemeUrlStateMachine(machine) {
        return (machine.type === 0 /* StateMachineType.Url */ &&
            machine.matchType === 0 /* UrlStateMachineMatchType.Scheme */);
    }

    // For debugging: search for other "For debugging" lines
    // import CliTable from 'cli-table';
    var CurrentTag = /** @class */ (function () {
        function CurrentTag(cfg) {
            if (cfg === void 0) { cfg = {}; }
            this.idx = cfg.idx !== undefined ? cfg.idx : -1;
            this.type = cfg.type || 'tag';
            this.name = cfg.name || '';
            this.isOpening = !!cfg.isOpening;
            this.isClosing = !!cfg.isClosing;
        }
        return CurrentTag;
    }());
    var noCurrentTag = new CurrentTag(); // shared reference for when there is no current tag currently being read
    /**
     * Context object containing all the state needed by the HTML parsing state
     * machine function.
     *
     * ## Historical note
     *
     * In v4.1.5, we used nested functions to handle the context via closures, but
     * this necessitated re-creating the functions for each call to `parseHtml()`,
     * which made them difficult for v8 to JIT optimize. In v4.1.6, we lifted all of
     * the functions to the top-level scope and passed the context object between
     * them, which allows the functions to be JIT compiled once and reused.
     */
    var ParseHtmlContext = /** @class */ (function () {
        function ParseHtmlContext(html, callbacks) {
            this.charIdx = 0; // Current character index being processed
            this.state = 0 /* State.Data */; // begin in the Data state
            this.currentDataIdx = 0; // where the current data start index is
            this.currentTag = noCurrentTag; // describes the current tag that is being read
            this.html = html;
            this.callbacks = callbacks;
        }
        return ParseHtmlContext;
    }());
    /**
     * Parses an HTML string, calling the callbacks to notify of tags and text.
     *
     * ## History
     *
     * This file previously used a regular expression to find html tags in the input
     * text. Unfortunately, we ran into a bunch of catastrophic backtracking issues
     * with certain input text, causing Autolinker to either hang or just take a
     * really long time to parse the string.
     *
     * The current code is intended to be a O(n) algorithm that walks through
     * the string in one pass, and tries to be as cheap as possible. We don't need
     * to implement the full HTML spec, but rather simply determine where the string
     * looks like an HTML tag, and where it looks like text (so that we can autolink
     * that).
     *
     * This state machine parser is intended just to be a simple but performant
     * parser of HTML for the subset of requirements we have. We simply need to:
     *
     * 1. Determine where HTML tags are
     * 2. Determine the tag name (Autolinker specifically only cares about <a>,
     *    <script>, and <style> tags, so as not to link any text within them)
     *
     * We don't need to:
     *
     * 1. Create a parse tree
     * 2. Auto-close tags with invalid markup
     * 3. etc.
     *
     * The other intention behind this is that we didn't want to add external
     * dependencies on the Autolinker utility which would increase its size. For
     * instance, adding htmlparser2 adds 125kb to the minified output file,
     * increasing its final size from 47kb to 172kb (at the time of writing). It
     * also doesn't work exactly correctly, treating the string "<3 blah blah blah"
     * as an HTML tag.
     *
     * Reference for HTML spec:
     *
     *     https://www.w3.org/TR/html51/syntax.html#sec-tokenization
     *
     * @param {String} html The HTML to parse
     * @param {Object} callbacks
     * @param {Function} callbacks.onOpenTag Callback function to call when an open
     *   tag is parsed. Called with the tagName as its argument.
     * @param {Function} callbacks.onCloseTag Callback function to call when a close
     *   tag is parsed. Called with the tagName as its argument. If a self-closing
     *   tag is found, `onCloseTag` is called immediately after `onOpenTag`.
     * @param {Function} callbacks.onText Callback function to call when text (i.e
     *   not an HTML tag) is parsed. Called with the text (string) as its first
     *   argument, and offset (number) into the string as its second.
     */
    function parseHtml(html, callbacks) {
        var context = new ParseHtmlContext(html, callbacks);
        // For debugging: search for other "For debugging" lines
        // const table = new CliTable( {
        // 	head: [ 'charIdx', 'char', 'state', 'currentDataIdx', 'currentOpenTagIdx', 'tag.type' ]
        // } );
        var len = html.length;
        while (context.charIdx < len) {
            var char = html.charAt(context.charIdx);
            var charCode = html.charCodeAt(context.charIdx);
            // For debugging: search for other "For debugging" lines
            // ALSO: Temporarily remove the 'const' keyword on the State enum
            // table.push([
            //     String(charIdx),
            //     char,
            //     State[state],
            //     String(currentDataIdx),
            //     String(currentTag.idx),
            //     currentTag.idx === -1 ? '' : currentTag.type
            // ]);
            switch (context.state) {
                case 0 /* State.Data */:
                    stateData(context, char);
                    break;
                case 1 /* State.TagOpen */:
                    stateTagOpen(context, char, charCode);
                    break;
                case 2 /* State.EndTagOpen */:
                    stateEndTagOpen(context, char, charCode);
                    break;
                case 3 /* State.TagName */:
                    stateTagName(context, char, charCode);
                    break;
                case 4 /* State.BeforeAttributeName */:
                    stateBeforeAttributeName(context, char, charCode);
                    break;
                case 5 /* State.AttributeName */:
                    stateAttributeName(context, char, charCode);
                    break;
                case 6 /* State.AfterAttributeName */:
                    stateAfterAttributeName(context, char, charCode);
                    break;
                case 7 /* State.BeforeAttributeValue */:
                    stateBeforeAttributeValue(context, char, charCode);
                    break;
                case 8 /* State.AttributeValueDoubleQuoted */:
                    stateAttributeValueDoubleQuoted(context, char);
                    break;
                case 9 /* State.AttributeValueSingleQuoted */:
                    stateAttributeValueSingleQuoted(context, char);
                    break;
                case 10 /* State.AttributeValueUnquoted */:
                    stateAttributeValueUnquoted(context, char, charCode);
                    break;
                case 11 /* State.AfterAttributeValueQuoted */:
                    stateAfterAttributeValueQuoted(context, char, charCode);
                    break;
                case 12 /* State.SelfClosingStartTag */:
                    stateSelfClosingStartTag(context, char);
                    break;
                case 13 /* State.MarkupDeclarationOpenState */:
                    stateMarkupDeclarationOpen(context);
                    break;
                case 14 /* State.CommentStart */:
                    stateCommentStart(context, char);
                    break;
                case 15 /* State.CommentStartDash */:
                    stateCommentStartDash(context, char);
                    break;
                case 16 /* State.Comment */:
                    stateComment(context, char);
                    break;
                case 17 /* State.CommentEndDash */:
                    stateCommentEndDash(context, char);
                    break;
                case 18 /* State.CommentEnd */:
                    stateCommentEnd(context, char);
                    break;
                case 19 /* State.CommentEndBang */:
                    stateCommentEndBang(context, char);
                    break;
                case 20 /* State.Doctype */:
                    stateDoctype(context, char);
                    break;
                /* istanbul ignore next */
                default:
                    assertNever(context.state);
            }
            // For debugging: search for other "For debugging" lines
            // ALSO: Temporarily remove the 'const' keyword on the State enum
            // table.push([
            //     String(context.charIdx),
            //     char,
            //     State[context.state],
            //     String(context.currentDataIdx),
            //     String(context.currentTag.idx),
            //     context.currentTag.idx === -1 ? '' : context.currentTag.type
            // ]);
            context.charIdx++;
        }
        if (context.currentDataIdx < context.charIdx) {
            emitText(context);
        }
        // For debugging: search for other "For debugging" lines
        // console.log( '\n' + table.toString() );
    }
    // Called when non-tags are being read (i.e. the text around HTML †ags)
    // https://www.w3.org/TR/html51/syntax.html#data-state
    function stateData(context, char) {
        if (char === '<') {
            startNewTag(context);
        }
    }
    // Called after a '<' is read from the Data state
    // https://www.w3.org/TR/html51/syntax.html#tag-open-state
    function stateTagOpen(context, char, charCode) {
        if (char === '!') {
            context.state = 13 /* State.MarkupDeclarationOpenState */;
        }
        else if (char === '/') {
            context.state = 2 /* State.EndTagOpen */;
            context.currentTag = new CurrentTag(__assign(__assign({}, context.currentTag), { isClosing: true }));
        }
        else if (char === '<') {
            // start of another tag (ignore the previous, incomplete one)
            startNewTag(context);
        }
        else if (isAsciiLetterChar(charCode)) {
            // tag name start (and no '/' read)
            context.state = 3 /* State.TagName */;
            context.currentTag = new CurrentTag(__assign(__assign({}, context.currentTag), { isOpening: true }));
        }
        else {
            // Any other
            context.state = 0 /* State.Data */;
            context.currentTag = noCurrentTag;
        }
    }
    // After a '<x', '</x' sequence is read (where 'x' is a letter character),
    // this is to continue reading the tag name
    // https://www.w3.org/TR/html51/syntax.html#tag-name-state
    function stateTagName(context, char, charCode) {
        if (isWhitespaceChar(charCode)) {
            context.currentTag = new CurrentTag(__assign(__assign({}, context.currentTag), { name: captureTagName(context) }));
            context.state = 4 /* State.BeforeAttributeName */;
        }
        else if (char === '<') {
            // start of another tag (ignore the previous, incomplete one)
            startNewTag(context);
        }
        else if (char === '/') {
            context.currentTag = new CurrentTag(__assign(__assign({}, context.currentTag), { name: captureTagName(context) }));
            context.state = 12 /* State.SelfClosingStartTag */;
        }
        else if (char === '>') {
            context.currentTag = new CurrentTag(__assign(__assign({}, context.currentTag), { name: captureTagName(context) }));
            emitTagAndPreviousTextNode(context); // resets to Data state as well
        }
        else if (!isAsciiLetterChar(charCode) && !isDigitChar(charCode) && char !== ':') {
            // Anything else that does not form an html tag. Note: the colon
            // character is accepted for XML namespaced tags
            resetToDataState(context);
        }
        else ;
    }
    // Called after the '/' is read from a '</' sequence
    // https://www.w3.org/TR/html51/syntax.html#end-tag-open-state
    function stateEndTagOpen(context, char, charCode) {
        if (char === '>') {
            // parse error. Encountered "</>". Skip it without treating as a tag
            resetToDataState(context);
        }
        else if (isAsciiLetterChar(charCode)) {
            context.state = 3 /* State.TagName */;
        }
        else {
            // some other non-tag-like character, don't treat this as a tag
            resetToDataState(context);
        }
    }
    // https://www.w3.org/TR/html51/syntax.html#before-attribute-name-state
    function stateBeforeAttributeName(context, char, charCode) {
        if (isWhitespaceChar(charCode)) ;
        else if (char === '/') {
            context.state = 12 /* State.SelfClosingStartTag */;
        }
        else if (char === '>') {
            emitTagAndPreviousTextNode(context); // resets to Data state as well
        }
        else if (char === '<') {
            // start of another tag (ignore the previous, incomplete one)
            startNewTag(context);
        }
        else if (char === "=" || isQuoteChar(charCode) || isControlChar(charCode)) {
            // "Parse error" characters that, according to the spec, should be
            // appended to the attribute name, but we'll treat these characters
            // as not forming a real HTML tag
            resetToDataState(context);
        }
        else {
            // Any other char, start of a new attribute name
            context.state = 5 /* State.AttributeName */;
        }
    }
    // https://www.w3.org/TR/html51/syntax.html#attribute-name-state
    function stateAttributeName(context, char, charCode) {
        if (isWhitespaceChar(charCode)) {
            context.state = 6 /* State.AfterAttributeName */;
        }
        else if (char === '/') {
            context.state = 12 /* State.SelfClosingStartTag */;
        }
        else if (char === '=') {
            context.state = 7 /* State.BeforeAttributeValue */;
        }
        else if (char === '>') {
            emitTagAndPreviousTextNode(context); // resets to Data state as well
        }
        else if (char === '<') {
            // start of another tag (ignore the previous, incomplete one)
            startNewTag(context);
        }
        else if (isQuoteChar(charCode)) {
            // "Parse error" characters that, according to the spec, should be
            // appended to the attribute name, but we'll treat these characters
            // as not forming a real HTML tag
            resetToDataState(context);
        }
        else ;
    }
    // https://www.w3.org/TR/html51/syntax.html#after-attribute-name-state
    function stateAfterAttributeName(context, char, charCode) {
        if (isWhitespaceChar(charCode)) ;
        else if (char === '/') {
            context.state = 12 /* State.SelfClosingStartTag */;
        }
        else if (char === '=') {
            context.state = 7 /* State.BeforeAttributeValue */;
        }
        else if (char === '>') {
            emitTagAndPreviousTextNode(context);
        }
        else if (char === '<') {
            // start of another tag (ignore the previous, incomplete one)
            startNewTag(context);
        }
        else if (isQuoteChar(charCode)) {
            // "Parse error" characters that, according to the spec, should be
            // appended to the attribute name, but we'll treat these characters
            // as not forming a real HTML tag
            resetToDataState(context);
        }
        else {
            // Any other character, start a new attribute in the current tag
            context.state = 5 /* State.AttributeName */;
        }
    }
    // https://www.w3.org/TR/html51/syntax.html#before-attribute-value-state
    function stateBeforeAttributeValue(context, char, charCode) {
        if (isWhitespaceChar(charCode)) ;
        else if (char === "\"") {
            context.state = 8 /* State.AttributeValueDoubleQuoted */;
        }
        else if (char === "'") {
            context.state = 9 /* State.AttributeValueSingleQuoted */;
        }
        else if (/[>=`]/.test(char)) {
            // Invalid chars after an '=' for an attribute value, don't count
            // the current tag as an HTML tag
            resetToDataState(context);
        }
        else if (char === '<') {
            // start of another tag (ignore the previous, incomplete one)
            startNewTag(context);
        }
        else {
            // Any other character, consider it an unquoted attribute value
            context.state = 10 /* State.AttributeValueUnquoted */;
        }
    }
    // https://www.w3.org/TR/html51/syntax.html#attribute-value-double-quoted-state
    function stateAttributeValueDoubleQuoted(context, char) {
        if (char === "\"") {
            // end the current double-quoted attribute
            context.state = 11 /* State.AfterAttributeValueQuoted */;
        }
    }
    // https://www.w3.org/TR/html51/syntax.html#attribute-value-single-quoted-state
    function stateAttributeValueSingleQuoted(context, char) {
        if (char === "'") {
            // end the current single-quoted attribute
            context.state = 11 /* State.AfterAttributeValueQuoted */;
        }
    }
    // https://www.w3.org/TR/html51/syntax.html#attribute-value-unquoted-state
    function stateAttributeValueUnquoted(context, char, charCode) {
        if (isWhitespaceChar(charCode)) {
            context.state = 4 /* State.BeforeAttributeName */;
        }
        else if (char === '>') {
            emitTagAndPreviousTextNode(context);
        }
        else if (char === '<') {
            // start of another tag (ignore the previous, incomplete one)
            startNewTag(context);
        }
        else ;
    }
    // Called after a double-quoted or single-quoted attribute value is read
    // (i.e. after the closing quote character)
    // https://www.w3.org/TR/html51/syntax.html#after-attribute-value-quoted-state
    function stateAfterAttributeValueQuoted(context, char, charCode) {
        if (isWhitespaceChar(charCode)) {
            context.state = 4 /* State.BeforeAttributeName */;
        }
        else if (char === '/') {
            context.state = 12 /* State.SelfClosingStartTag */;
        }
        else if (char === '>') {
            emitTagAndPreviousTextNode(context);
        }
        else if (char === '<') {
            // start of another tag (ignore the previous, incomplete one)
            startNewTag(context);
        }
        else {
            // Any other character, "parse error". Spec says to switch to the
            // BeforeAttributeState and re-consume the character, as it may be
            // the start of a new attribute name
            context.state = 4 /* State.BeforeAttributeName */;
            reconsumeCurrentChar(context);
        }
    }
    // A '/' has just been read in the current tag (presumably for '/>'), and
    // this handles the next character
    // https://www.w3.org/TR/html51/syntax.html#self-closing-start-tag-state
    function stateSelfClosingStartTag(context, char) {
        if (char === '>') {
            context.currentTag = new CurrentTag(__assign(__assign({}, context.currentTag), { isClosing: true }));
            emitTagAndPreviousTextNode(context); // resets to Data state as well
        }
        else {
            // Note: the spec calls for a character after a '/' within a start
            // tag to go back into the BeforeAttributeName state (in order to
            // read more attributes, but for the purposes of Autolinker, this is
            // most likely not a valid HTML tag. For example: "<something / other>"
            // state = State.BeforeAttributeName;
            // Instead, just treat as regular text
            resetToDataState(context);
        }
    }
    // https://www.w3.org/TR/html51/syntax.html#markup-declaration-open-state
    // (HTML Comments or !DOCTYPE)
    function stateMarkupDeclarationOpen(context) {
        var html = context.html, charIdx = context.charIdx;
        if (html.slice(charIdx, charIdx + 2) === '--') {
            // html comment
            context.charIdx++; // "consume" the second '-' character. Next loop iteration will consume the character after the '<!--' sequence
            context.currentTag = new CurrentTag(__assign(__assign({}, context.currentTag), { type: 'comment' }));
            context.state = 14 /* State.CommentStart */;
        }
        else if (html.slice(charIdx, charIdx + 7).toUpperCase() === 'DOCTYPE') {
            context.charIdx += 6; // "consume" the characters "OCTYPE" (the current loop iteraction consumed the 'D'). Next loop iteration will consume the character after the '<!DOCTYPE' sequence
            context.currentTag = new CurrentTag(__assign(__assign({}, context.currentTag), { type: 'doctype' }));
            context.state = 20 /* State.Doctype */;
        }
        else {
            // At this point, the spec specifies that the state machine should
            // enter the "bogus comment" state, in which case any character(s)
            // after the '<!' that were read should become an HTML comment up
            // until the first '>' that is read (or EOF). Instead, we'll assume
            // that a user just typed '<!' as part of some piece of non-html
            // text
            resetToDataState(context);
        }
    }
    // Handles after the sequence '<!--' has been read
    // https://www.w3.org/TR/html51/syntax.html#comment-start-state
    function stateCommentStart(context, char) {
        if (char === '-') {
            // We've read the sequence '<!---' at this point (3 dashes)
            context.state = 15 /* State.CommentStartDash */;
        }
        else if (char === '>') {
            // At this point, we'll assume the comment wasn't a real comment
            // so we'll just emit it as data. We basically read the sequence
            // '<!-->'
            resetToDataState(context);
        }
        else {
            // Any other char, take it as part of the comment
            context.state = 16 /* State.Comment */;
        }
    }
    // We've read the sequence '<!---' at this point (3 dashes)
    // https://www.w3.org/TR/html51/syntax.html#comment-start-dash-state
    function stateCommentStartDash(context, char) {
        if (char === '-') {
            // We've read '<!----' (4 dashes) at this point
            context.state = 18 /* State.CommentEnd */;
        }
        else if (char === '>') {
            // At this point, we'll assume the comment wasn't a real comment
            // so we'll just emit it as data. We basically read the sequence
            // '<!--->'
            resetToDataState(context);
        }
        else {
            // Anything else, take it as a valid comment
            context.state = 16 /* State.Comment */;
        }
    }
    // Currently reading the comment's text (data)
    // https://www.w3.org/TR/html51/syntax.html#comment-state
    function stateComment(context, char) {
        if (char === '-') {
            context.state = 17 /* State.CommentEndDash */;
        }
    }
    // When we we've read the first dash inside a comment, it may signal the
    // end of the comment if we read another dash
    // https://www.w3.org/TR/html51/syntax.html#comment-end-dash-state
    function stateCommentEndDash(context, char) {
        if (char === '-') {
            context.state = 18 /* State.CommentEnd */;
        }
        else {
            // Wasn't a dash, must still be part of the comment
            context.state = 16 /* State.Comment */;
        }
    }
    // After we've read two dashes inside a comment, it may signal the end of
    // the comment if we then read a '>' char
    // https://www.w3.org/TR/html51/syntax.html#comment-end-state
    function stateCommentEnd(context, char) {
        if (char === '>') {
            emitTagAndPreviousTextNode(context);
        }
        else if (char === '!') {
            context.state = 19 /* State.CommentEndBang */;
        }
        else if (char === '-') ;
        else {
            // Anything else, switch back to the comment state since we didn't
            // read the full "end comment" sequence (i.e. '-->')
            context.state = 16 /* State.Comment */;
        }
    }
    // We've read the sequence '--!' inside of a comment
    // https://www.w3.org/TR/html51/syntax.html#comment-end-bang-state
    function stateCommentEndBang(context, char) {
        if (char === '-') {
            // We read the sequence '--!-' inside of a comment. The last dash
            // could signify that the comment is going to close
            context.state = 17 /* State.CommentEndDash */;
        }
        else if (char === '>') {
            // End of comment with the sequence '--!>'
            emitTagAndPreviousTextNode(context);
        }
        else {
            // The '--!' was not followed by a '>', continue reading the
            // comment's text
            context.state = 16 /* State.Comment */;
        }
    }
    /**
     * For DOCTYPES in particular, we don't care about the attributes. Just
     * advance to the '>' character and emit the tag, unless we find a '<'
     * character in which case we'll start a new tag.
     *
     * Example doctype tag:
     *    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
     *
     * Actual spec: https://www.w3.org/TR/html51/syntax.html#doctype-state
     */
    function stateDoctype(context, char) {
        if (char === '>') {
            emitTagAndPreviousTextNode(context);
        }
        else if (char === '<') {
            startNewTag(context);
        }
        else ;
    }
    /**
     * Resets the state back to the Data state, and removes the current tag.
     *
     * We'll generally run this function whenever a "parse error" is
     * encountered, where the current tag that is being read no longer looks
     * like a real HTML tag.
     */
    function resetToDataState(context) {
        context.state = 0 /* State.Data */;
        context.currentTag = noCurrentTag;
    }
    /**
     * Starts a new HTML tag at the current index, ignoring any previous HTML
     * tag that was being read.
     *
     * We'll generally run this function whenever we read a new '<' character,
     * including when we read a '<' character inside of an HTML tag that we were
     * previously reading.
     */
    function startNewTag(context) {
        context.state = 1 /* State.TagOpen */;
        context.currentTag = new CurrentTag({ idx: context.charIdx });
    }
    /**
     * Once we've decided to emit an open tag, that means we can also emit the
     * text node before it.
     */
    function emitTagAndPreviousTextNode(context) {
        var textBeforeTag = context.html.slice(context.currentDataIdx, context.currentTag.idx);
        if (textBeforeTag) {
            // the html tag was the first element in the html string, or two
            // tags next to each other, in which case we should not emit a text
            // node
            context.callbacks.onText(textBeforeTag, context.currentDataIdx);
        }
        var currentTag = context.currentTag;
        if (currentTag.type === 'comment') {
            context.callbacks.onComment(currentTag.idx);
        }
        else if (currentTag.type === 'doctype') {
            context.callbacks.onDoctype(currentTag.idx);
        }
        else {
            if (currentTag.isOpening) {
                context.callbacks.onOpenTag(currentTag.name, currentTag.idx);
            }
            if (currentTag.isClosing) {
                // note: self-closing tags will emit both opening and closing
                context.callbacks.onCloseTag(currentTag.name, currentTag.idx);
            }
        }
        // Since we just emitted a tag, reset to the data state for the next char
        resetToDataState(context);
        context.currentDataIdx = context.charIdx + 1;
    }
    function emitText(context) {
        var text = context.html.slice(context.currentDataIdx, context.charIdx);
        context.callbacks.onText(text, context.currentDataIdx);
        context.currentDataIdx = context.charIdx + 1;
    }
    /**
     * Captures the tag name from the start of the tag to the current character
     * index, and converts it to lower case
     */
    function captureTagName(context) {
        var startIdx = context.currentTag.idx + (context.currentTag.isClosing ? 2 : 1);
        return context.html.slice(startIdx, context.charIdx).toLowerCase();
    }
    /**
     * Causes the main loop to re-consume the current character, such as after
     * encountering a "parse error" that changed state and needs to reconsume
     * the same character in that new state.
     */
    function reconsumeCurrentChar(context) {
        context.charIdx--;
    }

    /**
     * @class Autolinker
     * @extends Object
     *
     * Utility class used to process a given string of text, and wrap the matches in
     * the appropriate anchor (&lt;a&gt;) tags to turn them into links.
     *
     * Any of the configuration options may be provided in an Object provided
     * to the Autolinker constructor, which will configure how the {@link #link link()}
     * method will process the links.
     *
     * For example:
     *
     *     var autolinker = new Autolinker( {
     *         newWindow : false,
     *         truncate  : 30
     *     } );
     *
     *     var html = autolinker.link( "Joe went to www.yahoo.com" );
     *     // produces: 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>'
     *
     *
     * The {@link #static-link static link()} method may also be used to inline
     * options into a single call, which may be more convenient for one-off uses.
     * For example:
     *
     *     var html = Autolinker.link( "Joe went to www.yahoo.com", {
     *         newWindow : false,
     *         truncate  : 30
     *     } );
     *     // produces: 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>'
     *
     *
     * ## Custom Replacements of Links
     *
     * If the configuration options do not provide enough flexibility, a {@link #replaceFn}
     * may be provided to fully customize the output of Autolinker. This function is
     * called once for each URL/Email/Phone#/Hashtag/Mention (Twitter, Instagram, Soundcloud)
     * match that is encountered.
     *
     * For example:
     *
     *     var input = "...";  // string with URLs, Email Addresses, Phone #s, Hashtags, and Mentions (Twitter, Instagram, Soundcloud)
     *
     *     var linkedText = Autolinker.link( input, {
     *         replaceFn : function( match ) {
     *             console.log( "href = ", match.getAnchorHref() );
     *             console.log( "text = ", match.getAnchorText() );
     *
     *             switch( match.getType() ) {
     *                 case 'url' :
     *                     console.log( "url: ", match.getUrl() );
     *
     *                     if( match.getUrl().indexOf( 'mysite.com' ) === -1 ) {
     *                         var tag = match.buildTag();  // returns an `Autolinker.HtmlTag` instance, which provides mutator methods for easy changes
     *                         tag.setAttr( 'rel', 'nofollow' );
     *                         tag.addClass( 'external-link' );
     *
     *                         return tag;
     *
     *                     } else {
     *                         return true;  // let Autolinker perform its normal anchor tag replacement
     *                     }
     *
     *                 case 'email' :
     *                     var email = match.getEmail();
     *                     console.log( "email: ", email );
     *
     *                     if( email === "my@own.address" ) {
     *                         return false;  // don't auto-link this particular email address; leave as-is
     *                     } else {
     *                         return;  // no return value will have Autolinker perform its normal anchor tag replacement (same as returning `true`)
     *                     }
     *
     *                 case 'phone' :
     *                     var phoneNumber = match.getPhoneNumber();
     *                     console.log( phoneNumber );
     *
     *                     return '<a href="http://newplace.to.link.phone.numbers.to/">' + phoneNumber + '</a>';
     *
     *                 case 'hashtag' :
     *                     var hashtag = match.getHashtag();
     *                     console.log( hashtag );
     *
     *                     return '<a href="http://newplace.to.link.hashtag.handles.to/">' + hashtag + '</a>';
     *
     *                 case 'mention' :
     *                     var mention = match.getMention();
     *                     console.log( mention );
     *
     *                     return '<a href="http://newplace.to.link.mention.to/">' + mention + '</a>';
     *             }
     *         }
     *     } );
     *
     *
     * The function may return the following values:
     *
     * - `true` (Boolean): Allow Autolinker to replace the match as it normally
     *   would.
     * - `false` (Boolean): Do not replace the current match at all - leave as-is.
     * - Any String: If a string is returned from the function, the string will be
     *   used directly as the replacement HTML for the match.
     * - An {@link Autolinker.HtmlTag} instance, which can be used to build/modify
     *   an HTML tag before writing out its HTML text.
     */
    var Autolinker = /** @class */ (function () {
        /**
         * @method constructor
         * @param {Object} [cfg] The configuration options for the Autolinker instance,
         *   specified in an Object (map).
         */
        function Autolinker(cfg) {
            if (cfg === void 0) { cfg = {}; }
            /**
             * The Autolinker version number exposed on the instance itself.
             *
             * Ex: 0.25.1
             *
             * @property {String} version
             */
            this.version = Autolinker.version;
            /**
             * @cfg {Boolean/Object} [urls]
             *
             * `true` if URLs should be automatically linked, `false` if they should not
             * be. Defaults to `true`.
             *
             * Examples:
             *
             *     urls: true
             *
             *     // or
             *
             *     urls: {
             *         schemeMatches : true,
             *         tldMatches    : true,
             *         ipV4Matches   : true
             *     }
             *
             * As shown above, this option also accepts an Object form with 3 properties
             * to allow for more customization of what exactly gets linked. All default
             * to `true`:
             *
             * @cfg {Boolean} [urls.schemeMatches] `true` to match URLs found prefixed
             *   with a scheme, i.e. `http://google.com`, or `other+scheme://google.com`,
             *   `false` to prevent these types of matches.
             * @cfg {Boolean} [urls.tldMatches] `true` to match URLs with known top
             *   level domains (.com, .net, etc.) that are not prefixed with a scheme
             *   (such as 'http://'). This option attempts to match anything that looks
             *   like a URL in the given text. Ex: `google.com`, `asdf.org/?page=1`, etc.
             *   `false` to prevent these types of matches.
             * @cfg {Boolean} [urls.ipV4Matches] `true` to match IPv4 addresses in text
             *   that are not prefixed with a scheme (such as 'http://'). This option
             *   attempts to match anything that looks like an IPv4 address in text. Ex:
             *   `192.168.0.1`, `10.0.0.1/?page=1`, etc. `false` to prevent these types
             *   of matches.
             */
            this.urls = {}; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {Boolean} [email=true]
             *
             * `true` if email addresses should be automatically linked, `false` if they
             * should not be.
             */
            this.email = true; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {Boolean} [phone=true]
             *
             * `true` if Phone numbers ("(555)555-5555") should be automatically linked,
             * `false` if they should not be.
             */
            this.phone = true; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {Boolean/String} [hashtag=false]
             *
             * A string for the service name to have hashtags (ex: "#myHashtag")
             * auto-linked to. The currently-supported values are:
             *
             * - 'twitter'
             * - 'facebook'
             * - 'instagram'
             * - 'tiktok'
             * - 'youtube'
             *
             * Pass `false` to skip auto-linking of hashtags.
             */
            this.hashtag = false; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {String/Boolean} [mention=false]
             *
             * A string for the service name to have mentions (ex: "@myuser")
             * auto-linked to. The currently supported values are:
             *
             * - 'twitter'
             * - 'instagram'
             * - 'soundcloud'
             * - 'tiktok'
             * - 'youtube'
             *
             * Defaults to `false` to skip auto-linking of mentions.
             */
            this.mention = false; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {Boolean} [newWindow=true]
             *
             * `true` if the links should open in a new window, `false` otherwise.
             */
            this.newWindow = true; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {Boolean/Object} [stripPrefix=true]
             *
             * `true` if 'http://' (or 'https://') and/or the 'www.' should be stripped
             * from the beginning of URL links' text, `false` otherwise. Defaults to
             * `true`.
             *
             * Examples:
             *
             *     stripPrefix: true
             *
             *     // or
             *
             *     stripPrefix: {
             *         scheme : true,
             *         www    : true
             *     }
             *
             * As shown above, this option also accepts an Object form with 2 properties
             * to allow for more customization of what exactly is prevented from being
             * displayed. Both default to `true`:
             *
             * @cfg {Boolean} [stripPrefix.scheme] `true` to prevent the scheme part of
             *   a URL match from being displayed to the user. Example:
             *   `'http://google.com'` will be displayed as `'google.com'`. `false` to
             *   not strip the scheme. NOTE: Only an `'http://'` or `'https://'` scheme
             *   will be removed, so as not to remove a potentially dangerous scheme
             *   (such as `'file://'` or `'javascript:'`)
             * @cfg {Boolean} [stripPrefix.www] www (Boolean): `true` to prevent the
             *   `'www.'` part of a URL match from being displayed to the user. Ex:
             *   `'www.google.com'` will be displayed as `'google.com'`. `false` to not
             *   strip the `'www'`.
             */
            this.stripPrefix = {
                scheme: true,
                www: true,
            }; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {Boolean} [stripTrailingSlash=true]
             *
             * `true` to remove the trailing slash from URL matches, `false` to keep
             *  the trailing slash.
             *
             *  Example when `true`: `http://google.com/` will be displayed as
             *  `http://google.com`.
             */
            this.stripTrailingSlash = true; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {Boolean} [decodePercentEncoding=true]
             *
             * `true` to decode percent-encoded characters in URL matches, `false` to keep
             *  the percent-encoded characters.
             *
             *  Example when `true`: `https://en.wikipedia.org/wiki/San_Jos%C3%A9` will
             *  be displayed as `https://en.wikipedia.org/wiki/San_José`.
             */
            this.decodePercentEncoding = true; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {Number/Object} [truncate=0]
             *
             * ## Number Form
             *
             * A number for how many characters matched text should be truncated to
             * inside the text of a link. If the matched text is over this number of
             * characters, it will be truncated to this length by adding a two period
             * ellipsis ('..') to the end of the string.
             *
             * For example: A url like 'http://www.yahoo.com/some/long/path/to/a/file'
             * truncated to 25 characters might look something like this:
             * 'yahoo.com/some/long/pat..'
             *
             * Example Usage:
             *
             *     truncate: 25
             *
             *
             *  Defaults to `0` for "no truncation."
             *
             *
             * ## Object Form
             *
             * An Object may also be provided with two properties: `length` (Number) and
             * `location` (String). `location` may be one of the following: 'end'
             * (default), 'middle', or 'smart'.
             *
             * Example Usage:
             *
             *     truncate: { length: 25, location: 'middle' }
             *
             * @cfg {Number} [truncate.length=0] How many characters to allow before
             *   truncation will occur. Defaults to `0` for "no truncation."
             * @cfg {"end"/"middle"/"smart"} [truncate.location="end"]
             *
             * - 'end' (default): will truncate up to the number of characters, and then
             *   add an ellipsis at the end. Ex: 'yahoo.com/some/long/pat..'
             * - 'middle': will truncate and add the ellipsis in the middle. Ex:
             *   'yahoo.com/s..th/to/a/file'
             * - 'smart': for URLs where the algorithm attempts to strip out unnecessary
             *   parts first (such as the 'www.', then URL scheme, hash, etc.),
             *   attempting to make the URL human-readable before looking for a good
             *   point to insert the ellipsis if it is still too long. Ex:
             *   'yahoo.com/some..to/a/file'. For more details, see
             *   {@link Autolinker.truncate.TruncateSmart}.
             */
            this.truncate = {
                length: 0,
                location: 'end',
            }; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {String} className
             *
             * A CSS class name to add to the generated links. This class will be added
             * to all links, as well as this class plus match suffixes for styling
             * url/email/phone/hashtag/mention links differently.
             *
             * For example, if this config is provided as "myLink", then:
             *
             * - URL links will have the CSS classes: "myLink myLink-url"
             * - Email links will have the CSS classes: "myLink myLink-email", and
             * - Phone links will have the CSS classes: "myLink myLink-phone"
             * - Hashtag links will have the CSS classes: "myLink myLink-hashtag"
             * - Mention links will have the CSS classes: "myLink myLink-mention myLink-[type]"
             *   where [type] is either "instagram", "twitter" or "soundcloud"
             */
            this.className = ''; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {Function} replaceFn
             *
             * A function to individually process each match found in the input string.
             *
             * See the class's description for usage.
             *
             * The `replaceFn` can be called with a different context object (`this`
             * reference) using the {@link #context} cfg.
             *
             * This function is called with the following parameter:
             *
             * @cfg {Autolinker.match.Match} replaceFn.match The Match instance which
             *   can be used to retrieve information about the match that the `replaceFn`
             *   is currently processing. See {@link Autolinker.match.Match} subclasses
             *   for details.
             */
            this.replaceFn = null; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {Object} context
             *
             * The context object (`this` reference) to call the `replaceFn` with.
             *
             * Defaults to this Autolinker instance.
             */
            this.context = undefined; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @cfg {Boolean} [sanitizeHtml=false]
             *
             * `true` to HTML-encode the start and end brackets of existing HTML tags found
             * in the input string. This will escape `<` and `>` characters to `&lt;` and
             * `&gt;`, respectively.
             *
             * Setting this to `true` will prevent XSS (Cross-site Scripting) attacks,
             * but will remove the significance of existing HTML tags in the input string. If
             * you would like to maintain the significance of existing HTML tags while also
             * making the output HTML string safe, leave this option as `false` and use a
             * tool like https://github.com/cure53/DOMPurify (or others) on the input string
             * before running Autolinker.
             */
            this.sanitizeHtml = false; // default value just to get the above doc comment in the ES5 output and documentation generator
            /**
             * @private
             * @property {Autolinker.AnchorTagBuilder} tagBuilder
             *
             * The AnchorTagBuilder instance used to build match replacement anchor tags.
             * Note: this is lazily instantiated in the {@link #getTagBuilder} method.
             */
            this.tagBuilder = null;
            // Note: when `this.something` is used in the rhs of these assignments,
            //       it refers to the default values set above the constructor
            this.urls = normalizeUrlsCfg(cfg.urls);
            this.email = isBoolean(cfg.email) ? cfg.email : this.email;
            this.phone = isBoolean(cfg.phone) ? cfg.phone : this.phone;
            this.hashtag = cfg.hashtag || this.hashtag;
            this.mention = cfg.mention || this.mention;
            this.newWindow = isBoolean(cfg.newWindow) ? cfg.newWindow : this.newWindow;
            this.stripPrefix = normalizeStripPrefixCfg(cfg.stripPrefix);
            this.stripTrailingSlash = isBoolean(cfg.stripTrailingSlash)
                ? cfg.stripTrailingSlash
                : this.stripTrailingSlash;
            this.decodePercentEncoding = isBoolean(cfg.decodePercentEncoding)
                ? cfg.decodePercentEncoding
                : this.decodePercentEncoding;
            this.sanitizeHtml = cfg.sanitizeHtml || false;
            // Validate the value of the `mention` cfg
            var mention = this.mention;
            if (mention !== false && mentionServices.indexOf(mention) === -1) {
                throw new Error("invalid `mention` cfg '".concat(mention, "' - see docs"));
            }
            // Validate the value of the `hashtag` cfg
            var hashtag = this.hashtag;
            if (hashtag !== false && hashtagServices.indexOf(hashtag) === -1) {
                throw new Error("invalid `hashtag` cfg '".concat(hashtag, "' - see docs"));
            }
            this.truncate = normalizeTruncateCfg(cfg.truncate);
            this.className = cfg.className || this.className;
            this.replaceFn = cfg.replaceFn || this.replaceFn;
            this.context = cfg.context || this;
        }
        /**
         * Automatically links URLs, Email addresses, Phone Numbers, Twitter handles,
         * Hashtags, and Mentions found in the given chunk of HTML. Does not link URLs
         * found within HTML tags.
         *
         * For instance, if given the text: `You should go to http://www.yahoo.com`,
         * then the result will be `You should go to &lt;a href="http://www.yahoo.com"&gt;http://www.yahoo.com&lt;/a&gt;`
         *
         * Example:
         *
         *     var linkedText = Autolinker.link( "Go to google.com", { newWindow: false } );
         *     // Produces: "Go to <a href="http://google.com">google.com</a>"
         *
         * @static
         * @param {String} textOrHtml The HTML or text to find matches within (depending
         *   on if the {@link #urls}, {@link #email}, {@link #phone}, {@link #mention},
         *   {@link #hashtag}, and {@link #mention} options are enabled).
         * @param {Object} [options] Any of the configuration options for the Autolinker
         *   class, specified in an Object (map). See the class description for an
         *   example call.
         * @return {String} The HTML text, with matches automatically linked.
         */
        Autolinker.link = function (textOrHtml, options) {
            var autolinker = new Autolinker(options);
            return autolinker.link(textOrHtml);
        };
        /**
         * Parses the input `textOrHtml` looking for URLs, email addresses, phone
         * numbers, username handles, and hashtags (depending on the configuration
         * of the Autolinker instance), and returns an array of {@link Autolinker.match.Match}
         * objects describing those matches (without making any replacements).
         *
         * Note that if parsing multiple pieces of text, it is slightly more efficient
         * to create an Autolinker instance, and use the instance-level {@link #parse}
         * method.
         *
         * Example:
         *
         *     var matches = Autolinker.parse("Hello google.com, I am asdf@asdf.com", {
         *         urls: true,
         *         email: true
         *     });
         *
         *     console.log(matches.length);         // 2
         *     console.log(matches[0].getType());   // 'url'
         *     console.log(matches[0].getUrl());    // 'google.com'
         *     console.log(matches[1].getType());   // 'email'
         *     console.log(matches[1].getEmail());  // 'asdf@asdf.com'
         *
         * @static
         * @param {String} textOrHtml The HTML or text to find matches within
         *   (depending on if the {@link #urls}, {@link #email}, {@link #phone},
         *   {@link #hashtag}, and {@link #mention} options are enabled).
         * @param {Object} [options] Any of the configuration options for the Autolinker
         *   class, specified in an Object (map). See the class description for an
         *   example call.
         * @return {Autolinker.match.Match[]} The array of Matches found in the
         *   given input `textOrHtml`.
         */
        Autolinker.parse = function (textOrHtml, options) {
            var autolinker = new Autolinker(options);
            return autolinker.parse(textOrHtml);
        };
        /**
         * Parses the input `textOrHtml` looking for URLs, email addresses, phone
         * numbers, username handles, and hashtags (depending on the configuration
         * of the Autolinker instance), and returns an array of {@link Autolinker.match.Match}
         * objects describing those matches (without making any replacements).
         *
         * This method is used by the {@link #link} method, but can also be used to
         * simply do parsing of the input in order to discover what kinds of links
         * there are and how many.
         *
         * Example usage:
         *
         *     var autolinker = new Autolinker( {
         *         urls: true,
         *         email: true
         *     } );
         *
         *     var matches = autolinker.parse( "Hello google.com, I am asdf@asdf.com" );
         *
         *     console.log( matches.length );           // 2
         *     console.log( matches[ 0 ].getType() );   // 'url'
         *     console.log( matches[ 0 ].getUrl() );    // 'google.com'
         *     console.log( matches[ 1 ].getType() );   // 'email'
         *     console.log( matches[ 1 ].getEmail() );  // 'asdf@asdf.com'
         *
         * @param {String} textOrHtml The HTML or text to find matches within
         *   (depending on if the {@link #urls}, {@link #email}, {@link #phone},
         *   {@link #hashtag}, and {@link #mention} options are enabled).
         * @return {Autolinker.match.Match[]} The array of Matches found in the
         *   given input `textOrHtml`.
         */
        Autolinker.prototype.parse = function (textOrHtml) {
            var _this = this;
            var skipTagNames = ['a', 'style', 'script'];
            var skipTagsStackCount = 0; // used to only Autolink text outside of anchor/script/style tags. We don't want to autolink something that is already linked inside of an <a> tag, for instance
            var matches = [];
            // Find all matches within the `textOrHtml` (but not matches that are
            // already nested within <a>, <style> and <script> tags)
            parseHtml(textOrHtml, {
                onOpenTag: function (tagName) {
                    if (skipTagNames.indexOf(tagName) >= 0) {
                        skipTagsStackCount++;
                    }
                },
                onText: function (text, offset) {
                    // Only process text nodes that are not within an <a>, <style> or <script> tag
                    if (skipTagsStackCount === 0) {
                        // "Walk around" common HTML entities. An '&nbsp;' (for example)
                        // could be at the end of a URL, but we don't want to
                        // include the trailing '&' in the URL. See issue #76
                        // TODO: Handle HTML entities separately in parseHtml() and
                        // don't emit them as "text" except for &amp; entities
                        var htmlCharacterEntitiesRegex = /(&nbsp;|&#160;|&lt;|&#60;|&gt;|&#62;|&quot;|&#34;|&#39;)/gi; // NOTE: capturing group is significant to include the split characters in the .split() call below
                        var textSplit = text.split(htmlCharacterEntitiesRegex);
                        var currentOffset_1 = offset;
                        textSplit.forEach(function (splitText, i) {
                            // even number matches are text, odd numbers are html entities
                            if (i % 2 === 0) {
                                var textNodeMatches = _this.parseText(splitText, currentOffset_1);
                                matches.push.apply(matches, __spreadArray([], __read(textNodeMatches), false));
                            }
                            currentOffset_1 += splitText.length;
                        });
                    }
                },
                onCloseTag: function (tagName) {
                    if (skipTagNames.indexOf(tagName) >= 0) {
                        skipTagsStackCount = Math.max(skipTagsStackCount - 1, 0); // attempt to handle extraneous </a> tags by making sure the stack count never goes below 0
                    }
                },
                onComment: function ( /*_offset: number*/) { }, // no need to process comment nodes
                onDoctype: function ( /*_offset: number*/) { }, // no need to process doctype nodes
            });
            // After we have found all matches, remove subsequent matches that
            // overlap with a previous match. This can happen for instance with an
            // email address where the local-part of the email is also a top-level
            // domain, such as in "google.com@aaa.com". In this case, the entire
            // email address should be linked rather than just the 'google.com'
            // part.
            matches = this.compactMatches(matches);
            // And finally, remove matches for match types that have been turned
            // off. We needed to have all match types turned on initially so that
            // things like hashtags could be filtered out if they were really just
            // part of a URL match (for instance, as a named anchor).
            matches = this.removeUnwantedMatches(matches);
            return matches;
        };
        /**
         * After we have found all matches, we need to remove matches that overlap
         * with a previous match. This can happen for instance with an
         * email address where the local-part of the email is also a top-level
         * domain, such as in "google.com@aaa.com". In this case, the entire email
         * address should be linked rather than just the 'google.com' part.
         *
         * @private
         * @param {Autolinker.match.Match[]} matches
         * @return {Autolinker.match.Match[]}
         */
        Autolinker.prototype.compactMatches = function (matches) {
            // First, the matches need to be sorted in order of offset in the input
            // string
            matches.sort(byMatchOffset);
            var i = 0;
            while (i < matches.length - 1) {
                var match = matches[i];
                var offset = match.getOffset();
                var matchedTextLength = match.getMatchedText().length;
                if (i + 1 < matches.length) {
                    // Remove subsequent matches that equal offset with current match
                    // This can happen when matching the text "google.com@aaa.com"
                    // where we have both a URL ('google.com') and an email. We
                    // should only keep the email match in this case.
                    if (matches[i + 1].getOffset() === offset) {
                        // Remove the shorter match
                        var removeIdx = matches[i + 1].getMatchedText().length > matchedTextLength ? i : i + 1;
                        matches.splice(removeIdx, 1);
                        continue;
                    }
                    // Remove subsequent matches that overlap with the current match
                    //
                    // NOTE: This was a fundamental snippet of the Autolinker.js v3
                    // algorithm where we had multiple regular expressions searching
                    // the input string for matches. The regexes would sometimes
                    // overlap such as in the case of "google.com/#link", where we
                    // would have both a URL match and a hashtag match.
                    //
                    // However, the Autolinker.js v4 algorithm uses a state machine
                    // parser and knows that the '#link' part of 'google.com/#link'
                    // is part of the URL that precedes it, so we don't need this
                    // piece of code any more. Keeping it here commented for now in
                    // case we need to put it back at some point, but none of the
                    // test cases are currently able to trigger the need for it.
                    // const endIdx = offset + matchedTextLength;
                    // if (matches[i + 1].getOffset() < endIdx) {
                    //     matches.splice(i + 1, 1);
                    //     continue;
                    // }
                }
                i++;
            }
            return matches;
        };
        /**
         * Removes matches for matchers that were turned off in the options. For
         * example, if {@link #hashtag hashtags} were not to be matched, we'll
         * remove them from the `matches` array here.
         *
         * Note: we *must* use all Matchers on the input string, and then filter
         * them out later. For example, if the options were `{ url: false, hashtag: true }`,
         * we wouldn't want to match the text '#link' as a HashTag inside of the text
         * 'google.com/#link'. The way the algorithm works is that we match the full
         * URL first (which prevents the accidental HashTag match), and then we'll
         * simply throw away the URL match.
         *
         * @private
         * @param {Autolinker.match.Match[]} matches The array of matches to remove
         *   the unwanted matches from. Note: this array is mutated for the
         *   removals.
         * @return {Autolinker.match.Match[]} The mutated input `matches` array.
         */
        Autolinker.prototype.removeUnwantedMatches = function (matches) {
            if (!this.hashtag)
                removeWithPredicate(matches, function (match) {
                    return match.getType() === 'hashtag';
                });
            if (!this.email)
                removeWithPredicate(matches, function (match) {
                    return match.getType() === 'email';
                });
            if (!this.phone)
                removeWithPredicate(matches, function (match) {
                    return match.getType() === 'phone';
                });
            if (!this.mention)
                removeWithPredicate(matches, function (match) {
                    return match.getType() === 'mention';
                });
            if (!this.urls.schemeMatches) {
                removeWithPredicate(matches, function (m) {
                    return m.getType() === 'url' && m.getUrlMatchType() === 'scheme';
                });
            }
            if (!this.urls.tldMatches) {
                removeWithPredicate(matches, function (m) { return m.getType() === 'url' && m.getUrlMatchType() === 'tld'; });
            }
            if (!this.urls.ipV4Matches) {
                removeWithPredicate(matches, function (m) { return m.getType() === 'url' && m.getUrlMatchType() === 'ipV4'; });
            }
            return matches;
        };
        /**
         * Parses the input `text` looking for URLs, email addresses, phone
         * numbers, username handles, and hashtags (depending on the configuration
         * of the Autolinker instance), and returns an array of {@link Autolinker.match.Match}
         * objects describing those matches.
         *
         * This method processes a **non-HTML string**, and is used to parse and
         * match within the text nodes of an HTML string. This method is used
         * internally by {@link #parse}.
         *
         * @private
         * @param {String} text The text to find matches within (depending on if the
         *   {@link #urls}, {@link #email}, {@link #phone},
         *   {@link #hashtag}, and {@link #mention} options are enabled). This must be a non-HTML string.
         * @param {Number} [offset=0] The offset of the text node within the
         *   original string. This is used when parsing with the {@link #parse}
         *   method to generate correct offsets within the {@link Autolinker.match.Match}
         *   instances, but may be omitted if calling this method publicly.
         * @return {Autolinker.match.Match[]} The array of Matches found in the
         *   given input `text`.
         */
        Autolinker.prototype.parseText = function (text, offset) {
            offset = offset || 0;
            var matches = parseMatches(text, {
                tagBuilder: this.getTagBuilder(),
                stripPrefix: this.stripPrefix,
                stripTrailingSlash: this.stripTrailingSlash,
                decodePercentEncoding: this.decodePercentEncoding,
                hashtagServiceName: this.hashtag,
                mentionServiceName: this.mention || 'twitter',
            });
            // Correct the offset of each of the matches. They are originally
            // the offset of the match within the provided text node, but we
            // need to correct them to be relative to the original HTML input
            // string (i.e. the one provided to #parse).
            for (var i = 0, numTextMatches = matches.length; i < numTextMatches; i++) {
                matches[i].setOffset(offset + matches[i].getOffset());
            }
            return matches;
        };
        /**
         * Automatically links URLs, Email addresses, Phone numbers, Hashtags,
         * and Mentions (Twitter, Instagram, Soundcloud) found in the given chunk of HTML. Does not link
         * URLs found within HTML tags.
         *
         * For instance, if given the text: `You should go to http://www.yahoo.com`,
         * then the result will be `You should go to
         * &lt;a href="http://www.yahoo.com"&gt;http://www.yahoo.com&lt;/a&gt;`
         *
         * This method finds the text around any HTML elements in the input
         * `textOrHtml`, which will be the text that is processed. Any original HTML
         * elements will be left as-is, as well as the text that is already wrapped
         * in anchor (&lt;a&gt;) tags.
         *
         * @param {String} textOrHtml The HTML or text to autolink matches within
         *   (depending on if the {@link #urls}, {@link #email}, {@link #phone}, {@link #hashtag}, and {@link #mention} options are enabled).
         * @return {String} The HTML, with matches automatically linked.
         */
        Autolinker.prototype.link = function (textOrHtml) {
            if (!textOrHtml) {
                return '';
            } // handle `null` and `undefined` (for JavaScript users that don't have TypeScript support), and nothing to do with an empty string too
            /* We would want to sanitize the start and end characters of a tag
             * before processing the string in order to avoid an XSS scenario.
             * This behaviour can be changed by toggling the sanitizeHtml option.
             */
            if (this.sanitizeHtml) {
                textOrHtml = textOrHtml.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }
            var matches = this.parse(textOrHtml);
            var newHtml = new Array(matches.length * 2 + 1);
            var lastIndex = 0;
            for (var i = 0, len = matches.length; i < len; i++) {
                var match = matches[i];
                newHtml.push(textOrHtml.substring(lastIndex, match.getOffset()));
                newHtml.push(this.createMatchReturnVal(match));
                lastIndex = match.getOffset() + match.getMatchedText().length;
            }
            newHtml.push(textOrHtml.substring(lastIndex)); // handle the text after the last match
            return newHtml.join('');
        };
        /**
         * Creates the return string value for a given match in the input string.
         *
         * This method handles the {@link #replaceFn}, if one was provided.
         *
         * @private
         * @param {Autolinker.match.Match} match The Match object that represents
         *   the match.
         * @return {String} The string that the `match` should be replaced with.
         *   This is usually the anchor tag string, but may be the `matchStr` itself
         *   if the match is not to be replaced.
         */
        Autolinker.prototype.createMatchReturnVal = function (match) {
            // Handle a custom `replaceFn` being provided
            var replaceFnResult;
            if (this.replaceFn) {
                replaceFnResult = this.replaceFn.call(this.context, match); // Autolinker instance is the context
            }
            if (typeof replaceFnResult === 'string') {
                return replaceFnResult; // `replaceFn` returned a string, use that
            }
            else if (replaceFnResult === false) {
                return match.getMatchedText(); // no replacement for the match
            }
            else if (replaceFnResult instanceof HtmlTag) {
                return replaceFnResult.toAnchorString();
            }
            else {
                // replaceFnResult === true, or no/unknown return value from function
                // Perform Autolinker's default anchor tag generation
                var anchorTag = match.buildTag(); // returns an Autolinker.HtmlTag instance
                return anchorTag.toAnchorString();
            }
        };
        /**
         * Returns the {@link #tagBuilder} instance for this Autolinker instance,
         * lazily instantiating it if it does not yet exist.
         *
         * @private
         * @return {Autolinker.AnchorTagBuilder}
         */
        Autolinker.prototype.getTagBuilder = function () {
            var tagBuilder = this.tagBuilder;
            if (!tagBuilder) {
                tagBuilder = this.tagBuilder = new AnchorTagBuilder({
                    newWindow: this.newWindow,
                    truncate: this.truncate,
                    className: this.className,
                });
            }
            return tagBuilder;
        };
        // NOTE: must be 'export default' here for UMD module
        /**
         * @static
         * @property {String} version
         *
         * The Autolinker version number in the form major.minor.patch
         *
         * Ex: 3.15.0
         */
        Autolinker.version = version;
        return Autolinker;
    }());
    /**
     * Normalizes the {@link #urls} config into an Object with its 2 properties:
     * `schemeMatches` and `tldMatches`, both booleans.
     *
     * See {@link #urls} config for details.
     *
     * @private
     * @param {Boolean/Object} urls
     * @return {Object}
     */
    function normalizeUrlsCfg(urls) {
        if (urls == null)
            urls = true; // default to `true`
        if (isBoolean(urls)) {
            return { schemeMatches: urls, tldMatches: urls, ipV4Matches: urls };
        }
        else {
            // object form
            return {
                schemeMatches: isBoolean(urls.schemeMatches) ? urls.schemeMatches : true,
                tldMatches: isBoolean(urls.tldMatches) ? urls.tldMatches : true,
                ipV4Matches: isBoolean(urls.ipV4Matches) ? urls.ipV4Matches : true,
            };
        }
    }
    /**
     * Normalizes the {@link #stripPrefix} config into an Object with 2
     * properties: `scheme`, and `www` - both Booleans.
     *
     * See {@link #stripPrefix} config for details.
     *
     * @private
     * @param {Boolean/Object} stripPrefix
     * @return {Object}
     */
    function normalizeStripPrefixCfg(stripPrefix) {
        if (stripPrefix == null)
            stripPrefix = true; // default to `true`
        if (isBoolean(stripPrefix)) {
            return { scheme: stripPrefix, www: stripPrefix };
        }
        else {
            // object form
            return {
                scheme: isBoolean(stripPrefix.scheme) ? stripPrefix.scheme : true,
                www: isBoolean(stripPrefix.www) ? stripPrefix.www : true,
            };
        }
    }
    /**
     * Normalizes the {@link #truncate} config into an Object with 2 properties:
     * `length` (Number), and `location` (String).
     *
     * See {@link #truncate} config for details.
     *
     * @private
     * @param {Number/Object} truncate
     * @return {Object}
     */
    function normalizeTruncateCfg(truncate) {
        if (typeof truncate === 'number') {
            return { length: truncate, location: 'end' };
        }
        else {
            // object, or undefined/null
            return __assign({ length: Number.POSITIVE_INFINITY, location: 'end' }, truncate);
        }
    }
    /**
     * Helper function for Array.prototype.sort() to sort the Matches by
     * their offset in the input string.
     */
    function byMatchOffset(a, b) {
        return a.getOffset() - b.getOffset();
    }

    return Autolinker;

}));
//# sourceMappingURL=autolinker.js.map
