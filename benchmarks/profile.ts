/* This file can be used to generate a performance profile in the debugger.
 *
 * To use:
 *
 * 1. Run this file with "npm run profile"
 * 2. Open the Node.js debugger from Chrome's devtools. Code execution should be
 *    paused on the 'debugger' line below.
 * 3. Switch to the "Performance" tab, and click "Record" ('round dot' button)
 * 4. Stop the recording after ther terminal reports that it's waiting for the
 *    debugger to disconnect.
 */

import Autolinker from '../src/autolinker';
import { inputText } from './input-text';

// eslint-disable-next-line no-debugger
debugger;
for (let i = 0; i < 10000; i++) {
    Autolinker.link(inputText);
}
