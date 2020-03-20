// @flow

const fs = require("fs");
const path = require("path");

const glob = require("glob");

const mdjs = require("./index.js");

module.exports = {
  globMarkdownToJson: (
    sourcePath /*: string*/,
    outputPath /*: string*/ = process.cwd(),
    done /*: ($ReadOnlyArray<string>) => void*/,
  ) => {
    const root = process.cwd();
    glob(sourcePath, function(er, files) {
      if (er) {
        throw er;
      }
      if (files.length === 0) {
        throw new Error("No files found with pattern " + sourcePath);
      }

      let nbFiles = 0;
      files.forEach(file => {
        fs.readFile(file, { encoding: "utf8" }, (
          fileErr,
          data /*: Buffer*/,
        ) => {
          if (fileErr) {
            console.error("Failed to read", file);
            throw fileErr;
          }
          const newFile = path.join(
            outputPath,
            file.replace(root, "").replace(/\.[a-z]+$/, ".json"),
          );
          fs.mkdirSync(path.dirname(newFile), { recursive: true });
          let result;
          try {
            result = JSON.stringify(mdjs.markdownAsJsTree(data.toString()));
          } catch (e) {
            console.error("Failed to transform", file);
            throw e;
          }
          fs.writeFile(newFile, result, fileWErr => {
            if (fileWErr) {
              console.error("Failed to write", newFile);
              throw fileWErr;
            }
            nbFiles++;
            if (nbFiles === files.length) {
              done(files);
            }
          });
        });
      });
    });
  },
};
