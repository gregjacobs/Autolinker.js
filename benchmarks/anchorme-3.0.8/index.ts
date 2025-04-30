import anchorme from 'anchorme';
import { inputText } from '../input-text';

console.log(anchorme(inputText));

export function runAnchorMe3_0_8() {
    anchorme({
        input: inputText,
        options: {
            attributes: {
                target: '_blank',
                class: 'detected',
            },
        },
        extensions: [
            // an extension for hashtag search
            {
                test: /#(\w|_)+/gi,
                transform: string => `<a href="https://a.b?s=${string.substring(1)}">${string}</a>`,
            },
            // an extension for mentions
            {
                test: /@(\w|_)+/gi,
                transform: string => `<a href="https://a.b/${string.substring(1)}">${string}</a>`,
            },
        ],
    });
}
