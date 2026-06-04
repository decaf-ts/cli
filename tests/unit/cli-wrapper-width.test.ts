describe("CliWrapper banner layout ties", () => {
  const originalColumnsDescriptor = Object.getOwnPropertyDescriptor(
    process.stdout,
    "columns"
  );

  const restoreColumns = () => {
    if (originalColumnsDescriptor) {
      Object.defineProperty(process.stdout, "columns", originalColumnsDescriptor);
    }
  };

  afterEach(() => {
    restoreColumns();
    jest.restoreAllMocks();
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("randomizes between equal minimum-width banners when the terminal is narrower than all of them", async () => {
    jest.doMock("../../src/banners", () => ({
      banners: ["AA\nAA", "BB\nBB", "CCCC\nCCCC"],
      colorPalettes: { sunset: [""] },
      printAllBanners: jest.fn(),
    }));

    const { CliWrapper } = await import("../../src/CliWrapper");
    const cli = new CliWrapper("./");

    Object.defineProperty(process.stdout, "columns", {
      value: 0,
      configurable: true,
    });

    const randomSpy = jest.spyOn(Math, "random");
    randomSpy.mockReturnValueOnce(0);
    const first = cli["selectBannerLayout"]();
    randomSpy.mockReturnValueOnce(0.999);
    const second = cli["selectBannerLayout"]();

    expect(first.width).toBe(2);
    expect(second.width).toBe(2);
    expect(first.lines).not.toEqual(second.lines);
  });

  it("randomizes across all banners that fit the terminal", async () => {
    jest.doMock("../../src/banners", () => ({
      banners: ["AA\nAA", "BBBB\nBBBB", "CCCCCC\nCCCCCC"],
      colorPalettes: { sunset: [""] },
      printAllBanners: jest.fn(),
    }));

    const { CliWrapper } = await import("../../src/CliWrapper");
    const cli = new CliWrapper("./");

    Object.defineProperty(process.stdout, "columns", {
      value: 10,
      configurable: true,
    });

    const randomSpy = jest.spyOn(Math, "random");
    randomSpy.mockReturnValueOnce(0);
    const first = cli["selectBannerLayout"]();
    randomSpy.mockReturnValueOnce(0.999);
    const second = cli["selectBannerLayout"]();

    expect(first.width).toBe(2);
    expect(second.width).toBe(6);
    expect(first.lines).not.toEqual(second.lines);
  });
});
