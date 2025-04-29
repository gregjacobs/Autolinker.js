import Benchmark from 'benchmark';
import CliTable from 'cli-table';

import { run as runAutolinkerCurrent } from './autolinker-current/index';
import { run as runAutolinker4_1_2 } from './autolinker-4.1.2/index';
// import { run as runAutolinker4_1_1 } from './autolinker-4.1.1/index';
// import { run as runAutolinker4_1_0 } from './autolinker-4.1.0/index';
// import { run as runAutolinker4_0_2 } from './autolinker-4.0.2/index';
// import { run as runAutolinker4_0_1 } from './autolinker-4.0.1/index';
import { run as runAutolinker4_0_0 } from './autolinker-4.0.0/index';
// import { run as runAutolinker3_16_2 } from './autolinker-3.16.2/index';
// import { run as runAutolinker2_2_2 } from './autolinker-2.2.2/index';
// import { run as runAutolinker1_8_3 } from './autolinker-1.8.3/index';
import { run as runLinkifyIt5_0_0 } from './linkify-it-5.0.0/index';
import { run as runLinkifyHtml4_2_0 } from './linkify-html-4.2.0/index';
import { run as runLinkifyString4_2_0 } from './linkify-string-4.2.0/index';

const suite = new Benchmark.Suite();

// add tests
suite
    .add('autolinker@current-src', runAutolinkerCurrent)
    .add('autolinker@4.1.2', runAutolinker4_1_2)
    // .add('autolinker@4.1.1', runAutolinker4_1_1)
    // .add('autolinker@4.1.0', runAutolinker4_1_0)
    // .add('autolinker@4.0.2', runAutolinker4_0_2)
    // .add('autolinker@4.0.1', runAutolinker4_0_1)
    .add('autolinker@4.0.0', runAutolinker4_0_0)
    // .add('autolinker@3.16.2', runAutolinker3_16_2)
    // .add('autolinker@2.2.2', runAutolinker2_2_2)
    // .add('autolinker@1.8.3', runAutolinker1_8_3)
    .add('linkify-it@5.0.0', runLinkifyIt5_0_0)
    .add('linkify-html@4.2.0', runLinkifyHtml4_2_0)
    .add('linkify-string@4.2.0', runLinkifyString4_2_0)

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
