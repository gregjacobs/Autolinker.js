import { expect } from 'chai';
import _ from 'lodash';
import Autolinker from '../src/autolinker';
import { HashtagService } from '../src/parser/hashtag-utils';
import { generateLinkTests } from './util/generate-link-tests';

describe(`Hashtag Matching >`, () => {
    const noDefaultHashtagAutolinker = new Autolinker({ newWindow: false });
    const twitterAutolinker = new Autolinker({
        hashtag: 'twitter',
        newWindow: false,
    });
    const facebookAutolinker = new Autolinker({
        hashtag: 'facebook',
        newWindow: false,
    });
    const instagramAutolinker = new Autolinker({
        hashtag: 'instagram',
        newWindow: false,
    });
    const tiktokAutolinker = new Autolinker({
        hashtag: 'tiktok',
        newWindow: false,
    });
    const youtubeAutolinker = new Autolinker({
        hashtag: 'youtube',
        newWindow: false,
    });

    const services: HashtagTestService[] = [
        {
            serviceName: 'twitter',
            urlPrefix: 'https://twitter.com/hashtag',
            autolinker: twitterAutolinker,
        },
        {
            serviceName: 'instagram',
            urlPrefix: 'https://instagram.com/explore/tags',
            autolinker: instagramAutolinker,
        },
        {
            serviceName: 'facebook',
            urlPrefix: 'https://www.facebook.com/hashtag',
            autolinker: facebookAutolinker,
        },
        {
            serviceName: 'tiktok',
            urlPrefix: 'https://www.tiktok.com/tag',
            autolinker: tiktokAutolinker,
        },
        {
            serviceName: 'youtube',
            urlPrefix: 'https://youtube.com/hashtag',
            autolinker: youtubeAutolinker,
        },
    ];

    interface HashtagTestService {
        serviceName: HashtagService;
        urlPrefix: string;
        autolinker: Autolinker;
    }

    it(`should NOT autolink hashtags by default for both backward compatibility, 
		 and because we don't know which service (twitter, facebook, etc.) to 
		 point them to`, () => {
        expect(noDefaultHashtagAutolinker.link(`#test`)).to.equal(`#test`);
    });

    it(`should NOT autolink hashtags the 'hashtag' cfg is explicitly false`, () => {
        const result = Autolinker.link(`#test`, { hashtag: false });

        expect(result).to.equal(`#test`);
    });

    describe('all services tests >', () => {
        services.forEach(service => {
            const { serviceName, urlPrefix, autolinker } = service;

            describe(`service: '${serviceName} >'`, () => {
                generateLinkTests([
                    {
                        input: '#test',
                        description: 'basic hashtag should link',
                        expectedHref: `${urlPrefix}/test`,
                        autolinker,
                    },
                    {
                        input: '#has_underscores',
                        description: 'hashtag with underscores should link',
                        expectedHref: `${urlPrefix}/has_underscores`,
                        autolinker,
                    },
                    {
                        input: '#mañana',
                        description: 'hashtag with accent chars',
                        expectedHref: `${urlPrefix}/mañana`,
                        autolinker,
                    },
                    {
                        input: '#Кириллица',
                        description: 'hashtag with cyrillic chars',
                        expectedHref: `${urlPrefix}/Кириллица`,
                        autolinker,
                    },
                ]);

                it(`should link a hashtag that is up to 139 characters long`, () => {
                    const aHashtag = _.repeat('a', 139);
                    const bHashtag = _.repeat('b', 140); // too long - don't link

                    const result = autolinker.link(`#${aHashtag} and #${bHashtag}`);
                    expect(result).to.equal(
                        `<a href="${urlPrefix}/${aHashtag}">#${aHashtag}</a> and #${bHashtag}`
                    );
                });

                it(`should automatically link multiple hashtags separated by slashes`, () => {
                    const result = autolinker.link(`#Stuff/#Things`);
                    expect(result).to.equal(
                        `<a href="${urlPrefix}/Stuff">#Stuff</a>/<a href="${urlPrefix}/Things">#Things</a>`
                    );
                });

                it(`should NOT automatically link a hashtag when the '#' belongs to part of another string`, () => {
                    const result = autolinker.link(`test as#df test`);

                    expect(result).to.equal(`test as#df test`);
                });

                it(`should NOT automatically link a hash symbol followed by another hash symbol`, () => {
                    const result = autolinker.link(`Hello ## stuff`);

                    expect(result).to.equal(`Hello ## stuff`);
                });

                it(`should NOT automatically link a hashtag that is actually a named anchor within a URL`, () => {
                    const result = autolinker.link(`http://google.com/#link`);

                    expect(result).to.equal(
                        `<a href="http://google.com/#link">google.com/#link</a>`
                    );
                });

                it(`should NOT automatically link a hashtag that is actually a 
				    named anchor within a URL **when URL linking is turned off**`, () => {
                    const noUrlTwitterHashtagAutolinker = new Autolinker({
                        urls: false,
                        hashtag: serviceName,
                        newWindow: false,
                    });
                    const result = noUrlTwitterHashtagAutolinker.link(`http://google.com/#link`);

                    expect(result).to.equal(`http://google.com/#link`);
                });
            });
        });
    });
});
