// @flow

const markdownAsJsTree = require("../index.js").markdownAsJsTree;

it("should transform markdown as js", () => {
  expect(
    markdownAsJsTree(
      `---
test: a
test2: b
---
` + "## Test\n[link](href)\n```js\nconsole.log(window)\n```"
    )
  ).toMatchSnapshot();
});

it("should give front title", () => {
  expect(
    markdownAsJsTree(
      `---
title: Title front
---
` + "# Title md"
    )
  ).toMatchSnapshot();
});

it("should give fallback to md title", () => {
  expect(
    markdownAsJsTree(
      "# Title md"
    )
  ).toMatchSnapshot();
});

