// import { Config } from "@jest/types";
const conf = require("../../jest.config.cjs");

const config = {
  ...conf,
  collectCoverage: true,
  coverageDirectory: "./workdocs/reports/coverage",
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/cli.ts",
    "!src/CliWrapper.ts", // exclude heavy CLI wrapper drawing/binding from coverage metrics
  ],
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./workdocs/reports/junit",
        outputName: "junit-report.xml",
      },
    ],
    [
      "jest-html-reporters",
      {
        publicPath: "./workdocs/reports/html",
        filename: "test-report.html",
        openReport: true,
        expand: true,
        pageTitle: "@decaf-ts/cli",
        stripSkippedTest: true,
        darkTheme: true,
        enableMergeData: true,
        dataMergeLevel: 2,
      },
    ],
  ],
  coverageThreshold: {
    global: {
      branches: 5,
      functions: 33,
      lines: 26,
      statements: 26,
    },
  },
};

module.exports = config;
