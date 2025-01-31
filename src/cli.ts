#!/usr/bin/env node

/**
 * @description Decaf-ts' CLI entry file
 * @summary This file will crawl the current working directory for files called {@link CLI_FILE_NAME}
 * within the @decaf-ts namespace and load then as subcommands
 *
 * @example
 * run module command     => `$ npx decaf <module name> <module command> ...<module command options>`
 * get module help        => `$ npx decaf help <module name>`;
 * list imported modules  => `$ npx decaf list`;
 * get cli help           => `$ npx decaf help`;
 *
 * @memberOf module:CLI
 */

import { CliWrapper } from "./CliWrapper";
new CliWrapper()
  .run(process.argv)
  .then(() => {
    console.log("Thank you for using decaf-ts' command line interface");
  })
  .catch((e: unknown) => {
    console.error(`${e instanceof Error ? e.message : e}`);
    process.exit(1);
  });
