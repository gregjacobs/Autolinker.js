import { HashtagMatcher } from '../../src/matcher/hashtag-matcher';
import { MatchChecker } from '../match/match-checker';

describe('Autolinker.matcher.Hashtag', function () {
    let matcher: HashtagMatcher;

    beforeEach(function () {
        matcher = new HashtagMatcher({
            service: 'twitter',
        });
    });

    describe('`service` cfg', function () {
        it('should throw if `hashtag` is a value other than `false` or one of the valid service names', function () {
            expect(function () {
                new HashtagMatcher({ service: true } as any); // `true` is an invalid value - must be a service name
            }).toThrowError("HashtagMatcher: invalid `service` cfg 'true' - see docs");

            expect(function () {
                new HashtagMatcher({ service: 'non-existent-service' } as any);
            }).toThrowError(
                "HashtagMatcher: invalid `service` cfg 'non-existent-service' - see docs"
            );
        });

        it("should not throw for the valid service name 'twitter'", function () {
            expect(function () {
                new HashtagMatcher({ service: 'twitter' });
            }).not.toThrow();
        });

        it("should not throw for the valid service name 'facebook'", function () {
            expect(function () {
                new HashtagMatcher({ service: 'facebook' });
            }).not.toThrow();
        });

        it("should not throw for the valid service name 'instagram'", function () {
            expect(function () {
                new HashtagMatcher({ service: 'instagram' });
            }).not.toThrow();
        });

        it("should not throw for the valid service name 'tiktok'", function () {
            expect(function () {
                new HashtagMatcher({ service: 'tiktok' });
            }).not.toThrow();
        });
    });

    describe('parseMatches()', function () {
        it('should return an empty array if there are no matches for hashtags', function () {
            expect(matcher.parseMatches('')).toEqual([]);
            expect(matcher.parseMatches('asdf')).toEqual([]);
            expect(matcher.parseMatches('asdf#asdf.com')).toEqual([]);
        });

        it('should return an array of a single hashtag match when the string is the hashtag itself', function () {
            let matches = matcher.parseMatches('#asdf');

            expect(matches.length).toBe(1);
            MatchChecker.expectHashtagMatch(matches[0], 'twitter', 'asdf', 0);
        });

        it('should return an array of a single hashtag match when the hashtag is in the middle of the string', function () {
            let matches = matcher.parseMatches('Hello #asdf my good friend');

            expect(matches.length).toBe(1);
            MatchChecker.expectHashtagMatch(matches[0], 'twitter', 'asdf', 6);
        });

        it('should return an array of a single hashtag match when the hashtag is at the end of the string', function () {
            let matches = matcher.parseMatches('Hello #asdf');

            expect(matches.length).toBe(1);
            MatchChecker.expectHashtagMatch(matches[0], 'twitter', 'asdf', 6);
        });

        it('should return an array of multiple hashtags when there are more than one within the string', function () {
            let matches = matcher.parseMatches('Talk to #asdf or #fdsa');

            expect(matches.length).toBe(2);
            MatchChecker.expectHashtagMatch(matches[0], 'twitter', 'asdf', 8);
            MatchChecker.expectHashtagMatch(matches[1], 'twitter', 'fdsa', 17);
        });

        it('a match within parenthesis should be parsed correctly', function () {
            let matches = matcher.parseMatches('Hello (#asdf)');

            expect(matches.length).toBe(1);
            MatchChecker.expectHashtagMatch(matches[0], 'twitter', 'asdf', 7);
        });
    });
});
