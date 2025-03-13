import gulp from "gulp";
import rename from "gulp-rename";
const { src, dest, series } = gulp;
import ts from "gulp-typescript";
const { createProject } = ts;
import sourcemaps from "gulp-sourcemaps";
import uglify from "gulp-uglify";
import gulpIf from "gulp-if";
import merge from "merge-stream";
import replace from "gulp-replace";
import run from "gulp-run-command";
import through from "through2";

import pkg from "./package.json" with { type: "json" };
let { name, version } = pkg;
import fs from "fs";
import path from "path";

if (name.includes("/")) name = name.split("/")[1]; // for scoped packages
const VERSION_STRING = "##VERSION##";

function patchFiles() {
  const doPatch = (basePath) => {
    return function doPatch() {
      const jsFiles = [`${basePath}/**/*.?(c|m)js`];
      return src(jsFiles)
        .pipe(
          replace(
            /"use\sstrict";\n\/\*\*\n\s\*\sBIN_CALL_PLACEHOLDER.*\n\s\*\//gm,
            "#!/usr/bin/env node"
          )
        )
        .pipe(replace(VERSION_STRING, `${version}`))
        .pipe(dest(`${basePath}/`));
    };
  };

  return series(doPatch("lib"));
}

function chmodCLIFiles() {
  const doChmod = (basePath) => {
    return function doChmod() {
      const jsFiles = [`${basePath}/**/cli.?(c|m)js`];
      return src(jsFiles).pipe(
        through.obj(function (file, enc, cb) {
          fs.chmodSync(file.path, 0o775);
          cb(null);
        })
      );
    };
  };

  return series(doChmod("lib"));
}

function exportDefault(isDev, mode) {
  return function exportDefault() {
    function createLib() {
      const tsProject = createProject("tsconfig.json", {
        module: mode,
        declaration: true,
        declarationMap: true,
        emitDeclarationOnly: false,
        isolatedModules: false,
      });

      const stream = src("./src/**/*.ts")
        .pipe(replace(VERSION_STRING, `${version}`))
        .pipe(gulpIf(isDev, sourcemaps.init()))
        .pipe(tsProject());

      const destPath = `lib${mode === "commonjs" ? "" : "/esm"}`;

      const fixCjsImports = function (match, ...groups) {
        const renamedFile = groups[1] + ".cjs";
        const fileName = groups[1] + ".ts";

        const filePath = path.join(
          this.file.path.split(name)[0],
          name,
          "src",
          this.file.path
            .split(name)[1]
            .split("/")
            .slice(1, this.file.path.split(name)[1].split("/").length - 1)
            .join("/"),
          fileName
        );

        if (!fs.existsSync(filePath))
          return groups[0] + groups[1] + "/index.cjs" + groups[2];

        return groups[0] + renamedFile + groups[2];
      };

      return merge([
        stream.dts.pipe(dest(destPath)),
        stream.js
          .pipe(gulpIf(!isDev, uglify()))
          .pipe(gulpIf(isDev, sourcemaps.write()))
          .pipe(
            gulpIf(
              mode === "commonjs",
              rename(function changeName(file) {
                return Object.assign(file, { extname: ".cjs" });
              })
            )
          )
          .pipe(
            gulpIf(
              mode === "commonjs",
              replace(/(require\(["'])(\..*?)(["']\)[;,])/g, fixCjsImports)
            )
          )
          .pipe(dest(destPath)),
      ]);
    }

    return createLib();
  };
}

function makeDocs() {
  const copyFiles = (source, destination) => {
    return function copyFiles() {
      return src(source + "/**/*", { base: source, encoding: false }).pipe(
        dest(destination)
      );
    };
  };

  function compileReadme() {
    return run.default("npx markdown-include ./mdCompile.json")();
  }

  function compileDocs() {
    return run.default(
      "npx jsdoc -c jsdocs.json -t ./node_modules/better-docs"
    )();
  }

  return series(
    compileReadme,
    compileDocs,
    series(
      ...[
        {
          src: "workdocs/assets",
          dest: "./docs/workdocs/assets",
        },
        {
          src: "workdocs/coverage",
          dest: "./docs/workdocs/coverage",
        },
      ].map((e) => copyFiles(e.src, e.dest))
    )
  );
}

export const dev = series(
  series(exportDefault(true, "commonjs"), exportDefault(true, "es2022")),
  patchFiles(),
  chmodCLIFiles()
);

export const prod = series(
  series(exportDefault(true, "commonjs"), exportDefault(true, "es2022")),
  patchFiles(),
  chmodCLIFiles()
);

export const docs = makeDocs();
