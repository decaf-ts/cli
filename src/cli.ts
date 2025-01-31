/**
 * Actual CLI file
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
