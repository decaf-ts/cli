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
