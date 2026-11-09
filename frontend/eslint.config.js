import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';

export default [
    { ignores: ['dist/**', 'node_modules/**'] },
    {
	files: ['src/**/*.{js,jsx}'],
	languageOptions: {
	    ecmaVersion: 'latest',
	    sourceType: 'module',
	    parserOptions: { ecmaFeatures: { jsx: true } },
	    globals: { ...globals.browser },
	},
	plugins: { react, 'react-hooks': hooks },
	settings: { react: { version: 'detect' } },
	rules: {
	    ...js.configs.recommended.rules,
	    ...react.configs.recommended.rules,
	    ...hooks.configs.recommended.rules,
	    'react/react-in-jsx-scope': 'off',
	    'react/prop-types': 'off',
	},
    },
    {
	files: ['src/test/**', '**/*.test.{js,jsx}'],
	languageOptions: { globals: { ...globals.vitest } },
    },
];
