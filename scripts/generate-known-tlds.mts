
import dedent from 'dedent';
import fse from 'fs-extra';
import tlds from 'tlds' with { type: "json" };

generateKnownTlds().catch(error => {
    console.error(error);
    process.exit(1);
});

/**
 * Updates the set of known top-level domains (TLDs). Ex: '.com', '.net', etc.
 */
export async function generateKnownTlds() {
    const tldRegexStr = tlds.toSorted(compareLengthLongestFirst).join('|');

    const outputFile =
        dedent`
        // NOTE: THIS IS A GENERATED FILE\n// To update with the latest TLD list, update the 'tlds' dependency version and then run a build
        
        export const tldRegex = /^(?:${tldRegexStr})$/;
    ` + '\n';
    await fse.outputFile('./src/parser/known-tlds.ts', outputFile);
}

function compareLengthLongestFirst(a: string, b: string): number {
    let result = b.length - a.length;
    if (result === 0) {
        result = a.localeCompare(b);
    }
    return result;
}
