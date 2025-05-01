import { expect } from 'chai';
import Autolinker from '../src/autolinker';
import { generateUrlCombinationTests } from './util/generate-url-combination-tests';

describe(`Matching scheme-prefixed URLs (i.e. URLs starting with 'http://' or 'somescheme:') >`, () => {
    const autolinker = new Autolinker({
        newWindow: false, // so that target="_blank" is not added to resulting autolinked URLs - makes it easier to test the resulting strings
        stripPrefix: {
            www: false, // for the purposes of the generated tests, leaving this as false makes it easier to automatically create the 'expected' values
        },
    });

    describe('combination URL tests >', () => {
        generateUrlCombinationTests({
            autolinker,
            schemes: ['http://', 'https://'],
            hosts: [
                'yahoo.com',
                'subdomain1.subdomain2.yahoo.com',
                'subdomain_with_underscores.yahoo.com',
                'subdomain-with-dashes.some-domain.com',
                'localhost',
                '66.102.7.147',
            ],
            ports: ['', ':8080'],
        });
    });

    it('should link scheme URLs that are only numbers', () => {
        const result = autolinker.link('Joe went to bugtracker://20012909');
        expect(result).to.equal(
            'Joe went to <a href="bugtracker://20012909">bugtracker://20012909</a>'
        );
    });

    it('should automatically link capitalized URLs', () => {
        const result1 = autolinker.link('Joe went to HTTP://YAHOO.COM');
        expect(result1).to.equal('Joe went to <a href="HTTP://YAHOO.COM">YAHOO.COM</a>');

        const result2 = autolinker.link('Joe went to HTTP://WWW.YAHOO.COM');
        expect(result2).to.equal('Joe went to <a href="HTTP://WWW.YAHOO.COM">WWW.YAHOO.COM</a>');
    });

    it('should automatically link URLs with periods in the path', () => {
        const result1 = autolinker.link(
            'https://images-na.ssl-images-amazon.com/images/I/912ozjp0ytL._SY450_.jpg'
        );
        expect(result1).to.equal(
            '<a href="https://images-na.ssl-images-amazon.com/images/I/912ozjp0ytL._SY450_.jpg">images-na.ssl-images-amazon.com/images/I/912ozjp0ytL._SY450_.jpg</a>'
        );

        const result2 = autolinker.link(
            'My image is at: https://images-na.ssl-images-amazon.com/images/I/912ozjp0ytL._SY450_.jpg - check it out'
        );
        expect(result2).to.equal(
            'My image is at: <a href="https://images-na.ssl-images-amazon.com/images/I/912ozjp0ytL._SY450_.jpg">images-na.ssl-images-amazon.com/images/I/912ozjp0ytL._SY450_.jpg</a> - check it out'
        );
    });

    it('should automatically link a URL with accented characters', () => {
        const result = autolinker.link(
            'Joe went to http://mañana.com/mañana?mañana=1#mañana today.'
        );
        expect(result).to.equal(
            'Joe went to <a href="http://mañana.com/mañana?mañana=1#mañana">mañana.com/mañana?mañana=1#mañana</a> today.'
        );
    });

    it('should automatically link cyrillic URLs', () => {
        const result = autolinker.link(
            'Joe went to https://ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица'
        );
        expect(result).to.equal(
            'Joe went to <a href="https://ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица">ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица</a>'
        );
    });

    it('should match local urls with numbers when prefixed with http://', () => {
        const result1 = autolinker.link('http://localhost.local001/test');
        expect(result1).to.equal(
            '<a href="http://localhost.local001/test">localhost.local001/test</a>'
        );

        const result2 = autolinker.link('http://suus111.w10:8090/display/test/AI');
        expect(result2).to.equal(
            '<a href="http://suus111.w10:8090/display/test/AI">suus111.w10:8090/display/test/AI</a>'
        );
    });

    it('should match a url with underscores in domain label', () => {
        const result = autolinker.link('https://gcs_test_env.storage.googleapis.com/file.pdf');
        expect(result).to.equal(
            '<a href="https://gcs_test_env.storage.googleapis.com/file.pdf">gcs_test_env.storage.googleapis.com/file.pdf</a>'
        );
    });

    it('should not match an address with multiple dots', () => {
        expect(autolinker.link('hello:...world')).to.equal('hello:...world');
        expect(autolinker.link('hello:wo.....rld')).to.equal('hello:wo.....rld');
    });

    it("should NOT include preceding ':' introductions without a space", () => {
        const result1 = autolinker.link('the link:http://example.com/');
        expect(result1).to.equal('the link:<a href="http://example.com/">example.com</a>');

        const result2 = autolinker.link('the link:git:example.com/');
        expect(result2).to.equal('the link:<a href="git:example.com/">git:example.com</a>');
    });

    it('should autolink protocols with at least one character', () => {
        const result = autolinker.link('link this: g://example.com/');
        expect(result).to.equal('link this: <a href="g://example.com/">g://example.com</a>');
    });

    it('should autolink protocols with more than 9 characters (as was the previous upper bound, but it seems protocols may be longer)', () => {
        const result = autolinker.link('link this: opaquelocktoken://example');
        expect(result).to.equal(
            'link this: <a href="opaquelocktoken://example">opaquelocktoken://example</a>'
        );
    });

    it('should autolink protocols with digits, dashes, dots, and plus signs in their names', () => {
        const result1 = autolinker.link('link this: a1://example');
        expect(result1).to.equal('link this: <a href="a1://example">a1://example</a>');

        const result2 = autolinker.link('link this: view-source://example');
        expect(result2).to.equal(
            'link this: <a href="view-source://example">view-source://example</a>'
        );

        const result3 = autolinker.link('link this: iris.xpc://example');
        expect(result3).to.equal('link this: <a href="iris.xpc://example">iris.xpc://example</a>');

        const result4 = autolinker.link('link this: test+protocol://example');
        expect(result4).to.equal(
            'link this: <a href="test+protocol://example">test+protocol://example</a>'
        );

        // Test all allowed non-alpha chars
        const result5 = autolinker.link('link this: test+proto-col.123://example');
        expect(result5).to.equal(
            'link this: <a href="test+proto-col.123://example">test+proto-col.123://example</a>'
        );
    });

    it('should NOT autolink protocols that start with a digit, dash, plus sign, or dot, as per http://tools.ietf.org/html/rfc3986#section-3.1', () => {
        const result1 = autolinker.link('do not link first char: -a://example');
        expect(result1).to.equal('do not link first char: -<a href="a://example">a://example</a>');

        const result2 = autolinker.link('do not link first char: +a://example');
        expect(result2).to.equal('do not link first char: +<a href="a://example">a://example</a>');

        const result3 = autolinker.link('do not link first char: .a://example');
        expect(result3).to.equal('do not link first char: .<a href="a://example">a://example</a>');

        const result4 = autolinker.link('do not link first char: .aa://example');
        expect(result4).to.equal(
            'do not link first char: .<a href="aa://example">aa://example</a>'
        );
    });

    it('should autolink protocol starting at http:// or http:// if URL is preceded with text', () => {
        const result1 = autolinker.link('link this: xxxhttp://example.com');
        expect(result1).to.equal('link this: xxx<a href="http://example.com">example.com</a>');

        const result2 = autolinker.link('link this: abchttps://www.example.com');
        expect(result2).to.equal(
            'link this: abc<a href="https://www.example.com">www.example.com</a>'
        );
    });

    it('should link a URL with a check character', () => {
        const result = autolinker.link(
            'https://gitlab.example.com/search?utf8=✓&search=mysearch&group_id=&project_id=42&search_code=true&repository_ref=master'
        );
        expect(result).to.equal(
            '<a href="https://gitlab.example.com/search?utf8=✓&search=mysearch&group_id=&project_id=42&search_code=true&repository_ref=master">gitlab.example.com/search?utf8=✓&amp;search=mysearch&amp;group_id=&amp;project_id=42&amp;search_code=true&amp;repository_ref=master</a>'
        );
    });

    it('should match any local URL with numbers', () => {
        const result1 = autolinker.link('http://localhost.local001/test');
        expect(result1).to.equal(
            '<a href="http://localhost.local001/test">localhost.local001/test</a>'
        );

        const result2 = autolinker.link('http://suus111.w10:8090/display/test/AI');
        expect(result2).to.equal(
            '<a href="http://suus111.w10:8090/display/test/AI">suus111.w10:8090/display/test/AI</a>'
        );
    });

    it('should match katakana with dakuten characters (symbol with combining mark - two unicode characters)', () => {
        const result = autolinker.link('https://website.com/files/name-ボ.pdf');
        expect(result).to.equal(
            '<a href="https://website.com/files/name-ボ.pdf">website.com/files/name-ボ.pdf</a>'
        );
    });

    it('should parse long contiguous characters with no spaces in a timely manner', () => {
        const str = new Array(10000).join('a');
        const start = Date.now();
        autolinker.link(str);
        expect(Date.now() - start).to.be.lessThan(100);
    });

    it('should match urls containing emoji', () => {
        const result = autolinker.link('emoji url http://📙.la/🧛🏻‍♂️ mid-sentence');

        expect(result).to.equal(`emoji url <a href="http://📙.la/🧛🏻‍♂️">📙.la/🧛🏻‍♂️</a> mid-sentence`);
    });

    it('should match urls if a URL begins after a colon', () => {
        const result = autolinker.link('stuff :https://nia.nexon.com testing');

        expect(result).to.equal(`stuff :<a href="https://nia.nexon.com">nia.nexon.com</a> testing`);
    });

    it(`should match urls if a URL begins after a semicolon (i.e. char that isn't part of a url)`, () => {
        const result = autolinker.link('Link 1;https://nia.nexon.com testing');

        expect(result).to.equal(`Link 1;<a href="https://nia.nexon.com">nia.nexon.com</a> testing`);
    });

    it('should match urls if a URL begins after a numeric character+colon (https://github.com/gregjacobs/Autolinker.js/issues/413)', () => {
        const result = autolinker.link('Link 1:https://nia.nexon.com testing');

        expect(result).to.equal(`Link 1:<a href="https://nia.nexon.com">nia.nexon.com</a> testing`);
    });

    it('should match urls if a URL begins after a non-latin character+colon', () => {
        const result = autolinker.link('한글:https://nia.nexon.com testing');

        expect(result).to.equal(`한글:<a href="https://nia.nexon.com">nia.nexon.com</a> testing`);
    });

    it('should match urls if a URL begins after a non-latin character+colon (https://github.com/gregjacobs/Autolinker.js/issues/394)', () => {
        const result = autolinker.link('链接:https://www.google.com testing');

        expect(result).to.equal(`链接:<a href="https://www.google.com">www.google.com</a> testing`);
    });

    it('should match urls if a URL begins after a non-latin character+colon #2 (https://github.com/gregjacobs/Autolinker.js/issues/394)', () => {
        const result = autolinker.link('こちら→https://google.com testing');

        expect(result).to.equal(`こちら→<a href="https://google.com">google.com</a> testing`);
    });

    it('should match urls if a URL begins after a Persian character (https://github.com/gregjacobs/Autolinker.js/issues/409)', () => {
        const result = autolinker.link('این یک لینک استhttps://www.example.com testing');

        expect(result).to.equal(
            `این یک لینک است<a href="https://www.example.com">www.example.com</a> testing`
        );
    });

    it('should match urls if a URL begins after an equals sign (much like an environment var assignment) (https://github.com/gregjacobs/Autolinker.js/issues/405)', () => {
        const result = autolinker.link('FOO=https://example.com');

        expect(result).to.equal(`FOO=<a href="https://example.com">example.com</a>`);
    });

    it('should match urls with scheme starting with an emoji', () => {
        const result = autolinker.link('emoji url 👉http://📙.la/🧛🏻‍♂️ mid-sentence');

        expect(result).to.equal(`emoji url 👉<a href="http://📙.la/🧛🏻‍♂️">📙.la/🧛🏻‍♂️</a> mid-sentence`);
    });

    it('should match urls with just a path', () => {
        const result = autolinker.link('file:some-file.txt mid-sentence');

        // TODO: in theory this is a valid url, but do we want to continue
        // autolinking this in the future? Seems like Autolinker may link
        // "too much" in this case, such as "things:stuff"
        expect(result).to.equal(`<a href="file:some-file.txt">file:some-file.txt</a> mid-sentence`);
    });

    it('should match a file url with an absolute path', () => {
        const result = autolinker.link('check out file:///c:/windows/etc mid-sentence');

        expect(result).to.equal(
            `check out <a href="file:///c:/windows/etc">file:///c:/windows/etc</a> mid-sentence`
        );
    });

    it(`
        should NOT autolink a scheme with an absolute path and no authority (i.e. 
        'scheme://<authority>'). These technically could be URLs according to
        RFC-3986, but most likely not and we'd likely be linking things that 
        people don't actually want linked if we were to link these
    `, () => {
        const result = autolinker.link('check out my-scheme:/something mid-sentence');

        expect(result).to.equal(`check out my-scheme:/something mid-sentence`);
    });

    it(`should NOT autolink what starts out to be a scheme but doesn't have a valid hier-part (https://datatracker.ietf.org/doc/html/rfc3986#appendix-A)`, () => {
        const result = autolinker.link('check out my-scheme:/ mid-sentence');

        expect(result).to.equal(`check out my-scheme:/ mid-sentence`);
    });

    it("should NOT autolink possible URLs with the 'javascript:' URI scheme", () => {
        const result = autolinker.link("do not link javascript:window.alert('hi') please");
        expect(result).to.equal("do not link javascript:window.alert('hi') please");
    });

    it("should NOT autolink possible URLs with the 'javascript:' URI scheme, with different upper/lowercase letters in the uri scheme", () => {
        const result = autolinker.link("do not link JavAscriPt:window.alert('hi') please");
        expect(result).to.equal("do not link JavAscriPt:window.alert('hi') please");
    });

    it("should NOT autolink possible URLs with the 'vbscript:' URI scheme", () => {
        const result = autolinker.link("do not link vbscript:window.alert('hi') please");
        expect(result).to.equal("do not link vbscript:window.alert('hi') please");
    });

    it("should NOT autolink possible URLs with the 'vbscript:' URI scheme, with different upper/lowercase letters in the uri scheme", () => {
        const result = autolinker.link("do not link vBsCriPt:window.alert('hi') please");
        expect(result).to.equal("do not link vBsCriPt:window.alert('hi') please");
    });

    it("should NOT automatically link strings of the form 'git:d' (using the heuristic that the domain name does not have a '.' in it)", () => {
        const result = autolinker.link('Something like git:d should not be linked as a URL');
        expect(result).to.equal('Something like git:d should not be linked as a URL');
    });

    it("should NOT automatically link strings of the form 'git:domain' (using the heuristic that the domain name does not have a '.' in it)", () => {
        const result = autolinker.link('Something like git:domain should not be linked as a URL');
        expect(result).to.equal('Something like git:domain should not be linked as a URL');
    });

    it("should automatically link strings of the form 'git:domain.com', interpreting this as a protocol and domain name", () => {
        const result = autolinker.link('Something like git:domain.com should be linked as a URL');
        expect(result).to.equal(
            'Something like <a href="git:domain.com">git:domain.com</a> should be linked as a URL'
        );
    });

    it("should NOT automatically link a string in the form of 'version:1.0'", () => {
        const result = autolinker.link('version:1.0');
        expect(result).to.equal('version:1.0');
    });

    it("should NOT automatically link these 'abc:def' style strings, which at first may look like schemes but are not", () => {
        const strings = [
            'BEGIN:VCALENDAR',
            'VERSION:1.0',
            'BEGIN:VEVENT',
            'DTSTART:20140401T090000',
            'DTEND:20140401T100000',
            'SUMMARY:Some thing to do',
            'LOCATION:',
            'DESCRIPTION:Just call this guy yeah! Testings',
            'PRIORITY:3',
            'END:VEVENT',
            'END:VCALENDAR',
            'START:123',
            'START:123:SOMETHING',
        ];
        let i, str;
        const len = strings.length;

        // Test with just the strings themselves.
        for (i = 0; i < len; i++) {
            str = strings[i];
            expect(autolinker.link(str)).to.equal(str); // none should be autolinked
        }

        // Test with the strings surrounded by other text
        for (i = 0; i < len; i++) {
            str = strings[i];
            expect(autolinker.link('test ' + str + ' test')).to.equal('test ' + str + ' test'); // none should be autolinked
        }
    });

    it(`should not autolink schemes with authority chars that don't have a host`, () => {
        expect(autolinker.link('http://')).to.equal('http://');
        expect(autolinker.link('http://.')).to.equal('http://.');
        expect(autolinker.link('http://#')).to.equal('http://#');
        expect(autolinker.link('http://##')).to.equal('http://##');
        expect(autolinker.link('http://?')).to.equal('http://?');
        expect(autolinker.link('http://??')).to.equal('http://??');
    });
});
