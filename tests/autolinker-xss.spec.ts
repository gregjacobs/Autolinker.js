import _ from 'lodash';
import { EmailMatcher } from '../src';
import Autolinker, { AutolinkerConfig } from '../src/autolinker';

describe('Autolinker XSS (Cross Site Scripting) check -', () => {
    function createAutolinker(options: Partial<AutolinkerConfig> = {}) {
        return new Autolinker(
            Object.assign({}, options, {
                matchers: [new EmailMatcher()],
                newWindow: false, // just so that target="_blank" is not added to resulting autolinked URLs
            })
        );
    }

    it('when `sanitizeHtml` is false (the default), should leave existing HTML tags as-is', function () {
        const autolinker = createAutolinker();
        let result = autolinker.link(`<img src="asdf.gif" onerror="alert('XSS!')">joe@joe.com`);

        expect(result).toBe(
            `<img src="asdf.gif" onerror="alert('XSS!')"><a href="mailto:joe@joe.com">joe@joe.com</a>`
        );
    });

    it('when `sanitizeHtml` is true, should sanitize existing HTML tags to render them harmless', function () {
        const autolinker = createAutolinker({ sanitizeHtml: true });
        let result = autolinker.link(`<img src="asdf.gif" onerror="alert('XSS!')">joe@joe.com`);

        expect(result).toBe(
            `&lt;img src="asdf.gif" onerror="alert('XSS!')"&gt;<a href="mailto:joe@joe.com">joe@joe.com</a>`
        );
    });
});
