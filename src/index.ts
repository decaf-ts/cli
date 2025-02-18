export * from "./CliWrapper";

/**
 * @description Decaf-ts' CLI module
 * @summary This file will crawl the current working directory for files called {@link CLI_FILE_NAME}
 * within the @decaf-ts namespace and load then as subcommands
 *
 * @example
 * run module command     - $ npx decaf <module name> <module command> ...<module command options>
 * get module help        - $ npx decaf help <module name>;
 * list imported modules  - $ npx decaf list;
 * get cli help           - $ npx decaf help;
 *
 * @module CLI
 */

/**
 * @description Decaf-ts' CLI namespace
 * @summary This file will crawl the current working directory for files called {@link CLI_FILE_NAME}
 * within the @decaf-ts namespace and load then as subcommands
 *
 * @example
 * run module command     - $ npx decaf <module name> <module command> ...<module command options>
 * get module help        - $ npx decaf help <module name>;
 * list imported modules  - $ npx decaf list;
 * get cli help           - $ npx decaf help;
 *
 * @namespace cli
 * @memberOf module:CLI
 */

/**
 * @summary stores the current package version
 * @description this is how you should document a constant
 * @const VERSION
 * @memberOf module:CLI
 */
export const VERSION = "##VERSION##";
