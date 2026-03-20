import { CliWrapper } from "../../src";
import * as path from "path";
import { CLI_FILE_NAME } from "../../src/constants";

describe("CliWrapper", () => {
  let cli: CliWrapper;
  const projectRoot = path.resolve(__dirname, "../..");
  const fixturesRoot = path.join(projectRoot, "tests/unit/__fixtures__");
  const fixtureFile = path.join(
    fixturesRoot,
    `build/${CLI_FILE_NAME}.cjs`
  );

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
});
