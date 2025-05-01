import fse from 'fs-extra';
import Benchmark from 'benchmark';
import CliTable from 'cli-table';

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
    const currentVer = fse.readJsonSync(`${__dirname}/../package.json`).version;

    // prettier-ignore
    const benchmarkCases: BenchmarkCase[] = [
        { name: 'autolinker', version: currentVer, url: null, exec: runAutolinkerCurrent},
        { name: 'anchorme', version: '3.0.8', url: 'https://github.com/alexcorvi/anchorme.js', exec: runAnchorMe3_0_8},
        { name: 'linkify-it', version: '5.0.0', url: 'https://github.com/markdown-it/linkify-it', exec: runLinkifyIt5_0_0},
        { name: 'linkifyjs', version: '4.2.0', url: 'https://linkify.js.org/docs/linkify-html.html', exec: runLinkifyJsHtml4_2_0},
    ];

    const results = await executeBenchmarks(benchmarkCases, {
        onCycle(event: Benchmark.Event) {
            console.log(String(event.target));
        },
    });

    // sort results in descending order of ops/sec
    results.sort((a, b) => b.ops - a.ops);
    const fastest = results[0];

    // Report output
    const table = new CliTable({
        head: ['Library', 'Ops/sec', 'MOE', 'Compared to Fastest'],
    });
    results.forEach(result => {
        const resultPctSlower = pctSlower(result.ops, fastest.ops);
        const resultTimesSlower = timesSlower(result.ops, fastest.ops);

        table.push([
            result.name,
            Benchmark.formatNumber(Math.floor(result.ops)),
            result.margin,
            result === fastest
                ? 'Fastest ✅'
                : `${resultPctSlower}% (${resultTimesSlower}x) slower`,
        ]);
    });
    console.log(table.toString());
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
            const results: BenchmarkResult[] = suite.map((bench: Benchmark, i: number) => {
                const benchmarkCase = benchmarkCases[i]; // the order of the results are the same order as benchmarks were added, so we can look up the benchmarkCase against the input array

                return {
                    name: bench.name,
                    version: benchmarkCase.version,
                    url: benchmarkCase.url,
                    ops: bench.hz, // ops/sec
                    margin: '±' + bench.stats.rme.toFixed(2) + '%',
                };
            });
            resolve(results);
        });
        suite.on('error', reject);

        suite.run({ async: true, minSamples: 100 });
    });
}

function pctSlower(currentOpsSec: number, fastestOpsSec: number) {
    return Math.floor((1 - currentOpsSec / fastestOpsSec) * 100);
}

function timesSlower(currentOpsSec: number, fastestOpsSec: number) {
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
    ops: number; // operations per second
    margin: string;
}
