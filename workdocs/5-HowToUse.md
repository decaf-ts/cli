### How to Use

- [Initial Setup](./workdocs/tutorials/For%20Developers.md#_initial-setup_)
- [Installation](./workdocs/tutorials/For%20Developers.md#installation)

#### Using the CLI

The Decaf-ts CLI provides a unified command-line interface for all Decaf-ts modules. Here are some examples of how to use it:

```bash
# Get general help
npx decaf help

# List all available modules
npx decaf list

# Get help for a specific module
npx decaf help <module-name>

# Run a command from a specific module
npx decaf <module-name> <command> [options]
```

#### Creating a CLI Module

To create a CLI module for your Decaf-ts package, follow these steps:

1. Create a file named `cli-module.ts` in your package:

```typescript
import { Command } from "commander";

export default function myModule(): Command {
  return new Command()
    .command("hello <name>")
    .description("Say hello to someone")
    .action((name: string) => {
      console.log(`Hello, ${name}!`);
    });
}
```

2. Configure your TypeScript build to output the CLI module:

```json
// tsconfig.cli.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist/cli"
  },
  "include": ["src/cli-module.ts"]
}
```

3. Add a build step to your package.json:

```json
"scripts": {
  "build:cli": "tsc --project tsconfig.cli.json"
}
```

#### Using the CliWrapper Programmatically

You can also use the CliWrapper class programmatically in your own code:

```typescript
import { CliWrapper } from "@decaf-ts/cli";

// Create a new CLI wrapper with custom options
const cli = new CliWrapper("./src", 2);

// Run the CLI with custom arguments
cli.run(process.argv)
  .then(() => {
    console.log("CLI commands executed successfully");
  })
  .catch((error) => {
    console.error("Error executing CLI commands:", error);
  });
```

#### Using CLIUtils

The CLIUtils class provides utility methods for working with CLI modules:

```typescript
import { CLIUtils } from "@decaf-ts/cli";
import { Command } from "commander";

// Initialize a Command object with package information
const command = new Command();
CLIUtils.initialize(command, "./path/to/package");

// Get package information
const version = CLIUtils.packageVersion("./path/to/package");
const name = CLIUtils.packageName("./path/to/package");

// Load a CLI module from a file
const modulePath = "./path/to/cli-module.js";
CLIUtils.loadFromFile(modulePath)
  .then((module) => {
    const command = module();
    console.log("Loaded command:", command.name());
  })
  .catch((error) => {
    console.error("Error loading module:", error);
  });
```

#### Demo CLI Module

The CLI package includes a demo module that shows how to create a simple command:

```typescript
// Run the demo command
npx decaf demo command "hello world"

// Output:
// executed demo command with type variable: hello world
```
