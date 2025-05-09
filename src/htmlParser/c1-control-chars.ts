/**
 * This mapping is for decoding numeric character references in the range 0x80 to
 * 0x9F, minus a few.
 *
 * For example, if we encounter the HTML character reference '&#x80;', we should
 * replace it with the Euro sign (€)
 *
 * This replacement process is described by the table here:
 *     https://html.spec.whatwg.org/multipage/parsing.html#numeric-character-reference-end-state
 *
 * And here:
 *     https://html.spec.whatwg.org/multipage/parsing.html#parse-error-control-character-reference
 */
export const c1ControlCharReplacements: ReadonlyMap<number, number> = new Map([
    [0x80, 0x20ac], // EURO SIGN (€)
    [0x82, 0x201a], // SINGLE LOW-9 QUOTATION MARK (‚)
    [0x83, 0x0192], // LATIN SMALL LETTER F WITH HOOK (ƒ)
    [0x84, 0x201e], // DOUBLE LOW-9 QUOTATION MARK („)
    [0x85, 0x2026], // HORIZONTAL ELLIPSIS (…)
    [0x86, 0x2020], // DAGGER (†)
    [0x87, 0x2021], // DOUBLE DAGGER (‡)
    [0x88, 0x02c6], // MODIFIER LETTER CIRCUMFLEX ACCENT (ˆ)
    [0x89, 0x2030], // PER MILLE SIGN (‰)
    [0x8a, 0x0160], // LATIN CAPITAL LETTER S WITH CARON (Š)
    [0x8b, 0x2039], // SINGLE LEFT-POINTING ANGLE QUOTATION MARK (‹)
    [0x8c, 0x0152], // LATIN CAPITAL LIGATURE OE (Œ)
    [0x8e, 0x017d], // LATIN CAPITAL LETTER Z WITH CARON (Ž)
    [0x91, 0x2018], // LEFT SINGLE QUOTATION MARK (‘)
    [0x92, 0x2019], // RIGHT SINGLE QUOTATION MARK (’)
    [0x93, 0x201c], // LEFT DOUBLE QUOTATION MARK (“)
    [0x94, 0x201d], // RIGHT DOUBLE QUOTATION MARK (”)
    [0x95, 0x2022], // BULLET (•)
    [0x96, 0x2013], // EN DASH (–)
    [0x97, 0x2014], // EM DASH (—)
    [0x98, 0x02dc], // SMALL TILDE (˜)
    [0x99, 0x2122], // TRADE MARK SIGN (™)
    [0x9a, 0x0161], // LATIN SMALL LETTER S WITH CARON (š)
    [0x9b, 0x203a], // SINGLE RIGHT-POINTING ANGLE QUOTATION MARK (›)
    [0x9c, 0x0153], // LATIN SMALL LIGATURE OE (œ)
    [0x9e, 0x017e], // LATIN SMALL LETTER Z WITH CARON (ž)
    [0x9f, 0x0178], // LATIN CAPITAL LETTER Y WITH DIAERESIS (Ÿ)
]);
