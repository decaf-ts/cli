import { Command } from "commander";

const runCommand = new Command("command")
  .description("A demo command")
  .argument("<type>")
  .action(async (type: string) => {
    console.log(`executed demo command with type variable: ${type}`);
  });

export default function demo(): Command {
  const demoCommand = new Command("demo").description("Demo commands");
  demoCommand.addCommand(runCommand);
  return demoCommand;
}
