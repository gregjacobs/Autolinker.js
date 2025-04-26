import { defaults, ellipsis } from '../src/utils';

describe('Autolinker.Util', function () {
    describe('defaults()', function () {
        it('should not overwrite any properties that exist on the destination object', function () {
            let obj = defaults({ a: 1, b: 2, c: 3 }, { a: 91, b: 92, c: 93 });

            expect(obj).toEqual({ a: 1, b: 2, c: 3 });
        });

        it('should add properties that do not exist on the destination object, without overwriting properties that do exist', function () {
            let obj = defaults({ b: 2 }, { a: 91, b: 92, c: 93 });

            expect(obj).toEqual({ a: 91, b: 2, c: 93 });
        });
    });

    describe('ellipsis()', () => {
        it('should add the given ellipsis characters to the end of the string', () => {
            const result = ellipsis('Hello, world!', 5, '...');

            expect(result).toBe('He...');
        });
    });
});
