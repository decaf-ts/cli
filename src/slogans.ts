import path from "path";
import fs from "fs";
import { getPackage } from "@decaf-ts/utils";
import { Logger } from "@decaf-ts/logging";
/**
 * @description Reads and parses slogans from workdocs/assets/slogans.json.
 * @summary Attempts to read a slogans.json file from the workdocs/assets directory at the given base path and returns its parsed contents as an array.
 *
 * @param {string} basePath - The base directory path where workdocs/assets/slogans.json should exist.
 * @return {any[] | undefined} The parsed array from slogans.json, or undefined if the file doesn't exist.
 *
 * @function readSlogans
 *
 * @memberOf module:utils
 */
export function readSlogans(
  log: Logger,
  basePath: string
): { Slogan: string }[] | undefined {
  log = log.for(readSlogans);
  const slogansPath = path.join(basePath, "workdocs", "assets", "slogans.json");

  try {
    if (!fs.existsSync(slogansPath)) {
      return undefined;
    }

    const content = fs.readFileSync(slogansPath);
    return JSON.parse(content.toString());
  } catch (error: unknown) {
    log.error(`Failed to read slogans from ${slogansPath}`, error as Error);
    return undefined;
  }
}

/**
 * @description Collects slogans from a base path and all @decaf scoped packages.
 * @summary Recursively collects slogans.json files from the given base path and all subdirectories under node_modules/@decaf/*. Results are stored in an object keyed by the package name (from package.json).
 *
 * @param {string} basePath - The base directory path to start collecting from.
 * @return {Record<string, any[]>} An object mapping package names to their slogans arrays.
 *
 * @function collectSlogans
 *
 * @memberOf module:utils
 */
export function collectSlogans(
  log: Logger,
  basePath: string
): Record<string, any[]> {
  log = log.for(collectSlogans);
  const result: Record<string, any[]> = {};

  // Read slogans for the base path
  const baseSlogans = readSlogans(log, basePath);
  if (baseSlogans) {
    try {
      const pkgName = getPackage(basePath, "name") as string;
      result[pkgName] = baseSlogans;
      log.verbose(`Collected ${baseSlogans.length} slogans from ${pkgName}`);
    } catch (error: unknown) {
      log.verbose(`Failed to get package name for base path: ${error}`);
    }
  }

  // Check for @decaf/* packages in node_modules
  const decafModulesPath = path.join(basePath, "node_modules", "@decaf-ts");
  if (fs.existsSync(decafModulesPath)) {
    try {
      const decafPackages = fs.readdirSync(decafModulesPath, {
        withFileTypes: true,
      });

      for (const pkg of decafPackages) {
        if (!pkg.isDirectory()) continue;

        const pkgPath = path.join(decafModulesPath, pkg.name);
        const pkgSlogans = readSlogans(log, pkgPath);

        if (pkgSlogans) {
          try {
            const pkgName = getPackage(pkgPath, "name") as string;
            result[pkgName] = pkgSlogans;
            log.verbose(
              `Collected ${pkgSlogans.length} slogans from ${pkgName}`
            );
          } catch (error: unknown) {
            log.verbose(`Failed to get package name for ${pkgPath}: ${error}`);
          }
        }
      }
    } catch (error: unknown) {
      log.verbose(`Error reading @decaf-ts modules: ${error}`);
    }
  }

  return result;
}

/**
 * @description Flattens collected slogans with weighted selection for a priority package.
 * @summary Given a collection of slogans and a priority package name, returns a flat array where slogans from the priority package have a 30-40% chance of appearing at any given position.
 *
 * @param {Record<string, any[]>} slogansMap - Object mapping package names to slogan arrays.
 * @param {string} priorityPackage - The package name whose slogans should be prioritized.
 * @return {any[]} A flat array of all slogans with weighted distribution.
 *
 * @function flattenSlogansWithPriority
 *
 * @memberOf module:utils
 */
export function flattenSlogansWithPriority(
  log: Logger,
  slogansMap: Record<string, any[]>,
  priorityPackage: string
): any[] {
  log = log.for(flattenSlogansWithPriority);
  const result: any[] = [];
  const prioritySlogans = slogansMap[priorityPackage] || [];
  const otherSlogans: any[] = [];

  // Collect all non-priority slogans
  for (const [pkgName, slogans] of Object.entries(slogansMap)) {
    if (pkgName === priorityPackage) continue;
    otherSlogans.push(...slogans);
  }

  if (prioritySlogans.length === 0 && otherSlogans.length === 0) {
    log.error("No slogans found to flatten");
    return result;
  }

  if (prioritySlogans.length === 0) {
    log.verbose(
      `package "${priorityPackage}" has no slogans, returning all other slogans`
    );
    return otherSlogans;
  }

  if (otherSlogans.length === 0) {
    log.debug("Only priority slogans available, returning them");
    return prioritySlogans;
  }

  // Interleave with 30-40% chance for priority slogans
  let priorityIndex = 0;
  let otherIndex = 0;
  const priorityWeight = 0.35; // 35% average chance

  while (
    priorityIndex < prioritySlogans.length ||
    otherIndex < otherSlogans.length
  ) {
    const usePriority = Math.random() < priorityWeight;

    if (usePriority && priorityIndex < prioritySlogans.length) {
      result.push(prioritySlogans[priorityIndex++]);
    } else if (otherIndex < otherSlogans.length) {
      result.push(otherSlogans[otherIndex++]);
    } else if (priorityIndex < prioritySlogans.length) {
      // Only priority slogans left
      result.push(prioritySlogans[priorityIndex++]);
    }
  }

  log.debug(
    `Flattened ${result.length} slogans with priority for "${priorityPackage}"`
  );
  return result;
}
