import Autolinker from '../src/autolinker';
import { generateLinkTests } from './util/generate-link-tests';

describe('Autolinker Email Matching >', () => {
    const autolinker = new Autolinker({ newWindow: false }); // so that target="_blank" is not added to resulting autolinked URLs

    describe('combination tests >', () => {
        generateLinkTests([
            {
                input: 'joe@joe.com',
                description: 'basic email',
                expectedHref: `mailto:joe@joe.com`,
                autolinker,
            },
            {
                input: 'joe.smith@joe.com',
                description: 'dot in the local part',
                expectedHref: `mailto:joe.smith@joe.com`,
                autolinker,
            },
            {
                input: 'JOE@JOE.COM',
                description: 'all caps',
                expectedHref: `mailto:JOE@JOE.COM`,
                autolinker,
            },
            {
                input: `joe'roe@joe.com`,
                description: 'apostrophe in the local part',
                expectedHref: `mailto:joe'roe@joe.com`,
                autolinker,
            },
            {
                input: `mañana@mañana.com`,
                description: 'accented chars',
                expectedHref: `mailto:mañana@mañana.com`,
                autolinker,
            },
            {
                input: `Кириллица@Кириллица.com`,
                description: 'cyrillic chars',
                expectedHref: `mailto:Кириллица@Кириллица.com`,
                autolinker,
            },
            {
                input: `mailto:asdf@asdf.com`,
                description: 'email address with a mailto: prefix',
                expectedHref: `mailto:asdf@asdf.com`,
                expectedAnchorText: 'asdf@asdf.com',
                autolinker,
            },
            {
                input: `MAILTO:asdf@asdf.com`,
                description: 'email address with uppercase MAILTO: prefix',
                expectedHref: `mailto:asdf@asdf.com`,
                expectedAnchorText: 'asdf@asdf.com',
                autolinker,
            },
        ]);
    });

    it(`should not match schemes that start looking like 'mailto:' schemes but end up not being them`, function () {
        expect(autolinker.link('mzzzzz:asdf@asdf.com')).toBe('mzzzzz:asdf@asdf.com');
        expect(autolinker.link('mazzzz:asdf@asdf.com')).toBe('mazzzz:asdf@asdf.com');
        expect(autolinker.link('maizzz:asdf@asdf.com')).toBe('maizzz:asdf@asdf.com');
        expect(autolinker.link('mailzz:asdf@asdf.com')).toBe('mailzz:asdf@asdf.com');
        expect(autolinker.link('mailtz:asdf@asdf.com')).toBe('mailtz:asdf@asdf.com');
        expect(autolinker.link('mailto_')).toBe('mailto_'); // note: no colon char
    });

    it(`should not match a random 'mailto:' with no other email-like chars after it`, function () {
        expect(autolinker.link('hello mailto: the world')).toBe('hello mailto: the world');
    });

    it('should NOT automatically link any old word with an @ character in it', function () {
        const result = autolinker.link('Hi there@stuff');

        expect(result).toBe('Hi there@stuff');
    });

    it('should automatically link an email address with tld matched localpart', function () {
        const result = autolinker.link('My email is busueng.kim@aaa.com');

        expect(result).toBe(
            'My email is <a href="mailto:busueng.kim@aaa.com">busueng.kim@aaa.com</a>'
        );
    });

    it(`should NOT link an email address with a local-part that has two consecutive dots (an invalid local-part according to https://datatracker.ietf.org/doc/html/rfc5322, although it's obscure in the document so search engine / AI can summarize better)`, function () {
        const result1 = autolinker.link('My email is notta..email@gmail.com');

        // TODO: perhaps we accept this as a valid email address in the future?
        // Apparently gmail's servers don't change the recipient based on dots
        // in the local part, although is likely invalid for others
        expect(result1).toBe('My email is notta..email@gmail.com');
    });

    it(`should NOT link an email address with a local-part that has a dot followed by the @ sign (an invalid local-part according to https://datatracker.ietf.org/doc/html/rfc5322, although it's obscure in the document so search engine / AI can summarize better)`, function () {
        const result1 = autolinker.link('My email is notanemail.@gmail.com');

        expect(result1).toBe('My email is notanemail.@gmail.com');
    });

    it('should NOT link an email address with an invalid tld', function () {
        const result1 = autolinker.link('My email is fake@gmail.c');
        expect(result1).toBe('My email is fake@gmail.c');

        const result2 = autolinker.link('My email is fake@gmail.comf');
        expect(result2).toBe('My email is fake@gmail.comf');

        const result3 = autolinker.link('My email is fake@gmail..com');
        expect(result3).toBe('My email is fake@gmail..com');

        const result4 = autolinker.link('My email is fake@gmail--somewhere.com');
        expect(result4).toBe('My email is fake@gmail--somewhere.com');

        const result5 = autolinker.link('My email is fake@gmail-.com');
        expect(result5).toBe('My email is fake@gmail-.com');

        const result6 = autolinker.link('My email is fake@gmail#.com');
        expect(result6).toBe('My email is fake@gmail#.com');

        const result7 = autolinker.link('My email is fake@gmail-#.com');
        expect(result7).toBe('My email is fake@gmail-#.com');
    });

    it('should match an email with a dash in it', function () {
        const result = autolinker.link('Hi bob@bobs-stuff.com');

        expect(result).toBe('Hi <a href="mailto:bob@bobs-stuff.com">bob@bobs-stuff.com</a>');
    });
});
