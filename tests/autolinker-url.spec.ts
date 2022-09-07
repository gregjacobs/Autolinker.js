import _ from 'lodash';
import Autolinker from '../src/autolinker';
import { generateLinkTests } from './util/generate-link-tests';

describe('Autolinker Url Matching >', () => {
    const autolinker = new Autolinker({
        newWindow: false,
        stripPrefix: {
            www: false, // for the purposes of the generated tests, leaving this as false makes it easier to automatically create the 'expected' values
        },
    }); // so that target="_blank" is not added to resulting autolinked URLs

    describe(`scheme-prefixed URLs (i.e. URLs starting with 'http://' or 'somescheme:') >`, () => {
        describe('combination URL tests >', () => {
            generateCombinationTests({
                schemes: ['http://', 'https://' /*, 'mailto:'*/],
                hosts: [
                    'yahoo.com',
                    'subdomain1.subdomain2.yahoo.com',
                    'subdomain_with_underscores.yahoo.com',
                    'localhost',
                    '66.102.7.147',
                ],
                ports: ['', ':8080'],
            });
        });

        it('should link scheme URLs that are only numbers', () => {
            let result = autolinker.link('Joe went to bugtracker://20012909');
            expect(result).toBe(
                'Joe went to <a href="bugtracker://20012909">bugtracker://20012909</a>'
            );
        });

        it('should automatically link capitalized URLs', () => {
            let result1 = autolinker.link('Joe went to HTTP://YAHOO.COM');
            expect(result1).toBe('Joe went to <a href="HTTP://YAHOO.COM">YAHOO.COM</a>');

            let result2 = autolinker.link('Joe went to HTTP://WWW.YAHOO.COM');
            expect(result2).toBe('Joe went to <a href="HTTP://WWW.YAHOO.COM">WWW.YAHOO.COM</a>');
        });

        it('should automatically link URLs with periods in the path', () => {
            const result1 = autolinker.link(
                'https://images-na.ssl-images-amazon.com/images/I/912ozjp0ytL._SY450_.jpg'
            );
            expect(result1).toBe(
                '<a href="https://images-na.ssl-images-amazon.com/images/I/912ozjp0ytL._SY450_.jpg">images-na.ssl-images-amazon.com/images/I/912ozjp0ytL._SY450_.jpg</a>'
            );

            const result2 = autolinker.link(
                'My image is at: https://images-na.ssl-images-amazon.com/images/I/912ozjp0ytL._SY450_.jpg - check it out'
            );
            expect(result2).toBe(
                'My image is at: <a href="https://images-na.ssl-images-amazon.com/images/I/912ozjp0ytL._SY450_.jpg">images-na.ssl-images-amazon.com/images/I/912ozjp0ytL._SY450_.jpg</a> - check it out'
            );
        });

        it('should automatically link a URL with accented characters', () => {
            let result = autolinker.link(
                'Joe went to http://mañana.com/mañana?mañana=1#mañana today.'
            );
            expect(result).toBe(
                'Joe went to <a href="http://mañana.com/mañana?mañana=1#mañana">mañana.com/mañana?mañana=1#mañana</a> today.'
            );
        });

        it('should automatically link cyrillic URLs', () => {
            let result = autolinker.link(
                'Joe went to https://ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица'
            );
            expect(result).toBe(
                'Joe went to <a href="https://ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица">ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица</a>'
            );
        });

        it('should match local urls with numbers when prefixed with http://', () => {
            let result1 = autolinker.link('http://localhost.local001/test');
            expect(result1).toBe(
                '<a href="http://localhost.local001/test">localhost.local001/test</a>'
            );

            let result2 = autolinker.link('http://suus111.w10:8090/display/test/AI');
            expect(result2).toBe(
                '<a href="http://suus111.w10:8090/display/test/AI">suus111.w10:8090/display/test/AI</a>'
            );
        });

        it('should match a url with underscores in domain label', () => {
            let result = autolinker.link('https://gcs_test_env.storage.googleapis.com/file.pdf');
            expect(result).toBe(
                '<a href="https://gcs_test_env.storage.googleapis.com/file.pdf">gcs_test_env.storage.googleapis.com/file.pdf</a>'
            );
        });

        it('should not match an address with multiple dots', () => {
            expect(autolinker.link('hello:...world')).toBe('hello:...world');
            expect(autolinker.link('hello:wo.....rld')).toBe('hello:wo.....rld');
        });

        it("should NOT include preceding ':' introductions without a space", () => {
            let result1 = autolinker.link('the link:http://example.com/');
            expect(result1).toBe('the link:<a href="http://example.com/">example.com</a>');

            let result2 = autolinker.link('the link:git:example.com/');
            expect(result2).toBe('the link:<a href="git:example.com/">git:example.com</a>');
        });

        it('should autolink protocols with at least one character', () => {
            let result = autolinker.link('link this: g://example.com/');
            expect(result).toBe('link this: <a href="g://example.com/">g://example.com</a>');
        });

        it('should autolink protocols with more than 9 characters (as was the previous upper bound, but it seems protocols may be longer)', () => {
            let result = autolinker.link('link this: opaquelocktoken://example');
            expect(result).toBe(
                'link this: <a href="opaquelocktoken://example">opaquelocktoken://example</a>'
            );
        });

        it('should autolink protocols with digits, dashes, dots, and plus signs in their names', () => {
            let result1 = autolinker.link('link this: a1://example');
            expect(result1).toBe('link this: <a href="a1://example">a1://example</a>');

            let result2 = autolinker.link('link this: view-source://example');
            expect(result2).toBe(
                'link this: <a href="view-source://example">view-source://example</a>'
            );

            let result3 = autolinker.link('link this: iris.xpc://example');
            expect(result3).toBe('link this: <a href="iris.xpc://example">iris.xpc://example</a>');

            let result4 = autolinker.link('link this: test+protocol://example');
            expect(result4).toBe(
                'link this: <a href="test+protocol://example">test+protocol://example</a>'
            );

            // Test all allowed non-alpha chars
            let result5 = autolinker.link('link this: test+proto-col.123://example');
            expect(result5).toBe(
                'link this: <a href="test+proto-col.123://example">test+proto-col.123://example</a>'
            );
        });

        it('should NOT autolink protocols that start with a digit, dash, plus sign, or dot, as per http://tools.ietf.org/html/rfc3986#section-3.1', () => {
            let result1 = autolinker.link('do not link first char: -a://example');
            expect(result1).toBe('do not link first char: -<a href="a://example">a://example</a>');

            let result2 = autolinker.link('do not link first char: +a://example');
            expect(result2).toBe('do not link first char: +<a href="a://example">a://example</a>');

            let result3 = autolinker.link('do not link first char: .a://example');
            expect(result3).toBe('do not link first char: .<a href="a://example">a://example</a>');

            let result4 = autolinker.link('do not link first char: .aa://example');
            expect(result4).toBe(
                'do not link first char: .<a href="aa://example">aa://example</a>'
            );
        });

        it('should autolink protocol starting at http:// or http:// if URL is preceded with text', () => {
            let result1 = autolinker.link('link this: xxxhttp://example.com');
            expect(result1).toBe('link this: xxx<a href="http://example.com">example.com</a>');

            let result2 = autolinker.link('link this: abchttps://www.example.com');
            expect(result2).toBe(
                'link this: abc<a href="https://www.example.com">www.example.com</a>'
            );
        });

        it('should link a URL with a check character', () => {
            let result = autolinker.link(
                'https://gitlab.example.com/search?utf8=✓&search=mysearch&group_id=&project_id=42&search_code=true&repository_ref=master'
            );
            expect(result).toBe(
                '<a href="https://gitlab.example.com/search?utf8=✓&search=mysearch&group_id=&project_id=42&search_code=true&repository_ref=master">gitlab.example.com/search?utf8=✓&search=mysearch&group_id=&project_id=42&search_code=true&repository_ref=master</a>'
            );
        });

        it('should match any local URL with numbers', function () {
            const result1 = autolinker.link('http://localhost.local001/test');
            expect(result1).toBe(
                '<a href="http://localhost.local001/test">localhost.local001/test</a>'
            );

            const result2 = autolinker.link('http://suus111.w10:8090/display/test/AI');
            expect(result2).toBe(
                '<a href="http://suus111.w10:8090/display/test/AI">suus111.w10:8090/display/test/AI</a>'
            );
        });

        it('should match katakana with dakuten characters (symbol with combining mark - two unicode characters)', () => {
            const result = autolinker.link('https://website.com/files/name-ボ.pdf');
            expect(result).toBe(
                '<a href="https://website.com/files/name-ボ.pdf">website.com/files/name-ボ.pdf</a>'
            );
        });

        it('should parse long contiguous characters with no spaces in a timely manner', function () {
            const str = new Array(10000).join('a');
            const start = Date.now();
            autolinker.link(str);
            expect(Date.now() - start).toBeLessThan(100);
        });

        it('should match urls containing emoji', function () {
            const result = autolinker.link('emoji url http://📙.la/🧛🏻‍♂️ mid-sentance');

            expect(result).toBe(`emoji url <a href="http://📙.la/🧛🏻‍♂️">📙.la/🧛🏻‍♂️</a> mid-sentance`);
        });

        it("should NOT autolink possible URLs with the 'javascript:' URI scheme", () => {
            let result = autolinker.link("do not link javascript:window.alert('hi') please");
            expect(result).toBe("do not link javascript:window.alert('hi') please");
        });

        it("should NOT autolink possible URLs with the 'javascript:' URI scheme, with different upper/lowercase letters in the uri scheme", () => {
            let result = autolinker.link("do not link JavAscriPt:window.alert('hi') please");
            expect(result).toBe("do not link JavAscriPt:window.alert('hi') please");
        });

        it("should NOT autolink possible URLs with the 'vbscript:' URI scheme", () => {
            let result = autolinker.link("do not link vbscript:window.alert('hi') please");
            expect(result).toBe("do not link vbscript:window.alert('hi') please");
        });

        it("should NOT autolink possible URLs with the 'vbscript:' URI scheme, with different upper/lowercase letters in the uri scheme", () => {
            let result = autolinker.link("do not link vBsCriPt:window.alert('hi') please");
            expect(result).toBe("do not link vBsCriPt:window.alert('hi') please");
        });

        it("should NOT automatically link strings of the form 'git:d' (using the heuristic that the domain name does not have a '.' in it)", () => {
            let result = autolinker.link('Something like git:d should not be linked as a URL');
            expect(result).toBe('Something like git:d should not be linked as a URL');
        });

        it("should NOT automatically link strings of the form 'git:domain' (using the heuristic that the domain name does not have a '.' in it)", () => {
            let result = autolinker.link('Something like git:domain should not be linked as a URL');
            expect(result).toBe('Something like git:domain should not be linked as a URL');
        });

        it("should automatically link strings of the form 'git:domain.com', interpreting this as a protocol and domain name", () => {
            let result = autolinker.link('Something like git:domain.com should be linked as a URL');
            expect(result).toBe(
                'Something like <a href="git:domain.com">git:domain.com</a> should be linked as a URL'
            );
        });

        it("should NOT automatically link a string in the form of 'version:1.0'", () => {
            let result = autolinker.link('version:1.0');
            expect(result).toBe('version:1.0');
        });

        it("should NOT automatically link these 'abc:def' style strings", () => {
            let strings = [
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
            let i,
                len = strings.length,
                str;

            // Test with just the strings themselves.
            for (i = 0; i < len; i++) {
                str = strings[i];
                expect(autolinker.link(str)).toBe(str); // none should be autolinked
            }

            // Test with the strings surrounded by other text
            for (i = 0; i < len; i++) {
                str = strings[i];
                expect(autolinker.link('test ' + str + ' test')).toBe('test ' + str + ' test'); // none should be autolinked
            }
        });

        it(`should not autolink schemes with authority chars that don't have a host`, () => {
            expect(autolinker.link('http://')).toBe('http://');
            expect(autolinker.link('http://.')).toBe('http://.');
            expect(autolinker.link('http://#')).toBe('http://#');
            expect(autolinker.link('http://##')).toBe('http://##');
            expect(autolinker.link('http://?')).toBe('http://?');
            expect(autolinker.link('http://??')).toBe('http://??');
        });
    });

    describe(`URLs with no scheme prefix but a known TLD (i.e. 'google.com') >`, () => {
        describe('combination URL tests >', () => {
            generateCombinationTests({
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
            let result1 = autolinker.link('yahoo.com');
            expect(result1).toBe('<a href="http://yahoo.com">yahoo.com</a>');
        });

        it(`should link a basic TLD URL with a port`, () => {
            let result1 = autolinker.link('yahoo.com:8080');
            expect(result1).toBe('<a href="http://yahoo.com:8080">yahoo.com:8080</a>');
        });

        it('should automatically link domain names represented in punicode', () => {
            let result1 = autolinker.link(
                'For compatibility reasons, xn--d1acufc.xn--p1ai is an acceptable form of an international domain.'
            );
            expect(result1).toBe(
                'For compatibility reasons, <a href="http://xn--d1acufc.xn--p1ai">xn--d1acufc.xn--p1ai</a> is an acceptable form of an international domain.'
            );

            let result2 = autolinker.link(
                'For compatibility reasons, http://xn--d1acufc.xn--p1ai is an acceptable form of an international domain.'
            );
            expect(result2).toBe(
                'For compatibility reasons, <a href="http://xn--d1acufc.xn--p1ai">xn--d1acufc.xn--p1ai</a> is an acceptable form of an international domain.'
            );
        });

        it('should automatically link international domain names', () => {
            let result1 = autolinker.link('Русским гораздо проще набрать россия.рф на клавиатуре.');
            expect(result1).toBe(
                'Русским гораздо проще набрать <a href="http://россия.рф">россия.рф</a> на клавиатуре.'
            );

            let result2 = autolinker.link(
                'Русским гораздо проще набрать http://россия.рф на клавиатуре.'
            );
            expect(result2).toBe(
                'Русским гораздо проще набрать <a href="http://россия.рф">россия.рф</a> на клавиатуре.'
            );

            let result3 = autolinker.link(
                'Русским гораздо проще набрать //россия.рф на клавиатуре.'
            );
            expect(result3).toBe(
                'Русским гораздо проще набрать <a href="//россия.рф">россия.рф</a> на клавиатуре.'
            );
        });

        it('should not match local urls with numbers when NOT prefixed with http://', () => {
            let result1 = autolinker.link('localhost.local001/test');
            expect(result1).toBe('localhost.local001/test');

            let result2 = autolinker.link('suus111.w10:8090/display/test/AI');
            expect(result2).toBe('suus111.w10:8090/display/test/AI');
        });

        it("should automatically link 'yahoo.xyz' (a known TLD), but not 'sencha.etc' (an unknown TLD)", () => {
            let result = autolinker.link('yahoo.xyz should be linked, sencha.etc should not');
            expect(result).toBe(
                '<a href="http://yahoo.xyz">yahoo.xyz</a> should be linked, sencha.etc should not'
            );
        });

        it("should automatically link 'a.museum' (a known TLD), but not 'abc.123'", () => {
            let result = autolinker.link('a.museum should be linked, but abc.123 should not');
            expect(result).toBe(
                '<a href="http://a.museum">a.museum</a> should be linked, but abc.123 should not'
            );
        });

        it('should automatically link URLs in the form of yahoo.com, prepending the http:// in this case', () => {
            let result = autolinker.link('Joe went to yahoo.com');
            expect(result).toBe('Joe went to <a href="http://yahoo.com">yahoo.com</a>');
        });

        it('should automatically link URLs in the form of subdomain.yahoo.com', () => {
            let result = autolinker.link('Joe went to subdomain.yahoo.com');
            expect(result).toBe(
                'Joe went to <a href="http://subdomain.yahoo.com">subdomain.yahoo.com</a>'
            );
        });

        it('should automatically link URLs in the form of yahoo.co.uk, prepending the http:// in this case', () => {
            let result = autolinker.link('Joe went to yahoo.co.uk');
            expect(result).toBe('Joe went to <a href="http://yahoo.co.uk">yahoo.co.uk</a>');
        });

        it('should automatically link URLs in the form of yahoo.ru, prepending the http:// in this case', () => {
            let result = autolinker.link('Joe went to yahoo.ru');
            expect(result).toBe('Joe went to <a href="http://yahoo.ru">yahoo.ru</a>');
        });

        it("should automatically link URLs in the form of 'yahoo.com.', without including the trailing period", () => {
            let result = autolinker.link('Joe went to yahoo.com.');
            expect(result).toBe('Joe went to <a href="http://yahoo.com">yahoo.com</a>.');
        });

        it("should automatically link URLs in the form of 'yahoo.com:8000' (with a port number)", () => {
            let result = autolinker.link('Joe went to yahoo.com:8000 today');
            expect(result).toBe(
                'Joe went to <a href="http://yahoo.com:8000">yahoo.com:8000</a> today'
            );
        });

        it("should automatically link URLs in the form of 'yahoo.com:8000/abc' (with a port number and path)", () => {
            let result = autolinker.link('Joe went to yahoo.com:8000/abc today');
            expect(result).toBe(
                'Joe went to <a href="http://yahoo.com:8000/abc">yahoo.com:8000/abc</a> today'
            );
        });

        it("should automatically link URLs in the form of 'yahoo.com:8000?abc' (with a port number and query string)", () => {
            let result = autolinker.link('Joe went to yahoo.com:8000?abc today');
            expect(result).toBe(
                'Joe went to <a href="http://yahoo.com:8000?abc">yahoo.com:8000?abc</a> today'
            );
        });

        it("should automatically link URLs in the form of 'yahoo.com:8000#abc' (with a port number and hash)", () => {
            let result = autolinker.link('Joe went to yahoo.com:8000#abc today');
            expect(result).toBe(
                'Joe went to <a href="http://yahoo.com:8000#abc">yahoo.com:8000#abc</a> today'
            );
        });

        it('should automatically link capitalized URLs', () => {
            let result = autolinker.link('Joe went to YAHOO.COM.');
            expect(result).toBe('Joe went to <a href="http://YAHOO.COM">YAHOO.COM</a>.');
        });

        it('should not include [?!:,.;] chars if at the end of the URL', () => {
            let result1 = autolinker.link('Joe went to yahoo.com? today');
            expect(result1).toBe('Joe went to <a href="http://yahoo.com">yahoo.com</a>? today');
            let result2 = autolinker.link('Joe went to yahoo.com! today');
            expect(result2).toBe('Joe went to <a href="http://yahoo.com">yahoo.com</a>! today');
            let result3 = autolinker.link('Joe went to yahoo.com: today');
            expect(result3).toBe('Joe went to <a href="http://yahoo.com">yahoo.com</a>: today');
            let result4 = autolinker.link('Joe went to yahoo.com, today');
            expect(result4).toBe('Joe went to <a href="http://yahoo.com">yahoo.com</a>, today');
            let result5 = autolinker.link('Joe went to yahoo.com. today');
            expect(result5).toBe('Joe went to <a href="http://yahoo.com">yahoo.com</a>. today');
            let result6 = autolinker.link('Joe went to yahoo.com; today');
            expect(result6).toBe('Joe went to <a href="http://yahoo.com">yahoo.com</a>; today');
        });

        it('should exclude invalid chars after TLD', () => {
            let result1 = autolinker.link("Joe went to yahoo.com's today");
            expect(result1).toBe('Joe went to <a href="http://yahoo.com">yahoo.com</a>\'s today');
            let result2 = autolinker.link("Joe went to yahoo.com/foo's today");
            expect(result2).toBe(
                'Joe went to <a href="http://yahoo.com/foo\'s">yahoo.com/foo\'s</a> today'
            );
            let result3 = autolinker.link("Joe went to yahoo.com's/foo today");
            expect(result3).toBe(
                'Joe went to <a href="http://yahoo.com">yahoo.com</a>\'s/foo today'
            );
        });

        it('should match a url with underscores in domain label', () => {
            let result = autolinker.link('gcs_test_env.storage.googleapis.com/file.pdf');
            expect(result).toBe(
                '<a href="http://gcs_test_env.storage.googleapis.com/file.pdf">gcs_test_env.storage.googleapis.com/file.pdf</a>'
            );
        });

        it('should automatically link a URL with accented characters', () => {
            let result = autolinker.link('Joe went to mañana.com today.');
            expect(result).toBe('Joe went to <a href="http://mañana.com">mañana.com</a> today.');
        });
    });

    describe(`IPv4 addresses without scheme (i.e. '192.168.0.1' without 'http://' prefix) >`, () => {
        it(`should match a basic IP address in text >`, () => {
            const result = autolinker.link('Joe went to 192.168.0.1 today.');
            expect(result).toBe('Joe went to <a href="http://192.168.0.1">192.168.0.1</a> today.');
        });

        describe('combination URL tests >', () => {
            generateCombinationTests({
                schemes: [''], // no scheme
                hosts: ['4.4.4.4', '192.168.0.1'],
                ports: ['', ':8080'],
            });
        });

        it(`should not link an invalid IP with too many octets`, () => {
            const text = 'Joe went to 1.2.3.4.5 today';

            const result = autolinker.link(text);
            expect(result).toBe(text);
        });

        it(`should not link an invalid IP with too few octets`, () => {
            const text = 'Joe went to 1.2.3 today';

            const result = autolinker.link(text);
            expect(result).toBe(text);
        });

        it(`should not link an invalid IP that has an octet >255 (400)`, () => {
            const text = 'Joe went to 1.2.3.400 today';

            const result = autolinker.link(text);
            expect(result).toBe(text);
        });

        it(`should not link an invalid IP that has an octet >255 (1000)`, () => {
            const text = 'Joe went to 1000.2.3.4 today';

            const result = autolinker.link(text);
            expect(result).toBe(text);
        });

        it(`should not link an invalid IP that has an alpha char in an octet (first octet)`, () => {
            const text = 'Joe went to a1.2.3.4 today';

            const result = autolinker.link(text);
            expect(result).toBe(text);
        });

        it(`should not link an invalid IP that has a alpha char in an octet, which could be misconstrued with a host name (last octet)`, () => {
            const text = 'Joe went to 1.2.3.4a today';

            const result = autolinker.link(text);
            expect(result).toBe(text);
        });
    });

    describe("protocol-relative URLs (i.e. URLs starting with only '//') >", () => {
        describe('combination URL tests >', () => {
            generateCombinationTests({
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
            let result = autolinker.link('//yahoo.com');
            expect(result).toBe('<a href="//yahoo.com">yahoo.com</a>');
        });

        it('should automatically link protocol-relative URLs in the form of //yahoo.com in the middle of the string', () => {
            let result = autolinker.link('Joe went to //yahoo.com yesterday');
            expect(result).toBe('Joe went to <a href="//yahoo.com">yahoo.com</a> yesterday');
        });

        it('should automatically link protocol-relative URLs in the form of //yahoo.com at the end of the string', () => {
            let result = autolinker.link('Joe went to //yahoo.com');
            expect(result).toBe('Joe went to <a href="//yahoo.com">yahoo.com</a>');
        });

        it('should automatically link capitalized protocol-relative URLs', () => {
            let result = autolinker.link('Joe went to //YAHOO.COM');
            expect(result).toBe('Joe went to <a href="//YAHOO.COM">YAHOO.COM</a>');
        });

        it('should match a url with underscores in domain label', () => {
            let result = autolinker.link('//gcs_test_env.storage.googleapis.com/file.pdf');
            expect(result).toBe(
                '<a href="//gcs_test_env.storage.googleapis.com/file.pdf">gcs_test_env.storage.googleapis.com/file.pdf</a>'
            );
        });

        it('should NOT automatically link supposed protocol-relative URLs in the form of abc//yahoo.com, which is most likely not supposed to be interpreted as a URL', () => {
            let result1 = autolinker.link('Joe went to abc//yahoo.com');
            expect(result1).toBe('Joe went to abc//yahoo.com');

            let result2 = autolinker.link('Относительный протокол//россия.рф');
            expect(result2).toBe('Относительный протокол//россия.рф');
        });

        it('should NOT automatically link supposed protocol-relative URLs in the form of 123//yahoo.com, which is most likely not supposed to be interpreted as a URL', () => {
            let result = autolinker.link('Joe went to 123//yahoo.com');
            expect(result).toBe('Joe went to 123//yahoo.com');
        });

        it("should automatically link supposed protocol-relative URLs as long as the character before the '//' is a non-word character", () => {
            let result = autolinker.link('Joe went to abc-//yahoo.com');
            expect(result).toBe('Joe went to abc-<a href="//yahoo.com">yahoo.com</a>');
        });
    });

    describe('brace handling (parens, square, and curly braces) >', () => {
        const testCases = [
            { braceName: 'parenthesis', openBraceChar: '(', closeBraceChar: ')' },
            { braceName: 'square braces', openBraceChar: '[', closeBraceChar: ']' },
            { braceName: 'curly braces', openBraceChar: '{', closeBraceChar: '}' },
        ];

        testCases.forEach(({ braceName, openBraceChar, closeBraceChar }) => {
            it(`should include ${braceName} in URLs with paths`, () => {
                const result1 = autolinker.link(
                    `TLDs come from en.wikipedia.org/wiki/IANA_${openBraceChar}disambiguation${closeBraceChar}.`
                );
                expect(result1).toBe(
                    `TLDs come from <a href="http://en.wikipedia.org/wiki/IANA_${openBraceChar}disambiguation${closeBraceChar}">en.wikipedia.org/wiki/IANA_${openBraceChar}disambiguation${closeBraceChar}</a>.`
                );

                const result2 = autolinker.link(
                    `MSDN has a great article at http://msdn.microsoft.com/en-us/library/aa752574${openBraceChar}VS.85${closeBraceChar}.aspx.`
                );
                expect(result2).toBe(
                    `MSDN has a great article at <a href="http://msdn.microsoft.com/en-us/library/aa752574${openBraceChar}VS.85${closeBraceChar}.aspx">msdn.microsoft.com/en-us/library/aa752574${openBraceChar}VS.85${closeBraceChar}.aspx</a>.`
                );
            });

            it(`should include ${braceName} in URLs with query strings`, () => {
                const result1 = autolinker.link(
                    `TLDs come from en.wikipedia.org/wiki?IANA_${openBraceChar}disambiguation${closeBraceChar}.`
                );
                expect(result1).toBe(
                    `TLDs come from <a href="http://en.wikipedia.org/wiki?IANA_${openBraceChar}disambiguation${closeBraceChar}">en.wikipedia.org/wiki?IANA_${openBraceChar}disambiguation${closeBraceChar}</a>.`
                );

                const result2 = autolinker.link(
                    `MSDN has a great article at http://msdn.microsoft.com/en-us/library?aa752574${openBraceChar}VS.85${closeBraceChar}.aspx.`
                );
                expect(result2).toBe(
                    `MSDN has a great article at <a href="http://msdn.microsoft.com/en-us/library?aa752574${openBraceChar}VS.85${closeBraceChar}.aspx">msdn.microsoft.com/en-us/library?aa752574${openBraceChar}VS.85${closeBraceChar}.aspx</a>.`
                );
            });

            it(`should include ${braceName} in URLs with hash anchors`, () => {
                const result1 = autolinker.link(
                    `TLDs come from en.wikipedia.org/wiki#IANA_${openBraceChar}disambiguation${closeBraceChar}.`
                );
                expect(result1).toBe(
                    `TLDs come from <a href="http://en.wikipedia.org/wiki#IANA_${openBraceChar}disambiguation${closeBraceChar}">en.wikipedia.org/wiki#IANA_${openBraceChar}disambiguation${closeBraceChar}</a>.`
                );

                const result2 = autolinker.link(
                    `MSDN has a great article at http://msdn.microsoft.com/en-us/library#aa752574${openBraceChar}VS.85${closeBraceChar}.aspx.`
                );
                expect(result2).toBe(
                    `MSDN has a great article at <a href="http://msdn.microsoft.com/en-us/library#aa752574${openBraceChar}VS.85${closeBraceChar}.aspx">msdn.microsoft.com/en-us/library#aa752574${openBraceChar}VS.85${closeBraceChar}.aspx</a>.`
                );
            });

            it(`when the URL has ${braceName} within it itself, should exclude the final closing brace from the URL when its unmatched`, () => {
                const result1 = autolinker.link(
                    `TLDs come from ${openBraceChar}en.wikipedia.org/wiki/IANA_${openBraceChar}disambiguation${closeBraceChar}${closeBraceChar}.`
                );
                expect(result1).toBe(
                    `TLDs come from ${openBraceChar}<a href="http://en.wikipedia.org/wiki/IANA_${openBraceChar}disambiguation${closeBraceChar}">en.wikipedia.org/wiki/IANA_${openBraceChar}disambiguation${closeBraceChar}</a>${closeBraceChar}.`
                );

                const result2 = autolinker.link(
                    `MSDN has a great article at ${openBraceChar}http://msdn.microsoft.com/en-us/library/aa752574${openBraceChar}VS.85${closeBraceChar}.aspx${closeBraceChar}.`
                );
                expect(result2).toBe(
                    `MSDN has a great article at ${openBraceChar}<a href="http://msdn.microsoft.com/en-us/library/aa752574${openBraceChar}VS.85${closeBraceChar}.aspx">msdn.microsoft.com/en-us/library/aa752574${openBraceChar}VS.85${closeBraceChar}.aspx</a>${closeBraceChar}.`
                );
            });

            it(`should not include final closing ${braceName} in the URL, if it doesn't match opening ${braceName} in the url`, () => {
                const result = autolinker.link(
                    `Click here ${openBraceChar}google.com${closeBraceChar} for more details`
                );
                expect(result).toBe(
                    `Click here ${openBraceChar}<a href="http://google.com">google.com</a>${closeBraceChar} for more details`
                );
            });

            it(`should not include final closing ${braceName} in the URL when a path exists`, () => {
                const result = autolinker.link(
                    `Click here ${openBraceChar}google.com/abc${closeBraceChar} for more details`
                );
                expect(result).toBe(
                    `Click here ${openBraceChar}<a href="http://google.com/abc">google.com/abc</a>${closeBraceChar} for more details`
                );
            });

            it(`should not include final closing ${braceName} in the URL when a query string exists`, () => {
                const result = autolinker.link(
                    `Click here ${openBraceChar}google.com?abc=1${closeBraceChar} for more details`
                );
                expect(result).toBe(
                    `Click here ${openBraceChar}<a href="http://google.com?abc=1">google.com?abc=1</a>${closeBraceChar} for more details`
                );
            });

            it(`should not include final closing ${braceName} in the URL when a hash anchor exists`, () => {
                const result = autolinker.link(
                    `Click here ${openBraceChar}google.com#abc${closeBraceChar} for more details`
                );
                expect(result).toBe(
                    `Click here ${openBraceChar}<a href="http://google.com#abc">google.com#abc</a>${closeBraceChar} for more details`
                );
            });
        });

        it(`when there are multiple brackets surrounding the URL, should exclude them all`, () => {
            const result = autolinker.link(`(Websites {like [google.com/path]})`);
            expect(result).toBe(
                `(Websites {like [<a href="http://google.com/path">google.com/path</a>]})`
            );
        });

        it(`when there are multiple brackets surrounding the URL including punctuation, should exclude the braces and the punctuation`, () => {
            const result = autolinker.link(`(Websites {like [google.com/path.]!}?)`);
            expect(result).toBe(
                `(Websites {like [<a href="http://google.com/path">google.com/path</a>.]!}?)`
            );
        });

        it(`when there are brackets surrounding the URL and extraneous close brackets inside the URL, should only exclude the ones from the end`, () => {
            const result = autolinker.link(`(Websites {like [google.com/path))}]s]})`);
            expect(result).toBe(
                `(Websites {like [<a href="http://google.com/path))}]s">google.com/path))}]s</a>]})`
            );
        });

        describe(`parenthesis-specific handling >`, () => {
            it(`should include escaped parentheses in the URL`, () => {
                const result = autolinker.link(
                    "Here's an example from CodingHorror: http://en.wikipedia.org/wiki/PC_Tools_%28Central_Point_Software%29"
                );
                expect(result).toBe(
                    'Here\'s an example from CodingHorror: <a href="http://en.wikipedia.org/wiki/PC_Tools_%28Central_Point_Software%29">en.wikipedia.org/wiki/PC_Tools_(Central_Point_Software)</a>'
                );
            });
        });

        describe('square bracket-specific handling >', () => {
            it('should include escaped square brackets in the URL', () => {
                let result = autolinker.link(
                    "Here's an example from CodingHorror: http://en.wikipedia.org/wiki/PC_Tools_%5BCentral_Point_Software%5D"
                );
                expect(result).toBe(
                    'Here\'s an example from CodingHorror: <a href="http://en.wikipedia.org/wiki/PC_Tools_%5BCentral_Point_Software%5D">en.wikipedia.org/wiki/PC_Tools_[Central_Point_Software]</a>'
                );
            });

            it(`should correctly accept square brackets such as PHP array representation in query strings`, () => {
                let result = autolinker.link(
                    "Here's an example: http://example.com/foo.php?bar[]=1&bar[]=2&bar[]=3"
                );
                expect(result).toBe(
                    `Here's an example: <a href="http://example.com/foo.php?bar[]=1&bar[]=2&bar[]=3">example.com/foo.php?bar[]=1&bar[]=2&bar[]=3</a>`
                );
            });

            it(`should correctly accept square brackets such as PHP array 
                 representation in query strings, when the entire URL is surrounded
                 by square brackets
                `, () => {
                let result = autolinker.link(
                    "Here's an example: [http://example.com/foo.php?bar[]=1&bar[]=2&bar[]=3]"
                );
                expect(result).toBe(
                    `Here's an example: [<a href="http://example.com/foo.php?bar[]=1&bar[]=2&bar[]=3">example.com/foo.php?bar[]=1&bar[]=2&bar[]=3</a>]`
                );
            });
        });

        describe('curly bracket-specific handling >', () => {
            it('should include escaped curly brackets in the URL', () => {
                let result = autolinker.link(
                    "Here's an example from CodingHorror: http://en.wikipedia.org/wiki/PC_Tools_%7BCentral_Point_Software%7D"
                );
                expect(result).toBe(
                    'Here\'s an example from CodingHorror: <a href="http://en.wikipedia.org/wiki/PC_Tools_%7BCentral_Point_Software%7D">en.wikipedia.org/wiki/PC_Tools_{Central_Point_Software}</a>'
                );
            });

            it(`should correctly accept curly brackets such as a sharepoint url`, () => {
                let result = autolinker.link(
                    "Here's an example: https://gohub.sharepoint.com/example/doc.aspx?sourcedoc={foobar}&action=edit"
                );
                expect(result).toBe(
                    `Here's an example: <a href="https://gohub.sharepoint.com/example/doc.aspx?sourcedoc={foobar}&action=edit">gohub.sharepoint.com/example/doc.aspx?sourcedoc={foobar}&action=edit</a>`
                );
            });

            it(`should correctly accept curly brackets such as a sharepoint url,
                 when the entire URL is surrounded by square brackets`, () => {
                let result = autolinker.link(
                    "Here's an example: https://gohub.sharepoint.com/example/doc.aspx?sourcedoc={foobar}&action=edit"
                );
                expect(result).toBe(
                    `Here's an example: <a href="https://gohub.sharepoint.com/example/doc.aspx?sourcedoc={foobar}&action=edit">gohub.sharepoint.com/example/doc.aspx?sourcedoc={foobar}&action=edit</a>`
                );
            });

            it(`should handle accepting nested curly brackets at end of URL`, () => {
                let result = autolinker.link(
                    "Here's an example: http://gohub.sharepoint/example/make-payment?props={%22params%22:{%22loanId%22:%220349494%22}}"
                );
                expect(result).toBe(
                    `Here's an example: <a href="http://gohub.sharepoint/example/make-payment?props={%22params%22:{%22loanId%22:%220349494%22}}">gohub.sharepoint/example/make-payment?props={&quot;params&quot;:{&quot;loanId&quot;:&quot;0349494&quot;}}</a>`
                );
            });
        });
    });

    describe('Special character handling >', () => {
        it('should include $ in URLs', () => {
            let result = autolinker.link(
                'Check out pair programming: http://c2.com/cgi/wiki$?VirtualPairProgramming'
            );
            expect(result).toBe(
                'Check out pair programming: <a href="http://c2.com/cgi/wiki$?VirtualPairProgramming">c2.com/cgi/wiki$?VirtualPairProgramming</a>'
            );
        });

        it('should include $ in URLs with query strings', () => {
            let result = autolinker.link(
                'Check out the image at http://server.com/template?fmt=jpeg&$base=700.'
            );
            expect(result).toBe(
                'Check out the image at <a href="http://server.com/template?fmt=jpeg&$base=700">server.com/template?fmt=jpeg&$base=700</a>.'
            );
        });

        it('should include * in URLs', () => {
            let result = autolinker.link(
                'Google from wayback http://wayback.archive.org/web/*/http://google.com'
            );
            expect(result).toBe(
                'Google from wayback <a href="http://wayback.archive.org/web/*/http://google.com">wayback.archive.org/web/*/http://google.com</a>'
            );
        });

        it('should include * in URLs with query strings', () => {
            let result = autolinker.link(
                'Twitter search for bob smith https://api.twitter.com/1.1/users/search.json?count=20&q=Bob+*+Smith'
            );
            expect(result).toBe(
                'Twitter search for bob smith <a href="https://api.twitter.com/1.1/users/search.json?count=20&q=Bob+*+Smith">api.twitter.com/1.1/users/search.json?count=20&q=Bob+*+Smith</a>'
            );
        });

        it('should include ^ in URLs with query strings', () => {
            let result = autolinker.link(
                'Test caret url: https://sourcegraph.yelpcorp.com/search?q=repo:^services&patternType=literal'
            );
            expect(result).toBe(
                'Test caret url: <a href="https://sourcegraph.yelpcorp.com/search?q=repo:^services&patternType=literal">sourcegraph.yelpcorp.com/search?q=repo:^services&patternType=literal</a>'
            );
        });

        it("should include ' in URLs", () => {
            let result = autolinker.link(
                "You are a star http://en.wikipedia.org/wiki/You're_a_Star/"
            );
            expect(result).toBe(
                'You are a star <a href="http://en.wikipedia.org/wiki/You\'re_a_Star/">en.wikipedia.org/wiki/You\'re_a_Star</a>'
            );
        });

        it("should include ' in URLs with query strings", () => {
            let result = autolinker.link("Test google search https://google.com/#q=test's");
            expect(result).toBe(
                'Test google search <a href="https://google.com/#q=test\'s">google.com/#q=test\'s</a>'
            );
        });

        it('should include [ and ] in URLs with query strings', () => {
            let result = autolinker.link(
                'Go to https://example.com/api/export/873/?a[]=10&a[]=9&a[]=8&a[]=7&a[]=6 today'
            );
            expect(result).toBe(
                'Go to <a href="https://example.com/api/export/873/?a[]=10&a[]=9&a[]=8&a[]=7&a[]=6">example.com/api/export/873/?a[]=10&a[]=9&a[]=8&a[]=7&a[]=6</a> today'
            );
        });

        it('should handle an example Google Maps URL with query string', () => {
            let result = autolinker.link(
                "google.no/maps/place/Gary's+Deli/@52.3664378,4.869345,18z/data=!4m7!1m4!3m3!1s0x47c609c14a6680df:0x643f005113531f15!2sBeertemple!3b1!3m1!1s0x0000000000000000:0x51a8a6adb4307be6?hl=no"
            );

            expect(result).toBe(
                '<a href="http://google.no/maps/place/Gary\'s+Deli/@52.3664378,4.869345,18z/data=!4m7!1m4!3m3!1s0x47c609c14a6680df:0x643f005113531f15!2sBeertemple!3b1!3m1!1s0x0000000000000000:0x51a8a6adb4307be6?hl=no">google.no/maps/place/Gary\'s+Deli/@52.3664378,4.869345,18z/data=!4m7!1m4!3m3!1s0x47c609c14a6680df:0x643f005113531f15!2sBeertemple!3b1!3m1!1s0x0000000000000000:0x51a8a6adb4307be6?hl=no</a>'
            );
        });

        it('should handle emoji', () => {
            let result = autolinker.link('Joe went to http://emoji🐰🦊town🧞‍♀️🧜🏻‍♀️.com/?emoji=👨🏾‍🚀');
            expect(result).toBe(
                'Joe went to <a href="http://emoji🐰🦊town🧞‍♀️🧜🏻‍♀️.com/?emoji=👨🏾‍🚀">emoji🐰🦊town🧞‍♀️🧜🏻‍♀️.com/?emoji=👨🏾‍🚀</a>'
            );
        });

        it('should decode emojis', () => {
            var result = autolinker.link(
                'Danish flag emoji: https://emojipedia.org/%F0%9F%87%A9%F0%9F%87%B0'
            );

            expect(result).toBe(
                'Danish flag emoji: <a href="https://emojipedia.org/%F0%9F%87%A9%F0%9F%87%B0">emojipedia.org/🇩🇰</a>'
            );
        });

        it('should HTML-encode escape-encoded special characters', () => {
            var result = autolinker.link('Link: http://example.com/%3c%3E%22%27%26');

            expect(result).toBe(
                'Link: <a href="http://example.com/%3c%3E%22%27%26">example.com/&lt;&gt;&quot;&#39;&amp;</a>'
            );
        });
    });

    it('should automatically link a URL with a complex hash (such as a Google Analytics url)', () => {
        let result = autolinker.link(
            'Joe went to https://google.com/analytics/web/?pli=1#my-reports/Obif-Y6qQB2xAJk0ZZE1Zg/a4454143w36378534p43704543/%3F.date00%3D20120314%26_.date01%3D20120314%268534-table.rowStart%3D0%268534-table.rowCount%3D25/ and analyzed his analytics'
        );
        expect(result).toBe(
            'Joe went to <a href="https://google.com/analytics/web/?pli=1#my-reports/Obif-Y6qQB2xAJk0ZZE1Zg/a4454143w36378534p43704543/%3F.date00%3D20120314%26_.date01%3D20120314%268534-table.rowStart%3D0%268534-table.rowCount%3D25/">google.com/analytics/web/?pli=1#my-reports/Obif-Y6qQB2xAJk0ZZE1Zg/a4454143w36378534p43704543/?.date00=20120314&amp;_.date01=20120314&amp;8534-table.rowStart=0&amp;8534-table.rowCount=25</a> and analyzed his analytics'
        );
    });

    it("should remove trailing slash from 'http://yahoo.com/'", () => {
        let result = autolinker.link('Joe went to http://yahoo.com/.');
        expect(result).toBe('Joe went to <a href="http://yahoo.com/">yahoo.com</a>.');
    });

    it("should remove trailing slash from 'http://yahoo.com/sports/'", () => {
        let result = autolinker.link('Joe went to http://yahoo.com/sports/.');
        expect(result).toBe('Joe went to <a href="http://yahoo.com/sports/">yahoo.com/sports</a>.');
    });

    describe('multiple dots handling', () => {
        it('should autolink a url with multiple dots in the path', () => {
            var result = autolinker.link(
                'https://gitlab.example.com/space/repo/compare/master...develop'
            );

            expect(result).toBe(
                '<a href="https://gitlab.example.com/space/repo/compare/master...develop">gitlab.example.com/space/repo/compare/master...develop</a>'
            );
        });
    });

    describe('curly quotes handling', () => {
        it('should autolink a url surrounded by curly quotes', () => {
            var result = autolinker.link('“link.com/foo”');

            expect(result).toBe('“<a href="http://link.com/foo">link.com/foo</a>”');
        });

        it('should autolink a url with www. prefix surrounded by curly quotes', () => {
            var result = autolinker.link('“www.link.com/foo”');

            expect(result).toBe('“<a href="http://www.link.com/foo">www.link.com/foo</a>”');
        });

        it('should autolink a url with protocol prefix surrounded by curly quotes', () => {
            var result = autolinker.link('“http://link.com/foo”');

            expect(result).toBe('“<a href="http://link.com/foo">link.com/foo</a>”');
        });
    });

    describe('combination example', () => {
        it(`should automatically link all of the URLs of many different forms`, () => {
            let inputStr = `
				Joe went to http://yahoo.com and http://localhost today along with http://localhost:8000.
				He also had a path on localhost: http://localhost:8000/abc, and a query string: http://localhost:8000?abc
				But who could forget about hashes like http://localhost:8000#abc
				It seems http://www.google.com is a good site, but might want to be secure with https://www.google.com
				Sometimes people just need an IP http://66.102.7.147, and a port like http://10.0.0.108:9000
				Capitalized URLs are interesting: HTTP://WWW.YAHOO.COM
				We all like known TLDs like yahoo.com, but shouldn't go to unknown TLDs like sencha.etc
				And definitely shouldn't go to abc.123
				Don't want to include periods at the end of sentences like http://yahoo.com.
				Sometimes you need to go to a path like yahoo.com/my-page
				And hit query strings like yahoo.com?page=index
				Port numbers on known TLDs are important too like yahoo.com:8000.
				Hashes too yahoo.com:8000/#some-link. 
				Sometimes you need a lot of things in the URL like https://abc123def.org/path1/2path?param1=value1#hash123z
				Do you see the need for dashes in these things too https://abc-def.org/his-path/?the-param=the-value#the-hash?
				There's a time for lots and lots of special characters like in https://abc123def.org/-+&@#/%=~_()|\'$*[]?!:,.;/?param1=value-+&@#/%=~_()|\'$*[]?!:,.;#hash-+&@#/%=~_()|\'$*[]?!:,.;z
				Don't forget about good times with unicode https://ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица 
				and this unicode http://россия.рф
				along with punycode http://xn--d1acufc.xn--p1ai
				Oh good old www links like www.yahoo.com
			`;

            let result = autolinker.link(inputStr);
            expect(result).toBe(`
				Joe went to <a href="http://yahoo.com">yahoo.com</a> and <a href="http://localhost">localhost</a> today along with <a href="http://localhost:8000">localhost:8000</a>.
				He also had a path on localhost: <a href="http://localhost:8000/abc">localhost:8000/abc</a>, and a query string: <a href="http://localhost:8000?abc">localhost:8000?abc</a>
				But who could forget about hashes like <a href="http://localhost:8000#abc">localhost:8000#abc</a>
				It seems <a href="http://www.google.com">www.google.com</a> is a good site, but might want to be secure with <a href="https://www.google.com">www.google.com</a>
				Sometimes people just need an IP <a href="http://66.102.7.147">66.102.7.147</a>, and a port like <a href="http://10.0.0.108:9000">10.0.0.108:9000</a>
				Capitalized URLs are interesting: <a href="HTTP://WWW.YAHOO.COM">WWW.YAHOO.COM</a>
				We all like known TLDs like <a href="http://yahoo.com">yahoo.com</a>, but shouldn't go to unknown TLDs like sencha.etc
				And definitely shouldn't go to abc.123
				Don't want to include periods at the end of sentences like <a href="http://yahoo.com">yahoo.com</a>.
				Sometimes you need to go to a path like <a href="http://yahoo.com/my-page">yahoo.com/my-page</a>
				And hit query strings like <a href="http://yahoo.com?page=index">yahoo.com?page=index</a>
				Port numbers on known TLDs are important too like <a href="http://yahoo.com:8000">yahoo.com:8000</a>.
				Hashes too <a href="http://yahoo.com:8000/#some-link">yahoo.com:8000/#some-link</a>. 
				Sometimes you need a lot of things in the URL like <a href="https://abc123def.org/path1/2path?param1=value1#hash123z">abc123def.org/path1/2path?param1=value1#hash123z</a>
				Do you see the need for dashes in these things too <a href="https://abc-def.org/his-path/?the-param=the-value#the-hash">abc-def.org/his-path/?the-param=the-value#the-hash</a>?
				There's a time for lots and lots of special characters like in <a href="https://abc123def.org/-+&@#/%=~_()|'$*[]?!:,.;/?param1=value-+&@#/%=~_()|'$*[]?!:,.;#hash-+&@#/%=~_()|'$*[]?!:,.;z">abc123def.org/-+&@#/%=~_()|'$*[]?!:,.;/?param1=value-+&@#/%=~_()|'$*[]?!:,.;#hash-+&@#/%=~_()|'$*[]?!:,.;z</a>
				Don't forget about good times with unicode <a href="https://ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица">ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица</a> 
				and this unicode <a href="http://россия.рф">россия.рф</a>
				along with punycode <a href="http://xn--d1acufc.xn--p1ai">xn--d1acufc.xn--p1ai</a>
				Oh good old www links like <a href="http://www.yahoo.com">www.yahoo.com</a>
			`);
        });
    });

    describe('emails in URL', () => {
        it('should autolink a url with multiple email in the query string', () => {
            const result = autolinker.link(
                'https://example.com/api/path?apikey={API_Key}&message=Test&useridentifier=name.surname@subdomain.domain.com&department=someid123&subject=Some_Subject&recipient=other.name@address.com&is_html_message=Y'
            );

            expect(result).toBe(
                '<a href="https://example.com/api/path?apikey={API_Key}&message=Test&useridentifier=name.surname@subdomain.domain.com&department=someid123&subject=Some_Subject&recipient=other.name@address.com&is_html_message=Y">example.com/api/path?apikey={API_Key}&message=Test&useridentifier=name.surname@subdomain.domain.com&department=someid123&subject=Some_Subject&recipient=other.name@address.com&is_html_message=Y</a>'
            );
        });
    });

    function generateCombinationTests({
        schemes,
        hosts,
        ports,
    }: {
        schemes: string[];
        hosts: string[];
        ports: string[];
    }) {
        schemes.forEach(scheme => {
            hosts.forEach(host => {
                ports.forEach(port => {
                    const hierPart = `${host}${port}`; // hier-part reference: https://www.rfc-editor.org/rfc/rfc3986#appendix-A
                    const origin = `${scheme}${hierPart}`;

                    // When 'scheme' is empty string, Autolinker fills in 'http://'
                    const expectedOrigin = `${scheme || 'http://'}${hierPart}`;

                    generateLinkTests([
                        {
                            input: `${origin}`,
                            description: 'origin only',
                            expectedHref: expectedOrigin,
                            expectedAnchorText: hierPart,
                            autolinker,
                        },
                        {
                            input: `${origin}/`,
                            description: 'trailing slash',
                            expectedHref: `${expectedOrigin}/`,
                            expectedAnchorText: hierPart,
                            autolinker,
                        },
                        {
                            input: `${origin}/path`,
                            description: 'basic path',
                            expectedHref: `${expectedOrigin}/path`,
                            expectedAnchorText: `${hierPart}/path`,
                            autolinker,
                        },
                        {
                            input: `${origin}/path/that/is-longer`,
                            description: 'long path',
                            expectedHref: `${expectedOrigin}/path/that/is-longer`,
                            expectedAnchorText: `${hierPart}/path/that/is-longer`,
                            autolinker,
                        },
                        {
                            input: `${origin}/path/with/dash/at-end-`,
                            description: 'path ending in a dash (valid URL)',
                            expectedHref: `${expectedOrigin}/path/with/dash/at-end-`,
                            expectedAnchorText: `${hierPart}/path/with/dash/at-end-`,
                            autolinker,
                        },
                        {
                            input: `${origin}?abc`,
                            description: 'basic query string',
                            expectedHref: `${expectedOrigin}?abc`,
                            expectedAnchorText: `${hierPart}?abc`,
                            autolinker,
                        },
                        {
                            input: `${origin}?param=1&param-2=2`,
                            description: 'long query string',
                            expectedHref: `${expectedOrigin}?param=1&param-2=2`,
                            expectedAnchorText: `${hierPart}?param=1&param-2=2`,
                            autolinker,
                        },
                        {
                            input: `${origin}#my-hash`,
                            description: 'basic hash',
                            expectedHref: `${expectedOrigin}#my-hash`,
                            expectedAnchorText: `${hierPart}#my-hash`,
                            autolinker,
                        },
                        {
                            input: `${origin}#param1=a&param2=b`,
                            description: 'hash params',
                            expectedHref: `${expectedOrigin}#param1=a&param2=b`,
                            expectedAnchorText: `${hierPart}#param1=a&param2=b`,
                            autolinker,
                        },
                        {
                            input: `${origin}/path?abc#my-hash`,
                            description: 'path, query string, and hash',
                            expectedHref: `${expectedOrigin}/path?abc#my-hash`,
                            expectedAnchorText: `${hierPart}/path?abc#my-hash`,
                            autolinker,
                        },
                        {
                            input: `${origin}/wiki/IANA_(disambiguation)`,
                            description: 'parens in the URL',
                            expectedHref: `${expectedOrigin}/wiki/IANA_(disambiguation)`,
                            expectedAnchorText: `${hierPart}/wiki/IANA_(disambiguation)`,
                            autolinker,
                        },
                        {
                            input: `${origin}/-+&@#/%=~_()|'$*[]?!:,.;/?param1=value-+&@#/%=~_()|'$*[]?!:,.;#hash-+&@#/%=~_()|'$*[]?!:,.;z`,
                            description: 'all special chars in the URL',
                            expectedHref: `${expectedOrigin}/-+&@#/%=~_()|'$*[]?!:,.;/?param1=value-+&@#/%=~_()|'$*[]?!:,.;#hash-+&@#/%=~_()|'$*[]?!:,.;z`,
                            expectedAnchorText: `${hierPart}/-+&@#/%=~_()|'$*[]?!:,.;/?param1=value-+&@#/%=~_()|'$*[]?!:,.;#hash-+&@#/%=~_()|'$*[]?!:,.;z`,
                            autolinker,
                        },
                        {
                            input: `${origin}'s`,
                            description: 'domain with apostrophe s',
                            expectedHref: `${expectedOrigin}`,
                            expectedAnchorText: `${hierPart}`,
                            expectedAfterAnchorText: `'s`,
                            autolinker,
                        },
                        {
                            input: `${origin}/path's`,
                            description: 'path with apostrophe s',
                            expectedHref: `${expectedOrigin}/path's`,
                            expectedAnchorText: `${hierPart}/path's`,
                            autolinker,
                        },
                        {
                            input: `${origin}'s/path`,
                            description: 'domain with apostrophe s and suffixed paths',
                            expectedHref: `${expectedOrigin}`,
                            expectedAnchorText: `${hierPart}`,
                            expectedAfterAnchorText: `'s/path`,
                            autolinker,
                        },
                    ]);
                });
            });
        });
    }
});
