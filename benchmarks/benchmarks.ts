import Benchmark from 'benchmark';

import { run as runAutolinkerCurrent } from './autolinker-current/index';
import { run as runAutolinker4_1_1 } from './autolinker-4.1.0/index';
// import { run as runAutolinker4_1_0 } from './autolinker-4.1.0/index';
// import { run as runAutolinker4_0_2 } from './autolinker-4.0.2/index';
// import { run as runAutolinker4_0_1 } from './autolinker-4.0.1/index';
// import { run as runAutolinker4_0_0 } from './autolinker-4.0.0/index';
import { run as runAutolinker3_16_2 } from './autolinker-3.16.2/index';
import { run as runAutolinker2_2_2 } from './autolinker-2.2.2/index';
import { run as runAutolinker1_8_3 } from './autolinker-1.8.3/index';
import { run as runLinkifyIt5_0_0 } from './linkify-it-5.0.0/index';
import { run as runLinkifyJs4_2_0 } from './linkify-js-4.2.0/index';

const suite = new Benchmark.Suite();

// add tests
suite
    .add('autolinker@current', runAutolinkerCurrent)
    .add('autolinker@4.1.1', runAutolinker4_1_1)
    // .add('autolinker@4.1.0', runAutolinker4_1_0)
    // .add('autolinker@4.0.2', runAutolinker4_0_2)
    // .add('autolinker@4.0.1', runAutolinker4_0_1)
    // .add('autolinker@4.0.0', runAutolinker4_0_0)
    .add('autolinker@3.16.2', runAutolinker3_16_2)
    .add('autolinker@2.2.2', runAutolinker2_2_2)
    .add('autolinker@1.8.3', runAutolinker1_8_3)
    .add('linkify-it@5.0.0', runLinkifyIt5_0_0)
    .add('linkify-js@4.2.0', runLinkifyJs4_2_0)

    .on('cycle', (event: Benchmark.Event) => {
        console.log(String(event.target));
    })
    .on('complete', () => {
        console.log('Fastest is: ' + suite.filter('fastest').map('name'));
    })
    .run({ async: true, minSamples: 100 });
