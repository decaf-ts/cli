import buildModule from "../../src/build-module/cli-module";
import { Command } from "commander";

describe("build-module", () => {
  it("exposes the build command definition", () => {
    const cmd = buildModule();
    expect(cmd).toBeInstanceOf(Command);
    expect(cmd.name()).toBe("build");
    expect(cmd.description()).toContain("build");
    const optionFlags = cmd.options.map((opt) => opt.long);
    expect(optionFlags).toEqual(
      expect.arrayContaining(["--dev", "--prod", "--docs"])
    );
  });
});
