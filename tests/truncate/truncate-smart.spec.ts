import { expect } from 'chai';
import { truncateSmart } from '../../src/truncate/truncate-smart';

/*
 * Date: 2015-10-05
 * Author: Kasper Søfren <soefritz@gmail.com> (https://github.com/kafoso)
 *
 * These tests target the "truncateSmart" addition to Autolinker
 * (Autolinker.truncate.truncateSmart), exclusively.
 */
describe('Truncate.truncate.truncateSmart', function () {
    it('Will not truncate a URL which is shorter than the specified length', function () {
        const truncatedUrl = truncateSmart(
            'http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee',
            999,
            '..'
        );
        expect(truncatedUrl).to.equal(
            'http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee'
        );
        expect(truncatedUrl.length).to.equal(72);
    });

    it(`when just a hostname is present and it's exactly the truncate length, should return it as-is`, () => {
        const truncatedUrl = truncateSmart('yahoo.com', 'yahoo.com'.length, '..');

        expect(truncatedUrl).to.equal('yahoo.com');
    });

    it(`when the hostname is exactly the truncate length but there's also a scheme, should ellipsis the hostname while removing the scheme`, () => {
        const truncatedUrl = truncateSmart('http://yahoo.com', 'yahoo.com'.length, '..');

        expect(truncatedUrl).to.equal('yahoo.c..');
    });

    it('Will remove malformed query section 1st', function () {
        const truncatedUrl = truncateSmart(
            'http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee',
            61,
            '..'
        );
        expect(truncatedUrl).to.equal(
            'http://www.yahoo.com/some/long/path/to/a/file?foo=bar#baz=bee'
        );
        expect(truncatedUrl.length).to.equal(61);
    });

    it("Will remove 'www' 2nd", function () {
        const truncatedUrl = truncateSmart(
            'http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee',
            57,
            '..'
        );
        expect(truncatedUrl).to.equal('http://yahoo.com/some/long/path/to/a/file?foo=bar#baz=bee');
        expect(truncatedUrl.length).to.equal(57);
    });

    it("Will remove scheme ('http') 3rd", function () {
        const truncatedUrl = truncateSmart(
            'http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee',
            53,
            '..'
        );
        expect(truncatedUrl).to.equal('yahoo.com/some/long/path/to/a/file?foo=bar#baz=bee');
        expect(truncatedUrl.length).to.equal(50);
    });

    it("Will truncate fragment ('#') 4th", function () {
        const truncatedUrl = truncateSmart(
            'http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee',
            45,
            '..'
        );
        expect(truncatedUrl).to.equal('yahoo.com/some/long/path/to/a/file?foo=bar#..');
        expect(truncatedUrl.length).to.equal(45);
    });

    it("Will truncate path ('/') 5th", function () {
        const truncatedUrl = truncateSmart(
            'http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorezthis#baz=bee',
            40,
            '..'
        );
        expect(truncatedUrl).to.equal('yahoo.com/some/long/path..a/file?foo=bar');
        expect(truncatedUrl.length).to.equal(40);
    });

    it('Will keep fragment when there is room for it', function () {
        const truncatedUrl = truncateSmart(
            'http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee',
            50,
            '..'
        );
        expect(truncatedUrl).to.equal('yahoo.com/some/long/path/to/a/file?foo=bar#baz=bee');
        expect(truncatedUrl.length).to.equal(50);
    });

    it("Will remove/truncate 'path' before 'host'", function () {
        const truncatedUrl = truncateSmart(
            'http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee',
            12,
            '..'
        );
        expect(truncatedUrl).to.equal('yahoo.com/..');
        expect(truncatedUrl.length).to.equal(12);
    });

    it("Will truncate 'host' when 'truncateLen' is very short", function () {
        const truncatedUrl = truncateSmart(
            'http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee',
            7,
            '..'
        );
        expect(truncatedUrl).to.equal('yah..om');
        expect(truncatedUrl.length).to.equal(7);
    });

    it("Will truncate 'path' when no 'query' exists", function () {
        const truncatedUrl = truncateSmart(
            'http://www.yahoo.com/some/long/path/to/a/file#baz=bee',
            17,
            '..'
        );
        expect(truncatedUrl).to.equal('yahoo.com/so..ile');
        expect(truncatedUrl.length).to.equal(17);
    });

    it("Will truncate 'query' when no 'path' exists", function () {
        const truncatedUrl = truncateSmart(
            'http://www.yahoo.com?foo=bar?ignorethis#baz=bee',
            17,
            '..'
        );
        expect(truncatedUrl).to.equal('yahoo.com?foo=bar');
        expect(truncatedUrl.length).to.equal(17);
    });

    it("Works when no 'scheme' or 'host' exists", function () {
        const truncatedUrl = truncateSmart(
            '/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee',
            17,
            '..'
        );
        expect(truncatedUrl).to.equal('/some/lo..foo=bar');
        expect(truncatedUrl.length).to.equal(17);
    });

    it("Works when only 'query' exists", function () {
        const truncatedUrl = truncateSmart('?foo=bar?ignorethis#baz=bee', 15, '..');
        expect(truncatedUrl).to.equal('?foo=bar#ba..ee');
        expect(truncatedUrl.length).to.equal(15);
    });

    it("Works when only 'fragment' exists", function () {
        const truncatedUrl = truncateSmart('#baz=bee', 5, '..');
        expect(truncatedUrl).to.equal('#b..e');
        expect(truncatedUrl.length).to.equal(5);
    });

    it('Works with a standard Google search URL', function () {
        const truncatedUrl = truncateSmart(
            'https://www.google.com/search?q=cake&oq=cake&aqs=chrome..69i57j69i60l5.573j0j7&sourceid=chrome&es_sm=93&ie=UTF-8',
            80,
            '..'
        );
        expect(truncatedUrl).to.equal(
            'google.com/search?q=cake&oq=cake&aqs=chrome...&sourceid=chrome&es_sm=93&ie=UTF-8'
        );
        expect(truncatedUrl.length).to.equal(80);
    });

    it('Works with a long URL', function () {
        const truncatedUrl = truncateSmart(
            'https://www.google.com/search?q=cake&safe=off&es_sm=93&tbas=0&tbs=qdr:d,itp:photo,ic:specific,isc:red,isz:l&tbm=isch&source=lnt&sa=X&ved=0CBQQpwVqFQoTCMCUxfOErMgCFeFrcgodUDwD1w&dpr=1&biw=1920&bih=955',
            80,
            '..'
        );
        expect(truncatedUrl).to.equal(
            'google.com/search?q=cake&safe=off&es_sm=93&t..rcgodUDwD1w&dpr=1&biw=1920&bih=955'
        );
        expect(truncatedUrl.length).to.equal(80);
    });

    it('Will start with a character from the URL and then append the ellipsis character(s)', function () {
        const truncatedUrl = truncateSmart(
            'http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee',
            3,
            '..'
        );
        expect(truncatedUrl).to.equal('y..');
        expect(truncatedUrl.length).to.equal(3);
    });

    it("Will write only the ellipsis character(s) ('..') when truncate length is 2", function () {
        const truncatedUrl = truncateSmart(
            'http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee',
            2,
            '..'
        );
        expect(truncatedUrl).to.equal('..');
        expect(truncatedUrl.length).to.equal(2);
    });

    it("Will write only the ellipsis character ('.') when truncate length is 1", function () {
        const truncatedUrl = truncateSmart(
            'http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee',
            1,
            '..'
        );
        expect(truncatedUrl).to.equal('.');
        expect(truncatedUrl.length).to.equal(1);
    });

    it('Will write nothing (empty string) when truncate length is 0', function () {
        const truncatedUrl = truncateSmart(
            'http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee',
            0,
            '..'
        );
        expect(truncatedUrl).to.equal('');
        expect(truncatedUrl.length).to.equal(0);
    });

    it("Will truncate 'hashtag routing' nicely", function () {
        const truncatedUrl = truncateSmart('/app#my/little/hashtag/route', 20, '..');
        expect(truncatedUrl).to.equal('/app#my/lit..g/route');
        expect(truncatedUrl.length).to.equal(20);
    });

    it("Allows a 'query' section in 'hashtag routing'", function () {
        const truncatedUrl = truncateSmart('/app#my/little/hashtag/route?foo=bar', 20, '..');
        expect(truncatedUrl).to.equal('/app#my/lit..foo=bar');
        expect(truncatedUrl.length).to.equal(20);
    });

    it("Removes 'hashtag routing' when truncate length is very small", function () {
        const truncatedUrl = truncateSmart('/app#my/little/hashtag/route?foo=bar', 4, '..');
        expect(truncatedUrl).to.equal('/app');
        expect(truncatedUrl.length).to.equal(4);
    });
});
