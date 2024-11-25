const fs = require("node:fs");
const htmlmin = require("html-minifier-terser");

var urlRegex = new RegExp('^(?:[a-z+]+:)?//', 'i');

// Generic functions
function replaceAll(string, find, replace) {
  return string.replace(new RegExp(find, 'g'), replace);
}

// sort by order
function sortByOrder(values, field = ['data']['order']) {
  let vals = [...values]; // this *seems* to prevent collection mutation...
  if (field) {
    order = [`${field}`];
  }
  // console.log(vals, field);
  return vals.sort((a, b) => {

    Math.sign(a.order - b.order)
  });
}

module.exports = eleventyConfig => {

  // modified, via @https://bnijenhuis.nl/notes/cache-busting-in-eleventy/
  eleventyConfig.addFilter('cachebust', (url) => {
    const [urlPart, paramPart] = url.split('?');
    const params = new URLSearchParams(paramPart || '');
    params.set('v', Date.now());
    return `${urlPart}?${params}`;
  });

  eleventyConfig.addFilter('date', (date, dateFormat) => {
    return format(date, dateFormat);
  });

  eleventyConfig.addFilter('env', key => process.env[key]);

  // via @ https://github.com/11ty/eleventy/issues/3051#issuecomment-1722342440
  eleventyConfig.addFilter('file_exists', function (filename) {
    return fs.existsSync(filename);
  });


  // check if something has HTML tags
  eleventyConfig.addFilter('has_html', (data) => {
    let regexForHTML = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/;
    let hasHTML = regexForHTML.test(data);
    return hasHTML;
  });

  // helps get a full id (object.key) when provided with a short id (good for webinars)
  eleventyConfig.addFilter('get_key', (obj, id) => {
    const key = Object.keys(obj).filter(k => k.startsWith(id));

    return key;
  });

  eleventyConfig.addFilter('get_path', (id, img) => {
    let type;
    let path;


    if (id.startsWith('web')) {
      type = 'webinar';
      path = '/webinars/';
      imgPath = `/img/webinars/poster/`;
    } else {
      idString = id.split('-')[1];
      let idNum = Number(idString);
      path = '/courses/';

      if (idNum <= 100) {
        type = 'short';
      } else if (idNum >= 700 && idNum < 800) {
        type = 'workshop';
      } else if (idNum >= 100 && idNum < 200) {
        type = 'full';
      } else if (idNum >= 5000) {
        type = 'tutorial';
        path = '/tutorials/';
      } else {
        console.warn(`the ID passed in doesn't match any ranges`);
      }
    }

    if (img) {
      path = `/img${path}`;
    }

    return path;
  });


  eleventyConfig.addFilter('is_external_link', (href) => {
    let isExternal;
    if (urlRegex.test(href)) {
      // console.log(`url is absolute`);
      isExternal = true;
    } else {
      // console.log(`url is relative`);
      isExternal = false;
    }

    return isExternal;
  });

  eleventyConfig.addFilter('is_object', (obj) => {
    return typeof obj === 'object';
  });

  eleventyConfig.addFilter('is_string', (obj) => {
    return typeof obj === 'string';
  });

  eleventyConfig.addFilter('lowercase', (string) => {
    return string.toLowerCase();
  });

  // DEBUG: Show object keys
  eleventyConfig.addFilter('object_keys', (obj) => Object.keys(obj));

  // DEBUG: Show object values
  eleventyConfig.addFilter('object_values', (obj) => Object.values(obj));

  // DEBUG: Show object values
  eleventyConfig.addFilter('object_entries', (obj) => Object.entries(obj));

  // very helpful function to omit select object keys, via @ https://www.30secondsofcode.org/js/s/omit-object-keys/
  eleventyConfig.addFilter('omit', (obj, arr) => Object.keys(obj)
    .filter(k => !arr.includes(k))
    .reduce((acc, key) => ((acc[key] = obj[key]), acc), {}));

  // extract items from objects or arrays
  eleventyConfig.addFilter('pluck', function (obj, attr, value) {
    let arr;
    if (typeof obj === 'object') {
      arr = Object.values(obj);
    } else if (typeof obj === 'array') {
      arr = obj;
    } else {
      console.error(`Oops, the pluck filter accepts either an object or an array!`);
    }

    const filtered = arr.filter((item) => {
      return item[attr].includes(value);
    });

    return filtered;
  });

  // Modified, original @ https://willvincent.com/2022/07/27/redirects-with-11ty-and-netlify/
  eleventyConfig.addFilter('course_endpoint', (id, dest_format) => {
    idString = id.split('-')[1];
    let idNum = Number(idString);
    let path;

    if (!!dest_format) {
      let destUrl = process.env[`MFE_${dest_format.toUpperCase()}_BASE_URL`];
      // console.log(process.env);

      if (dest_format === 'course_about') {
        path = `${destUrl}/courses/course-v1:GYM+${idString}+0/about`;

      } else if (dest_format === 'learning') {
        path = `${destUrl}/learning/course/course-v1:GYM+${idString}+0/home`;
      }
    } else {
      path = `/courses/course-v1:GYM+${idString}+0/`;
    }

    // console.log(idNum, idString, path)
    return path;
  });

  const MFE_PORTS = {
    'ACCOUNT': 1997,
    'AUTHN': 1999,
    'COURSE_ABOUT': 3000,
    'DISCUSSIONS': 2002,
    'LEARNER_DASHBOARD': 1996,
    'LEARNING': 2000,
    'PROFILE': 1995,
  };

  eleventyConfig.addFilter('mfe_endpoint', (name) => {
    if (name) {
      const usePorts = process.env.NODE_ENV === 'development' ? true : false;
      
      const BASE_URL = usePorts ? `${process.env.MFE_URL}:${MFE_PORTS[name.toUpperCase().replaceAll('-','_')]}` : process.env.MFE_URL;
      return `${BASE_URL}/${name.toLowerCase().replaceAll('_','-')}/`;
    } else {
      console.warn('you must specify a name!');
    }
  });

  // smart-ish replace filter, which works on strings and objects
  eleventyConfig.addFilter('replace', (input, string, replace) => {
    let output;
    if (typeof input === 'object') {
      output = JSON.parse(replaceAll(JSON.stringify(input), string, replace));
    } else if (typeof input === 'string') {
      output = replaceAll(input, string, replace);
    } else {
      console.warn(`[replace filter]: input must be a string or object!`);
    }

    return output;
  });

  eleventyConfig.addAsyncFilter('minify_html', (input) => {
    let minified = htmlmin.minify(input, {
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true,
    });

    return minified;
  });

  eleventyConfig.addFilter('replace_after', (input, find, replace) => {
    const regex = new RegExp('[' + find + '].+', 'g');
    const repl = input.replaceAll(regex, replace);
    return repl;
  });

  // Modified version, original @https://stevenwoodson.com/blog/a-step-by-step-guide-to-sorting-eleventy-global-data-files-by-date/
  eleventyConfig.addFilter('sortDataByDate', (obj, dateField = 'date') => {
      const sorted = {};

      const values = Object.values(obj);

      values
        .sort((a, b) => {
          let sortOrder = a[dateField].toISOString() > b[dateField].toISOString();
          return sortOrder ? 1 : -1;
        })
        .forEach((name) => (sorted[name] = values[name]));

      return values;
    }
  );

  eleventyConfig.addFilter('sortByOrder', sortByOrder);

  eleventyConfig.addFilter('sortByTitle', values => {
    return values.sort((a, b) => a.title.localeCompare(b.title))
  });

  eleventyConfig.addFilter('sortByUrl', values => {
    return values.sort((a, b) => a.url.localeCompare(b.url))
  });

  eleventyConfig.addFilter('stringify', (data) => {
    return JSON.stringify(data, null, '\t');
  });

  eleventyConfig.addFilter('strip_html', (post) => {
    const content = post.replace(/(<([^>]+)>)/gi, '');
    return content;
  });

  eleventyConfig.addFilter('uppercase', (string) => {
    return string.toUpperCase();
  });
}
