import { expect } from 'chai';
import { isValidSchemeUrl, isValidTldMatch } from '../../src/parser/uri-utils';

describe('isValidSchemeUrl()', () => {
    it('should return true for valid scheme URLs', () => {
        expect(isValidSchemeUrl('http://example.com')).to.equal(true);
        expect(isValidSchemeUrl('https://example.com')).to.equal(true);
        expect(isValidSchemeUrl('ftp://example.com')).to.equal(true);
        expect(isValidSchemeUrl('file:///path/to/file.txt')).to.equal(true);
    });

    it('should return false for invalid scheme URLs', () => {
        expect(isValidSchemeUrl('javascript:alert(1)')).to.equal(false);
        expect(isValidSchemeUrl('vbscript:alert(1)')).to.equal(false);
        expect(isValidSchemeUrl('1abc')).to.equal(false);
    });
});

describe('isValidTldMatch()', () => {
    it('should return true for valid TLD matches', () => {
        expect(isValidTldMatch('example.com')).to.equal(true);
        expect(isValidTldMatch('sub.example.com')).to.equal(true);
        expect(isValidTldMatch('example.co.uk')).to.equal(true);
    });

    it('should return false for invalid TLD matches', () => {
        expect(isValidTldMatch('/')).to.equal(false);
        expect(isValidTldMatch('#')).to.equal(false);
        expect(isValidTldMatch('//?')).to.equal(false);
        expect(isValidTldMatch('localhost')).to.equal(false);
    });
});
