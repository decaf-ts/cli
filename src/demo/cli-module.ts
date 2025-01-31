import { Command } from "commander";

/**
 * @description demo CLI module for libraries
 * @summary minimal implementation on how to extend the decaf-ts cli
 *
 * Simply logs a message
 *
 * @function demo
 *
 * @category CLI
 * @memberOf module:CLI.cli
 */
export default function demo() {
  return new Command()
    .command("command <type>")
    .description("A demo command")
    .action((args: string) => {
      console.log(`executed demo command with type variable: ${args}`);
    });
}
