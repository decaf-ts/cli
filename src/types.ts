import { Command } from "commander";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CLI_FILE_NAME } from "./constants";

/**
 * @description Function type for Decaf CLI modules
 * @summary Defines the signature for CLI module functions that each Decaf module must export under the CLI_FILE_NAME file
 * The function should return a Command object or a Promise that resolves to a Command object
 *
 * @typedef {Function} CliModule
 * @return {Command|Promise<Command>} A Command object or Promise that resolves to a Command object
 * @memberOf module:CLI
 */
export type CliModule = () => Command | Promise<Command>;
