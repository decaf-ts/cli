import { CliWrapper } from "../../src";
import * as path from "path";
import { CLI_FILE_NAME } from "../../src/constants";

describe("CliWrapper", () => {
  let cli: CliWrapper;
  const projectRoot = path.resolve(__dirname, "../..");

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
    cli = new CliWrapper("./");
  });

  it("crawls properly from the given basePath", () => {
    const files = cli["crawl"](path.join(projectRoot, "lib"));
    expect(files).toEqual(
      expect.arrayContaining([
        path.join(projectRoot, `lib/demo/${CLI_FILE_NAME}.cjs`),
      ])
    );
  });

  it("loads from a given file", async () => {
    await cli["load"](path.join(projectRoot, `lib/demo/${CLI_FILE_NAME}.cjs`));
    expect(cli["modules"]["demo"]).toBeDefined();
  });

  it("loads all modules from a base path within 4 levels", async () => {
    await cli["boot"]();
    expect(cli["modules"]["demo"]).toBeDefined();
  });
});
