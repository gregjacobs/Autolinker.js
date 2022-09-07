// This file simply makes sure that we can import Autolinker entities using the
// 'autolinker' package installed into node_modules
// To run this test, run:
//     yarn test
// This will install the package locally in ./.tmp/, and build this file.

import Autolinker, {
    Autolinker as NamedAutolinker,
    AnchorTagBuilder,
    HtmlTag,
    AbstractMatch,
    EmailMatch,
    HashtagMatch,
    MentionMatch,
    PhoneMatch,
    UrlMatch,
} from 'autolinker';

describe('Autolinker imports tests - ', () => {
    it(`Autolinker should be the default export of 'autolinker'`, () => {
        expect(Autolinker).toEqual(jasmine.any(Function)); // constructor function
        expect(Autolinker.link).toEqual(jasmine.any(Function));

        expect(Autolinker.link('Hello google.com', { newWindow: false })).toBe(
            'Hello <a href="http://google.com">google.com</a>'
        );
    });

    it(`Autolinker should also be a named export of 'autolinker'`, () => {
        expect(NamedAutolinker).toEqual(jasmine.any(Function)); // constructor function
        expect(NamedAutolinker.link).toEqual(jasmine.any(Function));
    });

    it(`AnchorTagBuilder should be a named export of 'autolinker'`, () => {
        expect(AnchorTagBuilder).toEqual(jasmine.any(Function)); // constructor function
        expect(AnchorTagBuilder.prototype.build).toEqual(jasmine.any(Function));
    });

    it(`HtmlTag should be a named export of 'autolinker'`, () => {
        expect(HtmlTag).toEqual(jasmine.any(Function)); // constructor function
        expect(HtmlTag.prototype.getTagName).toEqual(jasmine.any(Function));
    });

    it(`The 'Match' classes should be named exports of 'autolinker'`, () => {
        expect(AbstractMatch).toEqual(jasmine.any(Function)); // constructor function
        expect(AbstractMatch.name).toBe('AbstractMatch'); // function name
        expect(AbstractMatch.prototype.getMatchedText).toEqual(jasmine.any(Function));

        expect(EmailMatch).toEqual(jasmine.any(Function)); // constructor function
        expect(EmailMatch.name).toBe('EmailMatch'); // function name
        expect(EmailMatch.prototype.getEmail).toEqual(jasmine.any(Function));

        expect(HashtagMatch).toEqual(jasmine.any(Function)); // constructor function
        expect(HashtagMatch.name).toBe('HashtagMatch'); // function name
        expect(HashtagMatch.prototype.getHashtag).toEqual(jasmine.any(Function));

        expect(MentionMatch).toEqual(jasmine.any(Function)); // constructor function
        expect(MentionMatch.name).toBe('MentionMatch'); // function name
        expect(MentionMatch.prototype.getMention).toEqual(jasmine.any(Function));

        expect(PhoneMatch).toEqual(jasmine.any(Function)); // constructor function
        expect(PhoneMatch.name).toBe('PhoneMatch'); // function name
        expect(PhoneMatch.prototype.getNumber).toEqual(jasmine.any(Function));

        expect(UrlMatch).toEqual(jasmine.any(Function)); // constructor function
        expect(UrlMatch.name).toBe('UrlMatch'); // function name
        expect(UrlMatch.prototype.getUrl).toEqual(jasmine.any(Function));
    });
});
