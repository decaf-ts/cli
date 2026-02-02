import { Command } from "commander";
import fs from "fs";
import path from "path";
import { CLI_FILE_NAME } from "./constants";
import { CLIUtils } from "./utils";
import { LoggedClass } from "@decaf-ts/logging";
import { banners, colorPalettes } from "./banners";
import { readSlogans } from "./slogans";
import { DecafCLieEnvironment } from "./environment";

const MIN_BANNER_WIDTH = 92;

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

  private moduleSlogans: Record<string, string[]> = {};
  private globalSlogans: string[] = [];
  private bannerAnimation?: () => void;

  private static env = DecafCLieEnvironment;

  constructor(
    private basePath: string = DecafCLieEnvironment.cliModuleRoot,
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

      if (!this.isCommandInstance(module))
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
      const moduleRoot = this.findModuleRoot(path.dirname(filePath));
      const records = readSlogans(log, moduleRoot);
      const strings = this.extractSloganStrings(records);
      if (strings.length) {
        this.moduleSlogans[name] = strings;
      }
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

  private findModuleRoot(initialDir: string): string {
    let current = initialDir;
    const root = path.parse(initialDir).root;
    while (true) {
      if (fs.existsSync(path.join(current, "package.json"))) {
        return current;
      }
      if (current === root) break;
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
    return initialDir;
  }

  protected getSlogan(priorityModule?: string): string {
    this.ensureGlobalSlogans();
    const priority = priorityModule
      ? this.moduleSlogans[priorityModule] || []
      : [];
    const others = this.otherSlogans(priorityModule);

    if (!priority.length && !others.length) {
      return "Decaf: strongly brewed TypeScript.";
    }

    if (!priority.length) {
      return others[Math.floor(Math.random() * others.length)];
    }

    if (!others.length) {
      return priority[Math.floor(Math.random() * priority.length)];
    }

    const pool = this.buildBalancedSloganPool(priority, others);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  private otherSlogans(priorityModule?: string): string[] {
    const modules = Object.entries(this.moduleSlogans)
      .filter(([name]) => name !== priorityModule)
      .flatMap(([, slogans]) => slogans);
    if (this.globalSlogans.length === 0 && modules.length === 0) {
      return [];
    }
    return [...this.globalSlogans, ...modules];
  }

  private buildBalancedSloganPool(primary: string[], secondary: string[]): string[] {
    const targetLength = Math.max(primary.length, secondary.length);
    const primaryBucket = this.repeatToLength(primary, targetLength);
    const secondaryBucket = this.repeatToLength(secondary, targetLength);
    const result: string[] = [];
    for (let i = 0; i < targetLength; i++) {
      result.push(primaryBucket[i]);
      result.push(secondaryBucket[i]);
    }
    return result;
  }

  private repeatToLength(values: string[], targetLength: number): string[] {
    if (!values.length || targetLength <= 0) return [];
    return Array.from({ length: targetLength }, (_, index) => {
      return values[index % values.length];
    });
  }

  private ensureGlobalSlogans() {
    if (this.globalSlogans.length > 0) return;
    const log = this.log.for(this.ensureGlobalSlogans);
    const gathered: string[] = [];

    const basePaths = [this.rootPath];
    const hostPath = path.resolve(this.rootPath, this.basePath);
    if (hostPath !== this.rootPath) {
      basePaths.push(hostPath);
    }

    for (const candidate of basePaths) {
      this.collectSlogansFromPath(log, candidate, gathered);
      this.collectSlogansFromScope(log, candidate, gathered);
    }

    this.globalSlogans = gathered;
  }

  private collectSlogansFromPath(
    log: any,
    basePath: string,
    accumulator: string[]
  ) {
    try {
      const records = readSlogans(log, basePath);
      if (!records) return;
      for (const entry of records) {
        if (entry && typeof entry.Slogan === "string" && entry.Slogan.trim()) {
          accumulator.push(entry.Slogan.trim());
        }
      }
    } catch {
      // readSlogans already logs issues
    }
  }

  private collectSlogansFromScope(
    log: any,
    basePath: string,
    accumulator: string[]
  ) {
    const scopeDir = path.join(basePath, "node_modules", "@decaf-ts");
    try {
      if (!fs.existsSync(scopeDir) || !fs.statSync(scopeDir).isDirectory()) {
        return;
      }
      const pkgs = fs.readdirSync(scopeDir);
      for (const pkg of pkgs) {
        const candidate = path.join(scopeDir, pkg);
        try {
          if (!fs.existsSync(candidate) || !fs.statSync(candidate).isDirectory()) {
            continue;
          }
          this.collectSlogansFromPath(log, candidate, accumulator);
        } catch {
          // ignore individual package errors
        }
      }
    } catch {
      // ignore scope directory errors
    }
  }

  private extractSloganStrings(records?: { Slogan: string }[]): string[] {
    if (!records || !records.length) return [];
    return records
      .map((entry) => (entry && entry.Slogan ? entry.Slogan.trim() : ""))
      .filter((value) => value.length > 0);
  }

  private isCommandInstance(value: unknown): value is Command {
    if (value instanceof Command) return true;
    if (!value || typeof value !== "object") return false;
    const candidate = value as Command;
    return (
      typeof candidate.parseAsync === "function" &&
      typeof candidate.addCommand === "function" &&
      typeof candidate.name === "function"
    );
  }

  protected printBanner(args?: string[]) {
    let message: string;
    try {
      const priorityModule = this.getPriorityModule(args);
      message = this.getSlogan(priorityModule);
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

    const rawLines = bannerTemplate
      .split("\n")
      .filter((line) => line.length > 0);
    const maxLineWidth = rawLines.reduce<number>(
      (max, line) => Math.max(max, line.length),
      0
    );
    const messageWidth = Math.max(0, message.length);
    const targetWidth = Math.max(
      MIN_BANNER_WIDTH,
      maxLineWidth,
      messageWidth
    );
    const banner = rawLines.map((line) => line.padEnd(targetWidth));
    banner.push(message.padStart(targetWidth));

    const reservedLines = "\n".repeat(Math.max(0, banner.length));
    process.stdout.write(reservedLines);

    const stop = this.animateBanner(banner, palette);
    this.bannerAnimation = stop;
    return stop;
  }

  private getPriorityModule(args?: string[]): string | undefined {
    if (!args || args.length <= 2) return undefined;
    const candidates = args.slice(2);
    for (const item of candidates) {
      if (!item || item.startsWith("-")) continue;
      const trimmed = item.trim();
      if (!trimmed) continue;
      if (this.modules[trimmed]) {
        return trimmed;
      }
      return trimmed;
    }
    return undefined;
  }

  private stopBannerAnimation() {
    if (this.bannerAnimation) {
      this.bannerAnimation();
      this.bannerAnimation = undefined;
    }
  }

  private animateBanner(lines: string[], palette: string[]) {
    if (!lines.length) {
      return () => {};
    }

    this.stopBannerAnimation();

    const frameInterval = 150;
    const duration = 5000;
    const totalFrames = Math.max(1, Math.ceil(duration / frameInterval));
    let framesRendered = 0;
    let stopped = false;
    let timer: NodeJS.Timeout | undefined;

    const paletteLength = Math.max(1, palette.length);
    const colorOffsets = lines.map((_, index) => index % paletteLength);
    const reset = "\x1b[0m";
    const height = lines.length;
    const moveUp = `\u001b[${height}A`;

    const stop = () => {
      if (stopped) return;
      stopped = true;
      if (timer) {
        clearInterval(timer);
        timer = undefined;
      }
    };

    const renderFrame = () => {
      const offset = framesRendered % paletteLength;
      const colored = lines.map((line, index) => {
        const colorIndex = (colorOffsets[index] + offset) % paletteLength;
        const color = palette[colorIndex] || "";
        return `${color}${line}${reset}`;
      });

      process.stdout.write(moveUp);
      for (const line of colored) {
        process.stdout.write("\u001b[2K");
        process.stdout.write(`${line}\n`);
      }

      framesRendered++;
    };

    renderFrame();
    timer = setInterval(() => {
      if (framesRendered >= totalFrames) {
        stop();
        return;
      }
      renderFrame();
    }, frameInterval);

    return stop;
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
    const stopAnimation = DecafCLieEnvironment.banner
      ? this.printBanner(args)
      : undefined;
    try {
      return await this.command.parseAsync(args);
    } finally {
      if (stopAnimation) stopAnimation();
      this.bannerAnimation = undefined;
    }
  }

  static accumulateEnvironment(obj: object) {
    this.env = this.env.accumulate(obj) as any;
  }

  static getEnv() {
    return this.env;
  }
}
