import { HashtagService } from '../parser/hashtag-utils';
import { assertNever } from '../utils';
import { AbstractMatch, AbstractMatchConfig } from './abstract-match';

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
export class HashtagMatch extends AbstractMatch {
    /**
     * @public
     * @property {'hashtag'} type
     *
     * A string name for the type of match that this class represents. Can be
     * used in a TypeScript discriminating union to type-narrow from the
     * `Match` type.
     */
    public readonly type: 'hashtag' = 'hashtag';

    /**
     * @cfg {String} serviceName
     *
     * The service to point hashtag matches to. See {@link Autolinker#hashtag}
     * for available values.
     */
    private readonly serviceName: HashtagService = 'twitter'; // default value just to get the above doc comment in the ES5 output and documentation generator

    /**
     * @cfg {String} hashtag (required)
     *
     * The HashtagMatch that was matched, without the '#'.
     */
    private readonly hashtag: string = ''; // default value just to get the above doc comment in the ES5 output and documentation generator

    /**
     * @method constructor
     * @param {Object} cfg The configuration properties for the Match
     *   instance, specified in an Object (map).
     */
    constructor(cfg: HashtagMatchConfig) {
        super(cfg);

        this.serviceName = cfg.serviceName;
        this.hashtag = cfg.hashtag;
    }

    /**
     * Returns a string name for the type of match that this class represents.
     * For the case of HashtagMatch, returns 'hashtag'.
     *
     * @return {String}
     */
    getType(): 'hashtag' {
        return 'hashtag';
    }

    /**
     * Returns the configured {@link #serviceName} to point the HashtagMatch to.
     * Ex: 'facebook', 'twitter'.
     *
     * @return {String}
     */
    getServiceName(): HashtagService {
        return this.serviceName;
    }

    /**
     * Returns the matched hashtag, without the '#' character.
     *
     * @return {String}
     */
    getHashtag(): string {
        return this.hashtag;
    }

    /**
     * Returns the anchor href that should be generated for the match.
     *
     * @return {String}
     */
    getAnchorHref(): string {
        const serviceName = this.serviceName,
            hashtag = this.hashtag;

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
    }

    /**
     * Returns the anchor text that should be generated for the match.
     *
     * @return {String}
     */
    getAnchorText(): string {
        return '#' + this.hashtag;
    }

    /**
     * Returns the CSS class suffixes that should be used on a tag built with
     * the match. See {@link Autolinker.match.Match#getCssClassSuffixes} for
     * details.
     *
     * @return {String[]}
     */
    getCssClassSuffixes(): string[] {
        const cssClassSuffixes = super.getCssClassSuffixes(),
            serviceName = this.getServiceName();

        if (serviceName) {
            cssClassSuffixes.push(serviceName);
        }
        return cssClassSuffixes;
    }
}

export interface HashtagMatchConfig extends AbstractMatchConfig {
    serviceName: HashtagService;
    hashtag: string;
}
