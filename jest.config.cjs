const config = {
  verbose: true,
  // eslint-disable-next-line no-undef
  rootDir: __dirname,
  transform: {
    "^.+\\.ts$": "ts-jest",
    "^.+/node_modules/commander/.*\\.js$": [
      "babel-jest",
      { plugins: ["@babel/plugin-transform-modules-commonjs"] },
    ],
  },
  transformIgnorePatterns: ["/node_modules/(?!commander/)"],
  testEnvironment: "node",
  testRegex: "/tests/.*\\.(test|spec)\\.(ts|tsx)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverage: false,
  reporters: ["default"],
  watchman: false,
};

// eslint-disable-next-line no-undef
module.exports = config;
