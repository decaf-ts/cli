import { Command } from "commander";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CLI_FILE_NAME } from "./constants";

/**
 * @description describes the function type each decaf module must expose under {@link CLI_FILE_NAME}
 * @type CliModule
 *
 * @memberOf module.CLI.cli
 */
export type CliModule = (commander: Command) => void | Promise<void>;
