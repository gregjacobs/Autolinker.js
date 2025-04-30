import Autolinker from 'autolinker';
import { inputText } from '../input-text';
import { sharedAutolinkerConfig } from '../shared-autolinker-config';

const autolinker = new Autolinker(sharedAutolinkerConfig);

export function runAutolinker4_1_2() {
    autolinker.link(inputText);
}
