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

const suite = new Benchmark.Suite();

// add tests
suite
    // Autolinker benchmarks
    .add('autolinker@current-src', runAutolinkerCurrent)
    // .add('autolinker@4.1.3', runAutolinker4_1_3)
    // .add('autolinker@4.1.2', runAutolinker4_1_2)
    // .add('autolinker@4.0.0', runAutolinker4_0_0)
    // .add('autolinker@3.16.2', runAutolinker3_16_2)
    // .add('autolinker@2.2.2', runAutolinker2_2_2)
    // .add('autolinker@1.8.3', runAutolinker1_8_3)

    // Other libraries benchmarks
    .add('anchorme@3.0.8', runAnchorMe3_0_8)
    .add('linkify-it@5.0.0', runLinkifyIt5_0_0)
    .add('linkifyjs@4.2.0 (linkify-html)', runLinkifyJsHtml4_2_0)

    .on('cycle', (event: Benchmark.Event) => {
        console.log(String(event.target));
    })
    .on('complete', () => {
        console.log('-------------------------------------');

        const results: Result[] = suite.map((bench: Benchmark) => {
            return {
                name: bench.name,
                ops: bench.hz,
                margin: '±' + bench.stats.rme.toFixed(2) + '%',
            };
        });
        results.sort((a, b) => b.ops - a.ops);

        const fastest = results[0];

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

        console.log('Fastest is: ' + suite.filter('fastest').map('name'));
    })
    .run({ async: true, minSamples: 100 });

function pctSlower(currentOpsSec: number, fastestOpsSec: number) {
    return Math.floor((1 - currentOpsSec / fastestOpsSec) * 100);
}

function timesSlower(currentOpsSec: number, fastestOpsSec: number) {
    return (fastestOpsSec / currentOpsSec).toFixed(2);
}

interface Result {
    name: string;
    ops: number; // operations per second
    margin: string;
}
