import { Command } from "commander";
import fs from "fs";
import path from "path";
import { getCmdLogger } from "../logging";
import { Metadata } from "@decaf-ts/decoration";
import { CliWrapper } from "../CliWrapper";
import { toENVFormat } from "@decaf-ts/logging";
import {
  ModulesCommand,
  NpmLinkCommand,
  NpmTokenCommand,
  RunAllCommand,
  TagReleaseCommand,
} from "@decaf-ts/utils";
import {
  buildValueMap,
  OptionSpec,
  runUtilsCommand,
} from "../utils/command-forwarder";

const libraries = new Command()
  .name("libraries")
  .description("outputs the installed decaf-ts libraries and their versions")
  .option("--format [String]", "additional output formats (json, raw)")
  .action(async (options: any) => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8")
    );

    const version = pkg.version;
    const log = getCmdLogger(libraries);
    log.debug(
      `running with options: ${JSON.stringify(options)} for ${pkg.name} version ${version}`
    );
    const { format } = options;
    const libs = Metadata.libraries();
    switch (format) {
      case "json":
        console.log(JSON.stringify(libs, null, 2));
        break;
      case "raw":
        Object.entries(libs).forEach(([key, value]) =>
          console.log(`${key}: ${value}`)
        );
        break;
      default:
        Object.entries(libs).forEach(([key, value]) =>
          log.info(`${key}: ${value}`)
        );
    }
  });

const environmentExport = new Command()
  .name("environment-export")
  .description(
    "outputs currently enforced environment along with it's description"
  )
  .option("--format [String]", "additional output formats (json, raw)")
  .action(async (options: any) => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8")
    );

    const version = pkg.version;
    const log = getCmdLogger(environmentExport);
    log.debug(
      `running with options: ${JSON.stringify(options)} for ${pkg.name} version ${version}`
    );
    const { format } = options;
    const env = CliWrapper.getEnv();
    const flatten = (accum: string[], obj: any, prefix = "") => {
      Object.entries(obj).forEach(([key, value]) => {
        const envKey = toENVFormat(key);
        const fullKey = prefix ? `${prefix}__${envKey}` : envKey;
        if (value && typeof value === "object" && !Array.isArray(value)) {
          flatten(accum, value, fullKey);
        } else {
          accum.push(`${fullKey}=${value}`);
        }
      });
    };
    switch (format) {
      case "json":
        console.log(JSON.stringify(env, null, 2));
        break;
      case "raw": {
        const str: string[] = [];
        flatten(str, env);
        console.log(str.join("\n"));
        break;
      }
      default: {
        const str: string[] = [];
        flatten(str, env);
        str.forEach((s) => log.info(s));
      }
    }
  });

const MODULES_OPTION_SPECS: OptionSpec[] = [
  { name: "version", flag: "--version", type: "boolean" },
  { name: "basePath", flag: "--base-path", type: "string" },
];

const modulesCommand = new Command()
  .name("modules")
  .description("list decaf-ts submodules discovered from .gitmodules")
  .option("--version", "Show modules command version")
  .option(
    "--base-path <path>",
    "Directory to read .gitmodules from (defaults to the current working directory)"
  )
  .action(async function (this: Command) {
    const values = buildValueMap(this, MODULES_OPTION_SPECS);
    await runUtilsCommand(new ModulesCommand(), values, this);
  });

const NPM_LINK_OPTION_SPECS: OptionSpec[] = [
  { name: "version", flag: "--version", type: "boolean" },
  { name: "maxTraversal", flag: "--max-traversal", type: "string" },
  { name: "excludes", flag: "--excludes", type: "string[]" },
  { name: "include", flag: "--include", type: "string[]" },
  { name: "operation", flag: "--operation", type: "string" },
];

const npmLinkCommand = new Command()
  .name("npm-link")
  .description("link or relink decaf-ts package internals across modules")
  .option("--version", "Show npm-link command version")
  .option(
    "--max-traversal <depth>",
    "How many nested .gitmodules levels to traverse",
    "2"
  )
  .option(
    "--excludes <items...>",
    "Dependency names or patterns to ignore while linking/unlinking",
    ["@decaf-ts/utils", "@decaf-ts/logging"]
  )
  .option(
    "--include <items...>",
    "Module names or paths to target explicitly"
  )
  .option(
    "--operation <name>",
    "Operation to run in each module (link, unlink, install, etc.)"
  )
  .addHelpText(
    "after",
    "\nlink creates symlinks for decaf-ts dependencies, unlink removes those links and reinstalls, and any other operation is passed through to npm in each selected module."
  )
  .action(async function (this: Command) {
    const values = buildValueMap(this, NPM_LINK_OPTION_SPECS);
    await runUtilsCommand(new NpmLinkCommand(), values, this);
  });

const NPM_TOKEN_OPTION_SPECS: OptionSpec[] = [
  { name: "version", flag: "--version", type: "boolean" },
  { name: "maxTraversal", flag: "--max-traversal", type: "string" },
  { name: "tokenFiles", flag: "--token-files", type: "string[]" },
];

const npmTokenCommand = new Command()
  .name("npm-token")
  .description("link npm and git token files into each decaf-ts submodule")
  .option("--version", "Show npm-token command version")
  .option(
    "--max-traversal <depth>",
    "How many nested .gitmodules levels to traverse",
    "2"
  )
  .option(
    "--token-files <files...>",
    "Token files to link into each selected module",
    [".token", ".npmtoken"]
  )
  .action(async function (this: Command) {
    const values = buildValueMap(this, NPM_TOKEN_OPTION_SPECS);
    await runUtilsCommand(new NpmTokenCommand(), values, this);
  });

const TAG_RELEASE_OPTION_SPECS: OptionSpec[] = [
  { name: "version", flag: "--version", type: "boolean" },
  { name: "public", flag: "--public", type: "boolean" },
  { name: "private", flag: "--private", type: "boolean" },
  { name: "gitToken", flag: "--git-token", type: "string" },
  { name: "npmToken", flag: "--npm-token", type: "string" },
  { name: "gitUser", flag: "--git-user", type: "string" },
  {
    name: "allowFromBranch",
    flag: "--allow-from-branch",
    type: "boolean",
  },
  { name: "tag", flag: "--tag", type: "string" },
  { name: "message", flag: "--message", type: "string" },
];

const RUN_ALL_OPTION_SPECS: OptionSpec[] = [
  { name: "version", flag: "--version", type: "boolean" },
  { name: "basePath", flag: "--base-path", type: "string" },
  { name: "command", flag: "--command", type: "string" },
];

const runAllCommand = new Command()
  .name("run-all")
  .description("run a shell command across every module listed in .gitmodules")
  .option("--version", "Show run-all command version")
  .option(
    "--base-path <path>",
    "Directory to read .gitmodules from (defaults to the current working directory)"
  )
  .option("--command <cmd>", "Shell command to execute in each module")
  .action(async function (this: Command) {
    const values = buildValueMap(this, RUN_ALL_OPTION_SPECS);
    await runUtilsCommand(new RunAllCommand(), values, this);
  });

const tagReleaseCommand = new Command()
  .name("tag-release")
  .description("tag, commit, push, and publish a release")
  .option("--version", "Show tag-release command version")
  .option("--public", "Publish the release to the public npm registry")
  .option("--private", "Publish the release to the restricted npm registry")
  .option("--git-token <file>", "Git token file to use for authenticated pushes", ".token")
  .option("--npm-token <file>", "NPM token file to use for publishes", ".npmtoken")
  .option("--git-user <name>", "Git user name to embed in authenticated pushes")
  .option("--allow-from-branch", "Skip the master/main branch guard")
  .option("--tag <tag>", "Release tag to create")
  .option("--message <message>", "Release message to use")
  .action(async function (this: Command) {
    const values = buildValueMap(this, TAG_RELEASE_OPTION_SPECS);
    await runUtilsCommand(new TagReleaseCommand(), values, this);
  });

export default function utils(): Command {
  const utilsCmd = new Command()
    .command("utils")
    .description("utilitarian cli commands for the decaf-ts framework");

  utilsCmd.addCommand(libraries);
  utilsCmd.addCommand(environmentExport);
  utilsCmd.addCommand(modulesCommand);
  utilsCmd.addCommand(runAllCommand);
  utilsCmd.addCommand(npmLinkCommand);
  utilsCmd.addCommand(npmTokenCommand);
  utilsCmd.addCommand(tagReleaseCommand);
  return utilsCmd;
}
