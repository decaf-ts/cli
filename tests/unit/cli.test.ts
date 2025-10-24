import SpyInstance = jest.SpyInstance;

const realProcess = process;
const exitMock = jest.fn();
// @ts-expect-error for testing purposes
global.process = { ...realProcess, exit: exitMock };

const logOriginal = console.log;
const logMock = jest.spyOn(console, "log");
logMock.mockImplementation((msg: string) => {
  logOriginal(msg);
});

import { version } from "../../package.json";

import { CliWrapper } from "../../src";

describe("decaf-ts cli", () => {
  let cli: CliWrapper;
  let writeMock: SpyInstance<void, [str: string], any>;

  afterAll(() => {
    // global.process = realProcess;
  });

  beforeAll(() => {
    cli = new CliWrapper("./");
    writeMock = jest.spyOn(
      (cli["command"] as any)["_outputConfiguration"] as {
        writeOut: (str: string) => void;
      },
      "writeOut"
    );
    writeMock.mockImplementation((str: string) => {
      process.stdout.write(str);
    });
  });

  afterEach(() => {
    writeMock.mockReset();
    writeMock.mockClear();
    logMock.mockReset();
    logMock.mockClear();
  });

  it("Retrieves the cli version", async () => {
    await cli.run(["node", "cli", "-V"]);
    expect(writeMock).toHaveBeenNthCalledWith(1, version + "\n");
  });

  it("Retrieves the global help", async () => {
    await cli.run(["node", "cli", "-h"]);
    expect(writeMock).toHaveBeenCalledTimes(1);
    expect(writeMock).toHaveBeenCalledWith(
      "Usage: cli [options] [command]\n" +
        "\n" +
        "Runs cli related commands\n" +
        "\n" +
        "Options:\n" +
        "  -V, --version   output the version number\n" +
        "  -h, --help      display help for command\n" +
        "\n" +
        "Commands:\n" +
        "  demo\n" +
        "  help [command]  display help for command\n"
    );
  });

  // it("retrieves the help for a specific command", async () => {
  //   await cli.run(["node", "cli", "help", "test"]);
  //   expect(writeMock).toHaveBeenCalledTimes(1);
  //   expect(writeMock).toHaveBeenCalledWith("");
  // });

  it("Runs a command from a registered module", async () => {
    await cli.run(["node", "cli", "demo", "command", "entry"]);
    const calls = logMock.mock.calls.map((c) => String(c[0]));
    expect(calls.some((s) => s.includes("executed demo command with type variable: entry"))).toBe(true);
  });
});
