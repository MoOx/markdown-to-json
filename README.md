# markdown-to-json

[![Build Status](https://github.com/MoOx/markdown-to-json/workflows/Build/badge.svg)](https://github.com/MoOx/markdown-to-json/actions)
[![Version](https://img.shields.io/npm/v/@moox/markdown-to-json.svg)](https://www.npmjs.com/package/@moox/markdown-to-json)

[![Repo on GitHub](https://img.shields.io/badge/repo-GitHub-3D76C2.svg)](https://github.com/MoOx/markdown-to-json)
[![Repo on GitLab](https://img.shields.io/badge/repo-GitLab-6C488A.svg)](https://gitlab.com/MoOx/markdown-to-json)

> Transform markdown content as a JSON

This package is a minimal markdown preprocessor to make it easy to render
markdown in a JS environement like React, React Native etc.

It is meant to be used before runtime:

1. You transform your markdown files as JSON
2. You consume the JSON files from the JS without any runtime transformation
   required

## Installation

```console
npm install @moox/markdown-to-json
```

or

```console
yarn add @moox/markdown-to-json
```

## Usage

### CLI

```console
npx markdown-to-json "docs/**/*.md" [optional output-folder]
```

or

```console
yarn markdown-to-json "docs/**/*.md" [optional output-folder]
```

⚠️ Be sure to put globs between quotes.

### Node.js

```js
const mdjs = require("@moox/markdown-to-json");
const output = mdjs.markdownAsJsTree("# markdown string");
```

By default, it handles:

- front-matter (via gray-matter)
- auto slug for headings (with anchors)
- code highlight (via highlight.js)
- table of contents (via [remark-toc](https://www.npmjs.com/package/remark-toc))

The idea is to get a markdown like this

````markdown
---
test: a
test2: b
---

## Test

[link](href)

```js
console.log(window);
```
````

like

```js
{
  "test": "a",
  "test2": "b",
  "headings": [
    {
      "id": "test",
      "level": 2,
      "text": "Test"
    }
  ],
  "body": {
    "tag": "div",
    "children": [
      {
        "tag": "h2",
        "props": {
          "id": "test"
        },
        "children": [
          //...
        ]
      }
    ]
  }
}
```

### Options

In addition to the markdown string, 2 arguments are accepted that are functions
that should returns an array of plugin with there options:

- [remark](https://github.com/remarkjs/remark) plugins
- [rehype](https://github.com/rehypejs/rehype) plugins

The first example is equivalent to

```js
const mdjs = require("@moox/markdown-to-json");
const output = mdjs.markdownAsJsTree(
  "# markdown string",
  mdjs.defaultRemarkPlugins
  mdjs.defaultRehypePlugins
);
```

By default sending arguments will override [default plugins](./index.js). You
can get the default one by doing something like this

```js
const mdjs = require("@moox/markdown-to-json");
const output = mdjs.markdownAsJsTree(
  "# markdown string",
  () => ([
    [require("remark-whatever"), {optionForWhatever: true}],
    ...mdjs.defaultRemarkPlugins()
  ]),
  () => ([
    [require("rehype-hispterpackage"), {/* no options */}}],
    [require("rehype-anotherhispterpackage"), {powerUserOption: "super argument"}}],
    ...mdjs.defaultRehypePlugins()
  ]);
);
```

Thanks [unified](https://unifiedjs.com/) to make this possible!

[Check out input](__tests__/index.js) &
[output](__tests__/__snapshots__/index.js.snap) to get an idea of what to expect
from this package.

---

[LICENSE](LICENSE)
