import { expect } from 'chai';
import Autolinker, { AutolinkerConfig } from 'autolinker';

describe('test Autolinker with TypeScript in Node', () => {
    it('should run using the AutolinkerConfig interface import', () => {
        const options: AutolinkerConfig = { newWindow: false }; // Note: Testing that the AutolinkerConfig interface can be imported
        const linkedStr = Autolinker.link('Go to google.com', options);

        expect(linkedStr).to.equal(`Go to <a href="http://google.com">google.com</a>`);
    });
});
