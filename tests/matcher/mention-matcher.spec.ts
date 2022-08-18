import { MentionMatcher } from '../../src/matcher/mention-matcher';
import { MatchChecker } from '../match/match-checker';

describe('Autolinker.matcher.Mention', function () {
    let matcher: MentionMatcher;

    beforeEach(function () {
        matcher = new MentionMatcher({
            service: 'twitter',
        });
    });

    describe('`service` cfg', function () {
        it('should throw if `mention` is a value other than `false` or one of the valid service names', function () {
            expect(function () {
                new MentionMatcher({ service: true } as any); // `true` is an invalid value - must be a service name
            }).toThrowError("MentionMatcher: invalid `service` cfg 'true' - see docs");

            expect(function () {
                new MentionMatcher({ service: 'non-existent-service' } as any);
            }).toThrowError(
                "MentionMatcher: invalid `service` cfg 'non-existent-service' - see docs"
            );
        });

        it("should not throw for the valid service name 'twitter'", function () {
            expect(function () {
                new MentionMatcher({ service: 'twitter' });
            }).not.toThrow();
        });

        it("should not throw for the valid service name 'instagram'", function () {
            expect(function () {
                new MentionMatcher({ service: 'instagram' });
            }).not.toThrow();
        });

        it("should not throw for the valid service name 'soundcloud'", function () {
            expect(function () {
                new MentionMatcher({ service: 'soundcloud' });
            }).not.toThrow();
        });

        it("should not throw for the valid service name 'tiktok'", function () {
            expect(function () {
                new MentionMatcher({ service: 'tiktok' });
            }).not.toThrow();
        });
    });

    describe('parseMatches()', function () {
        it('should return an empty array if there are no matches for usernames', function () {
            expect(matcher.parseMatches('')).toEqual([]);
            expect(matcher.parseMatches('asdf')).toEqual([]);
            expect(matcher.parseMatches('asdf@asdf.com')).toEqual([]); // an email address is not a username
            expect(matcher.parseMatches('stuff@asdf')).toEqual([]); // using an '@' symbol as part of a word is not a username
        });

        it('should return an array of a single username match when the string is the username itself', function () {
            let matches = matcher.parseMatches('@asdf');

            expect(matches.length).toBe(1);
            MatchChecker.expectMentionMatch(matches[0], 'twitter', 'asdf', 0);
        });

        it('should return an array of a single username match when the username is in the middle of the string', function () {
            let matches = matcher.parseMatches('Hello @asdf my good friend');

            expect(matches.length).toBe(1);
            MatchChecker.expectMentionMatch(matches[0], 'twitter', 'asdf', 6);
        });

        it('should return an array of a single username match when the username is at the end of the string', function () {
            let matches = matcher.parseMatches('Hello @asdf');

            expect(matches.length).toBe(1);
            MatchChecker.expectMentionMatch(matches[0], 'twitter', 'asdf', 6);
        });

        it('should return an array of multiple usernames when there are more than one within the string', function () {
            let matches = matcher.parseMatches('Talk to @asdf or @fdsa');

            expect(matches.length).toBe(2);
            MatchChecker.expectMentionMatch(matches[0], 'twitter', 'asdf', 8);
            MatchChecker.expectMentionMatch(matches[1], 'twitter', 'fdsa', 17);
        });

        it('a match within parenthesis should be parsed correctly', function () {
            let matches = matcher.parseMatches('Hello (@asdf)');

            expect(matches.length).toBe(1);
            MatchChecker.expectMentionMatch(matches[0], 'twitter', 'asdf', 7);
        });

        it('an Instagram username with period not at boundaries should be parsed correctly', function () {
            let instagramMatcher = new MentionMatcher({
                service: 'instagram',
            });
            let matches = instagramMatcher.parseMatches('Hello (@as.df)');

            expect(matches.length).toBe(1);
            MatchChecker.expectMentionMatch(matches[0], 'instagram', 'as.df', 7);
        });

        it('an Instagram username with period at end of string should ignore period', function () {
            let instagramMatcher = new MentionMatcher({
                service: 'instagram',
            });
            let matches = instagramMatcher.parseMatches('Hello (@asdf.)');

            expect(matches.length).toBe(1);
            MatchChecker.expectMentionMatch(matches[0], 'instagram', 'asdf', 7);
        });

        it('an soundcloud username with dashes not at boundaries should be parsed correctly', function () {
            var soundcloudMatcher = new MentionMatcher({
                service: 'soundcloud',
            });
            var matches = soundcloudMatcher.parseMatches('Hello (@as-df)');

            expect(matches.length).toBe(1);
            MatchChecker.expectMentionMatch(matches[0], 'soundcloud', 'as-df', 7);
        });
    });
});
