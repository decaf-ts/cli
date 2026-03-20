import path from "path";
import { CLIUtils } from "../../src/utils";
import { CLI_FILE_NAME } from "../../src/constants";
import * as path from "path";

const fixtureFile = path.join(
  __dirname,
  "__fixtures__",
  "build",
  `${CLI_FILE_NAME}.cjs`
);

describe("Module Loading", function () {

  it("loads from files", async function () {
    await expect(() => CLIUtils.loadFromFile("missing-cli-module")).rejects.toThrow();
    const module = await CLIUtils.loadFromFile(fixtureFile);
    expect(module).toBeDefined();
    expect(module.name).toBe("build");
  });

  it("fails properly for incorrect paths", async function () {
    await expect(CLIUtils.loadFromFile(fixtureFile + "dfsdfgsdg")).rejects.toThrow();
  });

  it("fails reading package.json properly for incorrect paths", async function () {
    expect(() => CLIUtils["getPackage"](fixtureFile + "dfsdfgsdg")).toThrow();
  });
});
