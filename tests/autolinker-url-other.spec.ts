import { expect } from 'chai';
import Autolinker from '../src/autolinker';

describe('General URL Matching behavior (other) >', () => {
    const autolinker = new Autolinker({
        newWindow: false, // so that target="_blank" is not added to resulting autolinked URLs - makes it easier to test the resulting strings
        stripPrefix: {
            www: false, // for the purposes of the generated tests, leaving this as false makes it easier to automatically create the 'expected' values
        },
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
                expect(result1).to.equal(
                    `TLDs come from <a href="http://en.wikipedia.org/wiki/IANA_${openBraceChar}disambiguation${closeBraceChar}">en.wikipedia.org/wiki/IANA_${openBraceChar}disambiguation${closeBraceChar}</a>.`
                );

                const result2 = autolinker.link(
                    `MSDN has a great article at http://msdn.microsoft.com/en-us/library/aa752574${openBraceChar}VS.85${closeBraceChar}.aspx.`
                );
                expect(result2).to.equal(
                    `MSDN has a great article at <a href="http://msdn.microsoft.com/en-us/library/aa752574${openBraceChar}VS.85${closeBraceChar}.aspx">msdn.microsoft.com/en-us/library/aa752574${openBraceChar}VS.85${closeBraceChar}.aspx</a>.`
                );
            });

            it(`should include ${braceName} in URLs with query strings`, () => {
                const result1 = autolinker.link(
                    `TLDs come from en.wikipedia.org/wiki?IANA_${openBraceChar}disambiguation${closeBraceChar}.`
                );
                expect(result1).to.equal(
                    `TLDs come from <a href="http://en.wikipedia.org/wiki?IANA_${openBraceChar}disambiguation${closeBraceChar}">en.wikipedia.org/wiki?IANA_${openBraceChar}disambiguation${closeBraceChar}</a>.`
                );

                const result2 = autolinker.link(
                    `MSDN has a great article at http://msdn.microsoft.com/en-us/library?aa752574${openBraceChar}VS.85${closeBraceChar}.aspx.`
                );
                expect(result2).to.equal(
                    `MSDN has a great article at <a href="http://msdn.microsoft.com/en-us/library?aa752574${openBraceChar}VS.85${closeBraceChar}.aspx">msdn.microsoft.com/en-us/library?aa752574${openBraceChar}VS.85${closeBraceChar}.aspx</a>.`
                );
            });

            it(`should include ${braceName} in URLs with hash anchors`, () => {
                const result1 = autolinker.link(
                    `TLDs come from en.wikipedia.org/wiki#IANA_${openBraceChar}disambiguation${closeBraceChar}.`
                );
                expect(result1).to.equal(
                    `TLDs come from <a href="http://en.wikipedia.org/wiki#IANA_${openBraceChar}disambiguation${closeBraceChar}">en.wikipedia.org/wiki#IANA_${openBraceChar}disambiguation${closeBraceChar}</a>.`
                );

                const result2 = autolinker.link(
                    `MSDN has a great article at http://msdn.microsoft.com/en-us/library#aa752574${openBraceChar}VS.85${closeBraceChar}.aspx.`
                );
                expect(result2).to.equal(
                    `MSDN has a great article at <a href="http://msdn.microsoft.com/en-us/library#aa752574${openBraceChar}VS.85${closeBraceChar}.aspx">msdn.microsoft.com/en-us/library#aa752574${openBraceChar}VS.85${closeBraceChar}.aspx</a>.`
                );
            });

            it(`when the URL has ${braceName} within it itself, should exclude the final closing brace from the URL when its unmatched`, () => {
                const result1 = autolinker.link(
                    `TLDs come from ${openBraceChar}en.wikipedia.org/wiki/IANA_${openBraceChar}disambiguation${closeBraceChar}${closeBraceChar}.`
                );
                expect(result1).to.equal(
                    `TLDs come from ${openBraceChar}<a href="http://en.wikipedia.org/wiki/IANA_${openBraceChar}disambiguation${closeBraceChar}">en.wikipedia.org/wiki/IANA_${openBraceChar}disambiguation${closeBraceChar}</a>${closeBraceChar}.`
                );

                const result2 = autolinker.link(
                    `MSDN has a great article at ${openBraceChar}http://msdn.microsoft.com/en-us/library/aa752574${openBraceChar}VS.85${closeBraceChar}.aspx${closeBraceChar}.`
                );
                expect(result2).to.equal(
                    `MSDN has a great article at ${openBraceChar}<a href="http://msdn.microsoft.com/en-us/library/aa752574${openBraceChar}VS.85${closeBraceChar}.aspx">msdn.microsoft.com/en-us/library/aa752574${openBraceChar}VS.85${closeBraceChar}.aspx</a>${closeBraceChar}.`
                );
            });

            it(`should not include final closing ${braceName} in the URL, if it doesn't match opening ${braceName} in the url`, () => {
                const result = autolinker.link(
                    `Click here ${openBraceChar}google.com${closeBraceChar} for more details`
                );
                expect(result).to.equal(
                    `Click here ${openBraceChar}<a href="http://google.com">google.com</a>${closeBraceChar} for more details`
                );
            });

            it(`should not include final closing ${braceName} in the URL when a path exists`, () => {
                const result = autolinker.link(
                    `Click here ${openBraceChar}google.com/abc${closeBraceChar} for more details`
                );
                expect(result).to.equal(
                    `Click here ${openBraceChar}<a href="http://google.com/abc">google.com/abc</a>${closeBraceChar} for more details`
                );
            });

            it(`should not include final closing ${braceName} in the URL when a query string exists`, () => {
                const result = autolinker.link(
                    `Click here ${openBraceChar}google.com?abc=1${closeBraceChar} for more details`
                );
                expect(result).to.equal(
                    `Click here ${openBraceChar}<a href="http://google.com?abc=1">google.com?abc=1</a>${closeBraceChar} for more details`
                );
            });

            it(`should not include final closing ${braceName} in the URL when a hash anchor exists`, () => {
                const result = autolinker.link(
                    `Click here ${openBraceChar}google.com#abc${closeBraceChar} for more details`
                );
                expect(result).to.equal(
                    `Click here ${openBraceChar}<a href="http://google.com#abc">google.com#abc</a>${closeBraceChar} for more details`
                );
            });
        });

        it(`when there are multiple brackets surrounding the URL, should exclude them all`, () => {
            const result = autolinker.link(`(Websites {like [google.com/path]})`);
            expect(result).to.equal(
                `(Websites {like [<a href="http://google.com/path">google.com/path</a>]})`
            );
        });

        it(`when there are multiple brackets surrounding the URL including punctuation, should exclude the braces and the punctuation`, () => {
            const result = autolinker.link(`(Websites {like [google.com/path.]!}?)`);
            expect(result).to.equal(
                `(Websites {like [<a href="http://google.com/path">google.com/path</a>.]!}?)`
            );
        });

        it(`when there are brackets surrounding the URL and extraneous close brackets inside the URL, should only exclude the ones from the end`, () => {
            const result = autolinker.link(`(Websites {like [google.com/path))}]s]})`);
            expect(result).to.equal(
                `(Websites {like [<a href="http://google.com/path))}]s">google.com/path))}]s</a>]})`
            );
        });

        describe(`parenthesis-specific handling >`, () => {
            it(`should include escaped parentheses in the URL`, () => {
                const result = autolinker.link(
                    "Here's an example from CodingHorror: http://en.wikipedia.org/wiki/PC_Tools_%28Central_Point_Software%29"
                );
                expect(result).to.equal(
                    'Here\'s an example from CodingHorror: <a href="http://en.wikipedia.org/wiki/PC_Tools_%28Central_Point_Software%29">en.wikipedia.org/wiki/PC_Tools_(Central_Point_Software)</a>'
                );
            });
        });

        describe('square bracket-specific handling >', () => {
            it('should include escaped square brackets in the URL', () => {
                const result = autolinker.link(
                    "Here's an example from CodingHorror: http://en.wikipedia.org/wiki/PC_Tools_%5BCentral_Point_Software%5D"
                );
                expect(result).to.equal(
                    'Here\'s an example from CodingHorror: <a href="http://en.wikipedia.org/wiki/PC_Tools_%5BCentral_Point_Software%5D">en.wikipedia.org/wiki/PC_Tools_[Central_Point_Software]</a>'
                );
            });

            it(`should correctly accept square brackets such as PHP array representation in query strings`, () => {
                const result = autolinker.link(
                    "Here's an example: http://example.com/foo.php?bar[]=1&bar[]=2&bar[]=3"
                );
                expect(result).to.equal(
                    `Here's an example: <a href="http://example.com/foo.php?bar[]=1&bar[]=2&bar[]=3">example.com/foo.php?bar[]=1&bar[]=2&bar[]=3</a>`
                );
            });

            it(`should correctly accept square brackets such as PHP array
                 representation in query strings, when the entire URL is surrounded
                 by square brackets
                `, () => {
                const result = autolinker.link(
                    "Here's an example: [http://example.com/foo.php?bar[]=1&bar[]=2&bar[]=3]"
                );
                expect(result).to.equal(
                    `Here's an example: [<a href="http://example.com/foo.php?bar[]=1&bar[]=2&bar[]=3">example.com/foo.php?bar[]=1&bar[]=2&bar[]=3</a>]`
                );
            });
        });

        describe('curly bracket-specific handling >', () => {
            it('should include escaped curly brackets in the URL', () => {
                const result = autolinker.link(
                    "Here's an example from CodingHorror: http://en.wikipedia.org/wiki/PC_Tools_%7BCentral_Point_Software%7D"
                );
                expect(result).to.equal(
                    'Here\'s an example from CodingHorror: <a href="http://en.wikipedia.org/wiki/PC_Tools_%7BCentral_Point_Software%7D">en.wikipedia.org/wiki/PC_Tools_{Central_Point_Software}</a>'
                );
            });

            it(`should correctly accept curly brackets such as a sharepoint url`, () => {
                const result = autolinker.link(
                    "Here's an example: https://gohub.sharepoint.com/example/doc.aspx?sourcedoc={foobar}&action=edit"
                );
                expect(result).to.equal(
                    `Here's an example: <a href="https://gohub.sharepoint.com/example/doc.aspx?sourcedoc={foobar}&action=edit">gohub.sharepoint.com/example/doc.aspx?sourcedoc={foobar}&action=edit</a>`
                );
            });

            it(`should correctly accept curly brackets such as a sharepoint url,
                 when the entire URL is surrounded by square brackets`, () => {
                const result = autolinker.link(
                    "Here's an example: https://gohub.sharepoint.com/example/doc.aspx?sourcedoc={foobar}&action=edit"
                );
                expect(result).to.equal(
                    `Here's an example: <a href="https://gohub.sharepoint.com/example/doc.aspx?sourcedoc={foobar}&action=edit">gohub.sharepoint.com/example/doc.aspx?sourcedoc={foobar}&action=edit</a>`
                );
            });

            it(`should handle accepting nested curly brackets at end of URL`, () => {
                const result = autolinker.link(
                    "Here's an example: http://gohub.sharepoint/example/make-payment?props={%22params%22:{%22loanId%22:%220349494%22}}"
                );
                expect(result).to.equal(
                    `Here's an example: <a href="http://gohub.sharepoint/example/make-payment?props={%22params%22:{%22loanId%22:%220349494%22}}">gohub.sharepoint/example/make-payment?props={&quot;params&quot;:{&quot;loanId&quot;:&quot;0349494&quot;}}</a>`
                );
            });
        });
    });

    describe('Special character handling >', () => {
        it('should include $ in URLs', () => {
            const result = autolinker.link(
                'Check out pair programming: http://c2.com/cgi/wiki$?VirtualPairProgramming'
            );
            expect(result).to.equal(
                'Check out pair programming: <a href="http://c2.com/cgi/wiki$?VirtualPairProgramming">c2.com/cgi/wiki$?VirtualPairProgramming</a>'
            );
        });

        it('should include $ in URLs with query strings', () => {
            const result = autolinker.link(
                'Check out the image at http://server.com/template?fmt=jpeg&$base=700.'
            );
            expect(result).to.equal(
                'Check out the image at <a href="http://server.com/template?fmt=jpeg&$base=700">server.com/template?fmt=jpeg&$base=700</a>.'
            );
        });

        it('should include * in URLs', () => {
            const result = autolinker.link(
                'Google from wayback http://wayback.archive.org/web/*/http://google.com'
            );
            expect(result).to.equal(
                'Google from wayback <a href="http://wayback.archive.org/web/*/http://google.com">wayback.archive.org/web/*/http://google.com</a>'
            );
        });

        it('should include * in URLs with query strings', () => {
            const result = autolinker.link(
                'Twitter search for bob smith https://api.twitter.com/1.1/users/search.json?count=20&q=Bob+*+Smith'
            );
            expect(result).to.equal(
                'Twitter search for bob smith <a href="https://api.twitter.com/1.1/users/search.json?count=20&q=Bob+*+Smith">api.twitter.com/1.1/users/search.json?count=20&q=Bob+*+Smith</a>'
            );
        });

        it('should include ^ in URLs with query strings', () => {
            const result = autolinker.link(
                'Test caret url: https://sourcegraph.yelpcorp.com/search?q=repo:^services&patternType=literal'
            );
            expect(result).to.equal(
                'Test caret url: <a href="https://sourcegraph.yelpcorp.com/search?q=repo:^services&patternType=literal">sourcegraph.yelpcorp.com/search?q=repo:^services&patternType=literal</a>'
            );
        });

        it("should include ' in URLs", () => {
            const result = autolinker.link(
                "You are a star http://en.wikipedia.org/wiki/You're_a_Star/"
            );
            expect(result).to.equal(
                'You are a star <a href="http://en.wikipedia.org/wiki/You\'re_a_Star/">en.wikipedia.org/wiki/You\'re_a_Star</a>'
            );
        });

        it("should include ' in URLs with query strings", () => {
            const result = autolinker.link("Test google search https://google.com/#q=test's");
            expect(result).to.equal(
                'Test google search <a href="https://google.com/#q=test\'s">google.com/#q=test\'s</a>'
            );
        });

        it('should include [ and ] in URLs with query strings', () => {
            const result = autolinker.link(
                'Go to https://example.com/api/export/873/?a[]=10&a[]=9&a[]=8&a[]=7&a[]=6 today'
            );
            expect(result).to.equal(
                'Go to <a href="https://example.com/api/export/873/?a[]=10&a[]=9&a[]=8&a[]=7&a[]=6">example.com/api/export/873/?a[]=10&a[]=9&a[]=8&a[]=7&a[]=6</a> today'
            );
        });

        it('should handle an example Google Maps URL with query string', () => {
            const result = autolinker.link(
                "google.no/maps/place/Gary's+Deli/@52.3664378,4.869345,18z/data=!4m7!1m4!3m3!1s0x47c609c14a6680df:0x643f005113531f15!2sBeertemple!3b1!3m1!1s0x0000000000000000:0x51a8a6adb4307be6?hl=no"
            );

            expect(result).to.equal(
                '<a href="http://google.no/maps/place/Gary\'s+Deli/@52.3664378,4.869345,18z/data=!4m7!1m4!3m3!1s0x47c609c14a6680df:0x643f005113531f15!2sBeertemple!3b1!3m1!1s0x0000000000000000:0x51a8a6adb4307be6?hl=no">google.no/maps/place/Gary\'s+Deli/@52.3664378,4.869345,18z/data=!4m7!1m4!3m3!1s0x47c609c14a6680df:0x643f005113531f15!2sBeertemple!3b1!3m1!1s0x0000000000000000:0x51a8a6adb4307be6?hl=no</a>'
            );
        });

        it('should handle emoji', () => {
            const result = autolinker.link('Joe went to http://emoji🐰🦊town🧞‍♀️🧜🏻‍♀️.com/?emoji=👨🏾‍🚀');
            expect(result).to.equal(
                'Joe went to <a href="http://emoji🐰🦊town🧞‍♀️🧜🏻‍♀️.com/?emoji=👨🏾‍🚀">emoji🐰🦊town🧞‍♀️🧜🏻‍♀️.com/?emoji=👨🏾‍🚀</a>'
            );
        });

        it('should decode emojis', () => {
            const result = autolinker.link(
                'Danish flag emoji: https://emojipedia.org/%F0%9F%87%A9%F0%9F%87%B0'
            );

            expect(result).to.equal(
                'Danish flag emoji: <a href="https://emojipedia.org/%F0%9F%87%A9%F0%9F%87%B0">emojipedia.org/🇩🇰</a>'
            );
        });

        it('should HTML-encode escape-encoded special characters', () => {
            const result = autolinker.link('Link: http://example.com/%3c%3E%22%27%26');

            expect(result).to.equal(
                'Link: <a href="http://example.com/%3c%3E%22%27%26">example.com/&lt;&gt;&quot;&#39;&amp;</a>'
            );
        });
    });

    it('should automatically link a URL with a complex hash (such as a Google Analytics url)', () => {
        const result = autolinker.link(
            'Joe went to https://google.com/analytics/web/?pli=1#my-reports/Obif-Y6qQB2xAJk0ZZE1Zg/a4454143w36378534p43704543/%3F.date00%3D20120314%26_.date01%3D20120314%268534-table.rowStart%3D0%268534-table.rowCount%3D25/ and analyzed his analytics'
        );
        expect(result).to.equal(
            'Joe went to <a href="https://google.com/analytics/web/?pli=1#my-reports/Obif-Y6qQB2xAJk0ZZE1Zg/a4454143w36378534p43704543/%3F.date00%3D20120314%26_.date01%3D20120314%268534-table.rowStart%3D0%268534-table.rowCount%3D25/">google.com/analytics/web/?pli=1#my-reports/Obif-Y6qQB2xAJk0ZZE1Zg/a4454143w36378534p43704543/?.date00=20120314&amp;_.date01=20120314&amp;8534-table.rowStart=0&amp;8534-table.rowCount=25</a> and analyzed his analytics'
        );
    });

    it("should remove trailing slash from 'http://yahoo.com/'", () => {
        const result = autolinker.link('Joe went to http://yahoo.com/.');
        expect(result).to.equal('Joe went to <a href="http://yahoo.com/">yahoo.com</a>.');
    });

    it("should remove trailing slash from 'http://yahoo.com/sports/'", () => {
        const result = autolinker.link('Joe went to http://yahoo.com/sports/.');
        expect(result).to.equal(
            'Joe went to <a href="http://yahoo.com/sports/">yahoo.com/sports</a>.'
        );
    });

    describe('multiple dots handling', () => {
        it('should autolink a url with multiple dots in the path', () => {
            const result = autolinker.link(
                'https://gitlab.example.com/space/repo/compare/master...develop'
            );

            expect(result).to.equal(
                '<a href="https://gitlab.example.com/space/repo/compare/master...develop">gitlab.example.com/space/repo/compare/master...develop</a>'
            );
        });
    });

    describe('curly quotes handling', () => {
        it('should autolink a url surrounded by curly quotes', () => {
            const result = autolinker.link('“link.com/foo”');

            expect(result).to.equal('“<a href="http://link.com/foo">link.com/foo</a>”');
        });

        it('should autolink a url with www. prefix surrounded by curly quotes', () => {
            const result = autolinker.link('“www.link.com/foo”');

            expect(result).to.equal('“<a href="http://www.link.com/foo">www.link.com/foo</a>”');
        });

        it('should autolink a url with protocol prefix surrounded by curly quotes', () => {
            const result = autolinker.link('“http://link.com/foo”');

            expect(result).to.equal('“<a href="http://link.com/foo">link.com/foo</a>”');
        });
    });

    describe('combination example', () => {
        it(`should automatically link all of the URLs of many different forms`, () => {
            const inputStr = `
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
				There's a time for lots and lots of special characters like in https://abc123def.org/-+&@#/%=~_()|'$*[]?!:,.;/?param1=value-+&@#/%=~_()|'$*[]?!:,.;#hash-+&@#/%=~_()|'$*[]?!:,.;z
				Don't forget about good times with unicode https://ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица
				and this unicode http://россия.рф
				along with punycode http://xn--d1acufc.xn--p1ai
				Oh good old www links like www.yahoo.com
			`;

            const result = autolinker.link(inputStr);

            expect(result).to.equal(`
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

            expect(result).to.equal(
                '<a href="https://example.com/api/path?apikey={API_Key}&message=Test&useridentifier=name.surname@subdomain.domain.com&department=someid123&subject=Some_Subject&recipient=other.name@address.com&is_html_message=Y">example.com/api/path?apikey={API_Key}&message=Test&useridentifier=name.surname@subdomain.domain.com&department=someid123&subject=Some_Subject&recipient=other.name@address.com&is_html_message=Y</a>'
            );
        });
    });
});
