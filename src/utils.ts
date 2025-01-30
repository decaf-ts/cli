import path from "path";
import fs from "fs";
import { Command } from "commander";
import { CliModule } from "./types";

/**
 * @description util class to retrieve versions and other information
 *
 * @class CLIUtils
 * @static
 */
export class CLIUtils {
  static async loadFromFile(path: string): Promise<CliModule> {
    try {
      return CLIUtils.normalizeImport(import(path));
    } catch (e: unknown) {
      throw new Error(
        `Failed to load from ${path}: ${e instanceof Error ? e.message : e}`
      );
    }
  }

  private static async normalizeImport<T>(
    importPromise: Promise<T>
  ): Promise<T> {
    // CommonJS's `module.exports` is wrapped as `default` in ESModule.
    return importPromise.then(
      (m: unknown) => ((m as { default: T }).default || m) as T
    );
  }

  /**
   * @description initializes the Cli object
   *
   * @param {Command} command
   * @param {string} [basePath] defaults to the current working directory
   */
  static initialize(command: Command, basePath: string = process.cwd()) {
    const name = CLIUtils.packageName(basePath);
    command
      .name(name)
      .description(`Runs ${name} related commands`)
      .version(CLIUtils.packageVersion(basePath));
  }

  /**
   * @description retrieves and parses the package.json file
   *
   * @param {string} basePath
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
   * @description returns the package version
   * @param {string} [basePath] defaults to current working dir
   */
  static packageVersion(basePath: string = process.cwd()): string {
    return CLIUtils.getPackage(basePath)["version"] as string;
  }

  /**
   * @description returns the package name
   * @param {string} [basePath] defaults to current working dir
   */
  static packageName(basePath: string = process.cwd()): string {
    return (CLIUtils.getPackage(basePath)["name"] as string).split("/")[1];
  }
}
