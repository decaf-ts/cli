import { Metadata } from "@decaf-ts/decoration";

describe("version module", () => {
  it("registers library with package and version", async () => {
    const spy = jest.spyOn(Metadata, "registerLibrary");
    // dynamic import to ensure module executes during test
    const mod = await import("../../src/version");
    expect(typeof mod.VERSION).toBe("string");
    expect(typeof mod.PACKAGE_NAME).toBe("string");
    expect(spy).toHaveBeenCalledWith(mod.PACKAGE_NAME, mod.VERSION);
    spy.mockRestore();
  });
});

