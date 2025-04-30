import LinkifyIt from 'linkify-it';
import tlds from 'tlds';
import { inputText } from '../input-text';

const linkify = new LinkifyIt();

// Reload full tlds list & add unofficial `.onion` domain.
linkify
    .tlds(tlds) // Reload with full tlds list
    .set({ fuzzyIP: true }); // Enable IPs in fuzzy links (without schema)

export function runLinkifyIt5_0_0() {
    linkify.match(inputText);
    // NOTE: produces matches array, but doesn't link in the text (so
    // technically it does less work than Autolinker or linkifyjs at the moment)
}
