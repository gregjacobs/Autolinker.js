// NOTE: THIS FILE IS GENERATED. DO NOT EDIT.
// INSTEAD, RUN: npm run generate-char-utils

import { expect } from 'chai';
import { isAsciiLetterChar, isDigitChar, isQuoteChar, isWhitespaceChar } from '../src/char-utils';

describe('isAsciiLetterChar()', () => {
    it(`should appropriately return true/false to match the regular expression /[A-Za-z]/`, () => {
        for (let charCode = 0; charCode < 65535; charCode++) {
            const char = String.fromCharCode(charCode);
            const fnResult = isAsciiLetterChar(charCode);
            const regExpResult = /[A-Za-z]/.test(char);

            expect(fnResult).to.equal(
                regExpResult,
                `Expected charCode ${charCode} (${char}) to return ${regExpResult}, but returned ${fnResult}`
            );
        }
    });
});

describe('isDigitChar()', () => {
    it(`should appropriately return true/false to match the regular expression /\\d/`, () => {
        for (let charCode = 0; charCode < 65535; charCode++) {
            const char = String.fromCharCode(charCode);
            const fnResult = isDigitChar(charCode);
            const regExpResult = /\d/.test(char);

            expect(fnResult).to.equal(
                regExpResult,
                `Expected charCode ${charCode} (${char}) to return ${regExpResult}, but returned ${fnResult}`
            );
        }
    });
});

describe('isQuoteChar()', () => {
    it(`should appropriately return true/false to match the regular expression /['"]/`, () => {
        for (let charCode = 0; charCode < 65535; charCode++) {
            const char = String.fromCharCode(charCode);
            const fnResult = isQuoteChar(charCode);
            const regExpResult = /['"]/.test(char);

            expect(fnResult).to.equal(
                regExpResult,
                `Expected charCode ${charCode} (${char}) to return ${regExpResult}, but returned ${fnResult}`
            );
        }
    });
});

describe('isWhitespaceChar()', () => {
    it(`should appropriately return true/false to match the regular expression /\\s/`, () => {
        for (let charCode = 0; charCode < 65535; charCode++) {
            const char = String.fromCharCode(charCode);
            const fnResult = isWhitespaceChar(charCode);
            const regExpResult = /\s/.test(char);

            expect(fnResult).to.equal(
                regExpResult,
                `Expected charCode ${charCode} (${char}) to return ${regExpResult}, but returned ${fnResult}`
            );
        }
    });
});
