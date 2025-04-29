import { expect } from 'chai';
import { isLetterChar, isLetterCharCode } from '../src/string-utils';

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
