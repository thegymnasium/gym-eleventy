// docs: https://www.11ty.io/docs/config/
import { EleventyRenderPlugin } from "@11ty/eleventy";
import EleventyEdgePlugin from "11ty-edge";
import filters from "./11ty.config/filters.js";
import collectionz from "./11ty.config/collectionz.js";
import shortcodes from "./11ty.config/shortcodes.js";
import pluginImages from "./11ty.config/images.js";
import scss from "./11ty.config/scss.js";
import yaml from "js-yaml";
import markdownit from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItAttrs from "markdown-it-attrs";
import htmlmin from "html-minifier-terser";
import UpgradeHelper from "@11ty/eleventy-upgrade-help";
import * as dotenvx from '@dotenvx/dotenvx';

const ENV_FILE = process.env.NODE_ENV !== undefined ? `.env.${process.env.NODE_ENV}` : '.env';

dotenvx.config({ path: ENV_FILE })

console.log(`NODE_ENV: ${process.env.NODE_ENV} | ELEVENTY_ENV: ${process.env.ELEVENTY_ENV}`);

export function filter(arr, criteria) {
  return arr.filter(function (obj) {
    return Object.keys(criteria).every(function (c) {
      return obj[c] == criteria[c];
    });
  });
}

if (typeof String.prototype.endsWith !== 'function') {
  String.prototype.endsWith = function(suffix) {
      return this.indexOf(suffix, this.length - suffix.length) !== -1;
  };
}

export default function (eleventyConfig) {
  eleventyConfig.setInputDirectory("src");
  eleventyConfig.setOutputDirectory("dist");
  eleventyConfig.setIncludesDirectory("_includes");
  eleventyConfig.setLayoutsDirectory("_includes/layouts");
  eleventyConfig.setDataDirectory("_data");

  eleventyConfig.addGlobalData("env", process.env);

  eleventyConfig.addPassthroughCopy({
    "./public/": "/",
  });

  // markdown-it options
  let mdOpts = {
    html: true,
    breaks: true,
    linkify: true,
  };

  // markdown-it-attrs options
  const mdAttrs = {
    // optional, these are default options
    leftDelimiter: "{:", // modified to use `{:` instead of `{`
    rightDelimiter: "}",
    allowedAttributes: [], // empty array = all attributes are allowed
  };

  const md = markdownit(mdOpts);

  eleventyConfig.setLibrary("md", md);
  eleventyConfig.amendLibrary("md", (mdLib) => mdLib.use(markdownItAnchor));
  eleventyConfig.amendLibrary("md", (mdLib) => mdLib.use(markdownItAttrs, mdAttrs));

  eleventyConfig.addPlugin(filters);
  eleventyConfig.addPlugin(collectionz);
  eleventyConfig.addPlugin(shortcodes);
  // eleventyConfig.addPlugin(scss);
  // eleventyConfig.addPlugin(pluginRev);
  // eleventyConfig.addPlugin(pluginImages);
  eleventyConfig.addPlugin(EleventyEdgePlugin);
  eleventyConfig.addPlugin(EleventyRenderPlugin);

  eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));
  eleventyConfig.addDataExtension("yml", (contents) => yaml.load(contents));

  // If you have other `addPlugin` calls, it’s important that UpgradeHelper is added last.
  // eleventyConfig.addPlugin(UpgradeHelper);

  eleventyConfig.setServerOptions({
    // Default values are shown:

    // Whether the live reload snippet is used
    liveReload: true,

    // Whether DOM diffing updates are applied where possible instead of page reloads
    domDiff: true,

    // The starting port number
    // Will increment up to (configurable) 10 times if a port is already in use.
    port: 4040,

    // Additional files to watch that will trigger server updates
    // Accepts an Array of file paths or globs (passed to `chokidar.watch`).
    // Works great with a separate bundler writing files to your output folder.
    // e.g. `watch: ["_site/**/*.css"]`
    watch: [],

    // Show local network IP addresses for device testing
    showAllHosts: true,

    // Use a local key/certificate to opt-in to local HTTP/2 with https
    https: {
      // key: "./localhost.key",
      // cert: "./localhost.cert",
    },

    // Change the default file encoding for reading/serving files
    encoding: "utf-8",

    // Show the dev server version number on the command line
    showVersion: true,
  });

  eleventyConfig.setQuietMode(true);

  // Set up HTML minification (excludes local dev env)
  const HTMLMIN_CONFIG = {
    useShortDoctype: true,
    collapseWhitespace:
      process.env.NODE_ENV === "development" ? false : true,
  };

  // via @https://www.11ty.dev/docs/transforms/#minify-html-output
  eleventyConfig.addTransform("htmlmin", function (content) {
    if ((this.page.outputPath || "").endsWith(".html")) {
      let minified = htmlmin.minify(content, HTMLMIN_CONFIG);

      return minified;
    }

    // If not an HTML output, return content as-is
    return content;
  });


  return {
    htmlTemplateEngine: "njk",
    passthroughFileCopy: true,
  };
};
