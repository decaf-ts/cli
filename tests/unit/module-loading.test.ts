import path from "path";
import { CLIUtils } from "../../src/utils";

describe("Module Loading", function () {
  const file = "lib/test/cli.cjs";
  it("loads from files", async function () {
    const module = await CLIUtils.loadFromFile(path.join(process.cwd(), file));
    expect(module).toBeDefined();
    expect(module.name).toBe("test");
  });

  it("fails properly for incorrect paths", async function () {
    await expect(() =>
      CLIUtils.loadFromFile(file + "dfsdfgsdg")
    ).rejects.toThrow();
  });
});
