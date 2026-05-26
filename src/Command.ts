import { Command as CMD } from "commander";
import { Environment } from "@decaf-ts/logging";

export class Command extends CMD {
  constructor(name?: string) {
    super(name);
  }

  private solveValue(arg: object, flag: string): any {
    return arg[flag as keyof typeof arg] || Environment.get(flag);
  }

  private initCliCommand(fn: (...args: any[]) => void | Promise<void>) {
    return function init(opts: any, ...args: any[]): void | Promise<void> {
      const {
        environmentFlag,
        logLevel,
        verbosity,
        logFormat,
        logStyle,
        logPattern,
      } = opts;
      const { version, banner } = opts;
      if (version) return;
    };
  }

  override action(
    fn: (this: this, ...args: any[]) => void | Promise<void>
  ): this {
    return super
      .action(this.initCliCommand(fn))
      .option("--version", "outputs version")
      .option("--banner [Boolean]", "shows/hides banned", true)
      .option(
        "--environmentFlag [env]",
        "environment flag to set",
        "development"
      )
      .option(
        "--logLevel [logLevel]",
        "logging level (fatal|critical|error|info|verbose|debug|silly)",
        "info"
      )
      .option(
        "--verbosity [Number]",
        "verbosity level (1-3). defines the verbosity level. have lo level verbose at least",
        "1"
      )
      .option("--logFormat [String]", "logging mode (json|raw)", "raw")
      .option("--logStyle [Boolean]", "enables/disables log styling", true)
      .option("--logPattern [String]", "log message pattern");
  }
}
