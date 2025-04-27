// This file simply makes sure that we can import Autolinker entities using the
// 'autolinker' package installed into node_modules
// To run this test, run:
//     yarn test
// This will install the package locally in ./.tmp/, and build this file.

import { expect } from 'chai';
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

        const builder = new AnchorTagBuilder();
        const tag = builder.build(matches[0]);

        expect(tag.toAnchorString()).to.equal('<a href="http://example.com">example.com</a>');
    });

    it(`HtmlTag should be a named export of 'autolinker'`, () => {
        const tag = new HtmlTag({
            tagName: 'a',
            attrs: { href: 'http://example.com' },
            innerHtml: 'example.com',
        });

        expect(tag.getTagName()).to.equal('a');
        expect(tag.toAnchorString()).to.equal('<a href="http://example.com">example.com</a>');
    });

    it(`The 'Match' classes should be named exports of 'autolinker'`, () => {
        expect(AbstractMatch.name).to.equal('AbstractMatch'); // function (class) name
        expect(EmailMatch.name).to.equal('EmailMatch'); // function (class) name
        expect(HashtagMatch.name).to.equal('HashtagMatch'); // function (class) name
        expect(MentionMatch.name).to.equal('MentionMatch'); // function (class) name
        expect(PhoneMatch.name).to.equal('PhoneMatch'); // function (class) name
        expect(UrlMatch.name).to.equal('UrlMatch'); // function (class) name

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

        expect(emailMatch).to.be.instanceOf(EmailMatch);
        expect(hashtagMatch).to.be.instanceOf(HashtagMatch);
        expect(mentionMatch).to.be.instanceOf(MentionMatch);
        expect(phoneMatch).to.be.instanceOf(PhoneMatch);
        expect(urlMatch).to.be.instanceOf(UrlMatch);
    });
});
