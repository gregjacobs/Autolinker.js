import dedent from 'dedent';
import fs from 'fs';
import path from 'path';
import { alphaNumericAndMarksRe } from './alpha-numeric-and-marks-re';

/*
 * This script generates functions which check that a single character matches
 * a regular expression, but by character code rather than string.
 *
 * This is a performance enhancement for Autolinker where having a function that
 * checks a single character code by integer value via a binary search is far
 * more performant than checking against the equivalent regular expression (to
 * the tune of 10x faster sometimes). Because these character-checking functions
 * are used to process each character of the input string, we want these to be
 * as fast as possible.
 */

const rootPath = path.normalize(`${__dirname}/..`);
const generateScriptName = 'generate-char-utils';

const { srcFileContents, specFileContents } = generateCharUtils([
    ['isControlChar', /[\x00-\x1F\x7F]/], // ASCII control characters (0-31), and the backspace char (127). Used to check for invalid characters in the HTML parser.
    ['isAsciiLetterChar', /[A-Za-z]/],
    ['isAsciiAlphaNumericChar', /[A-Za-z0-9]/], // Used for parsing named HTML entities like '&amp';
    ['isAsciiDigitChar', /[0-9]/], // Used for parsing decimal HTML entities like '&#60;'
    ['isAsciiUpperHexDigitChar', /[A-F]/],
    //['isAsciiLowerHexDigitChar', /[a-f]/], -- not actually needed at the moment
    ['isHexChar', /[A-Fa-f0-9]/], // Used for parsing hexadecimal HTML entities like '&#x3C;'
    ['isQuoteChar', /['"]/],
    ['isWhitespaceChar', /\s/],
    ['isAlphaNumericOrMarkChar', alphaNumericAndMarksRe /*/[\p{Letter}\p{Mark}\p{Emoji}\p{Nd}]/u*/], // sadly the unicode regexp is not working, probably because the char codes are outside the range of 0-65535 for multi-char emojis and such, but not 100% sure. Need to investigate. Using the old regexp for now instead
    ['isValidEmailLocalPartSpecialChar', /[!#$%&'*+/=?^_`{|}~-]/], // special characters that are valid in an email address
    ['isUrlSuffixAllowedSpecialChar', /[-+&@#/%=~_()|'$*[\]{}\u2713]/], // The set of characters that are allowed in the URL suffix (i.e. the path, query, and hash part of the URL) which may also form the ending character of the URL. The isUrlSuffixNotAllowedAsFinalChar() function allows for additional allowed URL suffix characters, but (generally) should not be the *last* character of a URL.
    ['isUrlSuffixNotAllowedAsFinalChar', /[?!:,.;^]/], // URL suffix characters (i.e. path, query, and has part of the URL) that are not allowed as the *last character* in the URL suffix as they would normally form the end of a sentence. The isUrlSuffixAllowedSpecialChar() function contains additional allowed URL suffix characters which are allowed as the last character.
    ['isOpenBraceChar', /[({[]/],
    ['isCloseBraceChar', /[)}\]]/],
    ['isSurrogateChar', /[\uD800-\uDBFF\uDC00-\uDFFF]/], // Leading surrogate chars are in the range U+D800 to U+DBFF. Trailing surrogate chars are in the range U+DC00 to U+DFFF. Essentially, all surrogate chars are in the range U+D800 to U+DFFF. See: https://infra.spec.whatwg.org/#surrogate
]);

// console.log(srcFileContents);
// console.log(specFileContents);

const srcFilePath = `src/char-utils.ts`;
fs.writeFileSync(`${rootPath}/${srcFilePath}`, srcFileContents, 'utf-8');
console.log(`Wrote ${srcFilePath}`);

const specFilePath = `tests/char-utils.spec.ts`;
fs.writeFileSync(`${rootPath}/${specFilePath}`, specFileContents, 'utf-8');
console.log(`Wrote ${specFilePath}`);

// -------------------------------------------------------------

/**
 * Generates the source and spec files for char-utils.ts
 */
function generateCharUtils(fns: [fnName: string, re: RegExp][]): {
    srcFileContents: string;
    specFileContents: string;
} {
    const fileHeader = dedent`
        // NOTE: THIS FILE IS GENERATED. DO NOT EDIT.
        // INSTEAD, RUN: npm run ${generateScriptName}
    `;

    const srcFileContents = `
${fileHeader}

${fns.map(fn => generateCharCompareFn(fn[0], fn[1])).join('\n\n')}
`;

    const specFileContents = `
${fileHeader}

import { expect } from 'chai';
import { ${fns.map(fn => fn[0]).join(', ')} } from '../src/char-utils';

${fns.map(fn => generateCharCompareTest(fn[0], fn[1])).join('\n\n')}
`;

    return { srcFileContents, specFileContents };
}

/**
 * Generates the character-checking function based on a regular expression.
 *
 * For example:
 *
 *     generateCharCompareFn('isDigit', /\d/);
 *
 * Generates:
 *
 *     function isDigit(c: number): boolean {
 *         return (c >= 48 && c <= 57);
 *     }
 *
 * where 48 is the '0' char and 57 is the '9' character.
 */
function generateCharCompareFn(fnName: string, regExp: RegExp): string {
    const charCodes = charCodesFromRe(regExp);
    const charCodeRanges = toCharCodeRanges(charCodes);

    return dedent`
        /**
         * Determines if the given character \`c\` matches the regular expression /${regExp.source}/${regExp.flags} 
         * by checking it via character code in a binary search fashion.
         * 
         * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test() 
         * on the character itself.
         * 
         * NOTE: This function is generated. Do not edit manually. To regenerate, run: 
         * 
         *     npm run ${generateScriptName}
         */
        export function ${fnName}(c: number): boolean {
            return ${buildBinarySearchExpr(charCodeRanges)};
        }
    `;
}

/**
 * Given a regular expression, determines which character codes the regular
 * expression returns true for.
 *
 * Example:
 *
 *     charCodesFromRe(/\d/);
 *     // -> [48, 49, ..., 56, 57]
 */
function charCodesFromRe(regExp: RegExp): number[] {
    const charCodes: number[] = [];
    for (let charCode = 0; charCode < 65535; charCode++) {
        const char = String.fromCharCode(charCode);

        if (regExp.test(char)) {
            charCodes.push(charCode);
        }
    }
    return charCodes;
}

/**
 * Given an array of character codes, compresses adjacent codes into ranges.
 *
 * Example:
 *
 *     toCharCodeRanges([9, 10, 11, 12, 13, 32, 160]);
 *     // -> [[9, 13], [32], [160]]
 */
function toCharCodeRanges(charCodes: number[]): CharCodeRange[] {
    if (charCodes.length === 0) {
        throw new Error(
            `toCharCodeRanges(): No codes in charCodes array! Likely an invalid RegExp`
        );
    }
    if (charCodes.length === 1) {
        return [[charCodes[0]]]; // single element
    }

    const ranges: CharCodeRange[] = [];
    let currentRange: CharCodeRange | null = null;

    for (let i = 0; i < charCodes.length; i++) {
        const currentCode = charCodes[i];

        if (!currentRange) {
            currentRange = [currentCode, currentCode];
        }

        if (i < charCodes.length - 1) {
            // There's a "next" element
            const nextCode = charCodes[i + 1];

            if (nextCode === currentCode + 1) {
                currentRange[1] = nextCode;
            } else {
                ranges.push(collapseRange(currentRange));
                currentRange = null;
            }
        } else {
            // We've reached the end of the array
            // push the final range being generated
            ranges.push(collapseRange(currentRange));
        }
    }
    return ranges;

    // If the range contains just one number, collapse into a single element tuple
    function collapseRange(range: CharCodeRange): CharCodeRange {
        if (range[0] === range[1]) {
            return [range[0]]; // single number "range". Ex: [32]
        } else {
            return range; // multiple number range. Ex: [9, 13]
        }
    }
}

type CharCodeRange = [from: number, to?: number];

/**
 * Given a set of character code ranges, builds a binary search JavaScript
 * expression to check a character code against the ranges.
 *
 * Ex:
 *
 *     buildBinarySearchExpr([[9, 13], [32], [160]]);
 *     // -> '(c < 32 ? (c >= 9 && c <= 13) : (c == 32 || c == 160))'
 *
 */
function buildBinarySearchExpr(ranges: CharCodeRange[]): string {
    if (ranges.length === 1) {
        return buildComparisonExpr(ranges[0]);
    } else if (ranges.length === 2) {
        return `(${buildComparisonExpr(ranges[0])} || ${buildComparisonExpr(ranges[1])})`;
    } else {
        const mid = Math.floor(ranges.length / 2);

        const midRange = ranges[mid];
        const leftExpr = buildBinarySearchExpr(ranges.slice(0, mid));
        const rightExpr = buildBinarySearchExpr(ranges.slice(mid));

        return `(c < ${midRange[0]} ? ${leftExpr} : ${rightExpr})`;
    }
}

function buildComparisonExpr(range: CharCodeRange): string {
    if (range.length === 1) {
        return `c == ${range[0]}`;
    } else {
        return `(c >= ${range[0]} && c <= ${range[1]})`;
    }
}

function generateCharCompareTest(fnName: string, regExp: RegExp): string {
    const regexpInDescription = `/${regExp.source.replace(/\\/g, '\\\\').replace(/`/g, '\\`')}/${regExp.flags}`;
    return dedent`
        describe('${fnName}()', () => {
            it(\`should appropriately return true/false to match the regular expression ${regexpInDescription}\`, () => {
                for (let charCode = 0; charCode < 65535; charCode++) {
                    const char = String.fromCharCode(charCode);
                    const fnResult = ${fnName}(charCode);
                    const regExpResult = /${regExp.source}/${regExp.flags}.test(char);

                    expect(fnResult).to.equal(regExpResult, \`Expected charCode \${charCode} (\${char}) to return \${regExpResult}, but returned \${fnResult}\`);
                }
            });
        });
    `;
}
