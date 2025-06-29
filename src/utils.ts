import path from "path";
import fs from "fs";
import { Command } from "commander";
import { CliModule } from "./types";

/**
 * @description Utility class for CLI operations
 * @summary A static utility class that provides methods for loading modules, retrieving package information, and initializing CLI commands
 * 
 * @example
 * // Initialize a Command object with package information
 * const command = new Command();
 * CLIUtils.initialize(command, './path/to/package');
 * 
 * // Load a CLI module from a file
 * const module = await CLIUtils.loadFromFile('./path/to/cli-module.js');
 * 
 * @class CLIUtils
 */
export class CLIUtils {
  /**
   * @description Dynamically imports a module file
   * @summary Loads a JavaScript file and returns it as a CliModule, handling both ESM and CommonJS formats
   * 
   * @param {string} path The file path to the module to load
   * @return {Promise<CliModule>} A promise that resolves to the loaded CliModule
   */
  static async loadFromFile(path: string): Promise<CliModule> {
    try {
      return CLIUtils.normalizeImport(import(path));
    } catch (e: unknown) {
      throw new Error(
        `Failed to load from ${path}: ${e instanceof Error ? e.message : e}`
      );
    }
  }

  /**
   * @description Normalizes module imports to handle both ESM and CommonJS formats
   * @summary Properly imports JavaScript files regardless of their module format by handling the ESM wrapper for CommonJS modules
   *
   * @template T The type of the imported module
   * @param {Promise<T>} importPromise The promise returned by the dynamic import
   * @return {Promise<T>} A promise that resolves to the normalized module
   * @private
   */
  static async normalizeImport<T>(importPromise: Promise<T>): Promise<T> {
    // CommonJS's `module.exports` is wrapped as `default` in ESModule.
    return importPromise.then(
      (m: unknown) => ((m as { default: T }).default || m) as T
    );
  }

  /**
   * @description Initializes a Command object with package information
   * @summary Sets up a Commander Command object with the package name, description, and version from the package.json file
   *
   * @param {Command} command The Command object to initialize
   * @param {string} [basePath] The base path where the package.json file is located, defaults to the current working directory
   * @return {void}
   */
  static initialize(command: Command, basePath: string) {
    const name = CLIUtils.packageName(basePath);
    command
      .name(name)
      .description(`Runs ${name} related commands`)
      .version(CLIUtils.packageVersion(basePath));
  }

  /**
   * @description Retrieves and parses the package.json file
   * @summary Reads the package.json file from the specified path and parses it into a JavaScript object
   *
   * @param {string} basePath The base path where the package.json file is located
   * @return {Record<string, unknown>} The parsed package.json content as an object
   * @private
   */
  private static getPackage(basePath: string): Record<string, unknown> {
    try {
      return JSON.parse(
        fs.readFileSync(path.join(basePath, "package.json"), "utf8")
      );
    } catch (e: unknown) {
      throw new Error(`Unable to read version from ${basePath}: ${e}`);
    }
  }

  /**
   * @description Returns the version from package.json
   * @summary Retrieves the version field from the package.json file at the specified path
   *
   * @param {string} basePath The base path where the package.json file is located
   * @return {string} The package version string
   */
  static packageVersion(basePath: string): string {
    return CLIUtils.getPackage(basePath)["version"] as string;
  }

  /**
   * @description Returns the name from package.json
   * @summary Retrieves the name field from the package.json file at the specified path and extracts the package name without the scope
   *
   * @param {string} basePath The base path where the package.json file is located
   * @return {string} The package name without the scope (e.g., "cli" from "@decaf-ts/cli")
   */
  static packageName(basePath: string): string {
    const name = (CLIUtils.getPackage(basePath)["name"] as string).split("/");
    return name[name.length - 1];
  }
}
