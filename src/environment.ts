import path from "path";
import { LoggedEnvironment, LoggingConfig } from "@decaf-ts/logging";

export type DecafCliEnvironment = LoggingConfig & {
  banner: boolean;
  cliModuleRoot: string;
};

const cliModuleRoot =
  process.env.CLI_MODULE_TOOT && process.env.CLI_MODULE_TOOT.length > 0
    ? path.resolve(process.env.CLI_MODULE_TOOT)
    : process.cwd();

export const DefaultCliEnvironment: DecafCliEnvironment = {
  banner: true,
  cliModuleRoot,
} as DecafCliEnvironment;

export const DecafCLieEnvironment = LoggedEnvironment.accumulate(
  DefaultCliEnvironment
);
