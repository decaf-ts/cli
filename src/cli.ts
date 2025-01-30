import { CliWrapper } from "./CliWrapper";
new CliWrapper("./")
  .run(process.argv)
  .then(() => {
    console.log("Thank you for using the Decaf-ts command line interface");
  })
  .catch((e: unknown) => {
    console.error(`${e instanceof Error ? e.message : e}`);
  });
