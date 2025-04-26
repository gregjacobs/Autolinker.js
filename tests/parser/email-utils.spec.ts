import { isValidEmail } from '../../src/parser/email-utils';

describe('isValidEmail >', () => {
    it('should return true for valid email addresses', () => {
        expect(isValidEmail('asdf@asdf.com')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
        expect(isValidEmail('asdf@asdf')).toBe(false);
        expect(isValidEmail('asdf@com')).toBe(false);
        expect(isValidEmail('asdf@')).toBe(false);
        expect(isValidEmail('')).toBe(false);
    });
});
