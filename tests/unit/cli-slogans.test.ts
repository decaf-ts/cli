/* eslint-disable no-control-regex */

import { CliWrapper } from "../../src";
import { readSlogans } from "../../src/slogans";
import { Logging } from "@decaf-ts/logging";

describe("CliWrapper slogans", () => {
  const originalColumnsDescriptor = Object.getOwnPropertyDescriptor(
    process.stdout,
    "columns"
  );

  const restoreColumns = () => {
    if (originalColumnsDescriptor) {
      Object.defineProperty(
        process.stdout,
        "columns",
        originalColumnsDescriptor
      );
    }
  };

  afterEach(() => {
    restoreColumns();
    jest.restoreAllMocks();
  });

  it("prints the banner sequence through the CLI command", async () => {
    Object.defineProperty(process.stdout, "columns", {
      value: 240,
      configurable: true,
    });

    const actualSlogans =
      readSlogans(Logging.get().for("cli-slogans-test"), process.cwd())?.filter(
        (entry): entry is { Slogan: string } => Boolean(entry?.Slogan?.trim())
      ) ?? [];
    const sloganTexts = actualSlogans.map((entry) => entry.Slogan.trim());

    const cli = new CliWrapper("./");
    const originalWrite = process.stdout.write.bind(process.stdout);
    const write = jest
      .spyOn(process.stdout, "write")
      .mockImplementation((chunk: any, encoding?: any, cb?: any) => {
        originalWrite(chunk, encoding, cb);
        return true;
      });

    await cli.run(["node", "cli", "utils", "print-all-banners"]);
    const writes = write.mock.calls.slice();
    write.mockRestore();

    const capture = writes
      .map((call) => String(call[0]).replace(/\x1b\[[0-9;]*m/g, ""))
      .filter((line) => sloganTexts.some((slogan) => line.includes(slogan)));

    expect(sloganTexts.length).toBeGreaterThan(0);
    expect(capture.length).toBeGreaterThan(0);
    expect(capture.every((line) => sloganTexts.includes(line.trim()))).toBe(
      true
    );
  });
});
