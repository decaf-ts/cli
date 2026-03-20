// eslint-disable-next-line @typescript-eslint/no-require-imports,no-undef
const { Command } = require("commander");

// eslint-disable-next-line no-undef
module.exports = function build() {
  return new Command()
    .command("build")
    .description("Fixture build command")
    .option("--noop", "perform a no-op build step")
    .action(async () => {
      // intentionally empty: fixture should not execute any real work
    });
};
