import { Command } from "commander";
import fs from "fs";
import path from "path";
import { CLI_FILE_NAME } from "./constants";
import { CLIUtils } from "./utils";
import { LoggedClass, Logger, Logging } from "@decaf-ts/logging";
import { style } from "styled-string-builder";
import { banners, colorPalettes } from "./banners";
import { readSlogans } from "./slogans";
import { DecafCLieEnvironment } from "./environment";

/**
 * @description Utility class to handle CLI functionality from all Decaf modules
 * @summary This class provides a wrapper around Commander.js to handle CLI commands from different Decaf modules.
 * It crawls the filesystem to find CLI modules, loads them, and registers their commands.
 *
 * @param {string} [basePath] The base path to look for modules in. Defaults to `./`
 * @param {number} [crawlLevels] Number of folder levels to crawl to find modules from the basePath. Defaults to 4
 *
 * @example
 * // Create a new CLI wrapper and run it with custom options
 * const cli = new CliWrapper('./src', 2);
 * cli.run(process.argv).then(() => {
 *   console.log('CLI commands executed successfully');
 * });
 *
 * @class CliWrapper
 */
export class CliWrapper extends LoggedClass {
  private _command?: Command;
  private modules: Record<string, Command> = {};
  private readonly rootPath: string;

  private slogans: Record<string, { Slogan: string }[]> = {};

  private static env = DecafCLieEnvironment;

  constructor(
    private basePath: string = "./",
    private crawlLevels = 4
  ) {
    super();
    this.rootPath = path.resolve(__dirname, "..");
  }

  /**
   * @description Retrieves and initializes the Commander Command object
   * @summary Lazy-loads the Command object, initializing it with the package name, description, and version
   * @return {Command} The initialized Command object
   * @private
   */
  private get command() {
    if (!this._command) {
      this._command = new Command();
      CLIUtils.initialize(this._command, this.rootPath);
    }
    return this._command;
  }

  /**
   * @description Loads and registers a module from a file
   * @summary Dynamically imports a CLI module from the specified file path, initializes it, and registers it in the modules collection
   *
   * @param {string} filePath Path to the module file to load
   * @param {string} rootPath Repository root path to find the package.json
   * @return {Promise<string>} A promise that resolves to the module name
   *
   * @private
   * @mermaid
   * sequenceDiagram
   *   participant CliWrapper
   *   participant CLIUtils
   *   participant Module
   *
   *   CliWrapper->>CLIUtils: loadFromFile(filePath)
   *   CLIUtils-->>CliWrapper: module
   *   CliWrapper->>CliWrapper: Get module name
   *   CliWrapper->>Command: new Command()
   *   Command-->>CliWrapper: cmd
   *   CliWrapper->>CLIUtils: initialize(cmd, path.dirname(rootPath))
   *   CliWrapper->>Module: module()
   *   Note over CliWrapper,Module: Handle Promise if needed
   *   Module-->>CliWrapper: Command instance
   *   CliWrapper->>CliWrapper: Store in modules[name]
   *   CliWrapper-->>CliWrapper: Return name
   */
  private async load(filePath: string): Promise<string> {
    const log = this.log.for(this.load);
    let name;
    try {
      let module = await CLIUtils.loadFromFile(filePath);

      name = module.name as string;
      if (module instanceof Function) module = module() as any;
      if (module instanceof Promise) module = await module;

      if (!(module instanceof Command))
        throw new Error(
          `You should export the instantiated Commands class as default.`
        );

      this.modules[name] = module;
    } catch (e: unknown) {
      throw new Error(
        `failed to load module under ${filePath}: ${e instanceof Error ? e.message : e}`
      );
    }

    try {
      const slogans = readSlogans(log, name);
      if (slogans) this.slogans[name] = slogans;
    } catch (e: unknown) {
      console.error(`Failed to load slogans for ${name}: ${e}`);
    }

    return name;
  }

  /**
   * @description Finds and loads all CLI modules in the basePath
   * @summary Uses the crawl method to find all CLI modules in the specified base path,
   * then loads and registers each module as a subcommand
   *
   * @return {Promise<void>} A promise that resolves when all modules are loaded
   *
   * @private
   * @mermaid
   * sequenceDiagram
   *   participant CliWrapper
   *   participant Filesystem
   *   participant Module
   *
   *   CliWrapper->>Filesystem: Join basePath with cwd
   *   CliWrapper->>CliWrapper: crawl(basePath, crawlLevels)
   *   CliWrapper-->>CliWrapper: modules[]
   *   loop For each module
   *     alt Not @decaf-ts/cli
   *       CliWrapper->>CliWrapper: load(module, cwd)
   *       CliWrapper-->>CliWrapper: name
   *       CliWrapper->>CliWrapper: Check if command exists
   *       alt Command doesn't exist
   *         CliWrapper->>Command: command(name).addCommand(modules[name])
   *       end
   *     end
   *   end
   *   CliWrapper->>Console: Log loaded modules
   */
  private async boot() {
    const log = this.log.for(this.boot);
    const basePath = path.resolve(this.rootPath, this.basePath);
    const modules = this.crawl(basePath, this.crawlLevels);
    for (const module of modules) {
      if (module.includes("@decaf-ts/cli")) {
        continue;
      }
      let name: string;
      try {
        name = await this.load(module);
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
          this.command.addCommand(this.modules[name]);
        } catch (e: unknown) {
          console.error(e);
        }
    }
    log.debug(
      `loaded modules:\n${Object.keys(this.modules)
        .map((k) => `- ${k}`)
        .join("\n")}`
    );
  }

  /**
   * @description Recursively searches for CLI module files in the directory structure
   * @summary Crawls the basePath up to the specified number of folder levels to find files named according to CLI_FILE_NAME
   *
   * @param {string} basePath The absolute base path to start searching in
   * @param {number} [levels=2] The maximum number of directory levels to crawl
   * @return {string[]} An array of file paths to CLI modules
   *
   * @private
   */
  private crawl(basePath: string, levels: number = 2) {
    if (levels <= 0) return [];
    return fs.readdirSync(basePath).reduce((accum: string[], file) => {
      file = path.join(basePath, file);
      if (fs.statSync(file).isDirectory()) {
        accum.push(...this.crawl(file, levels - 1));
      } else if (file.match(new RegExp(`${CLI_FILE_NAME}\\.[cm]js$`, "gm"))) {
        accum.push(file);
      }
      return accum;
    }, []);
  }

  protected getSlogan(): string {
    // Find nearest node_modules from this file's directory to survive bundling
    const startDir = __dirname;
    let current: string | undefined = startDir;
    let nodeModulesDir: string | undefined;

    try {
      while (current && current !== path.parse(current).root) {
        const candidate = path.join(current, "node_modules");
        if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
          nodeModulesDir = candidate;
          break;
        }
        const parent = path.dirname(current);
        if (parent === current) break;
        current = parent;
      }
    } catch {
      // ignore errors during traversal
    }

    const slogans: string[] = [];

    if (nodeModulesDir) {
      const scopeDir = path.join(nodeModulesDir, "@decaf-ts");
      try {
        if (fs.existsSync(scopeDir) && fs.statSync(scopeDir).isDirectory()) {
          const pkgs = fs.readdirSync(scopeDir);
          for (const pkg of pkgs) {
            const depPath = path.join(scopeDir, pkg);
            try {
              const slogansPath = path.join(
                depPath,
                "workdocs",
                "assets",
                "slogans.json"
              );
              if (
                fs.existsSync(slogansPath) &&
                fs.statSync(slogansPath).isFile()
              ) {
                const raw = fs.readFileSync(slogansPath, "utf-8");
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                  for (const s of parsed) {
                    if (typeof s === "string" && s.trim().length > 0) {
                      slogans.push(s.trim());
                    }
                  }
                }
              }
            } catch {
              // ignore per-package errors
            }
          }
        }
      } catch {
        // ignore scope directory errors
      }
    }

    if (slogans.length === 0) {
      return "Decaf: strongly brewed TypeScript.";
    }
    const idx = Math.floor(Math.random() * slogans.length);
    return slogans[idx];
  }

  protected printBanner(logger: Logger = Logging.get()) {
    let message: string;
    try {
      message = this.getSlogan();
    } catch {
      message = "Decaf: strongly brewed TypeScript.";
    }

    // Select random banner and color palette
    const bannerTemplate = banners[Math.floor(Math.random() * banners.length)];
    const paletteKeys = Object.keys(colorPalettes);
    const palette =
      colorPalettes[
        paletteKeys[Math.floor(Math.random() * paletteKeys.length)]
      ];

    const banner = bannerTemplate.split("\n").filter((line) => line.length > 0);
    const maxLength = banner.reduce(
      (max, line) => Math.max(max, line.length),
      0
    );

    if (maxLength > 0) {
      banner.push(message.padStart(maxLength));
    } else {
      banner.push(message);
    }

    banner.forEach((line, index) => {
      const color = palette[index % palette.length] || "";
      const logFn = logger
        ? logger.info.bind(logger)
        : console.log.bind(console);
      try {
        const msg = style(line || "").raw(color).text;
        logFn(msg);
      } catch {
        // Fallback to plain output if styling fails for any reason
        logFn(String(line || ""));
      }
    });
  }

  /**
   * @description Executes the CLI with the provided arguments
   * @summary Boots the CLI by loading all modules, then parses and executes the command specified in the arguments
   *
   * @param {string[]} [args=process.argv] Command line arguments to parse and execute
   * @return {Promise<void>} A promise that resolves when the command execution is complete
   *
   * @mermaid
   * sequenceDiagram
   *   participant Client
   *   participant CliWrapper
   *   participant Command
   *
   *   Client->>CliWrapper: run(args)
   *   CliWrapper->>CliWrapper: boot()
   *   Note over CliWrapper: Loads all modules
   *   CliWrapper->>Command: parseAsync(args)
   *   Command-->>CliWrapper: result
   *   CliWrapper-->>Client: result
   */
  async run(args: string[] = process.argv) {
    await this.boot();
    if (DecafCLieEnvironment.banner) this.printBanner();
    return this.command.parseAsync(args);
  }

  static accumulateEnvironment(obj: object) {
    this.env = this.env.accumulate(obj) as any;
  }
}
