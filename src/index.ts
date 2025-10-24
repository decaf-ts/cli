export * from "./CliWrapper";

/**
 * @description Decaf-ts' CLI module
 * @summary This file will crawl the current working directory for files called {@link CLI_FILE_NAME}
 * within the @decaf-ts namespace and load them as subcommands. It serves as the main entry point
 * for the CLI functionality, exporting the CliWrapper class and VERSION constant.
 *
 * @example
 * run module command     - $ npx decaf <module name> <module command> ...<module command options>
 * get module help        - $ npx decaf help <module name>;
 * list imported modules  - $ npx decaf list;
 * get cli help           - $ npx decaf help;
 *
 * @module CLI
 */
