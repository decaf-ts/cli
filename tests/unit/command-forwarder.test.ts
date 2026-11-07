import { it } from "@decaf-ts/for-testing";
import { Command } from "commander";
import {
  buildValueMap,
  parseOptionalBoolean,
} from "../../src/utils/command-forwarder";

describe("CLI command option forwarding", () => {
  it("parses optional booleans with a true default", () => {
    expect(parseOptionalBoolean()).toBe(true);
    expect(parseOptionalBoolean("false")).toBe(false);
    expect(parseOptionalBoolean("0")).toBe(false);
    expect(parseOptionalBoolean("no")).toBe(false);
    expect(parseOptionalBoolean("yes")).toBe(true);
  });

  it("forwards normalized boolean, string, and repeated string options", () => {
    const command = new Command();
    command
      .option("--enabled")
      .option("--no-optional")
      .option("--name <name>")
      .option("--tag <tag>", "tag", (value, previous: string[] = []) => [
        ...previous,
        value,
      ]);
    command.parse([
      "node",
      "test",
      "--enabled",
      "--no-optional",
      "--name",
      "Alice",
      "--tag",
      "one",
      "--tag",
      " two ",
    ]);

    expect(
      buildValueMap(command, [
        { name: "enabled", flag: "enabled", type: "boolean" },
        {
          name: "optional",
          flag: "optional",
          type: "boolean",
          allowFalse: true,
        },
        { name: "name", flag: "name", type: "string" },
        { name: "tag", flag: "tag", type: "string[]" },
      ])
    ).toEqual({ enabled: true, optional: false, name: "Alice", tag: ["one", "two"] });
  });
});
