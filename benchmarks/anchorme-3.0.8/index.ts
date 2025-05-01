import anchorme from 'anchorme';
import { inputText } from '../input-text';

// Try to set up anchorme with roughly the same features as Autolinker
const options = {
    input: inputText,
    options: {
        attributes: {
            target: '_blank',
            class: 'detected',
        },
    },
    extensions: [
        // hashtag search
        {
            test: /#(\w|_)+/gi,
            transform: (string: string) =>
                `<a href="https://a.b?s=${string.substring(1)}">${string}</a>`,
        },
        // mentions
        {
            test: /@(\w|_)+/gi,
            transform: (string: string) =>
                `<a href="https://a.b/${string.substring(1)}">${string}</a>`,
        },
    ],
};

// console.log('input text: ', inputText);
// console.log('output: ', anchorme(options));  // seems anchorme.js@3.0.8 gets confused between #anchors in URLs and hashtags

export function runAnchorMe3_0_8() {
    anchorme(options);
}
