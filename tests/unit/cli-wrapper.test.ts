/* eslint-disable no-control-regex */
import { CliWrapper } from "../../src";
import * as path from "path";
import { CLI_FILE_NAME } from "../../src/constants";

class FixedSloganCli extends CliWrapper {
  constructor(private slogan: string) {
    super("tests/unit/__fixtures__");
  }

  public testPrintBanner() {
    return (this as any).printBanner();
  }

  protected getSlogan(): string {
    return this.slogan;
  }
}

describe("CliWrapper", () => {
  let cli: CliWrapper;
  const projectRoot = path.resolve(__dirname, "../..");
  const fixturesRoot = path.join(projectRoot, "tests/unit/__fixtures__");
  const fixtureFile = path.join(fixturesRoot, `build/${CLI_FILE_NAME}.cjs`);

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
    cli = new CliWrapper("tests/unit/__fixtures__");
  });

  it("crawls properly from the given basePath", () => {
    const files = cli["crawl"](fixturesRoot);
    expect(files).toEqual(expect.arrayContaining([fixtureFile]));
  });

  it("loads from a given file", async () => {
    await cli["load"](fixtureFile);
    expect(cli["modules"]["build"]).toBeDefined();
  });

  it("loads all modules from a base path within 4 levels", async () => {
    await cli["boot"]();
    expect(cli["modules"]["build"]).toBeDefined();
  });

  it("falls back to the smallest banner when the terminal is too narrow", () => {
    const originalColumnsDescriptor = Object.getOwnPropertyDescriptor(
      process.stdout,
      "columns"
    );

    const restoreColumns = () => {
      if (originalColumnsDescriptor) {
        Object.defineProperty(
          process.stdout,
          "columns",
          originalColumnsDescriptor
        );
      }
    };

    try {
      Object.defineProperty(process.stdout, "columns", {
        value: 0,
        configurable: true,
      });

      const smallest = cli["selectBannerLayout"]();

      Object.defineProperty(process.stdout, "columns", {
        value: Math.max(0, smallest.width - 1),
        configurable: true,
      });

      const belowMinimum = cli["selectBannerLayout"]();
      expect(belowMinimum.width).toBe(smallest.width);
    } finally {
      restoreColumns();
    }
  });

  it("right-aligns the slogan within the banner width when it fits", () => {
    const slogan = "small";
    const bannerCli = new FixedSloganCli(slogan);
    const originalColumnsDescriptor = Object.getOwnPropertyDescriptor(
      process.stdout,
      "columns"
    );

    const restoreColumns = () => {
      if (originalColumnsDescriptor) {
        Object.defineProperty(
          process.stdout,
          "columns",
          originalColumnsDescriptor
        );
      }
    };

    try {
      Object.defineProperty(process.stdout, "columns", {
        value: 240,
        configurable: true,
      });

      const layout = (bannerCli as any)["selectBannerLayout"]();
      const write = jest
        .spyOn(process.stdout, "write")
        .mockImplementation(() => true);

      bannerCli.testPrintBanner();

      const output = write.mock.calls
        .map((call) => String(call[0]).replace(/\x1b\[[0-9;]*m/g, ""))
        .filter((line) => line.includes(slogan));

      expect(output).toHaveLength(1);
      expect(output[0].replace(/\n$/, "")).toBe(
        `${" ".repeat(layout.indent + layout.width - slogan.length)}${slogan}`
      );
    } finally {
      restoreColumns();
      jest.restoreAllMocks();
    }
  });
});
