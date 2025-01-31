import { Command } from "commander";
import fs from "fs";
import path from "path";
import { CLI_FILE_NAME } from "./constants";
import { CLIUtils } from "./utils";

/**
 * @summary Util class to handle CLI functionality from all Decaf modules
 * @description CLI handler class
 *
 * @param {string} [basepath] the base path to look for modules in. defaults to `./`
 * @param {string} [crawlLevels] folders to crawl to find modules from the basePath. defaults to 4
 *
 * @class CliWrapper
 */
export class CliWrapper {
  private _command?: Command;
  private modules: Record<string, Command> = {};

  constructor(
    private basePath: string = "./",
    private crawlLevels = 4
  ) {}

  /**
   * @description Retrieves and initializes the {@link Command} object
   * @private
   */
  private get command() {
    if (!this._command) {
      this._command = new Command();
      CLIUtils.initialize(this._command, this.basePath);
    }
    return this._command;
  }

  /**
   * @description loads and registers module from a file
   *
   * @param {string} filePath path to look for modules
   * @param {string} rootPath repo root to find the package.json
   * @return {string} the module name
   *
   * @private
   */
  private async load(filePath: string, rootPath: string): Promise<string> {
    let name;
    try {
      const module = await CLIUtils.loadFromFile(filePath);
      name = module.name;
      const cmd = new Command();
      CLIUtils.initialize(cmd, path.dirname(rootPath));
      let m = module();
      if (m instanceof Promise) m = await m;
      this.modules[name] = m;
    } catch (e: unknown) {
      throw new Error(
        `failed to load module ${name || "unnamed"} under ${filePath}: ${e instanceof Error ? e.message : e}`
      );
    }
    return name;
  }

  /**
   * @description finds all the cli modules in the basePath via {@link CliWrapper.crawl}
   * and loads them
   * @private
   */
  private async boot() {
    const basePath = path.join(process.cwd(), this.basePath);
    const modules = this.crawl(basePath, this.crawlLevels);
    for (const module of modules) {
      if (module.includes("@decaf-ts/cli")) {
        continue;
      }
      let name: string;
      try {
        name = await this.load(module, process.cwd());
      } catch (e: unknown) {
        console.error(e);
        continue;
      }

      if (
        !this.command.commands.find(
          (c) => (c as unknown as Record<string, string>)["_name"] === name
        )
      )
        try {
          this.command.command(name).addCommand(this.modules[name]);
        } catch (e: unknown) {
          console.error(e);
        }
    }
    console.log(
      `loaded modules:\n${Object.keys(this.modules)
        .map((k) => `- ${k}`)
        .join("\n")}`
    );
  }

  /**
   * @description crawls the basePath up for 'levels' folders to find a module,eg a {@link CLI_FILE_NAME} named file
   * @param {string} basePath the relative base batch to start searching in
   * @param {number} [levels] the max number of levels to crawl. defaults to 2
   * @private
   */
  private crawl(basePath: string, levels: number = 2) {
    if (levels <= 0) return [];
    return fs.readdirSync(basePath).reduce((accum: string[], file) => {
      file = path.join(basePath, file);
      if (fs.statSync(file).isDirectory()) {
        accum.push(...this.crawl(file, levels - 1));
      } else if (file.match(new RegExp(`${CLI_FILE_NAME}.[cm]?js`, "gm"))) {
        // } else if (file.endsWith(`${CLI_FILE_NAME}.cjs`)) {
        accum.push(file);
      } else {
        // ignored file
      }
      return accum;
    }, []);
  }

  /**
   * @description runs the given command
   *
   * @param {string[]} [args] args to run. defaults to process.argv
   */
  async run(args: string[] = process.argv) {
    await this.boot();
    return this.command.parseAsync(args);
  }
}
