import { Command } from "commander";
import { DefaultCommandValues, VERSION as UtilsVersion } from "@decaf-ts/utils";
import { getCmdLogger } from "../logging";

export type OptionSpec = {
  name: string;
  flag: string;
  type: "boolean" | "string";
  allowFalse?: boolean;
};

export function parseOptionalBoolean(value?: string): boolean {
  if (value === undefined) return true;
  return !/^(false|0|no)$/i.test(value.toString());
}

export function buildValueMap(
  command: Command,
  specs: OptionSpec[],
): Record<string, unknown> {
  const opts = command.opts() as Record<string, unknown>;
  return specs.reduce((acc, spec) => {
    const value = opts[spec.name];
    if (spec.type === "boolean") {
      if (value === true || (spec.allowFalse && value === false)) {
        acc[spec.name] = value;
      }
    } else if (spec.type === "string" && typeof value === "string" && value.length > 0) {
      acc[spec.name] = value;
    }
    return acc;
  }, {} as Record<string, unknown>);
}

export async function runUtilsCommand(
  utilsCommand: object,
  values: Record<string, unknown>,
  invoker: Command,
): Promise<void> {
  const log = getCmdLogger(invoker);
  const payload = Object.assign({}, DefaultCommandValues, values);
  const runMethod = (utilsCommand as Record<string, unknown>)["run"];
  if (typeof runMethod !== "function") {
    throw new Error("Provided utils command does not expose a run method");
  }

  log.debug(`Executing ${utilsCommand.constructor.name} command via decaf CLI bridge`);
  if ((payload as Record<string, unknown>).version === true) {
    console.log(UtilsVersion);
    return;
  }
  await runMethod.call(utilsCommand, payload);
}
