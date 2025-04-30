import { inputText } from '../input-text';

// Try to set up linkifyjs with the same features as Autolinker
// https://linkify.js.org/docs/linkify-html.html
import linkifyHtml from 'linkify-html'; // html parsing
import linkifyString from 'linkify-string'; // non-html parsing
import 'linkify-plugin-hashtag';
import 'linkify-plugin-ip';
import 'linkify-plugin-mention';

// From https://linkify.js.org/docs/plugin-hashtag.html and
//      https://linkify.js.org/docs/plugin-mention.html
const linkifyOptions = {
    formatHref: {
        hashtag: (href: string) => 'https://bsky.app/hashtag/' + href.substr(1),
        mention: (href: string) => 'https://example.com/profiles' + href,
    },
};

// console.log(linkifyHtml(inputText, linkifyOptions)); // for testing

export function runLinkifyJsHtml4_2_0() {
    linkifyHtml(inputText, linkifyOptions);
}

export function runLinkifyJsString4_2_0() {
    linkifyString(inputText, linkifyOptions);
}
