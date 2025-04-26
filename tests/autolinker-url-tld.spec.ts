import Autolinker from '../src/autolinker';
import { generateUrlCombinationTests } from './util/generate-url-combination-tests';

describe(`Matching top-level domain (TLD) URLs with no scheme prefix (e.g. 'google.com') >`, () => {
    const autolinker = new Autolinker({
        newWindow: false, // so that target="_blank" is not added to resulting autolinked URLs - makes it easier to test the resulting strings
        stripPrefix: {
            www: false, // for the purposes of the generated tests, leaving this as false makes it easier to automatically create the 'expected' values
        },
    });

    describe('combination URL tests >', () => {
        generateUrlCombinationTests({
            autolinker,
            schemes: [''], // no scheme
            hosts: [
                'yahoo.com',
                'www.yahoo.com', // specifically the 'www' prefix
                'WWW.YAHOO.COM', // all caps
                'subdomain1.subdomain2.yahoo.com',
                'subdomain_with_underscores.yahoo.com',
            ],
            ports: ['', ':8080'],
        });
    });

    it(`should link a basic TLD URL`, () => {
        const result1 = autolinker.link('yahoo.com');
        expect(result1).toBe('<a href="http://yahoo.com">yahoo.com</a>');
    });

    it(`should link a basic TLD URL with a port`, () => {
        const result1 = autolinker.link('yahoo.com:8080');
        expect(result1).toBe('<a href="http://yahoo.com:8080">yahoo.com:8080</a>');
    });

    it('should automatically link domain names represented in punicode', () => {
        const result1 = autolinker.link(
            'For compatibility reasons, xn--d1acufc.xn--p1ai is an acceptable form of an international domain.'
        );
        expect(result1).toBe(
            'For compatibility reasons, <a href="http://xn--d1acufc.xn--p1ai">xn--d1acufc.xn--p1ai</a> is an acceptable form of an international domain.'
        );

        const result2 = autolinker.link(
            'For compatibility reasons, http://xn--d1acufc.xn--p1ai is an acceptable form of an international domain.'
        );
        expect(result2).toBe(
            'For compatibility reasons, <a href="http://xn--d1acufc.xn--p1ai">xn--d1acufc.xn--p1ai</a> is an acceptable form of an international domain.'
        );
    });

    it('should automatically link international domain names', () => {
        const result1 = autolinker.link('Русским гораздо проще набрать россия.рф на клавиатуре.');
        expect(result1).toBe(
            'Русским гораздо проще набрать <a href="http://россия.рф">россия.рф</a> на клавиатуре.'
        );

        const result2 = autolinker.link(
            'Русским гораздо проще набрать http://россия.рф на клавиатуре.'
        );
        expect(result2).toBe(
            'Русским гораздо проще набрать <a href="http://россия.рф">россия.рф</a> на клавиатуре.'
        );

        const result3 = autolinker.link('Русским гораздо проще набрать //россия.рф на клавиатуре.');
        expect(result3).toBe(
            'Русским гораздо проще набрать <a href="//россия.рф">россия.рф</a> на клавиатуре.'
        );
    });

    it('should not match local urls with numbers when NOT prefixed with http://', () => {
        const result1 = autolinker.link('localhost.local001/test');
        expect(result1).toBe('localhost.local001/test');

        const result2 = autolinker.link('suus111.w10:8090/display/test/AI');
        expect(result2).toBe('suus111.w10:8090/display/test/AI');
    });

    it("should automatically link 'yahoo.xyz' (a known TLD), but not 'sencha.etc' (an unknown TLD)", () => {
        const result = autolinker.link('yahoo.xyz should be linked, sencha.etc should not');
        expect(result).toBe(
            '<a href="http://yahoo.xyz">yahoo.xyz</a> should be linked, sencha.etc should not'
        );
    });

    it("should automatically link 'a.museum' (a known TLD), but not 'abc.123'", () => {
        const result = autolinker.link('a.museum should be linked, but abc.123 should not');
        expect(result).toBe(
            '<a href="http://a.museum">a.museum</a> should be linked, but abc.123 should not'
        );
    });

    it('should automatically link URLs in the form of yahoo.com, prepending the http:// in this case', () => {
        const result = autolinker.link('Joe went to yahoo.com');
        expect(result).toBe('Joe went to <a href="http://yahoo.com">yahoo.com</a>');
    });

    it('should automatically link URLs in the form of subdomain.yahoo.com', () => {
        const result = autolinker.link('Joe went to subdomain.yahoo.com');
        expect(result).toBe(
            'Joe went to <a href="http://subdomain.yahoo.com">subdomain.yahoo.com</a>'
        );
    });

    it('should automatically link URLs in the form of yahoo.co.uk, prepending the http:// in this case', () => {
        const result = autolinker.link('Joe went to yahoo.co.uk');
        expect(result).toBe('Joe went to <a href="http://yahoo.co.uk">yahoo.co.uk</a>');
    });

    it('should automatically link URLs in the form of yahoo.ru, prepending the http:// in this case', () => {
        const result = autolinker.link('Joe went to yahoo.ru');
        expect(result).toBe('Joe went to <a href="http://yahoo.ru">yahoo.ru</a>');
    });

    it("should automatically link URLs in the form of 'yahoo.com.', without including the trailing period", () => {
        const result = autolinker.link('Joe went to yahoo.com.');
        expect(result).toBe('Joe went to <a href="http://yahoo.com">yahoo.com</a>.');
    });

    it(`should not automatically link hostname that has a dot following a hypen in a domain label. This is not legal according to the domain label specs`, () => {
        const result = autolinker.link('google-.com');

        expect(result).toBe('google-.com');
    });

    it("should automatically link URLs in the form of 'yahoo.com:8000' (with a port number)", () => {
        const result = autolinker.link('Joe went to yahoo.com:8000 today');
        expect(result).toBe('Joe went to <a href="http://yahoo.com:8000">yahoo.com:8000</a> today');
    });

    it("should automatically link URLs in the form of 'yahoo.com:8000/abc' (with a port number and path)", () => {
        const result = autolinker.link('Joe went to yahoo.com:8000/abc today');
        expect(result).toBe(
            'Joe went to <a href="http://yahoo.com:8000/abc">yahoo.com:8000/abc</a> today'
        );
    });

    it("should automatically link URLs in the form of 'yahoo.com:8000?abc' (with a port number and query string)", () => {
        const result = autolinker.link('Joe went to yahoo.com:8000?abc today');
        expect(result).toBe(
            'Joe went to <a href="http://yahoo.com:8000?abc">yahoo.com:8000?abc</a> today'
        );
    });

    it("should automatically link URLs in the form of 'yahoo.com:8000#abc' (with a port number and hash)", () => {
        const result = autolinker.link('Joe went to yahoo.com:8000#abc today');
        expect(result).toBe(
            'Joe went to <a href="http://yahoo.com:8000#abc">yahoo.com:8000#abc</a> today'
        );
    });

    it('should automatically link capitalized URLs', () => {
        const result = autolinker.link('Joe went to YAHOO.COM.');
        expect(result).toBe('Joe went to <a href="http://YAHOO.COM">YAHOO.COM</a>.');
    });

    it('should not include [?!:,.;] chars if at the end of the URL', () => {
        const result1 = autolinker.link('Joe went to yahoo.com? today');
        expect(result1).toBe('Joe went to <a href="http://yahoo.com">yahoo.com</a>? today');
        const result2 = autolinker.link('Joe went to yahoo.com! today');
        expect(result2).toBe('Joe went to <a href="http://yahoo.com">yahoo.com</a>! today');
        const result3 = autolinker.link('Joe went to yahoo.com: today');
        expect(result3).toBe('Joe went to <a href="http://yahoo.com">yahoo.com</a>: today');
        const result4 = autolinker.link('Joe went to yahoo.com, today');
        expect(result4).toBe('Joe went to <a href="http://yahoo.com">yahoo.com</a>, today');
        const result5 = autolinker.link('Joe went to yahoo.com. today');
        expect(result5).toBe('Joe went to <a href="http://yahoo.com">yahoo.com</a>. today');
        const result6 = autolinker.link('Joe went to yahoo.com; today');
        expect(result6).toBe('Joe went to <a href="http://yahoo.com">yahoo.com</a>; today');
    });

    it('should exclude invalid chars after TLD', () => {
        const result1 = autolinker.link("Joe went to yahoo.com's today");
        expect(result1).toBe('Joe went to <a href="http://yahoo.com">yahoo.com</a>\'s today');
        const result2 = autolinker.link("Joe went to yahoo.com/foo's today");
        expect(result2).toBe(
            'Joe went to <a href="http://yahoo.com/foo\'s">yahoo.com/foo\'s</a> today'
        );
        const result3 = autolinker.link("Joe went to yahoo.com's/foo today");
        expect(result3).toBe('Joe went to <a href="http://yahoo.com">yahoo.com</a>\'s/foo today');
    });

    it('should match a url with underscores in domain label', () => {
        const result = autolinker.link('gcs_test_env.storage.googleapis.com/file.pdf');
        expect(result).toBe(
            '<a href="http://gcs_test_env.storage.googleapis.com/file.pdf">gcs_test_env.storage.googleapis.com/file.pdf</a>'
        );
    });

    it('should automatically link a URL with accented characters', () => {
        const result = autolinker.link('Joe went to mañana.com today.');
        expect(result).toBe('Joe went to <a href="http://mañana.com">mañana.com</a> today.');
    });
});
