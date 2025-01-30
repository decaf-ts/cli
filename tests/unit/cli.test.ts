import { CliWrapper } from "../../src";
import path from "path";

describe("cli", () => {
  let cli: CliWrapper;
  const p = "lib";

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
    cli = new CliWrapper(p);
  });

  it("crawls properly from the given basePath", () => {
    const files = cli["crawl"](p);
    expect(files).toEqual(
      expect.arrayContaining(["lib/cli.cjs", "lib/test/cli.cjs"])
    );
  });

  it("loads from a given file", async () => {
    await cli["load"](
      path.join(process.cwd(), "lib/test/cli.cjs"),
      process.cwd()
    );
    expect(cli["modules"]["test"]).toBeDefined();
  });

  it("loads all modules from a base path within 2 levels", async () => {
    cli = new CliWrapper(p + "/test");
    await cli["boot"]();
    expect(cli["modules"]["test"]).toBeDefined();
  });

  it("Runs a command from a registered module", async () => {
    const original = console.log;
    const logMock = jest.spyOn(console, "log");
    logMock.mockImplementation((msg: string) => {
      original(msg);
    });
    await cli.run([...process.argv.slice(0, 2), "test"]);
    expect(logMock).toHaveBeenCalledTimes(1);
  });
});
