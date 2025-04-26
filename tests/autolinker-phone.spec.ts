import Autolinker from '../src/autolinker';
import { generateLinkTests } from './util/generate-link-tests';

describe('Phone Number Matching >', () => {
    const autolinker = new Autolinker({ newWindow: false }); // so that target="_blank" is not added to resulting autolinked URLs

    describe('in-country phone numbers >', () => {
        generateLinkTests([
            {
                input: '555-666-7777',
                description: 'US phone number separated by dashes',
                expectedHref: 'tel:5556667777',
                autolinker,
            },
            {
                input: '555.666.7777',
                expectedHref: 'tel:5556667777',
                description: 'US phone number separated by dots',
                autolinker,
            },
            {
                input: '555 666 7777',
                expectedHref: 'tel:5556667777',
                description: 'US phone number separated by spaces',
                autolinker,
            },
            {
                input: '(555)6667777',
                expectedHref: 'tel:5556667777',
                description: 'US phone number area code, no other delims',
                autolinker,
            },
            {
                input: '(555)666-7777',
                expectedHref: 'tel:5556667777',
                description: 'US phone number area code',
                autolinker,
            },
            {
                input: '(555) 666-7777',
                expectedHref: 'tel:5556667777',
                description: 'US phone number area code + separator',
                autolinker,
            },
            {
                input: '03-1123-4562',
                expectedHref: 'tel:0311234562',
                description: 'Japanese local phone number',
                autolinker,
            },
        ]);
    });

    describe('international phone numbers >', () => {
        generateLinkTests([
            {
                input: '+1-541-754-3010',
                description: '+1 (USA) prefix',
                expectedHref: 'tel:+15417543010',
                autolinker,
            },
            {
                input: '1-541-754-3010',
                description: '1 prefix (USA) but with no "+" sign',
                expectedHref: 'tel:15417543010',
                autolinker,
            },
            {
                input: '1 (541) 754-3010',
                description: '1 prefix (USA), no "+" sign, and area code in parens',
                expectedHref: 'tel:15417543010',
                autolinker,
            },
            {
                input: '1.541.754.3010',
                description: '1 prefix (USA), no "+" sign, and separated by dots',
                expectedHref: 'tel:15417543010',
                autolinker,
            },
            {
                input: '+43 5 1766 1000',
                description: '+43 prefix (Austria) phone number',
                expectedHref: 'tel:+43517661000',
                autolinker,
            },
            {
                input: '+381 38 502 456',
                description: '+381 prefix (Serbia) phone number',
                expectedHref: 'tel:+38138502456',
                autolinker,
            },
            {
                input: '+38755233976',
                description: '+387 prefix (Bosnia) phone number',
                expectedHref: 'tel:+38755233976',
                autolinker,
            },
            {
                input: '+852 2846 6433',
                description: '+852 prefix (Hong Kong) phone number',
                expectedHref: 'tel:+85228466433',
                autolinker,
            },
        ]);
    });

    describe('phone numbers with extensions >', () => {
        generateLinkTests([
            {
                input: '1-555-666-7777,234523#',
                description: 'number with a pause and a pound sign',
                expectedHref: 'tel:15556667777,234523#',
                autolinker,
            },
            {
                input: '+1-555-666-7777,234523#',
                description: 'plus-prefixed number with a pause and a pound sign',
                expectedHref: 'tel:+15556667777,234523#',
                autolinker,
            },
            {
                input: '+1-555-666-7777,234523,233',
                description: 'plus-prefixed number with multiple pauses',
                expectedHref: 'tel:+15556667777,234523,233',
                autolinker,
            },
            {
                input: '555 666 7777,234523#,23453#',
                description: 'number with pauses and pound signs',
                expectedHref: 'tel:5556667777,234523#,23453#',
                autolinker,
            },
        ]);

        it('should automatically link numbers when there are extensions with ,<numbers>#, but exclude anything after too many separators', function () {
            expect(autolinker.link('+22016350659,;,55#;;234   ,  3334443323')).toBe(
                '<a href="tel:+22016350659,;,55#;;234">+22016350659,;,55#;;234</a>   ,  3334443323'
            );
        });

        // TODO: Is this definitely a case that should be excluded from matching?
        it('should NOT automatically link numbers when there are extensions with ,<numbers># followed by a number', function () {
            expect(autolinker.link('+1-555-666-7777,234523#233')).toBe(
                '+1-555-666-7777,234523#233'
            );
        });

        it(`should link up until a word character when there are letters after a pound sign ('#')`, () => {
            expect(autolinker.link('+1-555-666-7777,234523#abc')).toBe(
                '<a href="tel:+15556667777,234523#">+1-555-666-7777,234523#</a>abc'
            );
            expect(autolinker.link('+1-555-666-7777,234523#,234523#abc')).toBe(
                '<a href="tel:+15556667777,234523#,234523#">+1-555-666-7777,234523#,234523#</a>abc'
            );
        });
    });

    it("should NOT automatically link a phone number when there are no delimiters, since we don't know for sure if this is a phone number or some other number", function () {
        expect(autolinker.link('5556667777')).toBe('5556667777');
        expect(autolinker.link('15417543010')).toBe('15417543010');
    });

    it('should NOT automatically link numbers when there are non-single-space empty characters (such as newlines) in between', function () {
        expect(autolinker.link('555 666  7777')).toBe('555 666  7777');
        expect(autolinker.link('555	666 7777')).toBe('555	666 7777');
        expect(autolinker.link('555\n666 7777')).toBe('555\n666 7777');
    });
});
