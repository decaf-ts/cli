import { Command } from "commander";
import fs from "fs";
import path from "path";
import { CLI_FILE_NAME } from "./constants";
import { CLIUtils } from "./utils";

/**
 * @summary Util class to handle CLI functionality from all Decaf modules
 * @description CLI handler class
 *
 * @param {string} [basepath] the base path to look for modules in. defaults to `lib`
 *
 * @class CliWrapper
 */
export class CliWrapper {
  private static _command?: Command;
  private modules: Record<string, Command> = {};

  constructor(private basePath: string = "lib") {}

  /**
   * @description Retrieves and initializes the singleton {@link Command} object
   * @private
   */
  private get command() {
    if (!CliWrapper._command) {
      CliWrapper._command = new Command();
      CLIUtils.initialize(CliWrapper._command, this.basePath);
    }
    return CliWrapper._command;
  }

  /**
   * @description loads and registers module from a file
   * @param {string} filePath
   * @param {string} rootPath
   * @private
   */
  private async load(filePath: string, rootPath: string): Promise<void> {
    let name;
    try {
      const module = await CLIUtils.loadFromFile(filePath);
      name = module.name;
      const cmd = new Command();
      CLIUtils.initialize(cmd, path.dirname(rootPath));
      module(cmd);
      this.modules[name] = cmd;
    } catch (e: unknown) {
      throw new Error(
        `failed to load module ${name} under ${filePath}: ${e instanceof Error ? e.message : e}`
      );
    }
  }

  /**
   * @description finds all the cli modules in the basePath via {@link CliWrapper.crawl}
   * and loads them
   * @private
   */
  private async boot() {
    const basePath = path.join(process.cwd(), this.basePath);
    const modules = this.crawl(basePath);
    for (const module of modules) {
      if (module.includes("@decaf-ts/cli")) {
        continue;
      }

      try {
        await this.load(module, basePath);
      } catch (e: unknown) {
        console.error(e);
      }
    }
  }

  /**
   * @description
   * @param {string} basePath the relative base batch to start searching in
   * @param {number} [levels] the max number of levels to crawl. defaults to 2
   * @private
   */
  private crawl(basePath: string, levels: number = 2) {
    if (levels <= 0) return [];
    return fs
      .readdirSync(basePath)
      .reduce((accum: string[], file) => {
        file = path.join(basePath, file);
        if (basePath.endsWith("cli")) return accum;
        if (fs.statSync(file).isDirectory()) {
          accum.push(...this.crawl(file, levels - 1));
        } else {
          accum.push(file);
        }
        return accum;
      }, [])
      .filter((f) => f.endsWith(`${CLI_FILE_NAME}.cjs`));
  }

  /**
   * @description runs the given command
   *
   * @param {string[]} [args] args to run. defaults to process.argv
   */
  async run(args: string[] = process.argv) {
    await this.boot();
    this.command
      .command("<module> <operation> ...args")
      .action(async (ars: { module: string; operation: string }) => {
        const { module } = ars;
        if (!this.modules[module])
          throw new Error(`Could not find module ${module}.`);
        const childArgs = [
          ...args.slice(0, 2),
          ...args.slice(3, args.length - 1),
        ];
        await this.modules[module].parseAsync(childArgs);
      });
    await this.command.parseAsync(args);
  }
}
