import { Autolinker } from '../../src/index';
import { inputText } from '../input-text';

const autolinker = new Autolinker();

export function runAutolinkerCurrent() {
    autolinker.link(inputText);
}
