// https://linkify.js.org/docs/linkify-string.html

import linkifyString from 'linkify-string';
import { inputText } from '../input-text';

export function run() {
    linkifyString(inputText);
}
