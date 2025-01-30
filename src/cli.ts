import { CliWrapper } from "./CliWrapper";
new CliWrapper()
  .run(process.argv)
  .then(() => {
    console.log("Thank you for using the Decaf-ts command line interface");
    process.exit(0);
  })
  .catch((e: unknown) => {
    console.error(`${e instanceof Error ? e.message : e}`);
    process.exit(1);
  });
