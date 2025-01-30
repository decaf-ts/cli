import { Command } from "commander";

export default function test() {
  return new Command()
    .command("command <type>")
    .description("A test command")
    .action((args: string) => {
      console.log(`executed test command with ${args}`);
    });
}
