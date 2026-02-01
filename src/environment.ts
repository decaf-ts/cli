import { LoggedEnvironment, LoggingConfig } from "@decaf-ts/logging";

export type DecafCliEnvironment = LoggingConfig & {
  banner: boolean;
};

export const DefaultCliEnvironment: DecafCliEnvironment = {
  banner: true,
} as DecafCliEnvironment;

export const DecafCLieEnvironment = LoggedEnvironment.accumulate(
  DefaultCliEnvironment
);
