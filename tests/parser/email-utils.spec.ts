import { expect } from 'chai';
import { isValidEmail } from '../../src/parser/email-utils';

describe('isValidEmail >', () => {
    it('should return true for valid email addresses', () => {
        expect(isValidEmail('asdf@asdf.com')).to.equal(true);
    });

    it('should return false for invalid email addresses', () => {
        expect(isValidEmail('asdf@asdf')).to.equal(false);
        expect(isValidEmail('asdf@com')).to.equal(false);
        expect(isValidEmail('asdf@')).to.equal(false);
        expect(isValidEmail('')).to.equal(false);
    });
});
