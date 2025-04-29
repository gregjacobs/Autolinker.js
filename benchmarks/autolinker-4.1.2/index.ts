import Autolinker from 'autolinker';
import { inputText } from '../input-text';

const autolinker = new Autolinker();

export function run() {
    autolinker.link(inputText);
}
