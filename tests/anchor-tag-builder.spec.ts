import { AnchorTagBuilder } from '../src/anchor-tag-builder';
import Autolinker from '../src/autolinker';

describe(`AnchorTagBuilder`, () => {
    it(`should create an anchor tag based on the passed-in match`, () => {
        const matches = Autolinker.parse('example.com');
        const match = matches[0];

        const anchorTagBuilder = new AnchorTagBuilder();
        const tag = anchorTagBuilder.build(match);

        expect(tag.toAnchorString()).toBe('<a href="http://example.com">example.com</a>');
    });
});
