import utilsModule from "../../src/utils-module/cli-module";
import * as banners from "../../src/banners";
import * as slogans from "../../src/slogans";

describe("utils module", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("exposes the print-all-banners command", () => {
    const cmd = utilsModule();
    const subcommand = cmd.commands.find(
      (command) => command.name() === "print-all-banners"
    );

    expect(subcommand).toBeDefined();
    expect(subcommand?.description()).toContain("banner");
  });

  it("runs the banner loop through the hidden helper", async () => {
    const printAllBannersSpy = jest
      .spyOn(banners, "printAllBanners")
      .mockImplementation(() => undefined);
    jest.spyOn(slogans, "readSlogans").mockReturnValue([
      { Slogan: "Test Slogan" },
    ] as any);

    const cmd = utilsModule();
    await cmd.parseAsync(["node", "cli", "print-all-banners"]);

    expect(printAllBannersSpy).toHaveBeenCalledTimes(1);
    expect(printAllBannersSpy).toHaveBeenCalledWith(["Test Slogan"]);
  });
});
