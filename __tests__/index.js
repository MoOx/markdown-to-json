// @flow

const mdjsfs = require("../fs.js");
const mdjs = require("../index.js");

it("should transform markdown as js", () => {
  expect(
    mdjs.markdownAsJsTree(
      `---
test: a
test2: b
---
` + "## Test\n[link](href)\n```js\nconsole.log(window)\n```",
    ),
  ).toMatchSnapshot();
});

it("should give front title", () => {
  expect(
    mdjs.markdownAsJsTree(
      `---
title: Title front
---
` + "# Title md",
    ),
  ).toMatchSnapshot();
});

it("should give fallback to md title", () => {
  expect(mdjs.markdownAsJsTree("# Title md")).toMatchSnapshot();
});

it("should works for files", done => {
  const sourcePath = require("path").join(__dirname, "*.md");
  mdjsfs.globMarkdownToJson(sourcePath, undefined, () => {
    const testJson = require("fs")
      .readFileSync(require("path").join(__dirname, "test.json"))
      .toString();
    const testJs = JSON.parse(testJson);
    expect(testJs).toMatchSnapshot();
    done();
  });
});
