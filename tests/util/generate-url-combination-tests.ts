import Autolinker from '../../src/autolinker';
import { generateLinkTests } from './generate-link-tests';

/**
 * Utility function to generate tests that check URL combinations with
 * different schemes, hosts, and ports.
 *
 * This helps us test a wide variety of URL formats and ensure that Autolinker
 * correctly identifies and links them.
 */
export function generateUrlCombinationTests({
    autolinker,
    schemes,
    hosts,
    ports,
}: {
    autolinker: Autolinker;
    schemes: string[];
    hosts: string[];
    ports: string[];
}) {
    schemes.forEach(scheme => {
        hosts.forEach(host => {
            ports.forEach(port => {
                const hierPart = `${host}${port}`; // hier-part reference: https://www.rfc-editor.org/rfc/rfc3986#appendix-A
                const origin = `${scheme}${hierPart}`;

                // When 'scheme' is empty string, Autolinker fills in 'http://'
                const expectedOrigin = `${scheme || 'http://'}${hierPart}`;

                generateLinkTests([
                    {
                        input: `${origin}`,
                        description: 'origin only',
                        expectedHref: expectedOrigin,
                        expectedAnchorText: hierPart,
                        autolinker,
                    },
                    {
                        input: `${origin}/`,
                        description: 'trailing slash',
                        expectedHref: `${expectedOrigin}/`,
                        expectedAnchorText: hierPart,
                        autolinker,
                    },
                    {
                        input: `${origin}/path`,
                        description: 'basic path',
                        expectedHref: `${expectedOrigin}/path`,
                        expectedAnchorText: `${hierPart}/path`,
                        autolinker,
                    },
                    {
                        input: `${origin}/path/that/is-longer`,
                        description: 'long path',
                        expectedHref: `${expectedOrigin}/path/that/is-longer`,
                        expectedAnchorText: `${hierPart}/path/that/is-longer`,
                        autolinker,
                    },
                    {
                        input: `${origin}/path/with/dash/at-end-`,
                        description: 'path ending in a dash (valid URL)',
                        expectedHref: `${expectedOrigin}/path/with/dash/at-end-`,
                        expectedAnchorText: `${hierPart}/path/with/dash/at-end-`,
                        autolinker,
                    },
                    {
                        input: `${origin}?abc`,
                        description: 'basic query string',
                        expectedHref: `${expectedOrigin}?abc`,
                        expectedAnchorText: `${hierPart}?abc`,
                        autolinker,
                    },
                    {
                        input: `${origin}?param=1&param-2=2`,
                        description: 'long query string',
                        expectedHref: `${expectedOrigin}?param=1&param-2=2`,
                        expectedAnchorText: `${hierPart}?param=1&amp;param-2=2`,
                        autolinker,
                    },
                    {
                        input: `${origin}#my-hash`,
                        description: 'basic hash',
                        expectedHref: `${expectedOrigin}#my-hash`,
                        expectedAnchorText: `${hierPart}#my-hash`,
                        autolinker,
                    },
                    {
                        input: `${origin}#param1=a&param2=b`,
                        description: 'hash params',
                        expectedHref: `${expectedOrigin}#param1=a&param2=b`,
                        expectedAnchorText: `${hierPart}#param1=a&amp;param2=b`,
                        autolinker,
                    },
                    {
                        input: `${origin}/path?abc#my-hash`,
                        description: 'path, query string, and hash',
                        expectedHref: `${expectedOrigin}/path?abc#my-hash`,
                        expectedAnchorText: `${hierPart}/path?abc#my-hash`,
                        autolinker,
                    },
                    {
                        input: `${origin}/wiki/IANA_(disambiguation)`,
                        description: 'parens in the URL',
                        expectedHref: `${expectedOrigin}/wiki/IANA_(disambiguation)`,
                        expectedAnchorText: `${hierPart}/wiki/IANA_(disambiguation)`,
                        autolinker,
                    },
                    {
                        input: `${origin}/-+&@#/%=~_()|'$*[]?!:,.;/?param1=value-+&@#/%=~_()|'$*[]?!:,.;#hash-+&@#/%=~_()|'$*[]?!:,.;z`,
                        description: 'all special chars in the URL',
                        expectedHref: `${expectedOrigin}/-+&@#/%=~_()|'$*[]?!:,.;/?param1=value-+&@#/%=~_()|'$*[]?!:,.;#hash-+&@#/%=~_()|'$*[]?!:,.;z`,
                        expectedAnchorText: `${hierPart}/-+&amp;@#/%=~_()|'$*[]?!:,.;/?param1=value-+&amp;@#/%=~_()|'$*[]?!:,.;#hash-+&amp;@#/%=~_()|'$*[]?!:,.;z`,
                        autolinker,
                    },
                    {
                        input: `${origin}'s`,
                        description: 'domain with apostrophe s',
                        expectedHref: `${expectedOrigin}`,
                        expectedAnchorText: `${hierPart}`,
                        expectedAfterAnchorText: `'s`,
                        autolinker,
                    },
                    {
                        input: `${origin}/path's`,
                        description: 'path with apostrophe s',
                        expectedHref: `${expectedOrigin}/path's`,
                        expectedAnchorText: `${hierPart}/path's`,
                        autolinker,
                    },
                    {
                        input: `${origin}'s/path`,
                        description: 'domain with apostrophe s and suffixed paths',
                        expectedHref: `${expectedOrigin}`,
                        expectedAnchorText: `${hierPart}`,
                        expectedAfterAnchorText: `'s/path`,
                        autolinker,
                    },
                ]);
            });
        });
    });
}
