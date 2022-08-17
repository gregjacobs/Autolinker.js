import { EmailMatcher } from '../../src/matcher/email-matcher';
import { MatchChecker } from '../match/match-checker';

describe('Autolinker.matcher.Email', () => {
    let matcher: EmailMatcher;

    beforeEach(() => {
        matcher = new EmailMatcher();
    });

    describe('parseMatches()', () => {
        it('should return an empty array if there are no matches for email addresses', () => {
            expect(matcher.parseMatches('')).toEqual([]);
            expect(matcher.parseMatches('asdf')).toEqual([]);
            expect(matcher.parseMatches('@asdf')).toEqual([]);
            expect(matcher.parseMatches('Hello @asdf.com')).toEqual([]); // not a valid email address
        });

        it('should return an array of a single email address match when the string is the email address itself', () => {
            let matches = matcher.parseMatches('asdf@asdf.com');

            expect(matches.length).toBe(1);
            MatchChecker.expectEmailMatch(matches[0], 'asdf@asdf.com', 0);
        });

        it('should return an array of a single email address match when the email address is at the start of the string', () => {
            let matches = matcher.parseMatches('asdf@asdf.com is my good friend');

            expect(matches.length).toBe(1);
            MatchChecker.expectEmailMatch(matches[0], 'asdf@asdf.com', 0);
        });

        it('should return an array of a single email address match when the email address is in the middle of the string', () => {
            let matches = matcher.parseMatches('Hello asdf@asdf.com my good friend');

            expect(matches.length).toBe(1);
            MatchChecker.expectEmailMatch(matches[0], 'asdf@asdf.com', 6);
        });

        it('should return an array of a single email address match when the email address is at the end of the string', () => {
            let matches = matcher.parseMatches('Hello asdf@asdf.com');

            expect(matches.length).toBe(1);
            MatchChecker.expectEmailMatch(matches[0], 'asdf@asdf.com', 6);
        });

        it('should return a single email address match when an email address has two dot characters following it', () => {
            let matches = matcher.parseMatches('asdf@asdf.com..');

            expect(matches.length).toBe(1);
            MatchChecker.expectEmailMatch(matches[0], 'asdf@asdf.com', 0);
        });

        it('should return a single email address match when an email address has three dot characters following it', () => {
            let matches = matcher.parseMatches('asdf@asdf.com...');

            expect(matches.length).toBe(1);
            MatchChecker.expectEmailMatch(matches[0], 'asdf@asdf.com', 0);
        });

        it('should return an array of multiple email addresses when there are more than one within the string', () => {
            let matches = matcher.parseMatches('Talk to asdf@asdf.com or fdsa@fdsa.com');

            expect(matches.length).toBe(2);
            MatchChecker.expectEmailMatch(matches[0], 'asdf@asdf.com', 8);
            MatchChecker.expectEmailMatch(matches[1], 'fdsa@fdsa.com', 25);
        });

        it('a match within parenthesis should be parsed correctly', () => {
            let matches = matcher.parseMatches('Hello (asdf@asdf.com)');

            expect(matches.length).toBe(1);
            MatchChecker.expectEmailMatch(matches[0], 'asdf@asdf.com', 7);
        });

        it('should match correctly when the email address is uppercase', () => {
            let matches = matcher.parseMatches('Hello ASDF@ASDF.COM');

            expect(matches.length).toBe(1);
            MatchChecker.expectEmailMatch(matches[0], 'ASDF@ASDF.COM', 6);
        });

        it('a match with underscores should be parsed correctly', () => {
            let matches = matcher.parseMatches('Hello asdf_fdsa_asdf@asdf.com');

            expect(matches.length).toBe(1);
            MatchChecker.expectEmailMatch(matches[0], 'asdf_fdsa_asdf@asdf.com', 6);
        });

        it("a match with an ' should be parsed correctly", () => {
            let matches = matcher.parseMatches("o'donnel@asdf.com");

            expect(matches.length).toBe(1);
            MatchChecker.expectEmailMatch(matches[0], "o'donnel@asdf.com", 0);
        });

        it(`when a dot exists in front of the email address, the email address
			 should be parsed without the dot`, () => {
            let matches = matcher.parseMatches('Hello .asdf@asdf.com');

            expect(matches.length).toBe(1);
            MatchChecker.expectEmailMatch(matches[0], 'asdf@asdf.com', 7);
        });

        it(`when a dot exists at the end of the email address, the dot should 
		     not be included`, () => {
            let matches = matcher.parseMatches('Hello asdf@asdf.com.');

            expect(matches.length).toBe(1);
            MatchChecker.expectEmailMatch(matches[0], 'asdf@asdf.com', 6);
        });

        it(`when a dot exists at the end of the sentence ended by an email 
		     address, the dot should not be included`, () => {
            let matches = matcher.parseMatches('Hello asdf@asdf.com. How are you?');

            expect(matches.length).toBe(1);
            MatchChecker.expectEmailMatch(matches[0], 'asdf@asdf.com', 6);
        });

        it(`when a hypen exists at the end of the email address, the hypen 
		     should not be included`, () => {
            let matches = matcher.parseMatches('Hello asdf@asdf.com- how are you?');

            expect(matches.length).toBe(1);
            MatchChecker.expectEmailMatch(matches[0], 'asdf@asdf.com', 6);
        });

        it(`when two hypens exist in the domain portion of the email address,
		     but not next to each other, it should be considered a match`, () => {
            let matches = matcher.parseMatches('Hello asdf@as-df-gh.com');

            expect(matches.length).toBe(1);
            MatchChecker.expectEmailMatch(matches[0], 'asdf@as-df-gh.com', 6);
        });

        it(`when a domain has 3 (or more) parts, should be considered a match`, () => {
            let matches = matcher.parseMatches('Hello asdf@asdf.fdsa.com');

            expect(matches.length).toBe(1);
            MatchChecker.expectEmailMatch(matches[0], 'asdf@asdf.fdsa.com', 6);
        });

        it(`when two consecutive dots exist in the domain portion of 
		     the email address, it should not be considered a match`, () => {
            let matches = matcher.parseMatches('Hello asdf@as..df.com');

            expect(matches.length).toBe(0);
        });

        it(`when two consecutive hypens exist in the domain portion of 
		     the email address, it should not be considered a match`, () => {
            let matches = matcher.parseMatches('Hello asdf@as--df.com');

            expect(matches.length).toBe(0);
        });

        it(`when two hypens exist in the domain portion of the email address
			 which already has a valid domain name, the part before the two 
			 hypens should should not be considered a match`, () => {
            let matches = matcher.parseMatches('Hello asdf@asdf.com--somethingelse.com');

            expect(matches.length).toBe(1);
            MatchChecker.expectEmailMatch(matches[0], 'asdf@asdf.com', 6);
        });

        it('should *not* match email with incorrect domain beginning with "-"', () => {
            var matches = matcher.parseMatches('asdf@-asdf.com');

            expect(matches.length).toBe(0);
        });

        it('should *not* match email with incorrect domain ending with "-"', () => {
            var matches = matcher.parseMatches('asdf@asdf-.com');

            expect(matches.length).toBe(0);
        });

        it('should *not* match email with incorrect domain beginning with "."', () => {
            var matches = matcher.parseMatches('asdf@.asdf.com');

            expect(matches.length).toBe(0);
        });

        it('should *not* match email with incorrect local part beginning with "."', () => {
            var matches = matcher.parseMatches('.asdf@asdf.com');

            expect(matches.length).toBe(1);
            MatchChecker.expectEmailMatch(matches[0], 'asdf@asdf.com', 1);
        });

        it('should *not* match email with incorrect local part ending with "."', () => {
            var matches = matcher.parseMatches('asdf.@asdf.com');

            expect(matches.length).toBe(0);
        });

        it('should match email skipping incorrect local part tailing with ".."', () => {
            var matches = matcher.parseMatches('asdf..asdf@asdf.com');

            expect(matches.length).toBe(1);
            MatchChecker.expectEmailMatch(matches[0], 'asdf@asdf.com', 6);
        });

        it('when a match is prefixed with `mailto:`, should include that in the match (via the offset)', () => {
            let matches = matcher.parseMatches('Hello mailto:asdf@asdf.com');

            expect(matches.length).toBe(1);
            MatchChecker.expectEmailMatch(matches[0], 'asdf@asdf.com', 6);
            expect(matches[0].getMatchedText()).toBe('mailto:asdf@asdf.com');
        });

        it(
            'when a match is prefixed with `mailto` *without* a colon and it ' +
                'is a valid email address, should match it',
            () => {
                let matches = matcher.parseMatches('Hello mailtoasdf@asdf.com');

                expect(matches.length).toBe(1);
                MatchChecker.expectEmailMatch(matches[0], 'mailtoasdf@asdf.com', 6);
            }
        );

        it(
            'when a match is simply the string `mailto:` *without* any characters ' +
                'after it, should not match it',
            () => {
                let matches = matcher.parseMatches('Hello mailto: other stuff');

                expect(matches.length).toBe(0);
            }
        );

        it(
            'when a match is the string `mailto:@something.com`, should not ' +
                'match it as it is invalid',
            () => {
                let matches = matcher.parseMatches('Hello mailto:@asdf.com');

                expect(matches.length).toBe(0);
            }
        );

        'mailto'.split('').forEach((char, idx) => {
            const partialMailto = 'mailto'.substring(0, idx + 1);

            it(
                `when a match is prefixed with a partial of 'mailto:' ('${partialMailto}') ` +
                    `and it is a valid email address, should match it`,
                () => {
                    let matches = matcher.parseMatches(`Hello ${partialMailto}@asdf.com`);

                    expect(matches.length).toBe(1);
                    MatchChecker.expectEmailMatch(matches[0], `${partialMailto}@asdf.com`, 6);
                }
            );

            it(
                `when a match is prefixed with a partial of 'mailto:' ('${partialMailto}') ` +
                    `with other valid email address characters after it, and it is a valid ` +
                    `email address, should match it`,
                () => {
                    let matches = matcher.parseMatches(`Hello ${partialMailto}asdf@asdf.com`);

                    expect(matches.length).toBe(1);
                    MatchChecker.expectEmailMatch(matches[0], `${partialMailto}asdf@asdf.com`, 6);
                }
            );

            it(
                `when a match is prefixed with a partial of 'mailto:' ('${partialMailto}') ` +
                    `with a dot after it (a valid email address character), and it is a valid ` +
                    `email address, should match it`,
                () => {
                    let matches = matcher.parseMatches(`Hello ${partialMailto}.asdf@asdf.com`);

                    expect(matches.length).toBe(1);
                    MatchChecker.expectEmailMatch(matches[0], `${partialMailto}.asdf@asdf.com`, 6);
                }
            );

            it(
                `when a match is prefixed with a partial of 'mailto:' ('${partialMailto}') ` +
                    `but then a space is encountered to end the email address, should not match it`,
                () => {
                    let matches = matcher.parseMatches(`Hello ${partialMailto} asdf.com`);

                    expect(matches.length).toBe(0);
                }
            );
        });
    });
});
