import path from "path";
import { CLIUtils } from "../../src/utils";
import { CLI_FILE_NAME } from "../../src/constants";

describe("Module Loading", function () {
  const file = `lib/demo/${CLI_FILE_NAME}.cjs`;
  it("loads from files", async function () {
    const module = await CLIUtils.loadFromFile(path.join(process.cwd(), file));
    expect(module).toBeDefined();
    expect(module.name).toBe("demo");
  });

  it("fails properly for incorrect paths", async function () {
    await expect(() =>
      CLIUtils.loadFromFile(file + "dfsdfgsdg")
    ).rejects.toThrow();
  });
});
