import { CliWrapper } from "../../src";

class TestCli extends CliWrapper {
  // expose protected for testing via public wrapper
  public testPrintBanner() {
    return (this as any).printBanner();
  }
  protected getSlogan(): string {
    return "Test Slogan";
  }
}

describe("CliWrapper banner", () => {
  it("prints colored banner lines using stdout", () => {
    const cli = new TestCli("./");
    const write = jest
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);
    const stopAnimation = cli.testPrintBanner();
    stopAnimation?.();
    expect(write).toHaveBeenCalled();
    const entries = write.mock.calls.map((c) => String(c[0]));
    expect(entries.some((s) => s.includes("Test Slogan"))).toBe(true);
    write.mockRestore();
  });
});
