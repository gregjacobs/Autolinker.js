import { expect } from 'chai';
import Autolinker, { AutolinkerConfig } from '../src/autolinker';

describe('Autolinker XSS (Cross Site Scripting) check -', () => {
    function createAutolinker(options: Partial<AutolinkerConfig> = {}) {
        return new Autolinker(
            Object.assign({}, options, {
                newWindow: false, // just so that target="_blank" is not added to resulting autolinked URLs
            })
        );
    }

    it('when `sanitizeHtml` is false (the default), should leave existing HTML tags as-is', function () {
        const autolinker = createAutolinker();
        const result = autolinker.link(`<img src="asdf.gif" onerror="alert('XSS!')">joe@joe.com`);

        expect(result).to.equal(
            `<img src="asdf.gif" onerror="alert('XSS!')"><a href="mailto:joe@joe.com">joe@joe.com</a>`
        );
    });

    it('when `sanitizeHtml` is true, should sanitize existing HTML tags to render them harmless', function () {
        const autolinker = createAutolinker({ sanitizeHtml: true });
        const result = autolinker.link(`<img src="asdf.gif" onerror="alert('XSS!')">joe@joe.com`);

        expect(result).to.equal(
            `&lt;img src="asdf.gif" onerror="alert('XSS!')"&gt;<a href="mailto:joe@joe.com">joe@joe.com</a>`
        );
    });
});
