// @flow

const frontMatterParser = require("gray-matter");
const unified = require("unified");

const defaultRemarkPlugins = () => [
  [require("remark-toc"), {}],

  // List of language Here
  // https://github.com/atom/highlights/tree/master/deps
  // if language is not in the list, use `additionalLangs: ["language-{yourlanguage}"]`
  // and add this package (`language-{yourlanguage}`) to your node_modules
  //
  // To generated a CSS theme,
  // https://github.com/MoOx/atom-syntax-theme-to-highlights-css
  //
  [require("remark-highlight.js"), {}],
];

const defaultRehypePlugins = () => [
  [require("rehype-slug"), {}],
  [require("rehype-autolink-headings"), {}],
];

/*::
type mdNode =
  | string
  | {|
      tag?: string,
      props?: {[key: string]: string},
      children?: mdNode | $ReadOnlyArray<mdNode>,
    |};

type plugin = [() => void, {[key: string]: {}}];
type plugins = $ReadOnlyArray<plugin>;

type heading ={| level: number, text: string, id: string |};
type meta = {|
  title?: string,
  headings?: $ReadOnlyArray<heading>
|};

type result = {
  title?: string,
  headings?: $ReadOnlyArray<heading>,
  body: mdNode,
}
*/

const renderText = (node /*: void | mdNode */) /*: string */ => {
  if (typeof node === "string") return node;
  if (typeof node === "object")
    return Array.isArray(node.children)
      ? node.children.map((child /*: mdNode */) => renderText(child)).join("")
      : renderText(node.children);
  return "";
};

const getHeadings = (
  node /*: void | mdNode */,
) /*: $ReadOnlyArray<heading>*/ => {
  if (node != undefined) {
    if (typeof node === "string") {
      return [];
    }
    if (typeof node.tag === "string") {
      const tag = node.tag;
      const level = parseInt(tag[1], 10);
      if (tag[0] === "h" && !isNaN(level)) {
        return [
          {
            level,
            text: renderText(node),
            id: node.props && node.props.id ? String(node.props.id) : "",
          },
        ];
      }
    }
    return (Array.isArray(node.children)
      ? node.children.reduce(
          (acc, child /*: mdNode*/) => acc.concat(getHeadings(child)),
          [],
        )
      : getHeadings(node.children)
    ).filter(h => h);
  }
  return [];
};

const extractMetaFromBodyNode = (node /*: mdNode*/) /*: meta */ => {
  const headings = getHeadings(node);
  const firstH1 = headings.find(h => h.level === 1);
  return {
    title: firstH1 ? firstH1.text : undefined,
    headings,
  };
};

const getOnlyChildren = (ast /*: mdNode */) => {
  // rehype-react add an outer div by default
  // lets try to remove it
  if (
    ast.tag === "div" &&
    ast.children != undefined &&
    Array.isArray(ast.children) &&
    ast.children.length === 1 &&
    ast.children[0] != undefined
  ) {
    return ast.children[0];
  }
  return ast;
};

const markdownAsJsTree = (
  contents /*: string */,
  remarkPlugins /*: () => plugins */ = defaultRemarkPlugins,
  rehypePlugins /*: () => plugins */ = defaultRehypePlugins,
) /* : result */ => {
  const front = frontMatterParser(contents.toString());

  const processor = unified();
  processor.use(require("remark-parse"));
  remarkPlugins().forEach(plugin => processor.use(plugin[0], plugin[1]));
  // markdown to html ast
  // this is to allow "raw" things (html in md and md in html)
  processor.use(require("remark-rehype"), { allowDangerousHTML: true });
  processor.use(require("rehype-raw"));
  rehypePlugins().forEach(plugin => processor.use(plugin[0], plugin[1]));
  processor.use(require("rehype-react"), {
    createElement:
      // here we optimize structure just a little to have to smallest json possible
      (component, props, children) /*: mdNode */ => {
        return {
          tag: component,
          props: props && Object.keys(props).length ? props : undefined,
          children,
        };
      },
  });

  const processed = processor.processSync(front.content);

  if (
    processed != undefined &&
    typeof processed === "object" &&
    processed.contents != undefined &&
    typeof processed.contents === "object"
  ) {
    // $FlowFixMe rehype-react should handle this
    const body /* :mdNode */ = processed.contents;
    return Object.assign(extractMetaFromBodyNode(body), front.data, {
      body: getOnlyChildren(body),
    });
  }
  throw new Error("unified processSync didn't return an object.");
};

module.exports = {
  defaultRemarkPlugins,
  defaultRehypePlugins,
  markdownAsJsTree,
};
