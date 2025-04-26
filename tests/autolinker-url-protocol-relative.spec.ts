import Autolinker from '../src/autolinker';
import { generateUrlCombinationTests } from './util/generate-url-combination-tests';

describe(`Matching protocol-relative URLs (i.e. URLs starting with only '//') >`, () => {
    const autolinker = new Autolinker({
        newWindow: false, // so that target="_blank" is not added to resulting autolinked URLs - makes it easier to test the resulting strings
        stripPrefix: {
            www: false, // for the purposes of the generated tests, leaving this as false makes it easier to automatically create the 'expected' values
        },
    });

    describe('combination URL tests >', () => {
        generateUrlCombinationTests({
            autolinker,
            schemes: ['//'],
            hosts: [
                'yahoo.com',
                'subdomain1.subdomain2.yahoo.com',
                'subdomain_with_underscores.yahoo.com',
                // 'localhost', -- TODO: should this link? Doesn't link in the previous version before state machine implementation (Autolinker 3.x) or linkifyjs, does link in linkify-it
                // '66.102.7.147', -- TODO: should this link? Doesn't link in the previous version before state machine implementation (Autolinker 3.x) or linkifyjs, does link in linkify-it
            ],
            ports: ['', ':8080'],
        });
    });

    it('should automatically link protocol-relative URLs in the form of //yahoo.com at the beginning of the string', () => {
        const result = autolinker.link('//yahoo.com');
        expect(result).toBe('<a href="//yahoo.com">yahoo.com</a>');
    });

    it('should automatically link protocol-relative URLs in the form of //yahoo.com in the middle of the string', () => {
        const result = autolinker.link('Joe went to //yahoo.com yesterday');
        expect(result).toBe('Joe went to <a href="//yahoo.com">yahoo.com</a> yesterday');
    });

    it('should automatically link protocol-relative URLs in the form of //yahoo.com at the end of the string', () => {
        const result = autolinker.link('Joe went to //yahoo.com');
        expect(result).toBe('Joe went to <a href="//yahoo.com">yahoo.com</a>');
    });

    it('should automatically link capitalized protocol-relative URLs', () => {
        const result = autolinker.link('Joe went to //YAHOO.COM');
        expect(result).toBe('Joe went to <a href="//YAHOO.COM">YAHOO.COM</a>');
    });

    it('should match a url with underscores in domain label', () => {
        const result = autolinker.link('//gcs_test_env.storage.googleapis.com/file.pdf');
        expect(result).toBe(
            '<a href="//gcs_test_env.storage.googleapis.com/file.pdf">gcs_test_env.storage.googleapis.com/file.pdf</a>'
        );
    });

    it('should NOT automatically link supposed protocol-relative URLs in the form of abc//yahoo.com, which is most likely not supposed to be interpreted as a URL', () => {
        const result1 = autolinker.link('Joe went to abc//yahoo.com');
        expect(result1).toBe('Joe went to abc//yahoo.com');

        const result2 = autolinker.link('Относительный протокол//россия.рф');
        expect(result2).toBe('Относительный протокол//россия.рф');
    });

    it('should NOT automatically link supposed protocol-relative URLs in the form of 123//yahoo.com, which is most likely not supposed to be interpreted as a URL', () => {
        const result = autolinker.link('Joe went to 123//yahoo.com');
        expect(result).toBe('Joe went to 123//yahoo.com');
    });

    it(`should NOT automatically link supposed protocol-relative URLs where a non-domain label character follows the '//'`, () => {
        const result = autolinker.link('Joe went to //.asdf');
        expect(result).toBe('Joe went to //.asdf');
    });

    it("should automatically link supposed protocol-relative URLs as long as the character before the '//' is a non-word character", () => {
        const result = autolinker.link('Joe went to abc-//yahoo.com');
        expect(result).toBe('Joe went to abc-<a href="//yahoo.com">yahoo.com</a>');
    });
});
