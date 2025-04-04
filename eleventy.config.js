// docs: https://www.11ty.io/docs/config/
import { EleventyRenderPlugin } from "@11ty/eleventy";
import EleventyEdgePlugin from "@11ty/edge";
import filters from "./11ty.config/filters.js";
import shortcodes from "./11ty.config/shortcodes.js";
import pluginImages from "./11ty.config/images.js";
// const clean = await import("eleventy-plugin-clean");
import yaml from "js-yaml";
import markdownit from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItAttrs from "markdown-it-attrs";
import htmlmin from "html-minifier-terser";
import UpgradeHelper from "@11ty/eleventy-upgrade-help";
import * as dotenvx from '@dotenvx/dotenvx';
import * as sass from 'sass';
import path from 'node:path';

dotenvx.config({ path: `.env.${process.env.NODE_ENV}` });

function filter(arr, criteria) {
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

  // eleventyConfig.addPassthroughCopy({
  //   "./public/": "/",
  // });

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

  // create a catalog collection combining courses, tutorials, webinars
  eleventyConfig.addCollection("catalog", (collection) => {
    const allCollections = collection.getAll()[0];
    if (typeof allCollections !== "undefined" && allCollections !== null) {
      const courses = collection.getAll()[0]?.data?.courses;
      const tutorials = collection.getAll()[0]?.data?.tutorials;
      const livestreams = collection.getAll()[0]?.data?.livestreams;
      const webinars = collection.getAll()[0]?.data?.webinars;
      const catalog = { ...courses, ...tutorials, ...livestreams, ...webinars };
      return catalog;
    } else {
      return false;
    }
  });

  // Get all static pages and perform intentional exclusions by directory
  eleventyConfig.addCollection("static", function (collectionApi) {
    let col = collectionApi.getFilteredByGlob("**/pages/**/**.{njk,html,md}");

    return col.filter((item) => {
      if (
        !item.page.filePathStem.startsWith("/pages/courses/") &&
        !item.page.filePathStem.startsWith("/pages/tutorials/") &&
        !item.page.filePathStem.startsWith("/pages/webinars/") &&
        !item.page.filePathStem.startsWith("/pages/privacy-policy/")
      ) {
        return item;
      }
    });
  });

  eleventyConfig.addCollection("privacy", function (collectionApi) {
    let col = collectionApi.getFilteredByGlob("**/pages/**/**.{njk,html,md}");

    return col.filter((item) => {
      if (item.page.filePathStem.startsWith("/pages/privacy-policy/")) {
        return item;
      }
    });
  });

  // bios collections
  eleventyConfig.addCollection("bios", function (collection) {
    const allCollections = collection.getAll()[0];
    if (typeof allCollections !== "undefined" && allCollections !== null) {
      const col = Object.values(collection.getAll()[0].data.bios).filter(
        (item) => {
          return item.exclude ? false : item;
        }
      );
      return col;
    } else {
      return false;
    }
  });

  // this is our `hub pages` collection
  eleventyConfig.addCollection("collection", function (collection) {
    const allCollections = collection.getAll()[0];
    if (typeof allCollections !== "undefined" && allCollections !== null) {
      const col = Object.values(collection.getAll()[0].data.collection).filter(
        (item) => {
          return item.exclude ? false : item;
        }
      );
      return col;
    } else {
      return false;
    }
  });

  // return only live full courses
  eleventyConfig.addCollection("live_courses_full", function (collection) {
    const allCollections = collection.getAll()[0];
    if (typeof allCollections !== "undefined" && allCollections !== null) {
      const col = Object.values(collection.getAll()[0].data.courses).filter(
        (item) => {
          const bool = item.type === "full" && item.live;
          return bool ? item : false;
        }
      );
      return col;
    } else {
      return false;
    }
  });

  // return only live short courses
  eleventyConfig.addCollection("live_courses_short", function (collection) {
    const allCollections = collection.getAll()[0];
    if (typeof allCollections !== "undefined" && allCollections !== null) {
      const col = Object.values(collection.getAll()[0].data.courses).filter(
        (item) => {
          const bool = item.type === "short" && item.live;
          return bool ? item : false;
        }
      );
      return col;
    } else {
      return false;
    }
  });

  // return only live tutorials
  eleventyConfig.addCollection("live_tutorials", function (collection) {
    const allCollections = collection.getAll()[0];
    if (typeof allCollections !== "undefined" && allCollections !== null) {
      const col = Object.values(collection.getAll()[0].data.tutorials).filter(
        (item) => {
          const bool = item.type === "tutorial" && item.live;
          return bool ? item : false;
        }
      );
      return col;
    } else {
      return false;
    }
  });

  // eleventyConfig.addPlugin(clean);
  eleventyConfig.addPlugin(filters);
  eleventyConfig.addPlugin(shortcodes);
  // eleventyConfig.addPlugin(pluginRev);
  // eleventyConfig.addPlugin(pluginImages);
  eleventyConfig.addPlugin(EleventyEdgePlugin);
  eleventyConfig.addPlugin(EleventyRenderPlugin);

  eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));
  eleventyConfig.addDataExtension("yml", (contents) => yaml.load(contents));

  // eleventyConfig.addPlugin(eleventySass, {
  //   compileOptions: {
  //     permalink: function (contents, inputPath) {
  //       return (data) =>
  //         `${data.page.filePathStem.replace(/^\/scss\//, "/css/")}.css`;
  //     },
  //   },
  //   sass: {
  //     style: "compressed",
  //     sourceMap: true,
  //   },
  //   rev: false,
  // });

  eleventyConfig.addTemplateFormats("scss");

  // Creates the extension for use
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css", // optional, default: "html"

    // `compile` is called once per .scss file in the input directory
    compile: async function (inputContent) {
      let result = sass.compileString(inputContent,{
        loadPaths: ['./src/scss',]
      });

      // This is the render function, `data` is the full data cascade
      return async (data) => {
        return result.css;
      };
    },
    // … some configuration truncated
    compileOptions: {
      permalink: function(contents, inputPath) {
        let parsed = path.parse(inputPath);
        if(parsed.name.startsWith("_")) {
          return false;
        }
      }
    },

  });

  // If you have other `addPlugin` calls, it’s important that UpgradeHelper is added last.
  eleventyConfig.addPlugin(UpgradeHelper);

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

  // eleventyConfig.setQuietMode(true);

  // Set up HTML minification (excludes local dev env)
  const HTMLMIN_CONFIG = {
    useShortDoctype: true,
    collapseWhitespace:
      process.env.ELEVENTY_ENV === "development" ? false : true,
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
