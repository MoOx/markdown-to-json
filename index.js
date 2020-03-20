// @flow

const frontMatterParser = require("gray-matter");
const unified = require("unified");

/*::
type mdNode =
  | string
  | {|
      t?: string,
      p?: Object,
      c?: mdNode | $ReadOnlyArray<mdNode>,
    |};

type plugin = [Function, Object];
type plugins = $ReadOnlyArray<plugin>;

type heading ={| level: number, text: string, id: string |};
type meta = {|
  title?: string,
  headings?: $ReadOnlyArray<heading>
|};
*/

const renderText = (node /*: void | mdNode */) /*: string */ => {
  if (typeof node === "string") return node;
  if (typeof node === "object")
    return Array.isArray(node.c)
      ? node.c.map((child /*: mdNode */) => renderText(child)).join("")
      : renderText(node.c);
  return "";
};

const getHeadings = (node /*: void | mdNode */) /*: $ReadOnlyArray<heading>*/ => {
  if (node) {
    if (typeof node === "string") {
      return [];
    }
    if (typeof node.t === "string") {
      const tag = node.t;
      const level = parseInt(tag[1], 10);
      if (tag[0] === "h" && !isNaN(level)) {
        return [
          {
            level,
            text: renderText(node),
            id: node.p && node.p.id ? String(node.p.id) : ""
          }
        ];
      }
    }
    return (Array.isArray(node.c)
      ? node.c.reduce(
          (acc, child /*: mdNode*/) => acc.concat(getHeadings(child)),
          []
        )
      : getHeadings(node.c)
    ).filter(h => h);
  }
  return [];
};

const extractMetaFromBodyNode = (node /*: mdNode*/) /*: meta */ => {
  const headings = getHeadings(node);
  const firstH1 = headings.find(h => h.level === 1);
  // $FlowFixMe lazy me
  return Object.assign(
    firstH1 ? { title: firstH1.text } : {},
    headings.length > 0 ? { headings } : {}
  );
};

const getOnlyChildren = (ast /*: mdNode */) => {
  // rehype-react add an outer div by default
  // lets try to remove it
  if (
    ast.t ==="div" &&
    ast.c &&
    Array.isArray(ast.c) &&
    ast.c.length === 1 &&
    ast.c[0]
  ) {
    return ast.c[0]
  }
  return ast;
}

module.exports = (
  contents /*: string */,
  remarkPlugins/*: plugins */ = [
    [require("remark-toc"), {}],
    //
    // List of language Here
    // https://github.com/atom/highlights/tree/master/deps
    // if language is not in the list, use `additionalLangs: ["language-{yourlanguage}"]`
    // and add this package (`language-{yourlanguage}`) to your node_modules
    //
    // To generated a CSS theme,
    // https://github.com/MoOx/atom-syntax-theme-to-highlights-css
    //
    [require("remark-highlight.js"), {}],
  ],
  rehypePlugins/*: plugins */ = [
    [require("rehype-slug"), {}],
    [require("rehype-autolink-headings"), {}],
  ],
) => {
  const front = frontMatterParser(contents.toString());

  const processor = unified();
  processor.use(require("remark-parse"));
  remarkPlugins.forEach(plugin => processor.use(plugin[0], plugin[1]));
  // markdown to html ast
  // this is to allow "raw" things (html in md and md in html)
  processor.use(require("remark-rehype"), { allowDangerousHTML: true });
  processor.use(require("rehype-raw"));
  rehypePlugins.forEach(plugin => processor.use(plugin[0], plugin[1]));
  processor.use(
    require("rehype-react"),
    {
      createElement: 
      // here we optimize structure just a little to have to smallest json possible
      (component, props, children) /*: mdNode */ => {
        return {
          t: component,
          p: props && Object.keys(props).length ? props : undefined,
          c: children ? children : undefined,
        };
      }
    }
  );
  
  const processed = processor.processSync(front.content);
  
  if (
    processed &&
    typeof processed === "object" &&
    processed.contents && 
    typeof processed.contents === "object"
  ) {
    // $FlowFixMe rehype-react should handle this
    const body /* :mdNode */ = processed.contents;
    return Object.assign(
      extractMetaFromBodyNode(body),
      front.data,
      {
        body: getOnlyChildren(body)
      });
  }
  throw new Error("unified processSync didn't return an object.");
};
