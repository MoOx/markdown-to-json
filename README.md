# markdown-as-json

[![Build Status](https://github.com/MoOx/markdown-as-json/workflows/Build/badge.svg)](https://github.com/MoOx/markdown-as-json/actions)
[![Version](https://img.shields.io/npm/v/markdown-as-json.svg)](https://www.npmjs.com/package/markdown-as-json)

[![Repo on GitHub](https://img.shields.io/badge/repo-GitHub-3D76C2.svg)](https://github.com/MoOx/markdown-as-json)
[![Repo on GitLab](https://img.shields.io/badge/repo-GitLab-6C488A.svg)](https://gitlab.com/MoOx/markdown-as-json)

> Transform markdown content as a JSON

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

For easy rendering to dom (eg: React etc).

[Check out input](__tests__/index.js) &
[output](__tests__/__snapshots__/index.js.snap) to get an idea of what to expect
from this package.

[LICENSE](LICENSE)
