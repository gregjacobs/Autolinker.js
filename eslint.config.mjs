// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ...eslint.configs.recommended,
        rules: {
            ...eslint.configs.recommended.rules,
            'no-control-regex': 'off',
            'no-misleading-character-class': 'off', // do need to do further research on this for if we can handle this with how Autolinker processes text one char at a time. See https://eslint.org/docs/latest/rules/no-misleading-character-class
        }
    },
    tseslint.configs.recommended,
);