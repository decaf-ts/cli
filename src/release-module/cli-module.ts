import { Command } from "commander";
import {
  ReleaseChainCommand,
  ReleaseChainDispatchCommand,
} from "@decaf-ts/utils";
import {
  buildValueMap,
  OptionSpec,
  runUtilsCommand,
} from "../utils/command-forwarder";

const RELEASE_LOGGING_SPECS: OptionSpec[] = [
  { name: "verbose", flag: "--verbose", type: "boolean" },
  { name: "version", flag: "--version", type: "boolean" },
  { name: "logLevel", flag: "--logLevel", type: "string" },
  { name: "logStyle", flag: "--logStyle", type: "boolean", allowFalse: true },
  { name: "timestamp", flag: "--timestamp", type: "boolean", allowFalse: true },
  { name: "banner", flag: "--banner", type: "boolean", allowFalse: true },
];

const RELEASE_CHAIN_SPECS: OptionSpec[] = [
  ...RELEASE_LOGGING_SPECS,
  { name: "meta", flag: "--meta", type: "string" },
  { name: "branch", flag: "--branch", type: "string" },
  { name: "current", flag: "--current", type: "string" },
  { name: "package", flag: "--package", type: "string" },
  { name: "token", flag: "--token", type: "string" },
  { name: "submoduleFile", flag: "--submoduleFile", type: "string" },
  { name: "submodulePath", flag: "--submodulePath", type: "string" },
  { name: "targetBase", flag: "--targetBase", type: "string" },
];

const RELEASE_DISPATCH_SPECS: OptionSpec[] = [
  ...RELEASE_LOGGING_SPECS,
  { name: "meta", flag: "--meta", type: "string" },
  { name: "branch", flag: "--branch", type: "string" },
  { name: "current", flag: "--current", type: "string" },
  { name: "workflow", flag: "--workflow", type: "string" },
  { name: "repo", flag: "--repo", type: "string" },
  { name: "token", flag: "--token", type: "string" },
  { name: "ref", flag: "--ref", type: "string" },
  { name: "targetBase", flag: "--targetBase", type: "string" },
];

export default function releaseModule(): Command {
  const release = new Command()
    .command("release")
    .description("Automate release chain propagation and workflow dispatches");

  release
    .command("chain")
    .alias("run")
    .description("Run release chain locally")
    .option("-V, --verbose", "Enable verbose logging")
    .option("--version", "Show release-chain version")
    .option("--branch <name>", "Branch to update downstream repositories")
    .option(
      "--current <owner/repo>",
      "Current repository slug to resume after in the chain"
    )
    .option(
      "--package <name>",
      "Override detected package name for dependency updates"
    )
    .option("--token <token>", "GitHub token for cloning and pushing")
    .option(
      "--submodule-file <file>",
      "Override submodule file name (default .gitsubmodule)"
    )
    .option(
      "--submodule-path <path>",
      "Use a local submodule file instead of downloading"
    )
    .option(
      "--target-base <branch>",
      "Base branch to open downstream pull requests against"
    )
    .action(async function (this: Command) {
      const values = buildValueMap(this, RELEASE_CHAIN_SPECS);
      await runUtilsCommand(new ReleaseChainCommand(), values, this);
    });

  release
    .command("dispatch")
    .description(
      "Dispatch the GitHub Actions release-chain workflow with explicit inputs"
    )
    .option("-V, --verbose", "Enable verbose logging")
    .option("--version", "Show release-chain version")
    .option("--branch <name>", "Branch to evaluate in downstream repositories")
    .option(
      "--current <owner/repo>",
      "Repository slug that triggered the release chain"
    )
    .option(
      "--workflow <file>",
      "Workflow file name (default release-chain.yaml)"
    )
    .option(
      "--repo <owner/repo>",
      "Target repository slug where the workflow lives"
    )
    .option("--token <token>", "GitHub token for dispatching workflows")
    .option("--ref <ref>", "Git ref to dispatch the workflow on")
    .option(
      "--target-base <branch>",
      "Base branch to open downstream pull requests against"
    )
    .action(async function (this: Command) {
      const values = buildValueMap(this, RELEASE_DISPATCH_SPECS);
      await runUtilsCommand(new ReleaseChainDispatchCommand(), values, this);
    });

  return release;
}
