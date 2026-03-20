import { Command } from "commander";
import { BuildScripts } from "@decaf-ts/utils";
import {
  buildValueMap,
  OptionSpec,
  runUtilsCommand,
} from "../utils/command-forwarder";

const BUILD_OPTION_SPECS: OptionSpec[] = [
  { name: "version", flag: "--version", type: "boolean" },
  { name: "dev", flag: "--dev", type: "boolean" },
  { name: "prod", flag: "--prod", type: "boolean" },
  { name: "buildMode", flag: "--buildMode", type: "string" },
  { name: "includes", flag: "--includes", type: "string" },
  { name: "externals", flag: "--externals", type: "string" },
  { name: "docs", flag: "--docs", type: "boolean" },
  { name: "commands", flag: "--commands", type: "boolean" },
  { name: "entry", flag: "--entry", type: "string" },
];

export default function buildModule(): Command {
  return new Command()
    .command("build")
    .description("Run decaf build scripts")
    .option("--version", "Show build-scripts version")
    .option("--dev", "Run the development build pipeline")
    .option("--prod", "Run the production build pipeline")
    .option("--build-mode <mode>", "Select build mode (build|bundle|all)")
    .option("--includes <list>", "Comma separated bundle includes list")
    .option("--externals <list>", "Comma separated externals list")
    .option("--docs", "Generate documentation")
    .option("--commands", "Include CLI commands bundle")
    .option("--entry <path>", "Override entry file path")
    .action(async function (this: Command) {
      const values = buildValueMap(this, BUILD_OPTION_SPECS);
      await runUtilsCommand(new BuildScripts(), values, this);
    });
}
