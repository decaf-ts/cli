import { Command } from "commander";

export default function test(command: Command) {
  command
    .command("test <type>")
    .description("A test command")
    .action((args: { type: string }) => {
      console.log(`executed test command with ${args.type}`);
    });
}
