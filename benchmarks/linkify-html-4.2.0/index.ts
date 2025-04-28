// https://linkify.js.org/docs/linkify-html.html

import linkifyHtml from 'linkify-html';
import { inputText } from '../input-text';

export function run() {
    linkifyHtml(inputText);
}
