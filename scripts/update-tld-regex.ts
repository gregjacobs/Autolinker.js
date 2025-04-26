import axios from 'axios';
import dedent from 'dedent';
import fse from 'fs-extra';
import punycode from 'punycode';

if (require.main === module) {
    // If called directly from the command line
    updateTldRegex().catch(error => {
        console.error(error);
        process.exit(1);
    });
}

export async function updateTldRegex() {
    const tldsFile = await axios.get<string>('http://data.iana.org/TLD/tlds-alpha-by-domain.txt', {
        responseType: 'text',
    });

    const tldRegexStr = domainsToRegex(tldsFile.data);
    const outputFile =
        dedent`
        // NOTE: THIS IS A GENERATED FILE\n// To update with the latest TLD list, run \`npm run update-tld-regex\`
        
        export const tldRegexStr = '(?:${tldRegexStr})';

        export const tldRegex = new RegExp('^' + tldRegexStr + '$');
    ` + '\n';
    await fse.outputFile('./src/parser/tld-regex.ts', outputFile);
}

function domainsToRegex(contents: string): string {
    const lines = contents.split('\n').filter(notCommentLine);

    const domains = lines
        .map(dePunycodeDomain)
        .flat()
        .filter(s => !!s) // remove empty elements;
        .sort(compareLengthLongestFirst);

    return domains.join('|');
}

function notCommentLine(line: string): boolean {
    return !/^#/.test(line);
}

function dePunycodeDomain(domain: string): string[] {
    domain = domain.toLowerCase();
    if (/xn--/.test(domain)) {
        return [domain, punycode.toUnicode(domain)];
    }
    return [domain];
}

function compareLengthLongestFirst(a: string, b: string): number {
    let result = b.length - a.length;
    if (result === 0) {
        result = a.localeCompare(b);
    }
    return result;
}
