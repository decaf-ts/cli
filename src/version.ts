import { Metadata } from "@decaf-ts/decoration";

/**
 * @description Stores the current package version
 * @summary A constant that holds the version string of the package, which is replaced during build
 * @const VERSION
 * @memberOf module:CLI
 */
export const VERSION = "##VERSION##";

/**
 * @description Stores the current package version
 * @summary A constant that holds the version string of the package, which is replaced during build
 * @const VERSION
 * @memberOf module:CLI
 */
export const PACKAGE_NAME = "##PACKAGE##";

Metadata.registerLibrary(PACKAGE_NAME, VERSION);
