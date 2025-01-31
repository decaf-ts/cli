import { Command } from "commander";

/**
 * @description demo CLI module for libraries
 * @summary minimal implementation on how to extend the decaf-ts cli
 *
 * - The name of the returned function will be considered to be the base command;
 * - the command you return will be considered as a subCommand and will not be called directly
 *
 * @returns {Command} the subCommand to be added to the main decaf CLI
 *
 * @function demo
 *
 * @category CLI
 *
 * @example
 * `npx decaf demo command "something something"`
 *
 * will output `executed demo command with type variable: something something`
 */
export default function demo(): Command {
  return new Command()
    .command("command <type>")
    .description("A demo command")
    .action((args: string) => {
      console.log(`executed demo command with type variable: ${args}`);
    });
}
