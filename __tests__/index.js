// @flow

const markdownAsJsTree = require("../index.js").markdownAsJsTree;

it("should transform markdown as json", () => {
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
