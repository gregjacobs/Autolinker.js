import { isValidSchemeUrl, isValidTldMatch } from '../../src/parser/uri-utils';

describe('isValidSchemeUrl()', () => {
    it('should return true for valid scheme URLs', () => {
        expect(isValidSchemeUrl('http://example.com')).toBe(true);
        expect(isValidSchemeUrl('https://example.com')).toBe(true);
        expect(isValidSchemeUrl('ftp://example.com')).toBe(true);
        expect(isValidSchemeUrl('file:///path/to/file.txt')).toBe(true);
    });

    it('should return false for invalid scheme URLs', () => {
        expect(isValidSchemeUrl('javascript:alert(1)')).toBe(false);
        expect(isValidSchemeUrl('vbscript:alert(1)')).toBe(false);
        expect(isValidSchemeUrl('1abc')).toBe(false);
    });
});

describe('isValidTldMatch()', () => {
    it('should return true for valid TLD matches', () => {
        expect(isValidTldMatch('example.com')).toBe(true);
        expect(isValidTldMatch('sub.example.com')).toBe(true);
        expect(isValidTldMatch('example.co.uk')).toBe(true);
    });

    it('should return false for invalid TLD matches', () => {
        expect(isValidTldMatch('/')).toBe(false);
        expect(isValidTldMatch('#')).toBe(false);
        expect(isValidTldMatch('//?')).toBe(false);
        expect(isValidTldMatch('localhost')).toBe(false);
    });
});
