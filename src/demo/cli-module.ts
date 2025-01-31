import { Command } from "commander";

/**
 * @description demo CLI module for libraries
 * @summary minimal implementation on how to extend the decaf-ts cli
 *
 * - the function must be ***exported by default***!;
 * - The name of the returned function will be considered to be the base command;
 * - the command you return will be considered as a subCommand and will not be called directly
 * - Commands must be transpiled under the same ts-configuration as this module
 * (so copy the ts-config of this module to your project. we propose `tsconfig.cli.json`)
 * - Following your build pipeline include `tsc --project tsconfig.cli.json --outDir <dist folder>/cli`
 *
 * Note the extra use of `cli` on the outDir param. this is meant to completely separate
 * the cli code from your source, in case they are transpiled under different ts-configurations
 *
 * @returns {Command} the subCommand to be added to the main decaf CLI
 *
 * @function demo
 *
 * @category Command Line Interface
 *
 * @example
 * `npx decaf demo command "something something" `
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
