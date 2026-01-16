import { Command } from "commander";
import { Logging, Logger } from "@decaf-ts/logging";

export function getCmdLogger(cmd: Command) {
  const inheritance: any[] = [cmd];
  let parent = cmd.parent;
  while (parent) {
    inheritance.push(parent);
    parent = parent.parent;
  }
  if (!parent)
    throw new Error("Outshot the root parent. should not be possible");
  const log = inheritance.reverse().reduce((accum: Logger, el) => {
    return accum.for(el.name);
  }, Logging.get());
  return log;
}
