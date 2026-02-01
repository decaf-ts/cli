import demo from "../../src/demo/cli-module";
import { Command } from "commander";

describe("demo-module", () => {
  afterAll(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it("instantiates & runs", async () => {
    expect(demo).toBeDefined();
    const cmd = demo();
    expect(cmd).toBeInstanceOf(Command);

    const logOriginal = console.log;
    const logMock = jest.spyOn(console, "log");
    logMock.mockImplementation((msg: string) => {
      logOriginal(msg);
    });

    await cmd.parseAsync(["node", "cli", "command", "test-type"]);

    expect(logMock).toBeCalledTimes(1);
    expect(logMock).toHaveBeenCalledWith(
      `executed demo command with type variable: test-type`
    );
  });
});
