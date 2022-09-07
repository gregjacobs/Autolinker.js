import Autolinker from '../../src/autolinker';
import { braceChars } from './braces';
import { punctuationChars } from './punctuation';

/**
 * Utility function to generate tests that check matches at the beginning,
 * middle, and end of strings, combined with a series of brace and punctuation
 * differences.
 */
export function generateLinkTests(testCases: TestCase[]) {
    testCases.forEach(
        ({
            input,
            description,
            expectedHref,
            expectedAnchorText,
            expectedAfterAnchorText = '',
            autolinker,
        }) => {
            const expectedAnchor = `<a href="${expectedHref}">${
                expectedAnchorText || input
            }</a>${expectedAfterAnchorText}`;

            braceChars.forEach(({ openBrace, closeBrace }) => {
                describe(`surrounding brace chars: '${openBrace}' '${closeBrace}' >`, () => {
                    punctuationChars.forEach(punctuationChar => {
                        describe(`punctuation char '${punctuationChar}' >`, () => {
                            const inputText = `${openBrace}${input}${punctuationChar}${closeBrace}`;
                            const expectedText = `${openBrace}${expectedAnchor}${punctuationChar}${closeBrace}`;

                            it(`when it's the only text in the string, properly links '${inputText}' (${description})`, () => {
                                const result = autolinker.link(inputText);
                                expect(result).toBe(expectedText);
                            });

                            it(`when at the beginning of the string, links '${input}' (${description})`, () => {
                                const result = autolinker.link(`${inputText} is where Joe went`);
                                expect(result).toBe(`${expectedText} is where Joe went`);
                            });

                            it(`when in the middle of the string, links '${input}' (${description})`, () => {
                                const result = autolinker.link(
                                    `The link ${inputText} is where Joe went`
                                );
                                expect(result).toBe(`The link ${expectedText} is where Joe went`);
                            });

                            it(`when at the end of a string, links '${input}' (${description})`, () => {
                                const result = autolinker.link(`Joe went to ${inputText}`);
                                expect(result).toBe(`Joe went to ${expectedText}`);
                            });

                            it(`when appearing multiple times in the string (beginning, middle, and end), links '${input}' (${description})`, () => {
                                const result = autolinker.link(
                                    `${inputText} is a link to ${inputText} and ${inputText}`
                                );
                                expect(result).toBe(
                                    `${expectedText} is a link to ${expectedText} and ${expectedText}`
                                );
                            });
                        });
                    });
                });
            });
        }
    );
}

interface TestCase {
    input: string;
    description: string;
    expectedHref: string;
    expectedAnchorText?: string; // if not provided, `input` is used instead
    expectedAfterAnchorText?: string; // if part of the input shouldn't be included in the anchor tag itself, this is the text that will be expected after the </a>
    autolinker: Autolinker;
}
