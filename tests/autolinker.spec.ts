import { expect } from 'chai';
import sinon from 'sinon';
import * as _ from 'lodash';
import Autolinker from '../src/autolinker';
import { UrlMatch } from '../src/match/url-match';
import { EmailMatch } from '../src/match/email-match';
import { HashtagMatch } from '../src/match/hashtag-match';
import { MentionMatch } from '../src/match/mention-match';
import { PhoneMatch } from '../src/match/phone-match';
import { Match } from '../src/match/match';
import { MentionService } from '../src/parser/mention-utils';
import { HashtagService } from '../src/parser/hashtag-utils';

describe('Autolinker', function () {
    describe('instantiating and using as a class', function () {
        it('should configure the instance with configuration options, and then be able to execute the link() method', function () {
            const autolinker = new Autolinker({ newWindow: false, truncate: 25 });

            const result = autolinker.link(
                'Check out http://www.yahoo.com/some/long/path/to/a/file'
            );
            expect(result).to.equal(
                'Check out <a href="http://www.yahoo.com/some/long/path/to/a/file" title="http://www.yahoo.com/some/long/path/to/a/file">yahoo.com/some/long/pa&hellip;</a>'
            );
        });
    });

    describe('config checking', function () {
        describe('no configs', function () {
            it('should default to the default options if no `cfg` object is provided (namely, `newWindow: true`)', function () {
                expect(Autolinker.link('Welcome to google.com')).to.equal(
                    'Welcome to <a href="http://google.com" target="_blank" rel="noopener noreferrer">google.com</a>'
                );
            });
        });

        describe('`url` cfg', () => {
            it(`when 'urls' is true, should default to matching all 3 scheme-prefixed, top-level domain, and IPv4 URLs`, () => {
                const autolinker = new Autolinker({ urls: true, newWindow: false });
                const result = autolinker.link(`
                    Welcome to https://google.com
                    Welcome to google.com
                    Welcome to 127.0.0.1
                `);
                expect(result).to.equal(`
                    Welcome to <a href="https://google.com">google.com</a>
                    Welcome to <a href="http://google.com">google.com</a>
                    Welcome to <a href="http://127.0.0.1">127.0.0.1</a>
                `);
            });

            it(`when 'urls' is an empty object, should default to matching all 3 scheme-prefixed, top-level domain, and IPv4 URLs`, () => {
                const autolinker = new Autolinker({ urls: {}, newWindow: false });
                const result = autolinker.link(`
                    Welcome to https://google.com
                    Welcome to google.com
                    Welcome to 127.0.0.1
                `);
                expect(result).to.equal(`
                    Welcome to <a href="https://google.com">google.com</a>
                    Welcome to <a href="http://google.com">google.com</a>
                    Welcome to <a href="http://127.0.0.1">127.0.0.1</a>
                `);
            });

            it(`when 'urls' is false, should not match any URLs`, () => {
                const autolinker = new Autolinker({ urls: false, newWindow: false });

                const inputStr = `
                    Welcome to https://google.com
                    Welcome to google.com
                    Welcome to 127.0.0.1
                `;
                const result = autolinker.link(inputStr);
                expect(result).to.equal(inputStr);
            });
        });

        describe('`hashtag` cfg', function () {
            it('should throw if `hashtag` is a value other than `false` or one of the valid service names', function () {
                expect(function () {
                    // @ts-expect-error Testing invalid value
                    new Autolinker({ hashtag: true }); // `true` is an invalid value - must be a service name
                }).to.throw("invalid `hashtag` cfg 'true' - see docs");

                expect(function () {
                    // @ts-expect-error Testing invalid value
                    new Autolinker({ hashtag: 'non-existent-service' });
                }).to.throw("invalid `hashtag` cfg 'non-existent-service' - see docs");
            });

            it("should not throw for the valid service name 'twitter'", function () {
                expect(function () {
                    new Autolinker({ hashtag: 'twitter' });
                }).to.not.throw();
            });

            it("should not throw for the valid service name 'facebook'", function () {
                expect(function () {
                    new Autolinker({ hashtag: 'facebook' });
                }).to.not.throw();
            });

            it("should not throw for the valid service name 'instagram'", function () {
                expect(function () {
                    new Autolinker({ hashtag: 'instagram' });
                }).to.not.throw();
            });

            it("should not throw for the valid service name 'tiktok'", function () {
                expect(function () {
                    new Autolinker({ hashtag: 'tiktok' });
                }).to.not.throw();
            });
        });

        describe('`mention` cfg', function () {
            it('should throw if `mention` is a value other than `false` or one of the valid service names', function () {
                expect(function () {
                    // @ts-expect-error Testing invalid value
                    new Autolinker({ mention: true }); // `true` is an invalid value - must be a service name
                }).to.throw("invalid `mention` cfg 'true' - see docs");

                expect(function () {
                    // @ts-expect-error Testing invalid value
                    new Autolinker({ mention: 'non-existent-service' });
                }).to.throw("invalid `mention` cfg 'non-existent-service' - see docs");
            });

            it("should not throw for the valid service name 'twitter'", function () {
                expect(function () {
                    new Autolinker({ mention: 'twitter' });
                }).to.not.throw();
            });

            it("should not throw for the valid service name 'instagram'", function () {
                expect(function () {
                    new Autolinker({ mention: 'instagram' });
                }).to.not.throw();
            });

            it("should not throw for the valid service name 'soundcloud'", function () {
                expect(function () {
                    new Autolinker({ mention: 'soundcloud' });
                }).to.not.throw();
            });

            it("should not throw for the valid service name 'tiktok'", function () {
                expect(function () {
                    new Autolinker({ mention: 'tiktok' });
                }).to.not.throw();
            });
        });

        describe(`'stripPrefix' cfg`, () => {
            it(`when 'stripPrefix' is true, should strip both the scheme and any 'www.' prefix from URLs for display`, () => {
                const autolinker = new Autolinker({ stripPrefix: true, newWindow: false });
                const result = autolinker.link(`
                    Welcome to https://google.com
                    Welcome to www.google.com
                `);
                expect(result).to.equal(`
                    Welcome to <a href="https://google.com">google.com</a>
                    Welcome to <a href="http://www.google.com">google.com</a>
                `);
            });

            it(`when 'stripPrefix' is an empty object, should default to strip both the scheme and any 'www.' prefix from URLs for display`, () => {
                const autolinker = new Autolinker({ stripPrefix: {}, newWindow: false });
                const result = autolinker.link(`
                    Welcome to https://google.com
                    Welcome to www.google.com
                `);
                expect(result).to.equal(`
                    Welcome to <a href="https://google.com">google.com</a>
                    Welcome to <a href="http://www.google.com">google.com</a>
                `);
            });

            it(`when 'stripPrefix' is false, should not strip the prefix from URLs for display`, () => {
                const autolinker = new Autolinker({ stripPrefix: false, newWindow: false });
                const result = autolinker.link(`
                    Welcome to https://google.com
                    Welcome to www.google.com
                `);
                expect(result).to.equal(`
                    Welcome to <a href="https://google.com">https://google.com</a>
                    Welcome to <a href="http://www.google.com">www.google.com</a>
                `);
            });
        });
    });

    describe('link() method', function () {
        let autolinker: Autolinker, twitterAutolinker: Autolinker;

        beforeEach(function () {
            autolinker = new Autolinker({ newWindow: false }); // so that target="_blank" is not added to resulting autolinked URLs
            twitterAutolinker = new Autolinker({
                hashtag: 'twitter',
                mention: 'twitter',
                newWindow: false,
            });
        });

        it('should return an empty string when provided `undefined` as its argument', function () {
            // @ts-expect-error Testing invalid value
            expect(autolinker.link(undefined)).to.equal('');
        });

        it('should return an empty string when provided `null` as its argument', function () {
            // @ts-expect-error Testing invalid value
            expect(autolinker.link(null)).to.equal('');
        });

        describe('proper handling of HTML in the input string', function () {
            it('should automatically link URLs past the last HTML tag', function () {
                const result = autolinker.link(
                    '<p>Joe went to <a href="http://www.yahoo.com">yahoo</a></p> and http://google.com'
                );
                expect(result).to.equal(
                    '<p>Joe went to <a href="http://www.yahoo.com">yahoo</a></p> and <a href="http://google.com">google.com</a>'
                );
            });

            it('should NOT automatically link URLs within the attributes of existing HTML tags', function () {
                const result = autolinker.link(
                    '<p>Joe went to <a href="http://www.yahoo.com">yahoo</a></p>'
                );
                expect(result).to.equal(
                    '<p>Joe went to <a href="http://www.yahoo.com">yahoo</a></p>'
                );
            });

            it('should NOT automatically link URLs within the attributes of existing HTML tags when there are prefixed or suffixed spaces in the attribute values', function () {
                const result = autolinker.link(
                    '<p>Joe went to <a href=" http://www.yahoo.com">yahoo</a></p>'
                );
                expect(result).to.equal(
                    '<p>Joe went to <a href=" http://www.yahoo.com">yahoo</a></p>'
                );

                const result2 = autolinker.link(
                    '<p>Joe went to <a href="http://www.yahoo.com ">yahoo</a></p>'
                );
                expect(result2).to.equal(
                    '<p>Joe went to <a href="http://www.yahoo.com ">yahoo</a></p>'
                );
            });

            it("when unquoted anchor href's exist, should NOT automatically link the text inside", function () {
                const result = autolinker.link(
                    '<p>Joe went to <a href=http://www.yahoo.com>yahoo</a></p>'
                );
                expect(result).to.equal(
                    '<p>Joe went to <a href=http://www.yahoo.com>yahoo</a></p>'
                );

                const result2 = autolinker.link(
                    '<p>Joe went to <a href=http://www.yahoo.com?query=1>yahoo</a></p>'
                );
                expect(result2).to.equal(
                    '<p>Joe went to <a href=http://www.yahoo.com?query=1>yahoo</a></p>'
                );
            });

            it('should NOT automatically link URLs within self-closing tags', function () {
                const result = autolinker.link(
                    'Just a flower image <img src="https://farm9.staticflickr.com/8378/8578790632_83c6471f3f_b.jpg" />'
                );
                expect(result).to.equal(
                    'Just a flower image <img src="https://farm9.staticflickr.com/8378/8578790632_83c6471f3f_b.jpg" />'
                );
            });

            it('should NOT automatically link a URL found within the inner text of a pre-existing anchor tag', function () {
                const result = autolinker.link(
                    '<p>Joe went to <a href="http://www.yahoo.com">yahoo.com</a></p> yesterday.'
                );
                expect(result).to.equal(
                    '<p>Joe went to <a href="http://www.yahoo.com">yahoo.com</a></p> yesterday.'
                );
            });

            it('should NOT automatically link a URL found within the inner text of a pre-existing anchor tag that uses a capital letter for its tag name', function () {
                const result = autolinker.link(
                    '<p>Joe went to <A href="http://www.yahoo.com">yahoo.com</A></p> yesterday.'
                );
                expect(result).to.equal(
                    '<p>Joe went to <A href="http://www.yahoo.com">yahoo.com</A></p> yesterday.'
                );
            });

            it('should NOT automatically link a URL found within the inner text of a pre-existing anchor tag, but link others', function () {
                const result = autolinker.link(
                    '<p>Joe went to google.com, <a href="http://www.yahoo.com">yahoo.com</a>, and weather.com</p> yesterday.'
                );
                expect(result).to.equal(
                    '<p>Joe went to <a href="http://google.com">google.com</a>, <a href="http://www.yahoo.com">yahoo.com</a>, and <a href="http://weather.com">weather.com</a></p> yesterday.'
                );
            });

            it('should NOT automatically link an image tag with incorrect HTML attribute spacing', function () {
                const result = autolinker.link(
                    '<img src="https://ssl.gstatic.com/welcome_calendar.png" alt="Calendar" style="display:block;"width="129"height="129"/>'
                );
                expect(result).to.equal(
                    '<img src="https://ssl.gstatic.com/welcome_calendar.png" alt="Calendar" style="display:block;"width="129"height="129"/>'
                );
            });

            it('should NOT automatically link an image tag with a URL inside it, inside an anchor tag', function () {
                const result = autolinker.link(
                    '<a href="http://google.com"><img src="http://google.com/someImage.jpg" /></a>'
                );
                expect(result).to.equal(
                    '<a href="http://google.com"><img src="http://google.com/someImage.jpg" /></a>'
                );
            });

            it('should NOT automatically link an image tag with a URL inside it, inside an anchor tag, but match urls around the tags', function () {
                const result = autolinker.link(
                    'google.com looks like <a href="http://google.com"><img src="http://google.com/someImage.jpg" /></a> (at google.com)'
                );
                expect(result).to.equal(
                    '<a href="http://google.com">google.com</a> looks like <a href="http://google.com"><img src="http://google.com/someImage.jpg" /></a> (at <a href="http://google.com">google.com</a>)'
                );
            });

            it('should NOT automatically link a URL found within the inner text of a style tag', function () {
                const result = autolinker.link(
                    'Testing with <style> .class { background-image: url("http://www.example.com/image.png"); } </style> tags'
                );
                expect(result).to.equal(
                    'Testing with <style> .class { background-image: url("http://www.example.com/image.png"); } </style> tags'
                );
            });

            it('should NOT automatically link a URL found within the inner text of a script tag', function () {
                const result = autolinker.link(
                    'Testing with <script> alert("http://google.com"); </script> tags'
                );
                expect(result).to.equal(
                    'Testing with <script> alert("http://google.com"); </script> tags'
                );
            });

            it('should NOT automatically link an image tag with a URL inside of it, when it has another attribute which has extraneous spaces surround its value (Issue #45)', function () {
                const result = autolinker.link(
                    "Testing <img src='http://terryshoemaker.files.wordpress.com/2013/03/placeholder1.jpg' style=' height: 22px; background-color: rgb(0, 188, 204); border-radius: 7px; padding: 2px; margin: 0px 2px;'>"
                );
                expect(result).to.equal(
                    "Testing <img src='http://terryshoemaker.files.wordpress.com/2013/03/placeholder1.jpg' style=' height: 22px; background-color: rgb(0, 188, 204); border-radius: 7px; padding: 2px; margin: 0px 2px;'>"
                );
            });

            it('should NOT automatically link a tag within an attribute of another tag (Issue #45)', function () {
                const result = autolinker.link(
                    '<form class="approval-form" name="thumbsUp" ng-submit="postApproval()"> <button type="submit"> <img class="thumbs-up" ng-click="comment.body=\'<img src=\'http://example.com/api-public/images/wg/w/Rating_and_Approval/icon-thumbs-up.png\' style=\'height: 22px; background-color: rgb(0, 188, 204); border-radius: 7px; padding: 2px; margin: 0px 2px;\'>\'+comment.body;" ng-src="http://example.com/api-public/images/wg/w/Rating_and_Approval/icon-thumbs-up.png"> </button> </form>'
                );
                expect(result).to.equal(
                    '<form class="approval-form" name="thumbsUp" ng-submit="postApproval()"> <button type="submit"> <img class="thumbs-up" ng-click="comment.body=\'<img src=\'http://example.com/api-public/images/wg/w/Rating_and_Approval/icon-thumbs-up.png\' style=\'height: 22px; background-color: rgb(0, 188, 204); border-radius: 7px; padding: 2px; margin: 0px 2px;\'>\'+comment.body;" ng-src="http://example.com/api-public/images/wg/w/Rating_and_Approval/icon-thumbs-up.png"> </button> </form>'
                );
            });

            it('should NOT remove `br` tags from the output (Issue #46)', function () {
                const result = autolinker.link('Testing<br /> with<br/> br<br> tags');
                expect(result).to.equal('Testing<br /> with<br/> br<br> tags');
            });

            it('should NOT automatically link anything in a !DOCTYPE tag (Issue #53)', function () {
                const input =
                    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';

                const result = autolinker.link(input);
                expect(result).to.equal(input);
            });

            it('should NOT automatically link within comment tags', function () {
                const result = autolinker.link('<!-- google.com -->');

                expect(result).to.equal('<!-- google.com -->');
            });

            it('should NOT automatically link within multi-line comment tags', function () {
                const result = autolinker.link('<!--\n\tgoogle.com\n\t-->');

                expect(result).to.equal('<!--\n\tgoogle.com\n\t-->');
            });

            it('should automatically link between comment tags, but not the comment tags themselves', function () {
                const result = autolinker.link(
                    '<!-- google.com -->\nweather.com\n<!-- http://yahoo.com -->'
                );

                expect(result).to.equal(
                    '<!-- google.com -->\n<a href="http://weather.com">weather.com</a>\n<!-- http://yahoo.com -->'
                );
            });

            it('should NOT automatically link within comment tags, using part of the comment tag as the URL (Issue #88)', function () {
                const result = autolinker.link('<!--.post-author-->');

                expect(result).to.equal('<!--.post-author-->');
            });

            it('should automatically link tags after a !DOCTYPE tag', function () {
                const input = [
                    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
                    '<html>',
                    '<body>',
                    'Welcome to mysite.com',
                    '</body>',
                    '</html>',
                ].join('');

                const result = autolinker.link(input);
                expect(result).to.equal(
                    [
                        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
                        '<html>',
                        '<body>',
                        'Welcome to <a href="http://mysite.com">mysite.com</a>',
                        '</body>',
                        '</html>',
                    ].join('')
                );
            });

            it('should autolink the link, and not fail with 100% cpu in the Regex engine when presented with the input in issue #54', function () {
                const inputStr =
                        'Shai ist endlich in Deutschland! Und wir haben gute Nachrichten! <3 Alle, die den Shai-Rasierer kostenlos probieren, machen am Gewinnspiel eines Jahresvorrates Klingen mit. Den Rasierer bekommst Du kostenlos durch diesen Link: http://dorcoshai.de/pb1205ro, und dann machst Du am Gewinnspiel mit! Gefallt mir klicken, wenn Du gern einen Jahresvorrat Shai haben mochtest. (Y)',
                    result = autolinker.link(inputStr);

                expect(result).to.equal(
                    'Shai ist endlich in Deutschland! Und wir haben gute Nachrichten! <3 Alle, die den Shai-Rasierer kostenlos probieren, machen am Gewinnspiel eines Jahresvorrates Klingen mit. Den Rasierer bekommst Du kostenlos durch diesen Link: <a href="http://dorcoshai.de/pb1205ro">dorcoshai.de/pb1205ro</a>, und dann machst Du am Gewinnspiel mit! Gefallt mir klicken, wenn Du gern einen Jahresvorrat Shai haben mochtest. (Y)'
                );
            });

            it('should not fail with an infinite loop for these given input strings (Issue #160)', function () {
                const inputStrings = [
                    'asdf ouefof<33we oeweofjojfew oeijwffejifjew ojiwjoiwefj iowjefojwe iofjw:)<33',
                    '<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3<3',
                    '<33<33<33<33<33<33<33<33<33<33',
                    '<33<33<33<33<33<33<33<33<33<33<33',
                ];

                inputStrings.forEach(function (str) {
                    expect(autolinker.link(str)).to.equal(str); // no links in these, just making sure they don't fail with 100% cpu and an infinite loop
                });
            });

            it(
                'should not fail with an infinite loop for an input string with ' +
                    'completely invalid HTML (issue #160)',
                function () {
                    const result = autolinker.link(
                        '<US_Con_SL_RTNS@dell.com\n' +
                            "He gave me a 1-800 customer care number that I've called twice.  The last time I called, about 3 weeks ago, the customer rep said he would request an expedited response. He gave me a reference number which is  925767619. Thankyou very much for looking into this.\n" +
                            '\n' +
                            'Ronald D Brigham\n' +
                            'brigham@mtnhome.com'
                    );

                    expect(result).to.equal(
                        [
                            '<<a href="mailto:US_Con_SL_RTNS@dell.com">US_Con_SL_RTNS@dell.com</a>',
                            "He gave me a 1-800 customer care number that I've called twice.  The last time I called, about 3 weeks ago, the customer rep said he would request an expedited response. He gave me a reference number which is  925767619. Thankyou very much for looking into this.",
                            '',
                            'Ronald D Brigham',
                            '<a href="mailto:brigham@mtnhome.com">brigham@mtnhome.com</a>',
                        ].join('\n')
                    );
                }
            );

            it(
                'should not fail with an infinite loop for an input string with ' +
                    'marginally valid HTML (issue #157)',
                function () {
                    const str =
                        'Our first step should be to get a CBC with differential, accompanied by a blood smear. The blood smear will be read (by a Hematologist) as sparse platelets among RBCs and some WBCs, that will most likely be normal. The platelets that do show up on the blood smear may or may not be damaged. In the case of TTP, platelets should not be damaged, but rather just low in number. A CBC with platelet count <50K starts to raise eyebrows for a possible case requiring platelet transfusion. Now would be the time to get a Type & Screen, and most would also tend towards ordering PT, PTT, and INR, or the "coagulative" measurement laboratory tests. Confirmation of TTP would be made by a serum ADAMST13 activity level.';

                    const result = autolinker.link(str);

                    expect(result).to.equal(str);
                }
            );

            it(
                'should not fail with an infinite loop for an input string with ' +
                    'an emoji (although really the <3 might be the original problem - ' +
                    'issue #165)',
                function () {
                    const str =
                        '-Que estupendos nos vemos <3#lapeorfoto #despedida2016 #dehoyoenhoyo #rabbit';

                    const result = autolinker.link(str);

                    expect(result).to.equal(str);
                }
            );

            it(
                'should not fail with an infinite loop for an input string with ' +
                    'a string that looks like HTML (Issue #172)',
                function () {
                    const str =
                            '<Office%20days:%20Tue.%20&%20Wed.%20(till%2015:30%20hr),%20Thu.%20(till%2017:30%20hr),%20Fri.%20(till%2012:30%20hr).%3c/a%3e%3cbr%3e%3c/td%3e%3ctd%20style=>',
                        result = autolinker.link(str);

                    expect(result).to.equal(str);
                }
            );

            it(
                'should not fail with a Maximum Call Stack Size Exceeded for an ' +
                    'input with a large number of html entities (Issue #171)',
                function () {
                    const testStr = (function () {
                        const t: string[] = [];
                        for (let i = 0; i < 50000; i++) {
                            t.push(' /&gt;&lt;br');
                        }
                        return t.join('');
                    })();

                    const result = autolinker.link(testStr);
                    expect(result).to.equal(testStr);
                }
            );

            it('should NOT modify the email address with other tags when inside another anchor', function () {
                const input = [
                    '<div>First name: Subin</div>',
                    '<div>Surname: Sundar</div>',
                    '<div>',
                    'EmailMatch: ',
                    '<a href="mailto:subin.sundar@yo.in">',
                    '<font color="blue"><u>s</u></font>',
                    '<font color="blue"><u>ubin</u></font>',
                    '<font color="blue"><u>.sundar@yo.in</u></font>',
                    '</a>',
                    '</div>',
                ].join('');

                const result = autolinker.link(input);
                expect(result).to.equal(input);
            });

            it('should allow the full range of HTML attribute name characters as specified in the W3C HTML syntax document (http://www.w3.org/TR/html-markup/syntax.html)', function () {
                // Note: We aren't actually expecting the HTML to be modified by this test
                const inAndOutHtml =
                    '<ns:p>Foo <a data-qux-="" href="http://www.example.com">Bar</a> Baz</ns:p>';
                expect(autolinker.link(inAndOutHtml)).to.equal(inAndOutHtml);
            });

            it('should properly autolink text within namespaced HTML elements, skipping over html elements with urls in attribute values', function () {
                const html =
                    '<ns:p>Go to google.com or <a data-qux-="test" href="http://www.example.com">Bar</a> Baz</ns:p>';

                const result = autolinker.link(html);
                expect(result).to.equal(
                    '<ns:p>Go to <a href="http://google.com">google.com</a> or <a data-qux-="test" href="http://www.example.com">Bar</a> Baz</ns:p>'
                );
            });

            it('should properly skip over attribute names that could be interpreted as urls, while still autolinking urls in their inner text', function () {
                const html =
                    '<div google.com anotherAttr yahoo.com>My div that has an attribute of google.com</div>';

                const result = autolinker.link(html);
                expect(result).to.equal(
                    '<div google.com anotherAttr yahoo.com>My div that has an attribute of <a href="http://google.com">google.com</a></div>'
                );
            });

            it('should properly skip over attribute names that could be interpreted as urls when they have a value, while still autolinking urls in their inner text', function () {
                const html =
                    '<div google.com="yes" anotherAttr=true yahoo.com="true">My div that has an attribute of google.com</div>';

                const result = autolinker.link(html);
                expect(result).to.equal(
                    '<div google.com="yes" anotherAttr=true yahoo.com="true">My div that has an attribute of <a href="http://google.com">google.com</a></div>'
                );
            });

            it('should properly skip over attribute names that could be interpreted as urls when they have a value and any number of spaces between attrs, while still autolinking urls in their inner text', function () {
                const html =
                    '<div  google.com="yes" \t\t anotherAttr=true   yahoo.com="true"  \t>My div that has an attribute of google.com</div>';

                const result = autolinker.link(html);
                expect(result).to.equal(
                    '<div  google.com="yes" \t\t anotherAttr=true   yahoo.com="true"  \t>My div that has an attribute of <a href="http://google.com">google.com</a></div>'
                );
            });

            it('should properly skip over attribute values that could be interpreted as urls/emails/twitter/mention accts, while still autolinking urls in their inner text', function () {
                const html =
                    '<div url="google.com" email="asdf@asdf.com" mention="@asdf">google.com asdf@asdf.com @asdf</div>';

                const result = twitterAutolinker.link(html);
                expect(result).to.equal(
                    [
                        '<div url="google.com" email="asdf@asdf.com" mention="@asdf">',
                        '<a href="http://google.com">google.com</a> ',
                        '<a href="mailto:asdf@asdf.com">asdf@asdf.com</a> ',
                        '<a href="https://twitter.com/asdf">@asdf</a>',
                        '</div>',
                    ].join('')
                );
            });

            it('should properly skip over attribute names and values that could be interpreted as urls/emails/twitter accts, while still autolinking urls in their inner text', function () {
                const html =
                    '<div google.com="google.com" asdf@asdf.com="asdf@asdf.com" @asdf="@asdf">google.com asdf@asdf.com @asdf</div>';

                const result = twitterAutolinker.link(html);
                expect(result).to.equal(
                    [
                        '<div google.com="google.com" asdf@asdf.com="asdf@asdf.com" @asdf="@asdf">',
                        '<a href="http://google.com">google.com</a> ',
                        '<a href="mailto:asdf@asdf.com">asdf@asdf.com</a> ',
                        '<a href="https://twitter.com/asdf">@asdf</a>',
                        '</div>',
                    ].join('')
                );
            });

            it('should properly handle HTML markup + text nodes that are nested within <a> tags', function () {
                const html = '<a href="http://google.com"><b>google.com</b></a>';

                const result = autolinker.link(html);
                expect(result).to.equal(html);
            });

            it('should attempt to handle some invalid HTML markup relating to <a> tags, esp if there are extraneous closing </a> tags', function () {
                const html = '</a><a href="http://google.com">google.com</a>';

                const result = autolinker.link(html);
                expect(result).to.equal(html);
            });

            it('should attempt to handle some more complex invalid HTML markup relating to <a> tags, esp if there are extraneous closing </a> tags', function () {
                const html = [
                    '</a>', // invalid
                    '<a href="http://google.com">google.com</a>',
                    '<div>google.com</div>',
                    '</a>', // invalid
                    '<a href="http://yahoo.com">yahoo.com</a>',
                    '</a>', // invalid
                    '</a>', // invalid
                    'twitter.com',
                ].join('');

                const result = autolinker.link(html);
                expect(result).to.equal(
                    [
                        '</a>', // invalid - left alone
                        '<a href="http://google.com">google.com</a>', // valid tag - left alone
                        '<div><a href="http://google.com">google.com</a></div>', // autolinked text in <div>
                        '</a>', // invalid - left alone
                        '<a href="http://yahoo.com">yahoo.com</a>', // valid tag - left alone
                        '</a>', // invalid - left alone
                        '</a>', // invalid - left alone
                        '<a href="http://twitter.com">twitter.com</a>', // autolinked text
                    ].join('')
                );
            });

            it('should handle &nbsp; after a url and not treat it as a query string', function () {
                const html = '<p>Joe went to yahoo.com&nbsp;and google.com&nbsp;today</p>';

                const result = autolinker.link(html);
                expect(result).to.equal(
                    '<p>Joe went to <a href="http://yahoo.com">yahoo.com</a>&nbsp;and <a href="http://google.com">google.com</a>&nbsp;today</p>'
                );
            });

            it('should handle HTML entities like &nbsp; within a non-autolinked part of a text node, properly appending it to the output', function () {
                const html =
                    'Joe went to yahoo.com and used HTML&nbsp;entities like &gt; and &lt; google.com';

                const result = autolinker.link(html);
                expect(result).to.equal(
                    'Joe went to <a href="http://yahoo.com">yahoo.com</a> and used HTML&nbsp;entities like &gt; and &lt; <a href="http://google.com">google.com</a>'
                );
            });

            it('should handle &amp; inside a url and not ignore it', function () {
                const html = '<p>Joe went to example.com?arg=1&amp;arg=2&amp;arg=3</p>';

                const result = autolinker.link(html);
                expect(result).to.equal(
                    '<p>Joe went to <a href="http://example.com?arg=1&arg=2&arg=3">example.com?arg=1&amp;arg=2&amp;arg=3</a></p>'
                );
            });

            it('should handle line breaks inside an HTML tag, not accidentally autolinking a URL within the tag', function () {
                const html =
                    '<a href="http://close.io/" style="font-family: Helvetica,\nArial">http://close.io</a>';

                const result = autolinker.link(html);
                expect(result).to.equal(
                    '<a href="http://close.io/" style="font-family: Helvetica,\nArial">http://close.io</a>'
                );
            });

            it('should handle a URL inside an HTML-encoded anchor tag (Issue #76)', function () {
                const html =
                    'Joe learned about anchor tags on the &lt;a href=&quot;http://www.w3schools.com/aaa&quot;&gt;W3SCHOOLS&lt;/a&gt; site ...';
                const tobe =
                    'Joe learned about anchor tags on the &lt;a href=&quot;<a href="http://www.w3schools.com/aaa">w3schools.com/aaa</a>&quot;&gt;W3SCHOOLS&lt;/a&gt; site ...';

                const result = autolinker.link(html);
                expect(result).to.equal(tobe);
            });
        });

        describe('HTML entity character handling', () => {
            it('should handle an HTML entity at the beginning of the string', function () {
                const result = autolinker.link('&amp;now go to google.com');
                expect(result).to.equal(
                    '&amp;now go to <a href="http://google.com">google.com</a>'
                );
            });

            it('should handle an HTML entity at the end of the string', function () {
                const result = autolinker.link('now go to google.com &amp;');
                expect(result).to.equal(
                    'now go to <a href="http://google.com">google.com</a> &amp;'
                );
            });

            it('should handle an HTML entity at the beginning and end of the string', function () {
                const result = autolinker.link('&amp;now go to google.com &amp;');
                expect(result).to.equal(
                    '&amp;now go to <a href="http://google.com">google.com</a> &amp;'
                );
            });

            it('should handle an HTML entity in the middle of the string', function () {
                const result = autolinker.link('now &amp;go to google.com');
                expect(result).to.equal(
                    'now &amp;go to <a href="http://google.com">google.com</a>'
                );
            });

            it('should handle a string with only an HTML entity', function () {
                const result = autolinker.link('&amp;');
                expect(result).to.equal('&amp;');
            });
        });

        describe('`newWindow` option', function () {
            it('should not add target="_blank" when the \'newWindow\' option is set to false', function () {
                const result = Autolinker.link('Test http://url.com', {
                    newWindow: false,
                });
                expect(result).to.equal('Test <a href="http://url.com">url.com</a>');
            });

            it('should add target="_blank" and rel="noopener noreferrer" when the \'newWindow\' option is set to true (see https://mathiasbynens.github.io/rel-noopener/ about the \'rel\' attribute, which prevents a potential phishing attack)', function () {
                const result = Autolinker.link('Test http://url.com', {
                    newWindow: true,
                });
                expect(result).to.equal(
                    'Test <a href="http://url.com" target="_blank" rel="noopener noreferrer">url.com</a>'
                );
            });
        });

        describe('`stripPrefix` option', function () {
            it('should not remove the prefix for non-http protocols even when true', function () {
                const result = Autolinker.link('Test file://execute-virus.com', {
                    stripPrefix: true,
                    newWindow: false,
                });
                expect(result).to.equal(
                    'Test <a href="file://execute-virus.com">file://execute-virus.com</a>'
                );
            });

            it("should remove 'http://www.' when the 'stripPrefix' option is set to `true`", function () {
                const result = Autolinker.link('Test http://www.url.com', {
                    stripPrefix: true,
                    newWindow: false,
                });
                expect(result).to.equal('Test <a href="http://www.url.com">url.com</a>');
            });

            it("should not remove 'http://www.' when the 'stripPrefix' option is set to `false`", function () {
                const result = Autolinker.link('Test http://www.url.com', {
                    stripPrefix: false,
                    newWindow: false,
                });
                expect(result).to.equal('Test <a href="http://www.url.com">http://www.url.com</a>');
            });

            it('should leave the original text as-is when the `stripPrefix` option is `false`', function () {
                const result1 = Autolinker.link('My url.com', {
                    stripPrefix: false,
                    newWindow: false,
                });
                expect(result1).to.equal('My <a href="http://url.com">url.com</a>');

                const result2 = Autolinker.link('My www.url.com', {
                    stripPrefix: false,
                    newWindow: false,
                });
                expect(result2).to.equal('My <a href="http://www.url.com">www.url.com</a>');

                const result3 = Autolinker.link('My http://url.com', {
                    stripPrefix: false,
                    newWindow: false,
                });
                expect(result3).to.equal('My <a href="http://url.com">http://url.com</a>');

                const result4 = Autolinker.link('My http://www.url.com', {
                    stripPrefix: false,
                    newWindow: false,
                });
                expect(result4).to.equal('My <a href="http://www.url.com">http://www.url.com</a>');
            });

            it('should remove the prefix by default', function () {
                const result = Autolinker.link('Test http://www.url.com', {
                    newWindow: false,
                });
                expect(result).to.equal('Test <a href="http://www.url.com">url.com</a>');
            });

            it(
                'when stripPrefix `scheme` is true, but `www` is false, it should ' +
                    'only strip the scheme',
                function () {
                    const result = Autolinker.link('Test http://www.url.com', {
                        stripPrefix: { scheme: true, www: false },
                        newWindow: false,
                    });

                    expect(result).to.equal('Test <a href="http://www.url.com">www.url.com</a>');
                }
            );

            it(
                'when stripPrefix `scheme` is false, but `www` is true, it should ' +
                    "only strip the 'www'",
                function () {
                    const result = Autolinker.link('Test http://www.url.com', {
                        stripPrefix: { scheme: false, www: true },
                        newWindow: false,
                    });

                    expect(result).to.equal('Test <a href="http://www.url.com">http://url.com</a>');
                }
            );

            it(
                'when stripPrefix `scheme` is false, but `www` is true for a ' +
                    'scheme-only URL, it should not strip anything',
                function () {
                    const result = Autolinker.link('Test http://url.com', {
                        stripPrefix: { scheme: false, www: true },
                        newWindow: false,
                    });

                    expect(result).to.equal('Test <a href="http://url.com">http://url.com</a>');
                }
            );

            it(
                'when stripPrefix `scheme` is false, but `www` is true for a ' +
                    "'www'-only URL, it should strip the 'www'",
                function () {
                    const result = Autolinker.link('Test www.url.com', {
                        stripPrefix: { scheme: false, www: true },
                        newWindow: false,
                    });

                    expect(result).to.equal('Test <a href="http://www.url.com">url.com</a>');
                }
            );

            it(
                'when stripPrefix `scheme` is true and `www` is true, it should ' +
                    "strip the entire prefix (scheme and 'www')",
                function () {
                    const result = Autolinker.link('Test http://www.url.com', {
                        stripPrefix: { scheme: true, www: true },
                        newWindow: false,
                    });

                    expect(result).to.equal('Test <a href="http://www.url.com">url.com</a>');
                }
            );

            it(
                'when stripPrefix `scheme` is false and `www` is false, it should ' +
                    'not strip any prefix',
                function () {
                    const result = Autolinker.link('Test http://www.url.com', {
                        stripPrefix: { scheme: false, www: false },
                        newWindow: false,
                    });

                    expect(result).to.equal(
                        'Test <a href="http://www.url.com">http://www.url.com</a>'
                    );
                }
            );
        });

        describe('`stripTrailingSlash` option', function () {
            it('by default, should remove the trailing slash', function () {
                const result = Autolinker.link('http://google.com/', {
                    stripPrefix: false,
                    //stripTrailingSlash : true,  -- not providing this cfg
                    newWindow: false,
                });

                expect(result).to.equal('<a href="http://google.com/">http://google.com</a>');
            });

            it('when provided as `true`, should remove the trailing slash', function () {
                const result = Autolinker.link('http://google.com/', {
                    stripPrefix: false,
                    stripTrailingSlash: true,
                    newWindow: false,
                });

                expect(result).to.equal('<a href="http://google.com/">http://google.com</a>');
            });

            it(
                'when provided as `false`, should not remove (i.e. retain) the ' + 'trailing slash',
                function () {
                    const result = Autolinker.link('http://google.com/', {
                        stripPrefix: false,
                        stripTrailingSlash: false,
                        newWindow: false,
                    });

                    expect(result).to.equal('<a href="http://google.com/">http://google.com/</a>');
                }
            );
        });

        describe('`decodePercentEncoding` option', function () {
            it('by default, should decode percent-encoding', function () {
                const result = Autolinker.link('https://en.wikipedia.org/wiki/San_Jos%C3%A9', {
                    stripPrefix: false,
                    //decodePercentEncoding : true,  -- not providing this cfg
                    newWindow: false,
                });

                expect(result).to.equal(
                    '<a href="https://en.wikipedia.org/wiki/San_Jos%C3%A9">https://en.wikipedia.org/wiki/San_José</a>'
                );
            });

            it('when provided as `true`, should decode percent-encoding', function () {
                const result = Autolinker.link('https://en.wikipedia.org/wiki/San_Jos%C3%A9', {
                    stripPrefix: false,
                    decodePercentEncoding: true,
                    newWindow: false,
                });

                expect(result).to.equal(
                    '<a href="https://en.wikipedia.org/wiki/San_Jos%C3%A9">https://en.wikipedia.org/wiki/San_José</a>'
                );
            });

            it('when provided as `false`, should not decode percent-encoding', function () {
                const result = Autolinker.link('https://en.wikipedia.org/wiki/San_Jos%C3%A9', {
                    stripPrefix: false,
                    decodePercentEncoding: false,
                    newWindow: false,
                });

                expect(result).to.equal(
                    '<a href="https://en.wikipedia.org/wiki/San_Jos%C3%A9">https://en.wikipedia.org/wiki/San_Jos%C3%A9</a>'
                );
            });
        });

        describe('`truncate` option', function () {
            describe('number form', function () {
                it('should not perform any truncation if the `truncate` option is not passed in', function () {
                    const result = Autolinker.link('Test http://url.com/with/path', {
                        newWindow: false,
                    });

                    expect(result).to.equal(
                        'Test <a href="http://url.com/with/path">url.com/with/path</a>'
                    );
                });

                it('should not perform any truncation if `truncate` is 0', function () {
                    const result = Autolinker.link('Test http://url.com/with/path', {
                        truncate: 0,
                        newWindow: false,
                    });

                    expect(result).to.equal(
                        'Test <a href="http://url.com/with/path">url.com/with/path</a>'
                    );
                });

                it("should truncate long a url/email/twitter to the given number of characters with the 'truncate' option specified", function () {
                    const result = Autolinker.link('Test http://url.com/with/path', {
                        truncate: 12,
                        newWindow: false,
                    });

                    expect(result).to.equal(
                        'Test <a href="http://url.com/with/path" title="http://url.com/with/path">url.com/w&hellip;</a>'
                    );
                });

                it("should leave a url/email/twitter alone if the length of the url is exactly equal to the length of the 'truncate' option", function () {
                    const result = Autolinker.link('Test http://url.com/with/path', {
                        truncate: 'url.com/with/path'.length,
                        newWindow: false,
                    }); // the exact length of the link

                    expect(result).to.equal(
                        'Test <a href="http://url.com/with/path">url.com/with/path</a>'
                    );
                });

                it("should leave a url/email/twitter alone if it does not exceed the given number of characters provided in the 'truncate' option", function () {
                    const result = Autolinker.link('Test http://url.com/with/path', {
                        truncate: 25,
                        newWindow: false,
                    }); // just a random high number

                    expect(result).to.equal(
                        'Test <a href="http://url.com/with/path">url.com/with/path</a>'
                    );
                });
            });

            describe('object form (with `length` and `location` properties)', function () {
                it('should not perform any truncation if `truncate.length` is not passed in', function () {
                    const result = Autolinker.link('Test http://url.com/with/path', {
                        truncate: { location: 'end' },
                        newWindow: false,
                    });

                    expect(result).to.equal(
                        'Test <a href="http://url.com/with/path">url.com/with/path</a>'
                    );
                });

                it('should not perform any truncation if `truncate.length` is 0', function () {
                    const result = Autolinker.link('Test http://url.com/with/path', {
                        truncate: { length: 0 },
                        newWindow: false,
                    });

                    expect(result).to.equal(
                        'Test <a href="http://url.com/with/path">url.com/with/path</a>'
                    );
                });

                it('should default the `location` to "end" if it is not provided', function () {
                    const result = Autolinker.link('Test http://url.com/with/path', {
                        truncate: { length: 12 },
                        newWindow: false,
                    });

                    expect(result).to.equal(
                        'Test <a href="http://url.com/with/path" title="http://url.com/with/path">url.com/w&hellip;</a>'
                    );
                });

                it('should truncate at the end when `location: "end"` is specified', function () {
                    const result = Autolinker.link('Test http://url.com/with/path', {
                        truncate: { length: 12, location: 'end' },
                        newWindow: false,
                    });

                    expect(result).to.equal(
                        'Test <a href="http://url.com/with/path" title="http://url.com/with/path">url.com/w&hellip;</a>'
                    );
                });

                it('should truncate in the middle when `location: "middle"` is specified', function () {
                    const result = Autolinker.link('Test http://url.com/with/path', {
                        truncate: { length: 12, location: 'middle' },
                        newWindow: false,
                    });
                    expect(result).to.equal(
                        'Test <a href="http://url.com/with/path" title="http://url.com/with/path">url.c&hellip;path</a>'
                    );
                });

                it('should truncate according to the "smart" truncation rules when `location: "smart"` is specified', function () {
                    const result = Autolinker.link('Test http://url.com/with/path', {
                        truncate: { length: 12, location: 'smart' },
                        newWindow: false,
                    });
                    expect(result).to.equal(
                        'Test <a href="http://url.com/with/path" title="http://url.com/with/path">url.com/&hellip;h</a>'
                    );
                });
            });
        });

        describe('`className` option', function () {
            it("should not add className when the 'className' option is not a string with at least 1 character", function () {
                let result = Autolinker.link('Test http://url.com', {
                    newWindow: false,
                });
                expect(result).to.equal('Test <a href="http://url.com">url.com</a>');

                result = Autolinker.link('Test http://url.com', {
                    newWindow: false,

                    // @ts-expect-error Testing invalid value
                    className: null,
                });
                expect(result).to.equal('Test <a href="http://url.com">url.com</a>');

                result = Autolinker.link('Test http://url.com', {
                    newWindow: false,
                    className: '',
                });
                expect(result).to.equal('Test <a href="http://url.com">url.com</a>');
            });

            it('should add className to links', function () {
                const result = Autolinker.link('Test http://url.com', {
                    newWindow: false,
                    className: 'myLink',
                });
                expect(result).to.equal(
                    'Test <a href="http://url.com" class="myLink myLink-url">url.com</a>'
                );
            });

            it('should add className to email links', function () {
                const result = Autolinker.link("Iggy's email is mr@iggypop.com", {
                    newWindow: false,
                    email: true,
                    className: 'myLink',
                });
                expect(result).to.equal(
                    'Iggy\'s email is <a href="mailto:mr@iggypop.com" class="myLink myLink-email">mr@iggypop.com</a>'
                );
            });

            it('should add className to twitter links', function () {
                const result = Autolinker.link('hi from @iggypopschest', {
                    newWindow: false,
                    mention: 'twitter',
                    className: 'myLink',
                });
                expect(result).to.equal(
                    'hi from <a href="https://twitter.com/iggypopschest" class="myLink myLink-mention myLink-twitter">@iggypopschest</a>'
                );
            });

            it('should add className to mention links', function () {
                let result = Autolinker.link('hi from @iggypopschest', {
                    newWindow: false,
                    mention: 'twitter',
                    className: 'myLink',
                });
                expect(result).to.equal(
                    'hi from <a href="https://twitter.com/iggypopschest" class="myLink myLink-mention myLink-twitter">@iggypopschest</a>'
                );

                result = Autolinker.link('hi from @iggypopschest', {
                    newWindow: false,
                    mention: 'instagram',
                    className: 'myLink',
                });
                expect(result).to.equal(
                    'hi from <a href="https://instagram.com/iggypopschest" class="myLink myLink-mention myLink-instagram">@iggypopschest</a>'
                );

                result = Autolinker.link('hi from @iggypopschest', {
                    newWindow: false,
                    mention: 'soundcloud',
                    className: 'myLink',
                });
                expect(result).to.equal(
                    'hi from <a href="https://soundcloud.com/iggypopschest" class="myLink myLink-mention myLink-soundcloud">@iggypopschest</a>'
                );

                result = Autolinker.link('hi from @iggypopschest', {
                    newWindow: false,
                    mention: 'tiktok',
                    className: 'myLink',
                });
                expect(result).to.equal(
                    'hi from <a href="https://www.tiktok.com/@iggypopschest" class="myLink myLink-mention myLink-tiktok">@iggypopschest</a>'
                );
            });
        });

        describe('`urls` option', function () {
            const str = 'http://google.com google.com 192.168.0.1'; // the 3 types: scheme URL, TLD (top level domain) URL, IPv4 address

            it('should link all 3 types if the `urls` option is `true`', function () {
                const result = Autolinker.link(str, {
                    newWindow: false,
                    stripPrefix: false,
                    urls: true,
                });

                expect(result).to.equal(
                    [
                        '<a href="http://google.com">http://google.com</a>',
                        '<a href="http://google.com">google.com</a>',
                        '<a href="http://192.168.0.1">192.168.0.1</a>',
                    ].join(' ')
                );
            });

            it('should not link any of the 3 types if the `urls` option is `false`', function () {
                const result = Autolinker.link(str, {
                    newWindow: false,
                    stripPrefix: false,
                    urls: false,
                });

                expect(result).to.equal(
                    ['http://google.com', 'google.com', '192.168.0.1'].join(' ')
                );
            });

            it('should only link scheme URLs if `schemeMatches` is the only `urls` option that is `true`', function () {
                const result = Autolinker.link(str, {
                    newWindow: false,
                    stripPrefix: false,
                    urls: {
                        schemeMatches: true,
                        tldMatches: false,
                        ipV4Matches: false,
                    },
                });

                expect(result).to.equal(
                    [
                        '<a href="http://google.com">http://google.com</a>',
                        'google.com',
                        '192.168.0.1',
                    ].join(' ')
                );
            });

            it('should only link TLD URLs if `tldMatches` is the only `urls` option that is `true`', function () {
                const result = Autolinker.link(str, {
                    newWindow: false,
                    stripPrefix: false,
                    urls: {
                        schemeMatches: false,
                        tldMatches: true,
                        ipV4Matches: false,
                    },
                });

                expect(result).to.equal(
                    [
                        'http://google.com',
                        '<a href="http://google.com">google.com</a>',
                        '192.168.0.1',
                    ].join(' ')
                );
            });

            it('should only link IPv4 addresses if `ipV4Matches` is the only `urls` option that is `true`', function () {
                const result = Autolinker.link(str, {
                    newWindow: false,
                    stripPrefix: false,
                    urls: {
                        schemeMatches: false,
                        tldMatches: false,
                        ipV4Matches: true,
                    },
                });

                expect(result).to.equal(
                    [
                        'http://google.com',
                        'google.com',
                        '<a href="http://192.168.0.1">192.168.0.1</a>',
                    ].join(' ')
                );
            });

            it('should link both scheme and IPv4 matches, but not TLD matches when `tldMatches` is the only option that is `false`', function () {
                const result = Autolinker.link(str, {
                    newWindow: false,
                    stripPrefix: false,
                    urls: {
                        schemeMatches: true,
                        tldMatches: false,
                        ipV4Matches: true,
                    },
                });

                expect(result).to.equal(
                    [
                        '<a href="http://google.com">http://google.com</a>',
                        'google.com',
                        '<a href="http://192.168.0.1">192.168.0.1</a>',
                    ].join(' ')
                );
            });

            it('should link both scheme and TLD matches, but not IPv4 matches when `ipV4Matches` is the only option that is `false`', function () {
                const result = Autolinker.link(str, {
                    newWindow: false,
                    stripPrefix: false,
                    urls: {
                        schemeMatches: true,
                        tldMatches: true,
                        ipV4Matches: false,
                    },
                });

                expect(result).to.equal(
                    [
                        '<a href="http://google.com">http://google.com</a>',
                        '<a href="http://google.com">google.com</a>',
                        '192.168.0.1',
                    ].join(' ')
                );
            });

            it('should link both TLD and IPv4 matches, but not scheme matches when `schemeMatches` is the only option that is `false`', function () {
                const result = Autolinker.link(str, {
                    newWindow: false,
                    stripPrefix: false,
                    urls: {
                        schemeMatches: false,
                        tldMatches: true,
                        ipV4Matches: true,
                    },
                });

                expect(result).to.equal(
                    [
                        'http://google.com',
                        '<a href="http://google.com">google.com</a>',
                        '<a href="http://192.168.0.1">192.168.0.1</a>',
                    ].join(' ')
                );
            });

            it('should link nothing when all 3 urls options are set to `false`', function () {
                const result = Autolinker.link(str, {
                    newWindow: false,
                    stripPrefix: false,
                    urls: {
                        schemeMatches: false,
                        tldMatches: false,
                        ipV4Matches: false,
                    },
                });

                expect(result).to.equal(
                    ['http://google.com', 'google.com', '192.168.0.1'].join(' ')
                );
            });
        });

        describe('`urls` (as boolean), `email`, `phone`, `twitter`, and `mention` options', function () {
            const inputStr = [
                'Website: asdf.com',
                'EmailMatch: asdf@asdf.com',
                'Phone: (123) 456-7890',
                'Mention: @asdf',
                'HashtagMatch: #asdf',
            ].join(', ');

            it('should link all 5 types if all 5 urls/email/phone/mention/hashtag options are enabled', function () {
                const result = Autolinker.link(inputStr, {
                    hashtag: 'twitter',
                    mention: 'twitter',
                    newWindow: false,
                });
                expect(result).to.equal(
                    [
                        'Website: <a href="http://asdf.com">asdf.com</a>',
                        'EmailMatch: <a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
                        'Phone: <a href="tel:1234567890">(123) 456-7890</a>',
                        'Mention: <a href="https://twitter.com/asdf">@asdf</a>',
                        'HashtagMatch: <a href="https://twitter.com/hashtag/asdf">#asdf</a>',
                    ].join(', ')
                );
            });

            it('should link mentions based on value provided to mention option', function () {
                let result = Autolinker.link(inputStr, {
                    newWindow: false,
                    hashtag: 'twitter',
                    mention: 'twitter',
                });
                expect(result).to.equal(
                    [
                        'Website: <a href="http://asdf.com">asdf.com</a>',
                        'EmailMatch: <a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
                        'Phone: <a href="tel:1234567890">(123) 456-7890</a>',
                        'Mention: <a href="https://twitter.com/asdf">@asdf</a>',
                        'HashtagMatch: <a href="https://twitter.com/hashtag/asdf">#asdf</a>',
                    ].join(', ')
                );

                result = Autolinker.link(inputStr, {
                    newWindow: false,
                    hashtag: 'twitter',
                    mention: 'instagram',
                });
                expect(result).to.equal(
                    [
                        'Website: <a href="http://asdf.com">asdf.com</a>',
                        'EmailMatch: <a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
                        'Phone: <a href="tel:1234567890">(123) 456-7890</a>',
                        'Mention: <a href="https://instagram.com/asdf">@asdf</a>',
                        'HashtagMatch: <a href="https://twitter.com/hashtag/asdf">#asdf</a>',
                    ].join(', ')
                );
            });

            it('should not link urls when they are disabled', function () {
                const result = Autolinker.link(inputStr, {
                    mention: 'twitter',
                    hashtag: 'twitter',
                    urls: false,
                    newWindow: false,
                });

                expect(result).to.equal(
                    [
                        'Website: asdf.com',
                        'EmailMatch: <a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
                        'Phone: <a href="tel:1234567890">(123) 456-7890</a>',
                        'Mention: <a href="https://twitter.com/asdf">@asdf</a>',
                        'HashtagMatch: <a href="https://twitter.com/hashtag/asdf">#asdf</a>',
                    ].join(', ')
                );
            });

            it('should not link email addresses when they are disabled', function () {
                const result = Autolinker.link(inputStr, {
                    mention: 'twitter',
                    hashtag: 'twitter',
                    email: false,
                    newWindow: false,
                });

                expect(result).to.equal(
                    [
                        'Website: <a href="http://asdf.com">asdf.com</a>',
                        'EmailMatch: asdf@asdf.com',
                        'Phone: <a href="tel:1234567890">(123) 456-7890</a>',
                        'Mention: <a href="https://twitter.com/asdf">@asdf</a>',
                        'HashtagMatch: <a href="https://twitter.com/hashtag/asdf">#asdf</a>',
                    ].join(', ')
                );
            });

            it('should not link phone numbers when they are disabled', function () {
                const result = Autolinker.link(inputStr, {
                    hashtag: 'twitter',
                    mention: 'twitter',
                    phone: false,
                    newWindow: false,
                });

                expect(result).to.equal(
                    [
                        'Website: <a href="http://asdf.com">asdf.com</a>',
                        'EmailMatch: <a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
                        'Phone: (123) 456-7890',
                        'Mention: <a href="https://twitter.com/asdf">@asdf</a>',
                        'HashtagMatch: <a href="https://twitter.com/hashtag/asdf">#asdf</a>',
                    ].join(', ')
                );
            });

            it('should not link mention handles when they are disabled', function () {
                const result = Autolinker.link(inputStr, {
                    newWindow: false,
                    hashtag: 'twitter',
                    mention: false,
                });

                expect(result).to.equal(
                    [
                        'Website: <a href="http://asdf.com">asdf.com</a>',
                        'EmailMatch: <a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
                        'Phone: <a href="tel:1234567890">(123) 456-7890</a>',
                        'Mention: @asdf',
                        'HashtagMatch: <a href="https://twitter.com/hashtag/asdf">#asdf</a>',
                    ].join(', ')
                );
            });

            it('should not link Hashtags when they are disabled', function () {
                const result = Autolinker.link(inputStr, {
                    mention: 'twitter',
                    hashtag: false,
                    newWindow: false,
                });

                expect(result).to.equal(
                    [
                        'Website: <a href="http://asdf.com">asdf.com</a>',
                        'EmailMatch: <a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
                        'Phone: <a href="tel:1234567890">(123) 456-7890</a>',
                        'Mention: <a href="https://twitter.com/asdf">@asdf</a>',
                        'HashtagMatch: #asdf',
                    ].join(', ')
                );
            });
        });

        describe('`replaceFn` option', function () {
            const returnTrueFn = function () {
                return true;
            };
            const returnFalseFn = function () {
                return false;
            };
            let replaceFnSpy: sinon.SinonSpy;

            beforeEach(function () {
                replaceFnSpy = sinon.spy();
            });

            it(
                'by default, should be called with with the `Autolinker` instance ' +
                    'as the context object (`this` reference)',
                function () {
                    const replaceFnAutolinker = new Autolinker({
                        replaceFn: replaceFnSpy,
                    });
                    replaceFnAutolinker.link('asdf.com'); // will call the `replaceFn`

                    expect(replaceFnSpy.callCount).to.equal(1);
                    expect(replaceFnSpy.firstCall.thisValue).to.equal(replaceFnAutolinker);
                }
            );

            it(
                'when provided a `context` option, should be called with with ' +
                    'that object as the context object (`this` reference)',
                function () {
                    const contextObj = { prop: 'value' };
                    const replaceFnAutolinker = new Autolinker({
                        replaceFn: replaceFnSpy,
                        context: contextObj,
                    });
                    replaceFnAutolinker.link('asdf.com'); // will call the `replaceFn`

                    expect(replaceFnSpy.callCount).to.equal(1);
                    expect(replaceFnSpy.firstCall.thisValue).to.equal(contextObj);
                }
            );

            it('should populate a UrlMatch object with the appropriate properties', function () {
                let replaceFnCallCount = 0;
                Autolinker.link('Website: asdf.com ', {
                    // purposeful trailing space
                    replaceFn: function (match: Match) {
                        replaceFnCallCount++;

                        expect(match.getMatchedText()).to.equal('asdf.com');
                        expect((match as UrlMatch).getUrl()).to.equal('http://asdf.com');
                    },
                });

                expect(replaceFnCallCount).to.equal(1); // make sure the replaceFn was called
            });

            it('should populate an EmailMatch object with the appropriate properties', function () {
                let replaceFnCallCount = 0;
                Autolinker.link('EmailMatch: asdf@asdf.com ', {
                    // purposeful trailing space
                    replaceFn: function (match: Match) {
                        replaceFnCallCount++;

                        expect(match.getMatchedText()).to.equal('asdf@asdf.com');
                        expect((match as EmailMatch).getEmail()).to.equal('asdf@asdf.com');
                    },
                });

                expect(replaceFnCallCount).to.equal(1); // make sure the replaceFn was called
            });

            it('should populate a HashtagMatch object with the appropriate properties', function () {
                let replaceFnCallCount = 0;
                Autolinker.link('HashtagMatch: #myHashtag ', {
                    // purposeful trailing space
                    hashtag: 'twitter',
                    replaceFn: function (match: Match) {
                        replaceFnCallCount++;

                        expect(match.getType()).to.equal('hashtag');
                        expect(match.getMatchedText()).to.equal('#myHashtag');
                        expect((match as HashtagMatch).getHashtag()).to.equal('myHashtag');
                    },
                });

                expect(replaceFnCallCount).to.equal(1); // make sure the replaceFn was called
            });

            it('should populate a TwitterMatch object with the appropriate properties', function () {
                let replaceFnCallCount = 0;
                Autolinker.link('Twitter: @myTwitter ', {
                    // purposeful trailing space
                    mention: 'twitter',
                    replaceFn: function (match: Match) {
                        replaceFnCallCount++;

                        expect(match.getMatchedText()).to.equal('@myTwitter');
                        expect((match as MentionMatch).getMention()).to.equal('myTwitter');
                    },
                });

                expect(replaceFnCallCount).to.equal(1); // make sure the replaceFn was called
            });

            it('should populate a MentionMatch object with the appropriate properties', function () {
                let replaceFnCallCount = 0;
                Autolinker.link('Mention: @myTwitter ', {
                    // purposeful trailing space
                    mention: 'twitter',
                    replaceFn: function (match: Match) {
                        replaceFnCallCount++;

                        expect(match.getMatchedText()).to.equal('@myTwitter');
                        expect((match as MentionMatch).getMention()).to.equal('myTwitter');
                    },
                });

                expect(replaceFnCallCount).to.equal(1); // make sure the replaceFn was called
            });

            it('should replace the match as Autolinker would normally do when `true` is returned from the `replaceFn`', function () {
                const result = Autolinker.link(
                    'Website: asdf.com, EmailMatch: asdf@asdf.com, Twitter: @asdf',
                    {
                        mention: 'twitter',
                        newWindow: false, // just to suppress the target="_blank" from the output for this test
                        replaceFn: returnTrueFn,
                    }
                );

                expect(result).to.equal(
                    [
                        'Website: <a href="http://asdf.com">asdf.com</a>',
                        'EmailMatch: <a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
                        'Twitter: <a href="https://twitter.com/asdf">@asdf</a>',
                    ].join(', ')
                );
            });

            it('should replace the match as Autolinker would normally do when there is no return value (i.e. `undefined` is returned) from the `replaceFn`', function () {
                const result = Autolinker.link(
                    'Website: asdf.com, EmailMatch: asdf@asdf.com, Twitter: @asdf',
                    {
                        mention: 'twitter',
                        newWindow: false, // just to suppress the target="_blank" from the output for this test
                        replaceFn: function () {}, // no return value (`undefined` is returned)
                    }
                );

                expect(result).to.equal(
                    [
                        'Website: <a href="http://asdf.com">asdf.com</a>',
                        'EmailMatch: <a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
                        'Twitter: <a href="https://twitter.com/asdf">@asdf</a>',
                    ].join(', ')
                );
            });

            it('should leave the match as-is when `false` is returned from the `replaceFn`', function () {
                const result = Autolinker.link(
                    'Website: asdf.com, EmailMatch: asdf@asdf.com, Twitter: @asdf',
                    {
                        mention: 'twitter',
                        replaceFn: returnFalseFn,
                    }
                );

                expect(result).to.equal(
                    ['Website: asdf.com', 'EmailMatch: asdf@asdf.com', 'Twitter: @asdf'].join(', ')
                );
            });

            it('should use a string returned from the `replaceFn` as the HTML that is replaced in the input', function () {
                const result = Autolinker.link(
                    'Website: asdf.com, EmailMatch: asdf@asdf.com, Twitter: @asdf',
                    {
                        mention: 'twitter',
                        replaceFn: function () {
                            return 'test';
                        },
                    }
                );

                expect(result).to.equal('Website: test, EmailMatch: test, Twitter: test');
            });

            it('should allow an Autolinker.HtmlTag instance to be returned from the `replaceFn`, and use that as the HTML to be replaced from the input', function () {
                const result = Autolinker.link('Website: asdf.com', {
                    newWindow: false,

                    replaceFn: function (match) {
                        const tag = match.buildTag();
                        tag.setInnerHtml('asdf!'); // just to check that we're replacing with the returned `tag` instance
                        return tag;
                    },
                });

                expect(result).to.equal('Website: <a href="http://asdf.com">asdf!</a>');
            });

            it('should allow an Autolinker.HtmlTag instance to be modified before being returned from the `replaceFn`', function () {
                const result = Autolinker.link('Website: asdf.com', {
                    newWindow: false,

                    replaceFn: function (match) {
                        const tag = match.buildTag();
                        tag.addClass('test');
                        tag.addClass('test2');
                        tag.setAttr('rel', 'nofollow');
                        return tag;
                    },
                });

                expect(result).to.equal(
                    'Website: <a href="http://asdf.com" class="test test2" rel="nofollow">asdf.com</a>'
                );
            });

            it('should not drop a trailing parenthesis of a URL match if the `replaceFn` returns false', function () {
                const result = Autolinker.link('Go to the website (asdf.com) and see', {
                    newWindow: false,
                    replaceFn: returnFalseFn,
                });

                expect(result).to.equal('Go to the website (asdf.com) and see');
            });

            describe('special cases which check the `prefixStr` and `suffixStr` vars in the code', function () {
                it('should leave the match as-is when the `replaceFn` returns `false` for a Twitter match', function () {
                    const result = Autolinker.link('@asdf', {
                        replaceFn: returnFalseFn,
                    });
                    expect(result).to.equal('@asdf');

                    const result2 = Autolinker.link('Twitter: @asdf', {
                        mention: 'twitter',
                        replaceFn: returnFalseFn,
                    });
                    expect(result2).to.equal('Twitter: @asdf');
                });

                it('should leave the match as-is when the `replaceFn` returns `false`, and the URL was wrapped in parenthesis', function () {
                    const result = Autolinker.link('Go to (yahoo.com) my friend', {
                        replaceFn: returnFalseFn,
                    });
                    expect(result).to.equal('Go to (yahoo.com) my friend');

                    const result2 = Autolinker.link(
                        'Go to en.wikipedia.org/wiki/IANA_(disambiguation) my friend',
                        { replaceFn: returnFalseFn }
                    );
                    expect(result2).to.equal(
                        'Go to en.wikipedia.org/wiki/IANA_(disambiguation) my friend'
                    );

                    const result3 = Autolinker.link(
                        'Go to (en.wikipedia.org/wiki/IANA_(disambiguation)) my friend',
                        { replaceFn: returnFalseFn }
                    );
                    expect(result3).to.equal(
                        'Go to (en.wikipedia.org/wiki/IANA_(disambiguation)) my friend'
                    );
                });

                it('should leave the match as-is when the `replaceFn` returns `false`, and the URL was a protocol-relative match', function () {
                    const result = Autolinker.link('Go to //yahoo.com my friend', {
                        replaceFn: returnFalseFn,
                    });
                    expect(result).to.equal('Go to //yahoo.com my friend');
                });
            });
        });

        describe('all match types tests', function () {
            const testCases = {
                schemeUrl: {
                    unlinked: 'http://google.com/path?param1=value1&param2=value2#hash',
                    linked: '<a href="http://google.com/path?param1=value1&param2=value2#hash">http://google.com/path?param1=value1&param2=value2#hash</a>',
                },
                tldUrl: {
                    unlinked: 'google.com/path?param1=value1&param2=value2#hash',
                    linked: '<a href="http://google.com/path?param1=value1&param2=value2#hash">google.com/path?param1=value1&param2=value2#hash</a>',
                },
                ipV4Url: {
                    unlinked: '192.168.0.1/path?param1=value1&param2=value2#hash',
                    linked: '<a href="http://192.168.0.1/path?param1=value1&param2=value2#hash">192.168.0.1/path?param1=value1&param2=value2#hash</a>',
                },
                email: {
                    unlinked: 'asdf@asdf.com',
                    linked: '<a href="mailto:asdf@asdf.com">asdf@asdf.com</a>',
                },
                mention: {
                    unlinked: '@asdf',
                    linked: '<a href="https://twitter.com/asdf">@asdf</a>',
                },
                phone: {
                    unlinked: '123-456-7890',
                    linked: '<a href="tel:1234567890">123-456-7890</a>',
                },
                hashtag: {
                    unlinked: '#Winning',
                    linked: '<a href="https://twitter.com/hashtag/Winning">#Winning</a>',
                },
            };

            const numTestCaseKeys = Object.keys(testCases).length;

            const paragraphTpl = _.template(
                [
                    'Check link 1: <%= schemeUrl %>.',
                    'Check link 2: <%= tldUrl %>.',
                    'Check link 3: <%= ipV4Url %>.',
                    'My email is: <%= email %>.',
                    'My mention (twitter) username is <%= mention %>.',
                    'My phone number is <%= phone %>.',
                    'HashtagMatch <%= hashtag %>.',
                ].join('\n')
            );

            const sourceParagraph = paragraphTpl({
                schemeUrl: testCases.schemeUrl.unlinked,
                tldUrl: testCases.tldUrl.unlinked,
                ipV4Url: testCases.ipV4Url.unlinked,
                email: testCases.email.unlinked,
                mention: testCases.mention.unlinked,
                phone: testCases.phone.unlinked,
                hashtag: testCases.hashtag.unlinked,
            });

            it("should replace matches appropriately in a paragraph of text, using a variety of enabled matchers. Want to make sure that when one match type is disabled (such as emails), that other ones don't accidentally link part of them (such as from the url matcher)", function () {
                interface MatcherTestConfig {
                    schemeMatches: boolean;
                    tldMatches: boolean;
                    ipV4Matches: boolean;
                    email: boolean;
                    mention: MentionService | false;
                    phone: boolean;
                    hashtag: HashtagService | false;
                }

                // We're going to run through every combination of matcher settings
                // possible.
                // 7 different settings and two possibilities for each (on or off)
                // is 2^7 == 128 settings possibilities
                for (let i = 0, len = Math.pow(2, numTestCaseKeys); i < len; i++) {
                    const cfg: MatcherTestConfig = {
                        schemeMatches: !!(i & parseInt('00000001', 2)),
                        tldMatches: !!(i & parseInt('00000010', 2)),
                        ipV4Matches: !!(i & parseInt('00000100', 2)),
                        email: !!(i & parseInt('00001000', 2)),
                        mention: i & parseInt('00010000', 2) ? 'twitter' : false,
                        phone: !!(i & parseInt('00100000', 2)),
                        hashtag: i & parseInt('01000000', 2) ? 'twitter' : false,
                    };

                    const autolinker = new Autolinker({
                        urls: {
                            schemeMatches: cfg.schemeMatches,
                            tldMatches: cfg.tldMatches,
                            ipV4Matches: cfg.ipV4Matches,
                        },
                        email: cfg.email,
                        mention: cfg.mention,
                        phone: cfg.phone,
                        hashtag: cfg.hashtag,

                        newWindow: false,
                        stripPrefix: false,
                    });

                    const result = autolinker.link(sourceParagraph),
                        resultLines = result.split('\n'), // splitting line-by-line to make it easier to see where a failure is
                        expectedLines = generateExpectedLines(cfg);

                    expect(resultLines.length).to.equal(expectedLines.length); // just in case

                    for (let j = 0, jlen = expectedLines.length; j < jlen; j++) {
                        if (resultLines[j] !== expectedLines[j]) {
                            const errorMsg = generateErrMsg(resultLines[j], expectedLines[j], cfg);
                            throw new Error(errorMsg);
                        }
                    }
                }

                function generateExpectedLines(cfg: MatcherTestConfig) {
                    const expectedLines = paragraphTpl({
                        schemeUrl: cfg.schemeMatches
                            ? testCases.schemeUrl.linked
                            : testCases.schemeUrl.unlinked,
                        tldUrl: cfg.tldMatches
                            ? testCases.tldUrl.linked
                            : testCases.tldUrl.unlinked,
                        ipV4Url: cfg.ipV4Matches
                            ? testCases.ipV4Url.linked
                            : testCases.ipV4Url.unlinked,
                        email: cfg.email ? testCases.email.linked : testCases.email.unlinked,
                        mention: cfg.mention
                            ? testCases.mention.linked
                            : testCases.mention.unlinked,
                        phone: cfg.phone ? testCases.phone.linked : testCases.phone.unlinked,
                        hashtag: cfg.hashtag
                            ? testCases.hashtag.linked
                            : testCases.hashtag.unlinked,
                    });

                    return expectedLines.split('\n'); // splitting line-by-line to make it easier to see where a failure is
                }

                function generateErrMsg(
                    resultLine: string,
                    expectedLine: string,
                    cfg: MatcherTestConfig
                ) {
                    const errorMsg = [
                        "Expected: '" + resultLine + "' to be '" + expectedLine + "'\n",
                    ];

                    errorMsg.push('{');
                    _.forOwn(cfg, (value: string | boolean, key: string) => {
                        errorMsg.push('\t' + key + ': ' + value);
                    });
                    errorMsg.push('}');

                    return errorMsg.join('\n');
                }
            });

            it('should be able to parse a very long string', function () {
                const testStr = (function () {
                    const t: string[] = [];
                    for (let i = 0; i < 50000; i++) {
                        t.push(' foo');
                    }
                    return t.join('');
                })();

                const result = Autolinker.link(testStr);
                expect(result).to.equal(testStr);
            });
        });

        describe('combination matches (matches right next to each other) >', () => {
            describe('starting with an email >', () => {
                it(`followed by a URL if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('stuff@stuff.com/http://google.com');
                    expect(result).to.equal(
                        '<a href="mailto:stuff@stuff.com">stuff@stuff.com</a>/<a href="http://google.com">google.com</a>'
                    );
                });

                it(`followed by an email if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('stuff@stuff.com/things@things.com');
                    expect(result).to.equal(
                        '<a href="mailto:stuff@stuff.com">stuff@stuff.com</a>/<a href="mailto:things@things.com">things@things.com</a>'
                    );
                });

                it(`followed by a hashtag if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('stuff@stuff.com/#Stuff');
                    expect(result).to.equal(
                        '<a href="mailto:stuff@stuff.com">stuff@stuff.com</a>/<a href="https://twitter.com/hashtag/Stuff">#Stuff</a>'
                    );
                });

                it(`followed by a mention if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('stuff@stuff.com/@stuff');
                    expect(result).to.equal(
                        '<a href="mailto:stuff@stuff.com">stuff@stuff.com</a>/<a href="https://twitter.com/stuff">@stuff</a>'
                    );
                });

                it(`followed by a phone number if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('stuff@stuff.com/123-456-7890');
                    expect(result).to.equal(
                        '<a href="mailto:stuff@stuff.com">stuff@stuff.com</a>/<a href="tel:1234567890">123-456-7890</a>'
                    );
                });
            });

            describe('starting with phone number >', () => {
                it('should parse a phone number directly next to a scheme-prefixed URL', function () {
                    const result = autolinker.link('+1123123123http://google.com');
                    expect(result).to.equal(
                        '<a href="tel:+1123123123">+1123123123</a><a href="http://google.com">google.com</a>'
                    );
                });

                it(`should parse a phone number followed by a URL if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('+1123123123/http://google.com');
                    expect(result).to.equal(
                        '<a href="tel:+1123123123">+1123123123</a>/<a href="http://google.com">google.com</a>'
                    );
                });

                // Don't link a TLD next to a phone number. Could be weird in that a
                // domain label could look like a phone number but is really just
                // part of the domain label
                // TODO: Should this definitely be the case?
                it('should parse a phone number directly next to a TLD URL', function () {
                    const result = autolinker.link('+1123123123google.com');
                    expect(result).to.equal('<a href="tel:+1123123123">+1123123123</a>google.com');
                });

                it(`followed by a URL if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('+1123123123/http://google.com');
                    expect(result).to.equal(
                        '<a href="tel:+1123123123">+1123123123</a>/<a href="http://google.com">google.com</a>'
                    );
                });

                it(`followed by an email if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('+1123123123/things@things.com');
                    expect(result).to.equal(
                        '<a href="tel:+1123123123">+1123123123</a>/<a href="mailto:things@things.com">things@things.com</a>'
                    );
                });

                it(`followed by a hashtag if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('+1123123123/#Stuff');
                    expect(result).to.equal(
                        '<a href="tel:+1123123123">+1123123123</a>/<a href="https://twitter.com/hashtag/Stuff">#Stuff</a>'
                    );
                });

                it(`followed by a mention if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('+1123123123/@stuff');
                    expect(result).to.equal(
                        '<a href="tel:+1123123123">+1123123123</a>/<a href="https://twitter.com/stuff">@stuff</a>'
                    );
                });

                it(`followed by a phone number if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('+1123123123/123-456-7890');
                    expect(result).to.equal(
                        '<a href="tel:+1123123123">+1123123123</a>/<a href="tel:1234567890">123-456-7890</a>'
                    );
                });
            });

            describe('starting with a hashtag >', () => {
                it(`followed by a URL if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('#Stuff/http://google.com');
                    expect(result).to.equal(
                        '<a href="https://twitter.com/hashtag/Stuff">#Stuff</a>/<a href="http://google.com">google.com</a>'
                    );
                });

                it(`followed by an email if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('#Stuff/things@things.com');
                    expect(result).to.equal(
                        '<a href="https://twitter.com/hashtag/Stuff">#Stuff</a>/<a href="mailto:things@things.com">things@things.com</a>'
                    );
                });

                it(`followed by a hashtag if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('#Stuff/#Things');
                    expect(result).to.equal(
                        '<a href="https://twitter.com/hashtag/Stuff">#Stuff</a>/<a href="https://twitter.com/hashtag/Things">#Things</a>'
                    );
                });

                it(`followed by a mention if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('#Stuff/@things');
                    expect(result).to.equal(
                        '<a href="https://twitter.com/hashtag/Stuff">#Stuff</a>/<a href="https://twitter.com/things">@things</a>'
                    );
                });

                it(`followed by a phone number if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('#Stuff/123-456-7890');
                    expect(result).to.equal(
                        '<a href="https://twitter.com/hashtag/Stuff">#Stuff</a>/<a href="tel:1234567890">123-456-7890</a>'
                    );
                });
            });

            describe('starting with a mention', () => {
                it(`followed by a URL if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('@stuff/http://google.com');
                    expect(result).to.equal(
                        '<a href="https://twitter.com/stuff">@stuff</a>/<a href="http://google.com">google.com</a>'
                    );
                });

                it(`followed by an email if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('@stuff/things@things.com');
                    expect(result).to.equal(
                        '<a href="https://twitter.com/stuff">@stuff</a>/<a href="mailto:things@things.com">things@things.com</a>'
                    );
                });

                it(`followed by a hashtag if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('@stuff/#Things');
                    expect(result).to.equal(
                        '<a href="https://twitter.com/stuff">@stuff</a>/<a href="https://twitter.com/hashtag/Things">#Things</a>'
                    );
                });

                it(`followed by a mention if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('@stuff/@things');
                    expect(result).to.equal(
                        '<a href="https://twitter.com/stuff">@stuff</a>/<a href="https://twitter.com/things">@things</a>'
                    );
                });

                it(`followed by a phone number if separated by a '/'`, () => {
                    const result = twitterAutolinker.link('@stuff/123-456-7890');
                    expect(result).to.equal(
                        '<a href="https://twitter.com/stuff">@stuff</a>/<a href="tel:1234567890">123-456-7890</a>'
                    );
                });
            });
        });
    });

    describe('static parse()', function () {
        it('should return an array of Match objects for the input', function () {
            const text = [
                'Website: asdf.com',
                'EmailMatch: asdf@asdf.com',
                'Phone: (123) 456-7890',
                'Mention: @asdf1',
                'HashtagMatch: #asdf2',
            ].join(' ');

            const matches = Autolinker.parse(text, {
                hashtag: 'twitter',
                mention: 'twitter',
            });

            expect(matches.length).to.equal(5);

            expect(matches[0].getType()).to.equal('url');
            expect((matches[0] as UrlMatch).getUrl()).to.equal('http://asdf.com');

            expect(matches[1].getType()).to.equal('email');
            expect((matches[1] as EmailMatch).getEmail()).to.equal('asdf@asdf.com');

            expect(matches[2].getType()).to.equal('phone');
            expect((matches[2] as PhoneMatch).getNumber()).to.equal('1234567890');

            expect(matches[3].getType()).to.equal('mention');
            expect((matches[3] as MentionMatch).getMention()).to.equal('asdf1');

            expect(matches[4].getType()).to.equal('hashtag');
            expect((matches[4] as HashtagMatch).getHashtag()).to.equal('asdf2');
        });
    });

    describe('parse()', function () {
        it('should return an array of Match objects for the input', function () {
            const autolinker = new Autolinker({
                mention: 'instagram',
                hashtag: 'tiktok',
                newWindow: false,
            });

            const text = [
                '<div>', // html tag to make sure that the 'offset' property is assigned correctly in the presence of them
                'Website1: http://asdf.com',
                'Website2: asdf.com',
                'Website3: subdomain.asdf.com',
                'Website4: //asdf.com',
                'Website5: 192.168.0.1',
                'EmailMatch: asdf@asdf.com',
                'Phone: (123) 456-7890',
                'Mention: @asdf1',
                'HashtagMatch: #asdf2',
                '</div>',
            ].join(' ');
            const matches = autolinker.parse(text);

            expect(matches.length).to.equal(9);

            const [
                schemeMatch,
                tldMatch,
                subdomainTldMatch,
                protocolRelativeMatch,
                ipV4Match,
                emailMatch,
                phoneMatch,
                mentionMatch,
                hashtagMatch,
            ] = matches;

            if (schemeMatch.type !== 'url') {
                throw new Error('matches[0] should be a url match');
            }
            if (tldMatch.type !== 'url') {
                throw new Error('matches[1] should be a url match');
            }
            if (subdomainTldMatch.type !== 'url') {
                throw new Error('matches[2] should be a url match');
            }
            if (protocolRelativeMatch.type !== 'url') {
                throw new Error('matches[3] should be a url match');
            }
            if (ipV4Match.type !== 'url') {
                throw new Error('matches[4] should be a url match');
            }
            if (emailMatch.type !== 'email') {
                throw new Error('matches[5] should be an email match');
            }
            if (phoneMatch.type !== 'phone') {
                throw new Error('matches[6] should be a phone match');
            }
            if (mentionMatch.type !== 'mention') {
                throw new Error('matches[7] should be a mention match');
            }
            if (hashtagMatch.type !== 'hashtag') {
                throw new Error('matches[8] should be a hashtag match');
            }

            expect(schemeMatch.getType()).to.equal('url'); // backward compatibility method - 'type' property replaces getType()
            expect(schemeMatch.getMatchedText()).to.equal('http://asdf.com');
            expect(schemeMatch.getOffset()).to.equal(16);
            expect(schemeMatch.getAnchorHref()).to.equal('http://asdf.com');
            expect(schemeMatch.getAnchorText()).to.equal('asdf.com');
            expect(schemeMatch.getCssClassSuffixes()).to.deep.equal(['url']);
            expect(schemeMatch.getUrlMatchType()).to.equal('scheme');
            expect(schemeMatch.getUrl()).to.equal('http://asdf.com');
            expect(schemeMatch.buildTag().toAnchorString()).to.equal(
                '<a href="http://asdf.com">asdf.com</a>'
            );

            expect(tldMatch.getType()).to.equal('url'); // backward compatibility method - 'type' property replaces getType()
            expect(tldMatch.getMatchedText()).to.equal('asdf.com');
            expect(tldMatch.getOffset()).to.equal(42);
            expect(tldMatch.getAnchorHref()).to.equal('http://asdf.com');
            expect(tldMatch.getAnchorText()).to.equal('asdf.com');
            expect(tldMatch.getCssClassSuffixes()).to.deep.equal(['url']);
            expect(tldMatch.getUrlMatchType()).to.equal('tld');
            expect(tldMatch.getUrl()).to.equal('http://asdf.com');
            expect(tldMatch.buildTag().toAnchorString()).to.equal(
                '<a href="http://asdf.com">asdf.com</a>'
            );

            expect(subdomainTldMatch.getType()).to.equal('url'); // backward compatibility method - 'type' property replaces getType()
            expect(subdomainTldMatch.getMatchedText()).to.equal('subdomain.asdf.com');
            expect(subdomainTldMatch.getOffset()).to.equal(61);
            expect(subdomainTldMatch.getAnchorHref()).to.equal('http://subdomain.asdf.com');
            expect(subdomainTldMatch.getAnchorText()).to.equal('subdomain.asdf.com');
            expect(subdomainTldMatch.getCssClassSuffixes()).to.deep.equal(['url']);
            expect(subdomainTldMatch.getUrlMatchType()).to.equal('tld');
            expect(subdomainTldMatch.getUrl()).to.equal('http://subdomain.asdf.com');
            expect(subdomainTldMatch.buildTag().toAnchorString()).to.equal(
                '<a href="http://subdomain.asdf.com">subdomain.asdf.com</a>'
            );

            expect(protocolRelativeMatch.getType()).to.equal('url'); // backward compatibility method - 'type' property replaces getType()
            expect(protocolRelativeMatch.getMatchedText()).to.equal('//asdf.com');
            expect(protocolRelativeMatch.getOffset()).to.equal(90);
            expect(protocolRelativeMatch.getAnchorHref()).to.equal('//asdf.com');
            expect(protocolRelativeMatch.getAnchorText()).to.equal('asdf.com');
            expect(protocolRelativeMatch.getCssClassSuffixes()).to.deep.equal(['url']);
            expect(protocolRelativeMatch.getUrlMatchType()).to.equal('tld');
            expect(protocolRelativeMatch.getUrl()).to.equal('//asdf.com');
            expect(protocolRelativeMatch.buildTag().toAnchorString()).to.equal(
                '<a href="//asdf.com">asdf.com</a>'
            );

            expect(ipV4Match.getType()).to.equal('url'); // backward compatibility method - 'type' property replaces getType()
            expect(ipV4Match.getMatchedText()).to.equal('192.168.0.1');
            expect(ipV4Match.getOffset()).to.equal(111);
            expect(ipV4Match.getAnchorHref()).to.equal('http://192.168.0.1');
            expect(ipV4Match.getAnchorText()).to.equal('192.168.0.1');
            expect(ipV4Match.getCssClassSuffixes()).to.deep.equal(['url']);
            expect(ipV4Match.getUrlMatchType()).to.equal('ipV4');
            expect(ipV4Match.getUrl()).to.equal('http://192.168.0.1');
            expect(ipV4Match.buildTag().toAnchorString()).to.equal(
                '<a href="http://192.168.0.1">192.168.0.1</a>'
            );

            expect(emailMatch.getType()).to.equal('email'); // backward compatibility method - 'type' property replaces getType()
            expect(emailMatch.getMatchedText()).to.equal('asdf@asdf.com');
            expect(emailMatch.getOffset()).to.equal(135);
            expect(emailMatch.getAnchorHref()).to.equal('mailto:asdf@asdf.com');
            expect(emailMatch.getAnchorText()).to.equal('asdf@asdf.com');
            expect(emailMatch.getCssClassSuffixes()).to.deep.equal(['email']);
            expect(emailMatch.getEmail()).to.equal('asdf@asdf.com');
            expect(emailMatch.buildTag().toAnchorString()).to.equal(
                '<a href="mailto:asdf@asdf.com">asdf@asdf.com</a>'
            );

            expect(phoneMatch.getType()).to.equal('phone'); // backward compatibility method - 'type' property replaces getType()
            expect(phoneMatch.getMatchedText()).to.equal('(123) 456-7890');
            expect(phoneMatch.getOffset()).to.equal(156);
            expect(phoneMatch.getAnchorHref()).to.equal('tel:1234567890');
            expect(phoneMatch.getAnchorText()).to.equal('(123) 456-7890');
            expect(phoneMatch.getCssClassSuffixes()).to.deep.equal(['phone']);
            expect(phoneMatch.getPhoneNumber()).to.equal('1234567890');
            expect(phoneMatch.getNumber()).to.equal('1234567890');
            expect(phoneMatch.buildTag().toAnchorString()).to.equal(
                '<a href="tel:1234567890">(123) 456-7890</a>'
            );

            expect(mentionMatch.getType()).to.equal('mention'); // backward compatibility method - 'type' property replaces getType()
            expect(mentionMatch.getMatchedText()).to.equal('@asdf1');
            expect(mentionMatch.getOffset()).to.equal(180);
            expect(mentionMatch.getAnchorHref()).to.equal('https://instagram.com/asdf1');
            expect(mentionMatch.getAnchorText()).to.equal('@asdf1');
            expect(mentionMatch.getCssClassSuffixes()).to.deep.equal(['mention', 'instagram']);
            expect(mentionMatch.getServiceName()).to.equal('instagram');
            expect(mentionMatch.buildTag().toAnchorString()).to.equal(
                '<a href="https://instagram.com/asdf1">@asdf1</a>'
            );

            expect(hashtagMatch.getType()).to.equal('hashtag'); // backward compatibility method - 'type' property replaces getType()
            expect(hashtagMatch.getMatchedText()).to.equal('#asdf2');
            expect(hashtagMatch.getOffset()).to.equal(201);
            expect(hashtagMatch.getAnchorHref()).to.equal('https://www.tiktok.com/tag/asdf2');
            expect(hashtagMatch.getAnchorText()).to.equal('#asdf2');
            expect(hashtagMatch.getCssClassSuffixes()).to.deep.equal(['hashtag', 'tiktok']);
            expect(hashtagMatch.getServiceName()).to.equal('tiktok');
            expect(hashtagMatch.buildTag().toAnchorString()).to.equal(
                '<a href="https://www.tiktok.com/tag/asdf2">#asdf2</a>'
            );
        });
    });
});
