import * as sass from 'sass-embedded';
import path from 'node:path';

export default function scss(eleventyConfig) {
  eleventyConfig.addTemplateFormats("scss");

  // Creates the scss extension for use
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    // outputPath:  "",

    // opt-out of Eleventy Layouts
    useLayouts: false,

    // `compile` is called once per .scss file in the input directory
    compile: async function (inputContent, inputPath) {
      let parsed = path.parse(inputPath);
      if (parsed.name.startsWith("_")) {
        return;
      }

      const outputStyle = process.env.NODE_ENV == "production" ? "compressed" : "expanded";

      let result = sass.compileString(inputContent, {
        charset: true,
        loadPaths: [
          './src/scss',
        ],
        style: outputStyle,
        sourceMap: true,
        sourceMapIncludeSources: true,
      });

      // This is the render function, `data` is the full data cascade
      return async (data) => {
        // replace a string with our actual static assets URL
        return result.css.replaceAll("STATIC_ASSETS_URL", process.env.STATIC_ASSETS_URL);
      };
    },

    compileOptions: {
      permalink: (contents, inputPath) => (data) => {
        let parsed = path.parse(inputPath);
        if (parsed.name.startsWith("_")) {
          return false;
        } else {
          // force "/css/" output path
          return data.page.filePathStem.replaceAll("\/scss\/", "/css/") + '.' + data.page.outputFileExtension;
        }
      }
    }
  });
}
