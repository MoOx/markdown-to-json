#!/usr/bin/env node
// @flow

const mdjsfs = require("./fs.js");

const args = process.argv.slice(0);
args.shift(); // node
args.shift(); // bin name
const sourcePath = args.shift();
const outputPath = args.shift();

mdjsfs.globMarkdownToJson(sourcePath, outputPath, files => {
  console.log(files.length + " transformed as JSON");
});
