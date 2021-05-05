#!/usr/bin/env node
// @flow

const mdjsfs = require("./fs.js");

const args = process.argv.slice(0);
args.shift(); // node
args.shift(); // bin name
const sourcePath = args.shift();
const outputPath = args.shift();

if (args.length > 0) {
  throw new Error(
    "Only 2 arguments expected, got " +
      (args.length + 2) +
      ". Please make sure glob strings are between quotes so your shell don't expand it.",
  );
}

mdjsfs.globMarkdownToJson(sourcePath, outputPath, files => {
  console.log(files.length + " transformed as JSON");
});
