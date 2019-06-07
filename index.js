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
*/

// here we optimize structure just a little to have to smallest json possible
const createElement = (component, props, children) /*: mdNode */ => {
  // $FlowFixMe optimization
  return Object.assign(
    { t: component },
    props && Object.keys(props).length ? { p: props } : {},
    children ? { c: children } : {}
  );
};

/*::
type plugin = [Function, Object];
type plugins = $ReadOnlyArray<plugin>;
*/

// Below "html" means "something that looks like html"
// The idea is to allow any kind of tags
// in order to map them later and allow custom react components in place of real
// html tags
const defaultPlugins /*: plugins*/ = [
  // first markdown
  [require("remark-parse"), {}],
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
  // markdown to html ast
  // this is to allow "raw" things (html in md and md in html)
  [require("remark-rehype"), { allowDangerousHTML: true }],
  [require("rehype-raw"), {}],
  // then some traditional plugins
  [require("rehype-slug"), {}],
  [require("rehype-autolink-headings"), {}],
  [require("rehype-react"), { createElement }]
];

const renderText = (node /*: mdNode */) /*: string */ => {
  if (typeof node === "string") return node;
  if (typeof node === "object")
    return Array.isArray(node.c)
      ? node.c.map((child /*: mdNode */) => renderText(child)).join("")
      : // $FlowFixMe
        renderText(node.c);
  return "";
};

/*::
type heading ={| level: number, text: string, id: string |};
type meta = {|
  title?: string,
  headings?: $ReadOnlyArray<heading>
|};
*/

const getHeadings = (node /*?: mdNode*/) /*: $ReadOnlyArray<heading>*/ => {
  if (!node) return [];
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
  // $FlowFixMe stfu
  return (Array.isArray(node.c)
    ? node.c.reduce(
        (acc, child /*: mdNode*/) => acc.concat(getHeadings(child)),
        []
      )
    : getHeadings(node.c)
  ).filter(h => h);
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

module.exports = (
  contents /*: string */,
  plugins /*: plugins*/ = defaultPlugins
) => {
  const front = frontMatterParser(contents.toString());

  const processor = unified();
  plugins.forEach(plugin => processor.use(plugin[0], plugin[1]));

  const processed = processor.processSync(front.content);
  // $FlowFixMe lazy me
  const body /*: string */ = processed.contents || "";

  return Object.assign(extractMetaFromBodyNode(body), front.data, { body });
};
