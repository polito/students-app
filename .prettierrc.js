module.exports = {
  "plugins": [require.resolve("@trivago/prettier-plugin-sort-imports")],
  "singleQuote": true,
  "trailingComma": "all",
  "arrowParens": "avoid",
  "bracketSpacing": true,
  "endOfLine": "auto",
  "semi": true,
  "importOrder": ["react-native-gesture-handler", "^react", "^@(?!ui/)(.*)$", "^~", "^\\w", "^@ui/(.*)$", "^[./]"],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true
}
