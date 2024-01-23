import { __extends } from "tslib";
import { assertNever } from '../utils';
import { AbstractMatch } from './abstract-match';
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
            default:
                // Shouldn't happen because Autolinker's constructor should block any invalid values, but just in case
                assertNever(serviceName);
                throw new Error("Invalid hashtag service: ".concat(serviceName));
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
export { HashtagMatch };
//# sourceMappingURL=hashtag-match.js.map