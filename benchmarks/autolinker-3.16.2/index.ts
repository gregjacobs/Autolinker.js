import Autolinker from 'autolinker';
import { inputText } from '../input-text';
import { commonAutolinkerConfig } from '../common-autolinker-config';

const autolinker = new Autolinker(commonAutolinkerConfig);

export function runAutolinker3_16_2() {
    autolinker.link(inputText);
}
