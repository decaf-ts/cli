import { CliWrapper } from "../../src";

class TestCli extends CliWrapper {
  // expose protected for testing via public wrapper
  public testPrintBanner(logger: any) {
    return (this as any).printBanner(logger);
  }
  protected getSlogan(): string {
    return "Test Slogan";
  }
}

describe("CliWrapper banner", () => {
  it("prints colored banner lines using logger", () => {
    const cli = new TestCli("./");
    const info = jest.fn();
    const logger = { info } as any;
    cli.testPrintBanner(logger);
    // Should print multiple lines including the slogan line
    expect(info).toHaveBeenCalled();
    const calls = info.mock.calls.map((c: any[]) => String(c[0]));
    expect(calls.some((s: string) => s.includes("Test Slogan"))).toBe(true);
  });
});

