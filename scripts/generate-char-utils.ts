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
    ['isDigitChar', /\d/],
    ['isQuoteChar', /['"]/],
    ['isWhitespaceChar', /\s/],
    ['isAlphaNumericOrMarkChar', alphaNumericAndMarksRe /*/[\p{Letter}\p{Mark}\p{Emoji}\p{Nd}]/u*/], // sadly the unicode regexp is not working, probably because the char codes are outside the range of 0-65535 for multi-char emojis and such, but not 100% sure. Need to investigate. Using the old regexp for now instead
    ['isValidEmailLocalPartSpecialChar', /[!#$%&'*+/=?^_`{|}~-]/], // special characters that are valid in an email address
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

/**
 * Common UTF-16 character codes used in the program.
 *
 * This is a 'const' enum, meaning that the numerical value will be inlined into
 * the code when TypeScript is compiled.
 */
// prettier-ignore
export const enum Char {
    // Letter chars (usually used for scheme testing)
    A = 65,
    Z = 90,
    a = 97,
    z = 122,

    // Quote chars (used for HTML parsing)
    DoubleQuote = 34, // char code for "
    SingleQuote = 39, // char code for '

    // Digit chars (used for parsing matches)
    Zero = 48, // char code for '0'
    Nine = 57, // char code for '9'

    // Semantically meaningful characters for HTML and Match parsing
    NumberSign = 35, // '#' char
    OpenParen = 40,  // '(' char
    CloseParen = 41, // ')' char
    Plus = 43,       // '+' char
    Comma = 44,      // ',' char
    Dash = 45,       // '-' char
    Dot = 46,        // '.' char
    Slash = 47,      // '/' char
    Colon = 58,      // ':' char
    SemiColon = 59,  // ';' char
    Question = 63,   // '?' char
    AtSign = 64,     // '@' char
    Underscore = 95, // '_' char

    // Whitespace and Line Terminator chars (all used by the /\\s/ RegExp escape) 
    // These are used for parsing both HTML and matches.
    // The order is in UTF-16 value in order to make it easier to write code 
    // against, but the following are all from the following documents (intermixed):
    //   - Whitespace: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#white_space
    //   - Line terminators: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#line_terminators
    //   - Other Unicode space characters <USP> Characters in the "Space_Separator" general category: https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5Cp%7BGeneral_Category%3DSpace_Separator%7D
    Tab = 9,                        // U+0009 Horizontal tab '\\t'
    // LineFeed = 10,               // U+000A Line Feed <LF> New line character in UNIX systems. \\n  -- not needed as we'll simply test the range from Tab to CarriageReturn
    // VerticalTab = 11,            // U+000B Line tabulation <VT> Vertical tabulation \\v  -- not needed as we'll simply test the range from Tab to CarriageReturn
    // FormFeed = 12,               // U+000C Form feed <FF> Page breaking control character (Wikipedia). \\f  -- not needed as we'll simply test the range from Tab to CarriageReturn
    CarriageReturn = 13,            // U+000D Carriage Return <CR> New line character in Commodore and early Mac systems. \\r
    Space = 32,                     // U+0020 Space <SP> Normal space 
    NoBreakSpace = 160,             // U+00A0 No-break space <NBSP> Normal space, but no point at which a line may break 
    OghamSpace = 5760,              // U+1680 OGHAM SPACE MARK
    EnQuad = 8192,                  // U+2000 EN QUAD
    // EmQuad = 8193,               // U+2001 EM QUAD -- not needed as we'll simply test the range from EnQuad to HairSpace
    // EnSpace = 8194,              // U+2002 EN SPACE -- not needed as we'll simply test the range from EnQuad to HairSpace
    // EmSpace = 8195,              // U+2003 EM SPACE -- not needed as we'll simply test the range from EnQuad to HairSpace
    // ThreePerEmSpace = 8196,      // U+2004 THREE-PER-EM SPACE -- not needed as we'll simply test the range from EnQuad to HairSpace
    // FourPerEmSpace = 8197,       // U+2005 FOUR-PER-EM SPACE -- not needed as we'll simply test the range from EnQuad to HairSpace
    // SizePerEmSpace = 8198,       // U+2006 SIX-PER-EM SPACE -- not needed as we'll simply test the range from EnQuad to HairSpace
    // FigureSpace = 8199,          // U+2007 FIGURE SPACE -- not needed as we'll simply test the range from EnQuad to HairSpace
    // PunctuationSpace = 8200,     // U+2008 PUNCTUATION SPACE -- not needed as we'll simply test the range from EnQuad to HairSpace
    // ThinSpace = 8201,            // U+2009 THIN SPACE -- not needed as we'll simply test the range from EnQuad to HairSpace
    HairSpace = 8202,               // U+200A HAIR SPACE
    LineSeparator = 8232,           // U+2028 Line Separator <LS>
    ParagraphSeparator = 8233,      // U+2029 Paragraph Separator <PS>
    NarrowNoBreakSpace = 8239,      // U+202F NARROW NO-BREAK SPACE
    MediumMathematicalSpace = 8287, // U+205F MEDIUM MATHEMATICAL SPACE
    IdiographicSpace = 12288,       // U+3000 IDEOGRAPHIC SPACE
    ZeroWidthNoBreakSpace = 65279,  // U+FEFF Zero-width no-break space <ZWNBSP> When not at the start of a script, the BOM marker is a normal whitespace character. 
}

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
