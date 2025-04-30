// @ts-expect-error No TypeScript definitions for v1.8.3
import Autolinker from 'autolinker';
import { inputText } from '../input-text';
import { commonAutolinkerConfig } from '../common-autolinker-config';

const autolinker = new Autolinker(commonAutolinkerConfig);

export function runAutolinker1_8_3() {
    autolinker.link(inputText);
}
