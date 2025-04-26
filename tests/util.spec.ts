import { ellipsis } from '../src/utils';

describe('Autolinker.Util', function () {
    describe('ellipsis()', () => {
        it('should add the given ellipsis characters to the end of the string', () => {
            const result = ellipsis('Hello, world!', 5, '...');

            expect(result).toBe('He...');
        });
    });
});
