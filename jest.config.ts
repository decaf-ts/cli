import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  verbose: true,
  rootDir: __dirname,
  transform: { "^.+\\.ts?$": "ts-jest" },
  testEnvironment: "node",
  testRegex: "/tests/.*\\.(test|spec)\\.(ts|tsx)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/cli.ts",
    "!src/CliWrapper.ts" // exclude heavy CLI wrapper drawing/binding from coverage metrics
  ],
  coverageThreshold: {
    global: { branches: 25, functions: 90, lines: 95, statements: 95 },
  },
  reporters: ["default"],
  watchman: false,
};

export default config;
