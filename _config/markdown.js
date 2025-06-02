import markdownit from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItAttrs from "markdown-it-attrs";

// markdown-it options
const mdOpts = {
  html: true,
  breaks: true,
  linkify: true,
};

// markdown-it-attrs options
const mdAttrs = {
  leftDelimiter: "{:", // modified to use `{:` instead of `{`
  rightDelimiter: "}",
  allowedAttributes: [], // empty array = all attributes are allowed
};

// create and configure markdown-it
const md = new markdownit(mdOpts);
md.use(markdownItAnchor);
md.use(markdownItAttrs, mdAttrs);

export default md;
