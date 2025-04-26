import { AbstractMatchConfig, AbstractMatch } from './abstract-match';

/**
 * @class Autolinker.match.Email
 * @extends Autolinker.match.AbstractMatch
 *
 * Represents a Email match found in an input string which should be Autolinked.
 *
 * See this class's superclass ({@link Autolinker.match.Match}) for more details.
 */
export class EmailMatch extends AbstractMatch {
    /**
     * @public
     * @property {'email'} type
     *
     * A string name for the type of match that this class represents. Can be
     * used in a TypeScript discriminating union to type-narrow from the
     * `Match` type.
     */
    public readonly type = 'email' as const;

    /**
     * @cfg {String} email (required)
     *
     * The email address that was matched.
     */
    private readonly email: string = ''; // default value just to get the above doc comment in the ES5 output and documentation generator

    /**
     * @method constructor
     * @param {Object} cfg The configuration properties for the Match
     *   instance, specified in an Object (map).
     */
    constructor(cfg: EmailMatchConfig) {
        super(cfg);

        this.email = cfg.email;
    }

    /**
     * Returns a string name for the type of match that this class represents.
     * For the case of EmailMatch, returns 'email'.
     *
     * @return {String}
     */
    getType(): 'email' {
        return 'email';
    }

    /**
     * Returns the email address that was matched.
     *
     * @return {String}
     */
    getEmail() {
        return this.email;
    }

    /**
     * Returns the anchor href that should be generated for the match.
     *
     * @return {String}
     */
    getAnchorHref() {
        return 'mailto:' + this.email;
    }

    /**
     * Returns the anchor text that should be generated for the match.
     *
     * @return {String}
     */
    getAnchorText() {
        return this.email;
    }
}

export interface EmailMatchConfig extends AbstractMatchConfig {
    email: string;
}
