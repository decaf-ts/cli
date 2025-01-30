import { CliWrapper } from "../../src";
import path from "path";
import { CLI_FILE_NAME } from "../../src/constants";

describe("CliWrapper", () => {
  let cli: CliWrapper;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
    cli = new CliWrapper("./");
  });

  it("crawls properly from the given basePath", () => {
    const files = cli["crawl"]("lib");
    expect(files).toEqual(
      expect.arrayContaining([`lib/test/${CLI_FILE_NAME}.cjs`])
    );
  });

  it("loads from a given file", async () => {
    await cli["load"](
      path.join(process.cwd(), `lib/test/${CLI_FILE_NAME}.cjs`),
      process.cwd()
    );
    expect(cli["modules"]["test"]).toBeDefined();
  });

  it("loads all modules from a base path within 4 levels", async () => {
    await cli["boot"]();
    expect(cli["modules"]["test"]).toBeDefined();
  });
});
