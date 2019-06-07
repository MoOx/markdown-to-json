# @phenomic/markdown-as-json

[![Repo on GitHub](https://img.shields.io/badge/repo-GitHub-3D76C2.svg)](https://github.com/phenomic/markdown-as-json)
[![Repo on GitLab](https://img.shields.io/badge/repo-GitLab-6C488A.svg)](https://gitlab.com/MoOx/markdown-as-json)

> Transform markdown content as a JSON

Handles:

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

```json
{
  "test": "a",
  "test2": "b",
  "headings": [
    {
      "id": "test",
      "level": 2,
      "text": "Test",
    },
  ],
  "body": {
    "c": [
      {
        "c": [
          {
            "c": [
              {
                "p": {
                  "class": "icon icon-link",
                },
                "t": "span",
              },
            ],
            "p": {
              "aria-hidden": "true",
              "href": "#test",
            },
            "t": "a",
          },
          "Test",
        ],
        "p": {
          "id": "test",
        },
        "t": "h2",
      },
      "
",
      {
        "c": [
          {
            "c": [
              "link",
            ],
            "p": {
              "href": "href",
            },
            "t": "a",
          },
        ],
        "t": "p",
      },
      "
",
      {
        "c": [
          {
            "c": [
              {
                "c": [
                  "console",
                ],
                "p": {
                  "class": "hljs-built_in",
                },
                "t": "span",
              },
              ".log(",
              {
                "c": [
                  "window",
                ],
                "p": {
                  "class": "hljs-built_in",
                },
                "t": "span",
              },
              ")",
            ],
            "p": {
              "class": "hljs language-js",
            },
            "t": "code",
          },
        ],
        "t": "pre",
      },
    ],
    "t": "div",
  },
}
```

For easy rendering to dom (eg: React etc).

[Check out input](__tests__/index.js) & [output](__tests__/__snapshots__/index.js.snap) to get an idea of what to expect from this package.

[LICENSE](LICENSE)
