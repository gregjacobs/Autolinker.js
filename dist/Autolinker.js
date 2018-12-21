"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var anchor_tag_builder_1 = require("./anchor-tag-builder");
var html_parser_1 = require("./htmlParser/html-parser");
var html_tag_1 = require("./html-tag");
var email_matcher_1 = require("./matcher/email-matcher");
var url_matcher_1 = require("./matcher/url-matcher");
var hashtag_matcher_1 = require("./matcher/hashtag-matcher");
var phone_matcher_1 = require("./matcher/phone-matcher");
var mention_matcher_1 = require("./matcher/mention-matcher");
/**
 * @class Autolinker
 * @extends Object
 *
 * Utility class used to process a given string of text, and wrap the matches in
 * the appropriate anchor (&lt;a&gt;) tags to turn them into links.
 *
 * Any of the configuration options may be provided in an Object (map) provided
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
 *
 * @constructor
 * @param {Object} [cfg] The configuration options for the Autolinker instance,
 *   specified in an Object (map).
 */
var Autolinker = /** @class */ (function () {
    function Autolinker(cfg) {
        if (cfg === void 0) { cfg = {}; }
        /**
         * The Autolinker version number exposed on the instance itself.
         *
         * Ex: 0.25.1
         */
        this.version = Autolinker.version;
        this.urls = this.normalizeUrlsCfg(cfg.urls);
        this.email = typeof cfg.email === 'boolean' ? cfg.email : true;
        this.phone = typeof cfg.phone === 'boolean' ? cfg.phone : true;
        this.hashtag = cfg.hashtag || false;
        this.mention = cfg.mention || false;
        this.newWindow = typeof cfg.newWindow === 'boolean' ? cfg.newWindow : true;
        this.stripPrefix = this.normalizeStripPrefixCfg(cfg.stripPrefix);
        this.stripTrailingSlash = typeof cfg.stripTrailingSlash === 'boolean' ? cfg.stripTrailingSlash : true;
        this.decodePercentEncoding = typeof cfg.decodePercentEncoding === 'boolean' ? cfg.decodePercentEncoding : true;
        // Validate the value of the `mention` cfg
        var mention = this.mention;
        if (mention !== false && mention !== 'twitter' && mention !== 'instagram') {
            throw new Error("invalid `mention` cfg - see docs");
        }
        // Validate the value of the `hashtag` cfg
        var hashtag = this.hashtag;
        if (hashtag !== false && hashtag !== 'twitter' && hashtag !== 'facebook' && hashtag !== 'instagram') {
            throw new Error("invalid `hashtag` cfg - see docs");
        }
        this.truncate = this.normalizeTruncateCfg(cfg.truncate);
        this.className = cfg.className || '';
        this.replaceFn = cfg.replaceFn || null;
        this.context = cfg.context || this;
        this.htmlParser = new html_parser_1.HtmlParser();
        this.matchers = null;
        this.tagBuilder = null;
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
     *     var matches = Autolinker.parse( "Hello google.com, I am asdf@asdf.com", {
     *         urls: true,
     *         email: true
     *     } );
     *
     *     console.log( matches.length );           // 2
     *     console.log( matches[ 0 ].getType() );   // 'url'
     *     console.log( matches[ 0 ].getUrl() );    // 'google.com'
     *     console.log( matches[ 1 ].getType() );   // 'email'
     *     console.log( matches[ 1 ].getEmail() );  // 'asdf@asdf.com'
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
     * Normalizes the {@link #urls} config into an Object with 3 properties:
     * `schemeMatches`, `wwwMatches`, and `tldMatches`, all Booleans.
     *
     * See {@link #urls} config for details.
     *
     * @param {Boolean/Object} urls
     * @return {Object}
     */
    Autolinker.prototype.normalizeUrlsCfg = function (urls) {
        if (urls == null)
            urls = true; // default to `true`
        if (typeof urls === 'boolean') {
            return { schemeMatches: urls, wwwMatches: urls, tldMatches: urls };
        }
        else { // object form
            return {
                schemeMatches: typeof urls.schemeMatches === 'boolean' ? urls.schemeMatches : true,
                wwwMatches: typeof urls.wwwMatches === 'boolean' ? urls.wwwMatches : true,
                tldMatches: typeof urls.tldMatches === 'boolean' ? urls.tldMatches : true
            };
        }
    };
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
    Autolinker.prototype.normalizeStripPrefixCfg = function (stripPrefix) {
        if (stripPrefix == null)
            stripPrefix = true; // default to `true`
        if (typeof stripPrefix === 'boolean') {
            return { scheme: stripPrefix, www: stripPrefix };
        }
        else { // object form
            return {
                scheme: typeof stripPrefix.scheme === 'boolean' ? stripPrefix.scheme : true,
                www: typeof stripPrefix.www === 'boolean' ? stripPrefix.www : true
            };
        }
    };
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
    Autolinker.prototype.normalizeTruncateCfg = function (truncate) {
        if (typeof truncate === 'number') {
            return { length: truncate, location: 'end' };
        }
        else { // object, or undefined/null
            return utils_1.defaults(truncate || {}, {
                length: Number.POSITIVE_INFINITY,
                location: 'end'
            });
        }
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
        var htmlNodes = this.htmlParser.parse(textOrHtml), anchorTagStackCount = 0, // used to only process text around anchor tags, and any inner text/html they may have;
        matches = [];
        // Find all matches within the `textOrHtml` (but not matches that are
        // already nested within <a>, <style> and <script> tags)
        for (var i = 0, len = htmlNodes.length; i < len; i++) {
            var node = htmlNodes[i], nodeType = node.getType();
            if (nodeType === 'element' && ['a', 'style', 'script'].indexOf(node.getTagName()) !== -1) { // Process HTML anchor, style and script element nodes in the input `textOrHtml` to find out when we're within an <a>, <style> or <script> tag
                if (!node.isClosing()) { // it's the start <a>, <style> or <script> tag
                    anchorTagStackCount++;
                }
                else { // it's the end </a>, </style> or </script> tag
                    anchorTagStackCount = Math.max(anchorTagStackCount - 1, 0); // attempt to handle extraneous </a> tags by making sure the stack count never goes below 0
                }
            }
            else if (nodeType === 'text' && anchorTagStackCount === 0) { // Process text nodes that are not within an <a>, <style> and <script> tag
                var textNodeMatches = this.parseText(node.getText(), node.getOffset());
                matches.push.apply(matches, textNodeMatches);
            }
        }
        // After we have found all matches, remove subsequent matches that
        // overlap with a previous match. This can happen for instance with URLs,
        // where the url 'google.com/#link' would match '#link' as a hashtag.
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
     * with a previous match. This can happen for instance with URLs, where the
     * url 'google.com/#link' would match '#link' as a hashtag. Because the
     * '#link' part is contained in a larger match that comes before the HashTag
     * match, we'll remove the HashTag match.
     *
     * @private
     * @param {Autolinker.match.Match[]} matches
     * @return {Autolinker.match.Match[]}
     */
    Autolinker.prototype.compactMatches = function (matches) {
        // First, the matches need to be sorted in order of offset
        matches.sort(function (a, b) { return a.getOffset() - b.getOffset(); });
        for (var i = 0; i < matches.length - 1; i++) {
            var match = matches[i], offset = match.getOffset(), matchedTextLength = match.getMatchedText().length, endIdx = offset + matchedTextLength;
            if (i + 1 < matches.length) {
                // Remove subsequent matches that equal offset with current match
                if (matches[i + 1].getOffset() === offset) {
                    var removeIdx = matches[i + 1].getMatchedText().length > matchedTextLength ? i : i + 1;
                    matches.splice(removeIdx, 1);
                    continue;
                }
                // Remove subsequent matches that overlap with the current match
                if (matches[i + 1].getOffset() < endIdx) {
                    matches.splice(i + 1, 1);
                }
            }
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
            utils_1.remove(matches, function (match) { return match.getType() === 'hashtag'; });
        if (!this.email)
            utils_1.remove(matches, function (match) { return match.getType() === 'email'; });
        if (!this.phone)
            utils_1.remove(matches, function (match) { return match.getType() === 'phone'; });
        if (!this.mention)
            utils_1.remove(matches, function (match) { return match.getType() === 'mention'; });
        if (!this.urls.schemeMatches) {
            utils_1.remove(matches, function (m) { return m.getType() === 'url' && m.getUrlMatchType() === 'scheme'; });
        }
        if (!this.urls.wwwMatches) {
            utils_1.remove(matches, function (m) { return m.getType() === 'url' && m.getUrlMatchType() === 'www'; });
        }
        if (!this.urls.tldMatches) {
            utils_1.remove(matches, function (m) { return m.getType() === 'url' && m.getUrlMatchType() === 'tld'; });
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
        if (offset === void 0) { offset = 0; }
        offset = offset || 0;
        var matchers = this.getMatchers(), matches = [];
        for (var i = 0, numMatchers = matchers.length; i < numMatchers; i++) {
            var textMatches = matchers[i].parseMatches(text);
            // Correct the offset of each of the matches. They are originally
            // the offset of the match within the provided text node, but we
            // need to correct them to be relative to the original HTML input
            // string (i.e. the one provided to #parse).
            for (var j = 0, numTextMatches = textMatches.length; j < numTextMatches; j++) {
                textMatches[j].setOffset(offset + textMatches[j].getOffset());
            }
            matches.push.apply(matches, textMatches);
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
            return "";
        } // handle `null` and `undefined`
        var matches = this.parse(textOrHtml), newHtml = [], lastIndex = 0;
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
        else if (replaceFnResult instanceof html_tag_1.HtmlTag) {
            return replaceFnResult.toAnchorString();
        }
        else { // replaceFnResult === true, or no/unknown return value from function
            // Perform Autolinker's default anchor tag generation
            var anchorTag = match.buildTag(); // returns an Autolinker.HtmlTag instance
            return anchorTag.toAnchorString();
        }
    };
    /**
     * Lazily instantiates and returns the {@link Autolinker.matcher.Matcher}
     * instances for this Autolinker instance.
     *
     * @protected
     * @return {Autolinker.matcher.Matcher[]}
     */
    Autolinker.prototype.getMatchers = function () {
        if (!this.matchers) {
            var tagBuilder = this.getTagBuilder();
            var matchers = [
                new hashtag_matcher_1.HashtagMatcher({ tagBuilder: tagBuilder, serviceName: this.hashtag }),
                new email_matcher_1.EmailMatcher({ tagBuilder: tagBuilder }),
                new phone_matcher_1.PhoneMatcher({ tagBuilder: tagBuilder }),
                new mention_matcher_1.MentionMatcher({ tagBuilder: tagBuilder, serviceName: this.mention }),
                new url_matcher_1.UrlMatcher({ tagBuilder: tagBuilder, stripPrefix: this.stripPrefix, stripTrailingSlash: this.stripTrailingSlash, decodePercentEncoding: this.decodePercentEncoding })
            ];
            return (this.matchers = matchers);
        }
        else {
            return this.matchers;
        }
    };
    /**
     * Returns the {@link #tagBuilder} instance for this Autolinker instance, lazily instantiating it
     * if it does not yet exist.
     *
     * This method may be used in a {@link #replaceFn} to generate the {@link Autolinker.HtmlTag HtmlTag} instance that
     * Autolinker would normally generate, and then allow for modifications before returning it. For example:
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
     *
     * @return {Autolinker.AnchorTagBuilder}
     */
    Autolinker.prototype.getTagBuilder = function () {
        var tagBuilder = this.tagBuilder;
        if (!tagBuilder) {
            tagBuilder = this.tagBuilder = new anchor_tag_builder_1.AnchorTagBuilder({
                newWindow: this.newWindow,
                truncate: this.truncate,
                className: this.className
            });
        }
        return tagBuilder;
    };
    /**
     * The Autolinker version number in the form major.minor.patch
     *
     * Ex: 0.25.1
     */
    Autolinker.version = '1.8.3';
    return Autolinker;
}());
exports.Autolinker = Autolinker;

//# sourceMappingURL=autolinker.js.map
