import _ from 'lodash';
import Autolinker from '../src/autolinker';
import { MentionService } from '../src/parser/mention-utils';
import { generateLinkTests } from './util/generate-link-tests';

describe('Autolinker Mention Matching >', () => {
    const twitterAutolinker = new Autolinker({
        mention: 'twitter',
        newWindow: false,
    });
    const instagramAutolinker = new Autolinker({
        mention: 'instagram',
        newWindow: false,
    });
    const soundcloudAutolinker = new Autolinker({
        mention: 'soundcloud',
        newWindow: false,
    });
    const tiktokAutolinker = new Autolinker({
        mention: 'tiktok',
        newWindow: false,
    });

    const services: MentionTestService[] = [
        {
            serviceName: 'twitter',
            urlPrefix: 'https://twitter.com/',
            autolinker: twitterAutolinker,
        },
        {
            serviceName: 'instagram',
            urlPrefix: 'https://instagram.com/',
            autolinker: instagramAutolinker,
        },
        {
            serviceName: 'soundcloud',
            urlPrefix: 'https://soundcloud.com/',
            autolinker: soundcloudAutolinker,
        },
        {
            serviceName: 'tiktok',
            urlPrefix: 'https://www.tiktok.com/@',
            autolinker: tiktokAutolinker,
        },
    ];

    interface MentionTestService {
        serviceName: MentionService;
        urlPrefix: string;
        autolinker: Autolinker;
    }

    it(`should not autolink mentions by default`, () => {
        let autolinker = new Autolinker({ newWindow: false });
        expect(autolinker.link('@test')).toBe('@test');
    });

    it(`should not autolink a mentions found as part of an email address`, () => {
        let autolinker = new Autolinker({ newWindow: false, mention: 'twitter', email: false });
        expect(autolinker.link('asdf@test.com')).toBe('asdf@test.com');
    });

    describe('all service tests >', () => {
        services.forEach(service => {
            const { serviceName, urlPrefix, autolinker } = service;

            describe(`service: ${serviceName} >`, () => {
                generateLinkTests([
                    {
                        input: '@joe',
                        description: 'basic mention',
                        expectedHref: `${urlPrefix}joe`,
                        autolinker,
                    },
                    {
                        input: '@joe_the_man12',
                        description: 'mention with underscores',
                        expectedHref: `${urlPrefix}joe_the_man12`,
                        autolinker,
                    },
                ]);

                it(`should NOT automatically link username handles with accented characters for ${serviceName} because non-ascii-letter characters are not allowed`, () => {
                    let result = autolinker.link(`Hello @mañana how are you?`);

                    expect(result).toBe(`Hello @mañana how are you?`);
                });

                it(`should NOT automatically link username handles with cyrillic characters for service ${serviceName} because non-ascii-letter characters are not allowed`, () => {
                    let result = autolinker.link(`Hello @Кириллица how are you?`);

                    expect(result).toBe(`Hello @Кириллица how are you?`);
                });

                it(`should NOT automatically link a mention when the '@' belongs to part of another string`, () => {
                    let result = autolinker.link(`test as@df test`);

                    expect(result).toBe(`test as@df test`);
                });
            });
        });
    });

    describe('twitter-specific tests', () => {
        it('should link a twitter mention that is up to 15 characters long', () => {
            const aUsername = _.repeat('a', 15);
            const bUsername = _.repeat('b', 16); // too long - don't link

            const result = twitterAutolinker.link(`@${aUsername} and @${bUsername}`);
            expect(result).toBe(
                `<a href="https://twitter.com/${aUsername}">@${aUsername}</a> and @${bUsername}`
            );
        });

        it(`should not link a twitter mention that has a period in it`, () => {
            const result = twitterAutolinker.link(`Hello @asdf.defg`);

            expect(result).toBe(`Hello @asdf.defg`);
        });

        it(`should link fully capitalized twitter handles`, () => {
            let result = twitterAutolinker.link(`@GREG is tweeting @JOE with @JOSH`);

            expect(result).toBe(
                `<a href="https://twitter.com/GREG">@GREG</a> is tweeting <a href="https://twitter.com/JOE">@JOE</a> with <a href="https://twitter.com/JOSH">@JOSH</a>`
            );
        });
    });

    describe('instagram-specific tests', () => {
        it('should link an instagram mention that is up to 30 characters long', () => {
            const aUsername = _.repeat('a', 30);
            const bUsername = _.repeat('b', 31); // too long - don't link

            const result = instagramAutolinker.link(`@${aUsername} and @${bUsername}`);
            expect(result).toBe(
                `<a href="https://instagram.com/${aUsername}">@${aUsername}</a> and @${bUsername}`
            );
        });

        it(`should link an instagram mention that has an underscore in it`, () => {
            const result = instagramAutolinker.link(`Hello @asdf_defg`);

            expect(result).toBe(`Hello <a href="https://instagram.com/asdf_defg">@asdf_defg</a>`);
        });

        it(`should link fully capitalized instagram handles`, () => {
            let result = instagramAutolinker.link(`@GREG is tweeting @JOE with @JOSH`);

            expect(result).toBe(
                `<a href="https://instagram.com/GREG">@GREG</a> is tweeting <a href="https://instagram.com/JOE">@JOE</a> with <a href="https://instagram.com/JOSH">@JOSH</a>`
            );
        });
    });

    describe('soundcloud-specific tests', () => {
        it('should link a soundcloud mention that is up to 25 characters long', () => {
            const aUsername = _.repeat('a', 25);
            const bUsername = _.repeat('b', 26); // too long - don't link

            const result = soundcloudAutolinker.link(`@${aUsername} and @${bUsername}`);
            expect(result).toBe(
                `<a href="https://soundcloud.com/${aUsername}">@${aUsername}</a> and @${bUsername}`
            );
        });

        it(`should link a soundcloud mention that has dashes in it`, () => {
            const result = soundcloudAutolinker.link(`Hello @asdf-defg`);

            expect(result).toBe(`Hello <a href="https://soundcloud.com/asdf-defg">@asdf-defg</a>`);
        });

        it(`should NOT link a soundcloud mention that has a period in it`, () => {
            const result = soundcloudAutolinker.link(`Hello @asdf.defg`);

            expect(result).toBe(`Hello @asdf.defg`);
        });

        it(`should NOT link capitalized soundcloud handles (soundcloud must be all lowercase)`, () => {
            let result = soundcloudAutolinker.link(`@GREG is tweeting @JOE with @JOSH`);

            expect(result).toBe(`@GREG is tweeting @JOE with @JOSH`);
        });
    });

    describe('tiktok-specific tests', () => {
        it('should link a tiktok mention that is up to 24 characters long', () => {
            const aUsername = _.repeat('a', 24);
            const bUsername = _.repeat('b', 25); // too long - don't link

            const result = tiktokAutolinker.link(`@${aUsername} and @${bUsername}`);
            expect(result).toBe(
                `<a href="https://www.tiktok.com/@${aUsername}">@${aUsername}</a> and @${bUsername}`
            );
        });

        it(`should link to an all all alpha username`, () => {
            const result = tiktokAutolinker.link(`Hello @shewhocannot`);

            expect(result).toBe(
                `Hello <a href="https://www.tiktok.com/@shewhocannot">@shewhocannot</a>`
            );
        });

        it(`should link a tiktok mention that has a period in it`, () => {
            const result = tiktokAutolinker.link(`Hello @asdf.defg`);

            expect(result).toBe(`Hello <a href="https://www.tiktok.com/@asdf.defg">@asdf.defg</a>`);
        });

        it(`should not include a trailing period in the username since tiktok usernames are not allowed to end in a period`, () => {
            const result = tiktokAutolinker.link(`Hello @asdf_fdsa.`);

            expect(result).toBe(
                `Hello <a href="https://www.tiktok.com/@asdf_fdsa">@asdf_fdsa</a>.`
            );
        });

        it(`should link fully capitalized twitter handles`, () => {
            let result = tiktokAutolinker.link(`@GREG is tweeting @JOE with @JOSH`);

            expect(result).toBe(
                `<a href="https://www.tiktok.com/@GREG">@GREG</a> is tweeting <a href="https://www.tiktok.com/@JOE">@JOE</a> with <a href="https://www.tiktok.com/@JOSH">@JOSH</a>`
            );
        });
    });

    it(`should NOT automatically link a username that is actually part of an email address when email address linking is turned on`, () => {
        let emailAutolinker = new Autolinker({
            email: true,
            mention: 'twitter',
            newWindow: false,
        });
        let result = emailAutolinker.link('asdf@asdf.com');

        expect(result).toBe('<a href="mailto:asdf@asdf.com">asdf@asdf.com</a>');
    });

    it(`should NOT automatically link a username that is actually part of an 
		 email address when email address linking is turned *off*
	`, () => {
        let noEmailAutolinker = new Autolinker({
            email: false,
            mention: 'twitter',
            newWindow: false,
        });
        let result = noEmailAutolinker.link('asdf@asdf.com');

        expect(result).toBe('asdf@asdf.com');
    });
});
