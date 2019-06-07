// @flow

const markdownAsJson = require("../index.js");

it("should transform markdown as json", () => {
  expect(
    markdownAsJson(
      `---
test: a
test2: b
---
` + "## Test\n[link](href)\n```js\nconsole.log(window)\n```"
    )
  ).toMatchSnapshot();
});
