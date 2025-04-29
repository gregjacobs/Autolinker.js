import { expect } from 'chai';
import {
    isLetterChar,
    isLetterCharCode,
    isDigitChar,
    isDigitCharCode,
    isQuoteChar,
    isQuoteCharCode,
} from '../src/string-utils';

describe(`isLetterChar()`, () => {
    it(`when given letter characters A-Z and a-z, should return true`, () => {
        expect(isLetterChar('A')).to.equal(true);
        expect(isLetterChar('B')).to.equal(true);
        expect(isLetterChar('C')).to.equal(true);
        expect(isLetterChar('M')).to.equal(true);
        expect(isLetterChar('X')).to.equal(true);
        expect(isLetterChar('Y')).to.equal(true);
        expect(isLetterChar('Z')).to.equal(true);

        expect(isLetterChar('a')).to.equal(true);
        expect(isLetterChar('b')).to.equal(true);
        expect(isLetterChar('c')).to.equal(true);
        expect(isLetterChar('m')).to.equal(true);
        expect(isLetterChar('x')).to.equal(true);
        expect(isLetterChar('y')).to.equal(true);
        expect(isLetterChar('z')).to.equal(true);
    });

    it(`when given non-letter characters (i.e. not A-Z or a-z), should return false`, () => {
        expect(isLetterChar('1')).to.equal(false);
        expect(isLetterChar('5')).to.equal(false);
        expect(isLetterChar('9')).to.equal(false);
        expect(isLetterChar('!')).to.equal(false);
        expect(isLetterChar('[')).to.equal(false); // char between the A-Z and a-z ASCII ranges
        expect(isLetterChar('_')).to.equal(false); // char between the A-Z and a-z ASCII ranges
        expect(isLetterChar('`')).to.equal(false); // char between the A-Z and a-z ASCII ranges
        expect(isLetterChar(' ')).to.equal(false);
        expect(isLetterChar('{')).to.equal(false);
        expect(isLetterChar('}')).to.equal(false);
        expect(isLetterChar(':')).to.equal(false);
        expect(isLetterChar(';')).to.equal(false);
        expect(isLetterChar('<')).to.equal(false);
        expect(isLetterChar('>')).to.equal(false);
        expect(isLetterChar('=')).to.equal(false);
        expect(isLetterChar('-')).to.equal(false);
    });
});

describe(`isLetterCharCodeCode()`, () => {
    it(`when given letter characters A-Z and a-z, should return true`, () => {
        expect(isLetterCharCode('A'.charCodeAt(0))).to.equal(true);
        expect(isLetterCharCode('B'.charCodeAt(0))).to.equal(true);
        expect(isLetterCharCode('C'.charCodeAt(0))).to.equal(true);
        expect(isLetterCharCode('M'.charCodeAt(0))).to.equal(true);
        expect(isLetterCharCode('X'.charCodeAt(0))).to.equal(true);
        expect(isLetterCharCode('Y'.charCodeAt(0))).to.equal(true);
        expect(isLetterCharCode('Z'.charCodeAt(0))).to.equal(true);

        expect(isLetterCharCode('a'.charCodeAt(0))).to.equal(true);
        expect(isLetterCharCode('b'.charCodeAt(0))).to.equal(true);
        expect(isLetterCharCode('c'.charCodeAt(0))).to.equal(true);
        expect(isLetterCharCode('m'.charCodeAt(0))).to.equal(true);
        expect(isLetterCharCode('x'.charCodeAt(0))).to.equal(true);
        expect(isLetterCharCode('y'.charCodeAt(0))).to.equal(true);
        expect(isLetterCharCode('z'.charCodeAt(0))).to.equal(true);
    });

    it(`when given non-letter characters (i.e. not A-Z or a-z), should return false`, () => {
        expect(isLetterCharCode('1'.charCodeAt(0))).to.equal(false);
        expect(isLetterCharCode('5'.charCodeAt(0))).to.equal(false);
        expect(isLetterCharCode('9'.charCodeAt(0))).to.equal(false);
        expect(isLetterCharCode('!'.charCodeAt(0))).to.equal(false);
        expect(isLetterCharCode('['.charCodeAt(0))).to.equal(false); // char between the A-Z and a-z ASCII ranges
        expect(isLetterCharCode('_'.charCodeAt(0))).to.equal(false); // char between the A-Z and a-z ASCII ranges
        expect(isLetterCharCode('`'.charCodeAt(0))).to.equal(false); // char between the A-Z and a-z ASCII ranges
        expect(isLetterCharCode(' '.charCodeAt(0))).to.equal(false);
        expect(isLetterCharCode('{'.charCodeAt(0))).to.equal(false);
        expect(isLetterCharCode('}'.charCodeAt(0))).to.equal(false);
        expect(isLetterCharCode(':'.charCodeAt(0))).to.equal(false);
        expect(isLetterCharCode(';'.charCodeAt(0))).to.equal(false);
        expect(isLetterCharCode('<'.charCodeAt(0))).to.equal(false);
        expect(isLetterCharCode('>'.charCodeAt(0))).to.equal(false);
        expect(isLetterCharCode('='.charCodeAt(0))).to.equal(false);
        expect(isLetterCharCode('-'.charCodeAt(0))).to.equal(false);
    });
});

describe(`isDigitChar()`, () => {
    it(`when given letter characters A-Z and a-z, should return true`, () => {
        expect(isDigitChar('0')).to.equal(true);
        expect(isDigitChar('1')).to.equal(true);
        expect(isDigitChar('2')).to.equal(true);
        expect(isDigitChar('3')).to.equal(true);
        expect(isDigitChar('4')).to.equal(true);
        expect(isDigitChar('5')).to.equal(true);
        expect(isDigitChar('6')).to.equal(true);
        expect(isDigitChar('7')).to.equal(true);
        expect(isDigitChar('8')).to.equal(true);
        expect(isDigitChar('9')).to.equal(true);
    });

    it(`when given non-letter characters (i.e. not A-Z or a-z), should return false`, () => {
        expect(isDigitChar('A')).to.equal(false);
        expect(isDigitChar('M')).to.equal(false);
        expect(isDigitChar('Z')).to.equal(false);
        expect(isDigitChar('a')).to.equal(false);
        expect(isDigitChar('m')).to.equal(false);
        expect(isDigitChar('z')).to.equal(false);
        expect(isDigitChar('!')).to.equal(false);
        expect(isDigitChar('[')).to.equal(false);
        expect(isDigitChar('_')).to.equal(false);
        expect(isDigitChar('`')).to.equal(false);
        expect(isDigitChar(' ')).to.equal(false);
        expect(isDigitChar('{')).to.equal(false);
        expect(isDigitChar('}')).to.equal(false);
        expect(isDigitChar(':')).to.equal(false);
        expect(isDigitChar(';')).to.equal(false);
        expect(isDigitChar('<')).to.equal(false);
        expect(isDigitChar('>')).to.equal(false);
        expect(isDigitChar('=')).to.equal(false);
        expect(isDigitChar('-')).to.equal(false);
    });
});

describe(`isDigitCharCodeCode()`, () => {
    it(`when given digit characters 0-9, should return true`, () => {
        expect(isDigitCharCode('0'.charCodeAt(0))).to.equal(true);
        expect(isDigitCharCode('1'.charCodeAt(0))).to.equal(true);
        expect(isDigitCharCode('2'.charCodeAt(0))).to.equal(true);
        expect(isDigitCharCode('3'.charCodeAt(0))).to.equal(true);
        expect(isDigitCharCode('4'.charCodeAt(0))).to.equal(true);
        expect(isDigitCharCode('5'.charCodeAt(0))).to.equal(true);
        expect(isDigitCharCode('6'.charCodeAt(0))).to.equal(true);
        expect(isDigitCharCode('7'.charCodeAt(0))).to.equal(true);
        expect(isDigitCharCode('8'.charCodeAt(0))).to.equal(true);
        expect(isDigitCharCode('9'.charCodeAt(0))).to.equal(true);
    });

    it(`when given non-digit characters, should return false`, () => {
        expect(isDigitCharCode('A'.charCodeAt(0))).to.equal(false);
        expect(isDigitCharCode('M'.charCodeAt(0))).to.equal(false);
        expect(isDigitCharCode('Z'.charCodeAt(0))).to.equal(false);
        expect(isDigitCharCode('a'.charCodeAt(0))).to.equal(false);
        expect(isDigitCharCode('m'.charCodeAt(0))).to.equal(false);
        expect(isDigitCharCode('z'.charCodeAt(0))).to.equal(false);
        expect(isDigitCharCode('!'.charCodeAt(0))).to.equal(false);
        expect(isDigitCharCode('['.charCodeAt(0))).to.equal(false);
        expect(isDigitCharCode('_'.charCodeAt(0))).to.equal(false);
        expect(isDigitCharCode('`'.charCodeAt(0))).to.equal(false);
        expect(isDigitCharCode(' '.charCodeAt(0))).to.equal(false);
        expect(isDigitCharCode('{'.charCodeAt(0))).to.equal(false);
        expect(isDigitCharCode('}'.charCodeAt(0))).to.equal(false);
        expect(isDigitCharCode(':'.charCodeAt(0))).to.equal(false);
        expect(isDigitCharCode(';'.charCodeAt(0))).to.equal(false);
        expect(isDigitCharCode('<'.charCodeAt(0))).to.equal(false);
        expect(isDigitCharCode('>'.charCodeAt(0))).to.equal(false);
        expect(isDigitCharCode('='.charCodeAt(0))).to.equal(false);
        expect(isDigitCharCode('-'.charCodeAt(0))).to.equal(false);
    });
});

describe(`isQuoteChar()`, () => {
    it(`when given single or double quote characters, should return true`, () => {
        expect(isQuoteChar(`"`)).to.equal(true);
        expect(isQuoteChar(`'`)).to.equal(true);
    });

    it(`when given non-quote characters, should return false`, () => {
        expect(isQuoteChar('`')).to.equal(false); // note: this is a "quote" character in JavaScript, but not in HTML, and thus we don't want to match it as such for the HTML parsing functionality
        expect(isQuoteChar('A')).to.equal(false);
        expect(isQuoteChar('M')).to.equal(false);
        expect(isQuoteChar('Z')).to.equal(false);
        expect(isQuoteChar('a')).to.equal(false);
        expect(isQuoteChar('m')).to.equal(false);
        expect(isQuoteChar('z')).to.equal(false);
        expect(isQuoteChar('1')).to.equal(false);
        expect(isQuoteChar('5')).to.equal(false);
        expect(isQuoteChar('9')).to.equal(false);
        expect(isQuoteChar('!')).to.equal(false);
        expect(isQuoteChar('[')).to.equal(false);
        expect(isQuoteChar('_')).to.equal(false);
        expect(isQuoteChar(' ')).to.equal(false);
        expect(isQuoteChar('{')).to.equal(false);
        expect(isQuoteChar('}')).to.equal(false);
        expect(isQuoteChar(':')).to.equal(false);
        expect(isQuoteChar(';')).to.equal(false);
        expect(isQuoteChar('<')).to.equal(false);
        expect(isQuoteChar('>')).to.equal(false);
        expect(isQuoteChar('=')).to.equal(false);
        expect(isQuoteChar('-')).to.equal(false);
    });
});

describe(`isQuoteCharCodeCode()`, () => {
    it(`when given single or double quote character codes, should return true`, () => {
        expect(isQuoteCharCode(`"`.charCodeAt(0))).to.equal(true);
        expect(isQuoteCharCode(`'`.charCodeAt(0))).to.equal(true);
    });

    it(`when given non-quote character codes, should return false`, () => {
        expect(isQuoteCharCode('`'.charCodeAt(0))).to.equal(false); // note: this is a "quote" character in JavaScript, but not in HTML, and thus we don't want to match it as such for the HTML parsing functionality
        expect(isQuoteCharCode('A'.charCodeAt(0))).to.equal(false);
        expect(isQuoteCharCode('M'.charCodeAt(0))).to.equal(false);
        expect(isQuoteCharCode('Z'.charCodeAt(0))).to.equal(false);
        expect(isQuoteCharCode('a'.charCodeAt(0))).to.equal(false);
        expect(isQuoteCharCode('m'.charCodeAt(0))).to.equal(false);
        expect(isQuoteCharCode('z'.charCodeAt(0))).to.equal(false);
        expect(isQuoteCharCode('1'.charCodeAt(0))).to.equal(false);
        expect(isQuoteCharCode('5'.charCodeAt(0))).to.equal(false);
        expect(isQuoteCharCode('9'.charCodeAt(0))).to.equal(false);
        expect(isQuoteCharCode('!'.charCodeAt(0))).to.equal(false);
        expect(isQuoteCharCode('['.charCodeAt(0))).to.equal(false);
        expect(isQuoteCharCode('_'.charCodeAt(0))).to.equal(false);
        expect(isQuoteCharCode(' '.charCodeAt(0))).to.equal(false);
        expect(isQuoteCharCode('{'.charCodeAt(0))).to.equal(false);
        expect(isQuoteCharCode('}'.charCodeAt(0))).to.equal(false);
        expect(isQuoteCharCode(':'.charCodeAt(0))).to.equal(false);
        expect(isQuoteCharCode(';'.charCodeAt(0))).to.equal(false);
        expect(isQuoteCharCode('<'.charCodeAt(0))).to.equal(false);
        expect(isQuoteCharCode('>'.charCodeAt(0))).to.equal(false);
        expect(isQuoteCharCode('='.charCodeAt(0))).to.equal(false);
        expect(isQuoteCharCode('-'.charCodeAt(0))).to.equal(false);
    });
});
