import { Command } from "commander";
import fs from "fs";
import path from "path";
import { getCmdLogger } from "../logging";
import { Metadata } from "@decaf-ts/decoration";
import { CliWrapper } from "../CliWrapper";
import { toENVFormat } from "@decaf-ts/logging";

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
  .description("outputs currently enforced environment")
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

export default function utils(): Command {
  const utilsCmd = new Command()
    .command("utils")
    .description("utilitarian cli commands for the decaf-ts framework");

  utilsCmd.addCommand(libraries);
  return utilsCmd;
}
