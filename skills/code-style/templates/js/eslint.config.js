import stylistic from "@stylistic/eslint-plugin";
import local from "./eslint-local-plugin.js";

export default [
	{ ignores: ["dist/**", "node_modules/**", "build/**", "coverage/**"] },
	{
		files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
		plugins: { "@stylistic": stylistic, local },
		rules: {
			"@stylistic/brace-style": ["error", "allman"],
			"@stylistic/indent": ["error", "tab"],
			"@stylistic/semi": ["error", "always"],
			"@stylistic/quotes": ["error", "double"],
			"@stylistic/comma-dangle": ["error", "always-multiline"],
			"@stylistic/max-len": ["off"],
			"local/destructure-param-newline": "error",
			"@stylistic/padding-line-between-statements": [
				"error",
				{ blankLine: "always", prev: "*", next: "return" },
				{ blankLine: "always", prev: "block-like", next: "*" },
				{ blankLine: "always", prev: ["const", "let", "var"], next: "*" },
				{ blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"] },
			],
		},
	},
];
