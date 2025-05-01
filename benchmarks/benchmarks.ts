import dedent from 'dedent';
import fse from 'fs-extra';
import path from 'path';
import Benchmark from 'benchmark';
import CliTable from 'cli-table';
import { markdownTable } from 'markdown-table';

// Autolinker benchmarks
import { runAutolinkerCurrent } from './autolinker-current/index';
// import { runAutolinker4_1_3 } from './autolinker-4.1.3/index';
// import { runAutolinker4_1_2 } from './autolinker-4.1.2/index';
// import { runAutolinker4_0_0 } from './autolinker-4.0.0/index';
// import { runAutolinker3_16_2 } from './autolinker-3.16.2/index';
// import { runAutolinker2_2_2 } from './autolinker-2.2.2/index';
// import { runAutolinker1_8_3 } from './autolinker-1.8.3/index';

// Other library benchmarks
import { runAnchorMe3_0_8 } from './anchorme-3.0.8/index';
import { runLinkifyIt5_0_0 } from './linkify-it-5.0.0/index';
import { runLinkifyJsHtml4_2_0 } from './linkifyjs-4.2.0/index';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
run().catch((error: any) => {
    console.error('An error occurred while running the benchmarks:');
    console.error(error?.target?.error ?? error);
    process.exit(1);
});

async function run() {
    const rootDir = path.normalize(`${__dirname}/..`);
    const currentVer = fse.readJsonSync(`${rootDir}/package.json`).version;

    // prettier-ignore
    const benchmarkCases: BenchmarkCase[] = [
        { name: 'autolinker', version: currentVer, url: null, exec: runAutolinkerCurrent},
        { name: 'anchorme', version: '3.0.8', url: 'https://github.com/alexcorvi/anchorme.js', exec: runAnchorMe3_0_8},
        { name: 'linkify-it', version: '5.0.0', url: 'https://github.com/markdown-it/linkify-it', exec: runLinkifyIt5_0_0},
        { name: 'linkifyjs', version: '4.2.0', url: 'https://linkify.js.org/docs/linkify-html.html', exec: runLinkifyJsHtml4_2_0},
    ];

    // Run the benchmarks
    const benchmarkResults = await executeBenchmarks(benchmarkCases, {
        onCycle(event: Benchmark.Event) {
            console.log(String(event.target));
        },
    });
    const fastest = benchmarkResults[0];

    // Report output to console
    const tableHeaders = ['Library', 'Ops/sec', 'MOE', 'Compared to Fastest'];
    const table = new CliTable({
        head: tableHeaders,
    });
    benchmarkResults.forEach(result => {
        table.push([
            `${result.name}@${result.version}`,
            Benchmark.formatNumber(Math.floor(result.ops)),
            result.margin,
            result === fastest
                ? 'Fastest ✅'
                : `${result.pctSlowerThanFastest}% (${result.timesSlowerThanFastest}x) slower`,
        ]);
    });
    const tableStr = table.toString();
    console.log(tableStr);

    // Write output to README.md
    const markdownTableContents = markdownTable([
        tableHeaders,
        ...benchmarkResults.map(result => {
            return [
                result.url
                    ? `[${result.name}](${result.url})@${result.version}`
                    : `**${result.name}**@${result.version}`,
                Benchmark.formatNumber(Math.floor(result.ops)),
                result.margin,
                result === fastest
                    ? 'Fastest ✅'
                    : `${result.pctSlowerThanFastest}% (${result.timesSlowerThanFastest}x) slower`,
            ];
        }),
    ]);
    const readmePath = `${rootDir}/README.md`;
    const readmeContents = fse.readFileSync(readmePath, 'utf-8');
    const newReadmeContents = readmeContents.replace(
        /<!-- BENCHMARKS_TABLE_START -->[\s\S]*?<!-- BENCHMARKS_TABLE_END -->/g,
        () => {
            return dedent`
            <!-- BENCHMARKS_TABLE_START -->
            ${markdownTableContents}
            <!-- Last update: ${new Date().toISOString()} -->
            <!-- BENCHMARKS_TABLE_END -->
        `;
        }
    );
    if (readmeContents === newReadmeContents) {
        throw new Error(
            `README.md file update was unsuccessful. Do the replacement tokens still exist? Check replace call in this script`
        );
    }
    // console.log(newReadmeContents);
    fse.writeFileSync(readmePath, newReadmeContents, 'utf-8');
    console.log('Wrote README.md with new benchmarks table');
}

/**
 * Executes the benchmark cases and returns the result.
 */
async function executeBenchmarks(
    benchmarkCases: BenchmarkCase[],
    options: {
        onCycle?: (event: Benchmark.Event) => void;
    } = {}
): Promise<BenchmarkResult[]> {
    return new Promise((resolve, reject) => {
        const suite = new Benchmark.Suite();

        // Add benchmarks
        benchmarkCases.forEach(benchmarkDesc => {
            const { name, version, exec } = benchmarkDesc;

            suite.add(`${name}@${version}`, exec);
        });

        if (options.onCycle) {
            suite.on('cycle', options.onCycle);
        }

        suite.on('complete', () => {
            const highestOps = suite.reduce((highestOps: number, benchmark: Benchmark) => {
                return Math.max(highestOps, benchmark.hz);
            }, 0);

            const results: BenchmarkResult[] = suite.map((bench: Benchmark, i: number) => {
                const benchmarkCase = benchmarkCases[i]; // the order of the results are the same order as benchmarks were added, so we can look up the benchmarkCase against the input array
                const ops = bench.hz; // ops/sec
                const resultPctSlower = pctSlower(ops, highestOps);
                const resultTimesSlower = timesSlower(ops, highestOps);

                return {
                    name: benchmarkCase.name,
                    version: benchmarkCase.version,
                    url: benchmarkCase.url,
                    ops,
                    pctSlowerThanFastest: resultPctSlower, // will be 0 for fastest
                    timesSlowerThanFastest: resultTimesSlower, // will be 0 for fastest
                    margin: '±' + bench.stats.rme.toFixed(2) + '%',
                };
            });
            results.sort((a, b) => b.ops - a.ops); // sort results in descending order of ops/sec

            resolve(results);
        });
        suite.on('error', reject);

        suite.run({ async: true, minSamples: 100 });
    });
}

function pctSlower(currentOpsSec: number, fastestOpsSec: number): number {
    return Math.floor((1 - currentOpsSec / fastestOpsSec) * 100);
}

function timesSlower(currentOpsSec: number, fastestOpsSec: number): string {
    return (fastestOpsSec / currentOpsSec).toFixed(2);
}

// Describes a library/version to benchmark
interface BenchmarkCase {
    name: string;
    version: string;
    url: string | null;
    exec: () => void;
}

interface BenchmarkResult {
    name: string;
    version: string;
    url: string | null;
    ops: number; // operations per second
    pctSlowerThanFastest: number; // will be 0 for fastest
    timesSlowerThanFastest: string; // will be '1.00' for fastest
    margin: string;
}
