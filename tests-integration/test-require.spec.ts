// This file simply makes sure that we can require() Autolinker entities using
// the 'autolinker' package installed into node_modules
// To run this test, run:
//     yarn test
// This will install the package locally in ./.tmp/, and build this file.

const Autolinker = require('autolinker');
const NamedAutolinker = require('autolinker').Autolinker;

describe('Autolinker require() tests - ', () => {
    it(`Autolinker should be the default export of 'autolinker'`, () => {
        expect(Autolinker).toEqual(jasmine.any(Function)); // constructor function
        expect(Autolinker.name).toBe('Autolinker'); // function name
        expect(Autolinker.link).toEqual(jasmine.any(Function));

        expect(Autolinker.link('Hello google.com', { newWindow: false })).toBe(
            'Hello <a href="http://google.com">google.com</a>'
        );
    });

    it(`Autolinker should also be a named export of 'autolinker'`, () => {
        expect(NamedAutolinker).toEqual(jasmine.any(Function)); // constructor function
        expect(NamedAutolinker.name).toBe('Autolinker'); // function name
        expect(NamedAutolinker.link).toEqual(jasmine.any(Function));
    });

    it(`The 'Match' classes should be top-level named exports of 'autolinker' (as of v2.0)`, () => {
        expect(Autolinker.AbstractMatch).toEqual(jasmine.any(Function)); // constructor function
        expect(Autolinker.AbstractMatch.name).toBe('AbstractMatch'); // function name
        expect(Autolinker.AbstractMatch.prototype.getMatchedText).toEqual(jasmine.any(Function));

        expect(Autolinker.EmailMatch).toEqual(jasmine.any(Function)); // constructor function
        expect(Autolinker.EmailMatch.name).toBe('EmailMatch'); // function name
        expect(Autolinker.EmailMatch.prototype.getEmail).toEqual(jasmine.any(Function));

        expect(Autolinker.HashtagMatch).toEqual(jasmine.any(Function)); // constructor function
        expect(Autolinker.HashtagMatch.name).toBe('HashtagMatch'); // function name
        expect(Autolinker.HashtagMatch.prototype.getHashtag).toEqual(jasmine.any(Function));

        expect(Autolinker.MentionMatch).toEqual(jasmine.any(Function)); // constructor function
        expect(Autolinker.MentionMatch.name).toBe('MentionMatch'); // function name
        expect(Autolinker.MentionMatch.prototype.getMention).toEqual(jasmine.any(Function));

        expect(Autolinker.PhoneMatch).toEqual(jasmine.any(Function)); // constructor function
        expect(Autolinker.PhoneMatch.name).toBe('PhoneMatch'); // function name
        expect(Autolinker.PhoneMatch.prototype.getNumber).toEqual(jasmine.any(Function));

        expect(Autolinker.UrlMatch).toEqual(jasmine.any(Function)); // constructor function
        expect(Autolinker.UrlMatch.name).toBe('UrlMatch'); // function name
        expect(Autolinker.UrlMatch.prototype.getUrl).toEqual(jasmine.any(Function));
    });
});
