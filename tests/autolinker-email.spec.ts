import _ from 'lodash';
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

    it('should NOT automatically link any old word with an @ character in it', function () {
        let result = autolinker.link('Hi there@stuff');

        expect(result).toBe('Hi there@stuff');
    });

    it('should automatically link an email address with tld matched localpart', function () {
        let result = autolinker.link('My email is busueng.kim@aaa.com');

        expect(result).toBe(
            'My email is <a href="mailto:busueng.kim@aaa.com">busueng.kim@aaa.com</a>'
        );
    });

    it('should NOT link an email address with an invalid tld', function () {
        let result1 = autolinker.link('My email is fake@gmail.c');
        expect(result1).toBe('My email is fake@gmail.c');

        let result2 = autolinker.link('My email is fake@gmail.comf');
        expect(result2).toBe('My email is fake@gmail.comf');
    });
});
