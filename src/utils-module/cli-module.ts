import { Command } from "commander";
import fs from "fs";
import path from "path";
import { getCmdLogger } from "../logging";
import { Metadata } from "@decaf-ts/decoration";
import { CliWrapper } from "../CliWrapper";
import { printAllBanners } from "../banners";
import { readSlogans } from "../slogans";
import { toENVFormat } from "@decaf-ts/logging";
import {
  ModulesCommand,
  NpmLinkCommand,
  NpmTokenCommand,
  RunAllCommand,
  TagReleaseCommand,
  CredentialsCommand,
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

const printAllBannersCommand = new Command()
  .name("print-all-banners")
  .description("prints every available CLI banner layout in sequence")
  .action(async () => {
    const log = getCmdLogger(printAllBannersCommand);
    const slogans = readSlogans(log, process.cwd()) || [];
    const availableSlogans = slogans
      .map((entry) => entry?.Slogan?.trim())
      .filter((slogan): slogan is string => Boolean(slogan));

    printAllBanners(availableSlogans);
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
  .addHelpText(
    "after",
    "\nUse this to discover the module tree before running `run-all`, `npm-link`, or `npm-token`."
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
    "\n`link` creates symlinks for decaf-ts dependencies, `unlink` removes those links and reinstalls, and any other operation is passed through to npm in each selected module."
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
  .addHelpText(
    "after",
    "\nThis command creates symlinks back to the repository root token files for every discovered module."
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
  .addHelpText(
    "after",
    "\nThe command stops on the first failing module command."
  )
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
  .option("--git-token <name>", "Secret name for the git push token", "github")
  .option("--npm-token <name>", "Secret name for the npm publish token", "npm")
  .option("--git-user <name>", "Git user name to embed in authenticated pushes")
  .option("--allow-from-branch", "Skip the master/main branch guard")
  .option("--tag <tag>", "Release tag to create")
  .option("--message <message>", "Release message to use")
  .addHelpText(
    "after",
    "\nIf tag or message are omitted, the command prompts interactively. Tokens are resolved via the credentials command (env var → OS keychain → legacy file)."
  )
  .action(async function (this: Command) {
    const values = buildValueMap(this, TAG_RELEASE_OPTION_SPECS);
    await runUtilsCommand(new TagReleaseCommand(), values, this);
  });

const CREDENTIALS_GET_OPTION_SPECS: OptionSpec[] = [
  { name: "version", flag: "--version", type: "boolean" },
  { name: "name", flag: "--name", type: "string" },
  { name: "envVar", flag: "--env-var", type: "string" },
  { name: "service", flag: "--service", type: "string" },
  { name: "account", flag: "--account", type: "string" },
  { name: "legacyFile", flag: "--legacy-file", type: "string" },
];

const credentialsGetCommand = new Command()
  .name("get")
  .description(
    "resolve a secret and print it to stdout (no trailing newline).\n" +
      "Resolution order: env var -> OS keychain -> legacy plaintext file.\n" +
      "In CI, set NPM_TOKEN / GH_TOKEN / ATLASSIAN_API_TOKEN as env vars."
  )
  .option("--version", "Show credentials command version")
  .option("--name <name>", "Secret name (npm, github, confluence, or custom)", "npm")
  .option("--env-var <name>", "Override the environment variable name (e.g. GH_PAT instead of GH_TOKEN)")
  .option("--service <name>", "Override the keychain service label (default: decaf-ts:<name>)")
  .option("--account <name>", "Override the keychain account label")
  .option("--legacy-file <path>", "Override the legacy plaintext file path (emits deprecation warning)")
  .addHelpText(
    "after",
    "\nExamples:\n" +
      "  decaf utils credentials get --name npm\n" +
      "  decaf utils credentials get --name github --env-var GH_PAT\n" +
      '  npm config set //registry.npmjs.org/:_authToken "$(decaf utils credentials get --name npm)"\n' +
      "  decaf utils credentials get --name stripe --env-var STRIPE_SECRET_KEY --legacy-file .stripe-token"
  )
  .action(async function (this: Command) {
    const values = buildValueMap(this, CREDENTIALS_GET_OPTION_SPECS);
    values.action = "get";
    await runUtilsCommand(new CredentialsCommand(), values, this);
  });

const CREDENTIALS_STORE_OPTION_SPECS: OptionSpec[] = [
  { name: "version", flag: "--version", type: "boolean" },
  { name: "name", flag: "--name", type: "string" },
  { name: "value", flag: "--value", type: "string" },
  { name: "envVar", flag: "--env-var", type: "string" },
  { name: "service", flag: "--service", type: "string" },
  { name: "account", flag: "--account", type: "string" },
  { name: "legacyFile", flag: "--legacy-file", type: "string" },
];

const credentialsStoreCommand = new Command()
  .name("store")
  .description(
    "store a secret in the OS keychain for later retrieval by 'get'.\n" +
      "Requires --value. Supports built-in names (npm, github, confluence) and custom names."
  )
  .option("--version", "Show credentials command version")
  .option("--name <name>", "Secret name (npm, github, confluence, or custom)", "npm")
  .option("--value <value>", "Secret value to store (required)")
  .option("--env-var <name>", "Override the environment variable name for this secret")
  .option("--service <name>", "Override the keychain service label (default: decaf-ts:<name>)")
  .option("--account <name>", "Override the keychain account label")
  .option("--legacy-file <path>", "Override the legacy plaintext file path")
  .addHelpText(
    "after",
    "\nExamples:\n" +
      "  decaf utils credentials store --name github --value ghp_xxxxxxxxxxxx\n" +
      "  decaf utils credentials store --name my-api --env-var MY_API_TOKEN --service 'my-app:api' --account 'ci' --value 'sk_live_xxx'"
  )
  .action(async function (this: Command) {
    const values = buildValueMap(this, CREDENTIALS_STORE_OPTION_SPECS);
    values.action = "store";
    await runUtilsCommand(new CredentialsCommand(), values, this);
  });

const credentialsSetupCommand = new Command()
  .name("setup")
  .description(
    "interactively enroll all built-in secrets (npm, github, confluence) into the OS keychain.\n" +
      "Prompts for each token, stores it securely, and configures the git credential helper.\n" +
      "Use --rm to auto-delete legacy plaintext token files after successful enrollment."
  )
  .option("--version", "Show credentials command version")
  .option("--rm", "Delete legacy plaintext token files (.npmtoken, .token, .confluence-token) after setup")
  .addHelpText(
    "after",
    "\nExamples:\n" +
      "  decaf utils credentials setup\n" +
      "  decaf utils credentials setup --rm   # auto-deletes legacy token files"
  )
  .action(async function (this: Command) {
    const values = buildValueMap(this, [
      { name: "version", flag: "--version", type: "boolean" },
      { name: "rm", flag: "--rm", type: "boolean" },
    ]);
    values.action = "setup";
    await runUtilsCommand(new CredentialsCommand(), values, this);
  });

const credentialsGitHelperCommand = new Command()
  .name("git-helper")
  .description(
    "configure the OS-native git credential helper only (no secret enrollment).\n" +
      "macOS: osxkeychain | Linux: libsecret (falls back to store) | Windows: manager.\n" +
      "This is also run automatically as part of 'setup'."
  )
  .option("--version", "Show credentials command version")
  .addHelpText(
    "after",
    "\nExample:\n" +
      "  decaf utils credentials git-helper"
  )
  .action(async function (this: Command) {
    const values = buildValueMap(this, [
      { name: "version", flag: "--version", type: "boolean" },
    ]);
    values.action = "git-helper";
    await runUtilsCommand(new CredentialsCommand(), values, this);
  });

const credentialsCommand = new Command()
  .name("credentials")
  .description(
    "manage secrets via the OS keychain with env-var and legacy-file fallbacks.\n\n" +
      "Resolution order for 'get': env var -> OS keychain -> legacy plaintext file.\n" +
      "Built-in secrets: npm (NPM_TOKEN), github (GH_TOKEN), confluence (ATLASSIAN_API_TOKEN).\n" +
      "Custom secrets are supported with --env-var, --service, --account, --legacy-file overrides.\n\n" +
      "In CI: set the env var as a GitHub/GitLab secret — no keychain access needed.\n" +
      "Locally: run 'setup' once to enroll secrets in the keychain, then delete plaintext files."
  )
  .addHelpText(
    "after",
    "\nSubcommands:\n" +
      "  get         Resolve a secret and print to stdout\n" +
      "  store       Store a secret in the OS keychain\n" +
      "  setup       Interactive one-time enrollment of all built-in secrets (--rm to auto-delete legacy files)\n" +
      "  git-helper  Configure the OS-native git credential helper\n\n" +
      "Examples:\n" +
      '  decaf utils credentials get --name npm\n' +
      "  decaf utils credentials store --name github --value ghp_xxxxxxxxxxxx\n" +
      "  decaf utils credentials setup\n" +
      "  decaf utils credentials setup --rm\n" +
      "  decaf utils credentials git-helper\n\n" +
      "Programmatic API (TypeScript):\n" +
      "  import { resolveSecret, hasSecret } from '@decaf-ts/utils';\n" +
      "  const token = resolveSecret('npm'); // env var -> keychain -> legacy file"
  );

credentialsCommand.addCommand(credentialsGetCommand);
credentialsCommand.addCommand(credentialsStoreCommand);
credentialsCommand.addCommand(credentialsSetupCommand);
credentialsCommand.addCommand(credentialsGitHelperCommand);

export default function utils(): Command {
  const utilsCmd = new Command()
    .command("utils")
    .description("utilitarian cli commands for the decaf-ts framework");

  utilsCmd.addCommand(libraries);
  utilsCmd.addCommand(environmentExport);
  utilsCmd.addCommand(printAllBannersCommand);
  utilsCmd.addCommand(modulesCommand);
  utilsCmd.addCommand(runAllCommand);
  utilsCmd.addCommand(npmLinkCommand);
  utilsCmd.addCommand(npmTokenCommand);
  utilsCmd.addCommand(tagReleaseCommand);
  utilsCmd.addCommand(credentialsCommand);
  return utilsCmd;
}
