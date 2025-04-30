// NOTE: THIS FILE IS GENERATED. DO NOT EDIT.
// INSTEAD, RUN: npm run generate-char-utils

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

    // Whitespace and Line Terminator chars (all used by the /\s/ RegExp escape) 
    // These are used for parsing both HTML and matches.
    // The order is in UTF-16 value in order to make it easier to write code 
    // against, but the following are all from the following documents (intermixed):
    //   - Whitespace: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#white_space
    //   - Line terminators: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#line_terminators
    //   - Other Unicode space characters <USP> Characters in the "Space_Separator" general category: https://util.unicode.org/UnicodeJsps/list-unicodeset.jsp?a=%5Cp%7BGeneral_Category%3DSpace_Separator%7D
    Tab = 9,                        // U+0009 Horizontal tab '\t'
    // LineFeed = 10,               // U+000A Line Feed <LF> New line character in UNIX systems. \n  -- not needed as we'll simply test the range from Tab to CarriageReturn
    // VerticalTab = 11,            // U+000B Line tabulation <VT> Vertical tabulation \v  -- not needed as we'll simply test the range from Tab to CarriageReturn
    // FormFeed = 12,               // U+000C Form feed <FF> Page breaking control character (Wikipedia). \f  -- not needed as we'll simply test the range from Tab to CarriageReturn
    CarriageReturn = 13,            // U+000D Carriage Return <CR> New line character in Commodore and early Mac systems. \r
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

/**
 * Determines if the given character `c` matches the regular expression /[A-Za-z]/
 * by checking it via character code in a binary search fashion.
 *
 * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test()
 * on the character itself.
 *
 * NOTE: This function is generated. Do not edit manually. To regenerate, run:
 *
 *     npm run generate-char-utils
 */
export function isAsciiLetterChar(c: number): boolean {
    return (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
}

/**
 * Determines if the given character `c` matches the regular expression /\d/
 * by checking it via character code in a binary search fashion.
 *
 * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test()
 * on the character itself.
 *
 * NOTE: This function is generated. Do not edit manually. To regenerate, run:
 *
 *     npm run generate-char-utils
 */
export function isDigitChar(c: number): boolean {
    return c >= 48 && c <= 57;
}

/**
 * Determines if the given character `c` matches the regular expression /['"]/
 * by checking it via character code in a binary search fashion.
 *
 * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test()
 * on the character itself.
 *
 * NOTE: This function is generated. Do not edit manually. To regenerate, run:
 *
 *     npm run generate-char-utils
 */
export function isQuoteChar(c: number): boolean {
    return c == 34 || c == 39;
}

/**
 * Determines if the given character `c` matches the regular expression /\s/
 * by checking it via character code in a binary search fashion.
 *
 * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test()
 * on the character itself.
 *
 * NOTE: This function is generated. Do not edit manually. To regenerate, run:
 *
 *     npm run generate-char-utils
 */
export function isWhitespaceChar(c: number): boolean {
    return c < 8232
        ? c < 160
            ? (c >= 9 && c <= 13) || c == 32
            : c < 5760
              ? c == 160
              : c == 5760 || (c >= 8192 && c <= 8202)
        : c < 8287
          ? (c >= 8232 && c <= 8233) || c == 8239
          : c < 12288
            ? c == 8287
            : c == 12288 || c == 65279;
}
