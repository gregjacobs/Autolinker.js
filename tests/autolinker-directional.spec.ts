import Autolinker from '../src/autolinker';

describe('Autolinker strip directional characters check -', () => {
    const autolinker = new Autolinker({
        newWindow: false,
        stripDirectionalCharacters: true,
        stripPrefix: {
            www: false,
        },
    });

    it('should strip out character direction override unicodes', () => {
        expect(autolinker.link('foo.combar.com')).toBe(
            '<a href="http://foo.combar.com">foo.combar.com</a>'
        );
        expect(autolinker.link('foo.com\u202Ebar.com')).toBe(
            '<a href="http://foo.combar.com">foo.combar.com</a>'
        );
        expect(autolinker.link('foo.com\u202abar.com')).toBe(
            '<a href="http://foo.combar.com">foo.combar.com</a>'
        );
    });
});
