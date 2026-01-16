import SpyInstance = jest.SpyInstance;

const exitMock = jest.fn();
const originalExit = process.exit;
// override only process.exit instead of replacing global.process
(process as any).exit = exitMock;

const logOriginal = console.log;
const logMock = jest.spyOn(console, "log");
logMock.mockImplementation((msg: string) => {
  logOriginal(msg);
});

import { CliWrapper } from "../../src";

describe("decaf-ts cli", () => {
  let cli: CliWrapper;
  let writeMock: SpyInstance<void, [str: string], any>;

  afterAll(() => {
    // restore original process.exit and mocks
    try {
      (process as any).exit = originalExit;
    } catch {
      // ignore
    }
    try {
      logMock.mockRestore();
    } catch {
      // ignore if already restored
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      writeMock &&
        (writeMock as any).mockRestore &&
        (writeMock as any).mockRestore();
    } catch {
      // ignore
    }
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
        "  command <type>  A demo command\n" +
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
    expect(
      calls.some((s) =>
        s.includes("executed demo command with type variable: entry")
      )
    ).toBe(true);
  });
});
