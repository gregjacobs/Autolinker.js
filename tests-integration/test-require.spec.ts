// This file simply makes sure that we can require() Autolinker entities using
// the 'autolinker' package installed into node_modules
// To run this test, run:
//     yarn test
// This will install the package locally in ./.tmp/, and build this file.
import { expect } from 'chai';

const Autolinker = require('autolinker'); // eslint-disable-line @typescript-eslint/no-require-imports
const NamedAutolinker = require('autolinker').Autolinker; // eslint-disable-line @typescript-eslint/no-require-imports

describe('Autolinker require() tests >', () => {
    it(`Autolinker should be the default export of 'autolinker'`, () => {
        // constructor function
        const instance = new Autolinker({ newWindow: false });
        expect(instance.link('Hello google.com')).to.equal(
            'Hello <a href="http://google.com">google.com</a>'
        );

        // static method
        expect(Autolinker.link('Hello google.com', { newWindow: false })).to.equal(
            'Hello <a href="http://google.com">google.com</a>'
        );
    });

    it(`Autolinker should also be a named export of 'autolinker'`, () => {
        // constructor function
        const instance = new NamedAutolinker({ newWindow: false });
        expect(instance.link('Hello google.com')).to.equal(
            'Hello <a href="http://google.com">google.com</a>'
        );

        // static method
        expect(NamedAutolinker.link('Hello google.com', { newWindow: false })).to.equal(
            'Hello <a href="http://google.com">google.com</a>'
        );
    });

    it(`AnchorTagBuilder should be a named export of 'autolinker'`, () => {
        const matches = Autolinker.parse('example.com');

        const builder = new Autolinker.AnchorTagBuilder();
        const tag = builder.build(matches[0]);

        expect(tag.toAnchorString()).to.equal('<a href="http://example.com">example.com</a>');
    });

    it(`HtmlTag should be a named export of 'autolinker'`, () => {
        const tag = new Autolinker.HtmlTag({
            tagName: 'a',
            attrs: { href: 'http://example.com' },
            innerHtml: 'example.com',
        });

        expect(tag.getTagName()).to.equal('a');
        expect(tag.toAnchorString()).to.equal('<a href="http://example.com">example.com</a>');
    });

    it(`The 'Match' classes should be named exports of 'autolinker'`, () => {
        expect(Autolinker.AbstractMatch.name).to.equal('AbstractMatch'); // function (class) name
        expect(Autolinker.EmailMatch.name).to.equal('EmailMatch'); // function (class) name
        expect(Autolinker.HashtagMatch.name).to.equal('HashtagMatch'); // function (class) name
        expect(Autolinker.MentionMatch.name).to.equal('MentionMatch'); // function (class) name
        expect(Autolinker.PhoneMatch.name).to.equal('PhoneMatch'); // function (class) name
        expect(Autolinker.UrlMatch.name).to.equal('UrlMatch'); // function (class) name

        const autolinker = new Autolinker({
            hashtag: 'twitter',
            mention: 'twitter',
        });
        const [emailMatch, hashtagMatch, mentionMatch, phoneMatch, urlMatch] = autolinker.parse(`
            asdf@asdf.com
            #hashtag
            @mention
            123-456-7890
            http://example.com
        `);

        expect(emailMatch).to.be.instanceOf(Autolinker.EmailMatch);
        expect(hashtagMatch).to.be.instanceOf(Autolinker.HashtagMatch);
        expect(mentionMatch).to.be.instanceOf(Autolinker.MentionMatch);
        expect(phoneMatch).to.be.instanceOf(Autolinker.PhoneMatch);
        expect(urlMatch).to.be.instanceOf(Autolinker.UrlMatch);
    });
});
