![Banner](./workdocs/assets/decaf-logo.svg)

## Decaf-ts CLI

A modular command-line interface framework for Decaf-ts that dynamically discovers and loads CLI modules from different packages. The CLI provides a unified entry point (`decaf`) for executing commands from various Decaf modules, making it easy to extend with new functionality without modifying the core CLI code.

> Release docs refreshed on 2025-11-26. See [workdocs/reports/RELEASE_NOTES.md](./workdocs/reports/RELEASE_NOTES.md) for ticket summaries.

![Licence](https://img.shields.io/github/license/decaf-ts/cli.svg?style=plastic)
![GitHub language count](https://img.shields.io/github/languages/count/decaf-ts/cli?style=plastic)
![GitHub top language](https://img.shields.io/github/languages/top/decaf-ts/cli?style=plastic)

[![Build & Test](https://github.com/decaf-ts/cli/actions/workflows/nodejs-build-prod.yaml/badge.svg)](https://github.com/decaf-ts/cli/actions/workflows/nodejs-build-prod.yaml)
[![CodeQL](https://github.com/decaf-ts/cli/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/decaf-ts/cli/actions/workflows/codeql-analysis.yml)[![Snyk Analysis](https://github.com/decaf-ts/cli/actions/workflows/snyk-analysis.yaml/badge.svg)](https://github.com/decaf-ts/cli/actions/workflows/snyk-analysis.yaml)
[![Pages builder](https://github.com/decaf-ts/cli/actions/workflows/pages.yaml/badge.svg)](https://github.com/decaf-ts/cli/actions/workflows/pages.yaml)
[![.github/workflows/release-on-tag.yaml](https://github.com/decaf-ts/cli/actions/workflows/release-on-tag.yaml/badge.svg?event=release)](https://github.com/decaf-ts/cli/actions/workflows/release-on-tag.yaml)

![Open Issues](https://img.shields.io/github/issues/decaf-ts/cli.svg)
![Closed Issues](https://img.shields.io/github/issues-closed/decaf-ts/cli.svg)
![Pull Requests](https://img.shields.io/github/issues-pr-closed/decaf-ts/cli.svg)
![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg)

![Line Coverage](workdocs/reports/coverage/badge-lines.svg)
![Function Coverage](workdocs/reports/coverage/badge-functions.svg)
![Statement Coverage](workdocs/reports/coverage/badge-statements.svg)
![Branch Coverage](workdocs/reports/coverage/badge-branches.svg)


![Forks](https://img.shields.io/github/forks/decaf-ts/cli.svg)
![Stars](https://img.shields.io/github/stars/decaf-ts/cli.svg)
![Watchers](https://img.shields.io/github/watchers/decaf-ts/cli.svg)

![Node Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbadges%2Fshields%2Fmaster%2Fpackage.json&label=Node&query=$.engines.node&colorB=blue)
![NPM Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbadges%2Fshields%2Fmaster%2Fpackage.json&label=NPM&query=$.engines.npm&colorB=purple)

Documentation available [here](https://decaf-ts.github.io/cli/)

Minimal size: 1.6 KB kb gzipped


### Description

The Decaf-ts CLI is a powerful and extensible command-line interface framework designed to provide a unified entry point for all Decaf-ts modules. It enables developers to create modular CLI commands that can be discovered and executed through a single command-line tool.

#### Core Components

1. **CliWrapper**: The central class that manages the discovery, loading, and execution of CLI modules. It:
   - Crawls the filesystem to find CLI module files
   - Dynamically loads modules using JavaScript's import system
   - Registers commands with Commander.js
   - Provides a simple API for running commands

2. **CLIUtils**: A utility class that provides helper methods for:
   - Loading modules from files
   - Normalizing imports between ESM and CommonJS formats
   - Retrieving package information (name, version)
   - Initializing Commander.js commands

3. **CLI Module System**: A standardized way for Decaf-ts packages to expose CLI functionality:
   - Modules are discovered by filename (cli-module.js)
   - Each module exports a function that returns a Commander.js Command object
   - Modules can define their own subcommands and options

#### Key Features

- **Dynamic Discovery**: Automatically finds CLI modules in the project and its dependencies
- **Modular Architecture**: Each module can define its own commands independently
- **Extensible**: New commands can be added without modifying the core CLI code
- **Unified Interface**: All commands are accessible through the single `decaf` command
- **Self-documenting**: Leverages Commander.js to provide help text and usage information

#### Technical Details

The CLI uses a recursive filesystem crawler to find modules up to a configurable depth. It handles both ESM and CommonJS module formats, making it compatible with various JavaScript environments. The command structure follows the pattern:

```
decaf <module> <command> [options]
```

Where `<module>` is the name of a Decaf-ts module and `<command>` is a specific command provided by that module.


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


## Coding Principles

- group similar functionality in folders (analog to namespaces but without any namespace declaration)
- one class per file;
- one interface per file (unless interface is just used as a type);
- group types as other interfaces in a types.ts file per folder;
- group constants or enums in a constants.ts file per folder;
- group decorators in a decorators.ts file per folder;
- always import from the specific file, never from a folder or index file (exceptions for dependencies on other packages);
- prefer the usage of established design patters where applicable:
  - Singleton (can be an anti-pattern. use with care);
  - factory;
  - observer;
  - strategy;
  - builder;
  - etc;

## Release Documentation Hooks
Stay aligned with the automated release pipeline by reviewing [Release Notes](./workdocs/reports/RELEASE_NOTES.md) and [Dependencies](./workdocs/reports/DEPENDENCIES.md) after trying these recipes (updated on 2025-11-26).


### Related

[![decaf-ts](https://github-readme-stats.vercel.app/api/pin/?username=decaf-ts&repo=decaf-ts)](https://github.com/decaf-ts/decaf-ts)
[![for-fabric](https://github-readme-stats.vercel.app/api/pin/?username=decaf-ts&repo=for-fabric)](https://github.com/decaf-ts/for-fabric)
[![for-angular](https://github-readme-stats.vercel.app/api/pin/?username=decaf-ts&repo=for-angular)](https://github.com/decaf-ts/for-angular)
[![decorator-validation](https://github-readme-stats.vercel.app/api/pin/?username=decaf-ts&repo=decorator-validation)](https://github.com/decaf-ts/decorator-validation)
[![db-decorators](https://github-readme-stats.vercel.app/api/pin/?username=decaf-ts&repo=db-decorators)](https://github.com/decaf-ts/db-decorators)
[![utils](https://github-readme-stats.vercel.app/api/pin/?username=decaf-ts&repo=utils)](https://github.com/decaf-ts/utils)


### Social

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/decaf-ts/)




#### Languages

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![ShellScript](https://img.shields.io/badge/Shell_Script-121011?style=for-the-badge&logo=gnu-bash&logoColor=white)

## Getting help

If you have bug reports, questions or suggestions please [create a new issue](https://github.com/decaf-ts/ts-workspace/issues/new/choose).

## Contributing

I am grateful for any contributions made to this project. Please read [this](./workdocs/98-Contributing.md) to get started.

## Supporting

The first and easiest way you can support it is by [Contributing](./workdocs/98-Contributing.md). Even just finding a typo in the documentation is important.

Financial support is always welcome and helps keep both me and the project alive and healthy.

So if you can, if this project in any way. either by learning something or simply by helping you save precious time, please consider donating.

## License

This project is released under the [MIT License](./LICENSE.md).

By developers, for developers...
