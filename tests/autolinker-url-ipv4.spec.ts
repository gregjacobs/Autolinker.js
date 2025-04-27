import { expect } from 'chai';
import Autolinker from '../src/autolinker';
import { generateUrlCombinationTests } from './util/generate-url-combination-tests';

describe(`Matching IPv4 addresses without scheme (e.g. '192.168.0.1' without 'http://' prefix) >`, () => {
    const autolinker = new Autolinker({
        newWindow: false, // so that target="_blank" is not added to resulting autolinked URLs - makes it easier to test the resulting strings
        stripPrefix: {
            www: false, // for the purposes of the generated tests, leaving this as false makes it easier to automatically create the 'expected' values
        },
    });

    it(`should match a basic IP address in text >`, () => {
        const result = autolinker.link('Joe went to 192.168.0.1 today.');
        expect(result).to.equal('Joe went to <a href="http://192.168.0.1">192.168.0.1</a> today.');
    });

    describe('combination URL tests >', () => {
        generateUrlCombinationTests({
            autolinker,
            schemes: [''], // no scheme
            hosts: ['4.4.4.4', '192.168.0.1'],
            ports: ['', ':8080'],
        });
    });

    it(`should not link an invalid IP with too many octets`, () => {
        const text = 'Joe went to 1.2.3.4.5 today';

        const result = autolinker.link(text);
        expect(result).to.equal(text);
    });

    it(`should not link an invalid IP with too few octets`, () => {
        const text = 'Joe went to 1.2.3 today';

        const result = autolinker.link(text);
        expect(result).to.equal(text);
    });

    it(`should not link an invalid IP that has an octet >255 (400)`, () => {
        const text = 'Joe went to 1.2.3.400 today';

        const result = autolinker.link(text);
        expect(result).to.equal(text);
    });

    it(`should not link an invalid IP that has an octet >255 (1000)`, () => {
        const text = 'Joe went to 1000.2.3.4 today';

        const result = autolinker.link(text);
        expect(result).to.equal(text);
    });

    it(`should not link an invalid IP that has an alpha char in an octet (first octet)`, () => {
        const text = 'Joe went to a1.2.3.4 today';

        const result = autolinker.link(text);
        expect(result).to.equal(text);
    });

    it(`should not link an invalid IP that has a alpha char in an octet, which could be misconstrued with a host name (last octet)`, () => {
        const text = 'Joe went to 1.2.3.4a today';

        const result = autolinker.link(text);
        expect(result).to.equal(text);
    });
});
